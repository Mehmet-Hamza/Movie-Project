'use strict';

const fs = require('fs');
const path = require('path');

/**
 * ============================================================
 *  DOSYA TABANLI VERITABANI (JsonDB)
 * ============================================================
 * Her koleksiyon (movies, users, comments...) data/ klasorunde
 * ayri bir .json dosyasidir. Proje kopyalandiginda veritabani da
 * birlikte tasinir; ekstra bir kurulum (MongoDB, Postgres) gerekmez.
 *
 * Calisma mantigi:
 *  1) Sunucu acilirken dosya bir kez okunur ve bellege alinir (cache).
 *  2) Okuma islemleri bellekten yapilir -> cok hizli.
 *  3) Yazma islemlerinde once .tmp dosyasina yazilip sonra rename edilir
 *     (atomic write). Boylece yazma sirasinda elektrik giderse bile
 *     JSON dosyasi yarim kalmaz / bozulmaz.
 *  4) Es zamanli yazmalar bir kuyrukta sirayla islenir.
 */

/**
 * Once .tmp dosyasina yazar, sonra asil dosyanin uzerine tasir.
 * Windows'ta dosya kisa sureligine kilitlenebildigi icin rename
 * islemi birkac kez tekrar denenir.
 */
function writeAtomic(tmpPath, targetPath, contents, attempt = 0) {
  return fs.promises
    .writeFile(tmpPath, contents, 'utf8')
    .then(() => fs.promises.rename(tmpPath, targetPath))
    .catch((err) => {
      const retryable = ['EPERM', 'EACCES', 'EBUSY'].includes(err.code);
      if (retryable && attempt < 5) {
        return new Promise((resolve) => setTimeout(resolve, 25 * (attempt + 1))).then(() =>
          writeAtomic(tmpPath, targetPath, contents, attempt + 1)
        );
      }
      // Son care: dogrudan hedefe yaz (atomik degil ama veri kaybolmaz)
      if (retryable) {
        return fs.promises.writeFile(targetPath, contents, 'utf8').then(() =>
          fs.promises.unlink(tmpPath).catch(() => {})
        );
      }
      throw err;
    });
}

class JsonDB {
  /**
   * @param {string} filePath - json dosyasinin tam yolu
   * @param {Array|Object} defaultValue - dosya yoksa olusturulacak icerik
   */
  constructor(filePath, defaultValue = []) {
    this.filePath = filePath;
    this.defaultValue = defaultValue;
    this.cache = null;
    this.writeQueue = Promise.resolve();
    this.writeCounter = 0;
    // Toplu islemlerde (seed gibi) her degisiklikte diske yazmamak icin
    this.paused = false;
    this.dirty = false;
  }

  /** Toplu islem baslat: save() cagrilari diske yazmaz, sadece isaretlenir. */
  pause() {
    this.paused = true;
  }

  /** Toplu islemi bitir ve bekleyen degisiklikleri tek seferde diske yaz. */
  resume() {
    this.paused = false;
    if (!this.dirty) return Promise.resolve();
    this.dirty = false;
    return this.save();
  }

  /** Dosyayi diskten okuyup bellege alir. Yoksa olusturur. */
  load() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    if (!fs.existsSync(this.filePath)) {
      this.cache = JSON.parse(JSON.stringify(this.defaultValue));
      fs.writeFileSync(this.filePath, JSON.stringify(this.cache, null, 2), 'utf8');
      return this.cache;
    }

    const raw = fs.readFileSync(this.filePath, 'utf8');
    try {
      this.cache = raw.trim() ? JSON.parse(raw) : JSON.parse(JSON.stringify(this.defaultValue));
    } catch (err) {
      throw new Error(`Bozuk JSON dosyasi: ${this.filePath} -> ${err.message}`);
    }
    return this.cache;
  }

  /** Bellekteki veriyi dondurur (gerekirse diskten yukler). */
  getAll() {
    if (this.cache === null) this.load();
    return this.cache;
  }

  /** Bellekteki veriyi degistirir ve diske yazar. */
  setAll(value) {
    this.cache = value;
    return this.save();
  }

  /**
   * Bellekteki veriyi diske yazar.
   * Atomic write + kuyruk: ayni anda gelen yazmalar birbirini bozmaz.
   */
  save() {
    if (this.paused) {
      this.dirty = true;
      return Promise.resolve();
    }

    const snapshot = JSON.stringify(this.cache, null, 2);
    this.writeCounter += 1;
    const tmpPath = `${this.filePath}.${process.pid}.${this.writeCounter}.tmp`;

    this.writeQueue = this.writeQueue.then(
      () => writeAtomic(tmpPath, this.filePath, snapshot),
      // onceki yazma hata verse bile kuyruk kilitlenmesin
      () => writeAtomic(tmpPath, this.filePath, snapshot)
    );
    return this.writeQueue;
  }
}

module.exports = JsonDB;
