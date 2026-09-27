'use strict';

const crypto = require('crypto');
const JsonDB = require('./JsonDB');

/**
 * JsonDB uzerine kurulu, MongoDB'ye benzer basit bir koleksiyon API'si.
 *
 *   movies.find({ year: 2010 })
 *   movies.findById('mv_1')
 *   await movies.insert({ title: 'Yeni Film' })
 *   await movies.updateById(id, { title: 'Guncel' })
 *   await movies.removeById(id)
 *
 * Amac: ogrencinin backend tarafinda "veritabani sorgusu" mantigini
 * gormesi, ama kurulum derdiyle ugrasmamasi.
 */
class Collection {
  /**
   * @param {string} name - koleksiyon adi (movies, users...)
   * @param {string} filePath - json dosya yolu
   * @param {string} idPrefix - uretilen id'lerin oneki (mv, us, cm...)
   */
  constructor(name, filePath, idPrefix = 'id') {
    this.name = name;
    this.idPrefix = idPrefix;
    this.db = new JsonDB(filePath, []);
  }

  load() {
    this.db.load();
    return this;
  }

  /** Toplu islem modunu acar (her degisiklikte diske yazilmaz). */
  pause() {
    this.db.pause();
    return this;
  }

  /** Toplu islemi bitirir ve degisiklikleri tek seferde diske yazar. */
  resume() {
    return this.db.resume();
  }

  /** Yeni benzersiz id uretir: mv_9f3a2b1c */
  generateId() {
    return `${this.idPrefix}_${crypto.randomBytes(6).toString('hex')}`;
  }

  /** Ham diziyi dondurur (referans!). Sadece dahili kullanim icin. */
  raw() {
    return this.db.getAll();
  }

  /** Tum kayitlarin kopyasini dondurur. */
  all() {
    return this.db.getAll().map((doc) => ({ ...doc }));
  }

  count(filter) {
    return this.find(filter).length;
  }

  /**
   * Basit filtreleme.
   * - Obje verilirse alanlar esitlik ile karsilastirilir (dizi alanlar "icerir" mantigi).
   * - Fonksiyon verilirse predicate olarak kullanilir.
   */
  find(filter) {
    const items = this.db.getAll();
    if (!filter) return items.map((doc) => ({ ...doc }));
    if (typeof filter === 'function') return items.filter(filter).map((doc) => ({ ...doc }));

    return items
      .filter((doc) =>
        Object.entries(filter).every(([key, value]) => {
          const field = doc[key];
          if (Array.isArray(field)) return field.includes(value);
          return field === value;
        })
      )
      .map((doc) => ({ ...doc }));
  }

  findOne(filter) {
    return this.find(filter)[0] || null;
  }

  findById(id) {
    const doc = this.db.getAll().find((item) => item.id === id);
    return doc ? { ...doc } : null;
  }

  exists(filter) {
    return this.findOne(filter) !== null;
  }

  /** Yeni kayit ekler; id, createdAt ve updatedAt otomatik doldurulur. */
  async insert(doc) {
    const now = new Date().toISOString();
    const record = {
      id: doc.id || this.generateId(),
      ...doc,
      createdAt: doc.createdAt || now,
      updatedAt: now,
    };
    this.db.getAll().push(record);
    await this.db.save();
    return { ...record };
  }

  /** Birden fazla kaydi tek seferde ekler (seed islemi icin hizli). */
  async insertMany(docs) {
    const now = new Date().toISOString();
    const records = docs.map((doc) => ({
      id: doc.id || this.generateId(),
      ...doc,
      createdAt: doc.createdAt || now,
      updatedAt: doc.updatedAt || now,
    }));
    this.db.getAll().push(...records);
    await this.db.save();
    return records.map((r) => ({ ...r }));
  }

  /** id'ye gore gunceller. Sadece gonderilen alanlar degisir (partial update). */
  async updateById(id, patch) {
    const items = this.db.getAll();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return null;

    const updated = {
      ...items[index],
      ...patch,
      id: items[index].id,
      createdAt: items[index].createdAt,
      updatedAt: new Date().toISOString(),
    };
    items[index] = updated;
    await this.db.save();
    return { ...updated };
  }

  async removeById(id) {
    const items = this.db.getAll();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return null;
    const [removed] = items.splice(index, 1);
    await this.db.save();
    return { ...removed };
  }

  /** Filtreye uyan tum kayitlari siler, silinen sayiyi dondurur. */
  async removeWhere(predicate) {
    const items = this.db.getAll();
    const kept = items.filter((item) => !predicate(item));
    const removedCount = items.length - kept.length;
    if (removedCount > 0) await this.db.setAll(kept);
    return removedCount;
  }

  /** Koleksiyonu tamamen bosaltir (seed icin). */
  async clear() {
    await this.db.setAll([]);
  }

  /** Koleksiyonu verilen dizi ile degistirir (seed icin). */
  async replaceAll(docs) {
    await this.db.setAll(docs);
    return docs;
  }
}

module.exports = Collection;
