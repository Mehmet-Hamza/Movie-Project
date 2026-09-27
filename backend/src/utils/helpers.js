'use strict';

/** "The Dark Knight" -> "the-dark-knight" */
function slugify(text) {
  const trMap = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', İ: 'i' };
  return String(text)
    .split('')
    .map((ch) => trMap[ch] || ch)
    .join('')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Sayiyi belirtilen araliga sikistirir. */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/** Ondalik basamak sayisini sinirlar: 8.4166 -> 8.4 */
function round(value, decimals = 1) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** Objeden sadece izin verilen alanlari alir (whitelist). */
function pick(source, keys) {
  const result = {};
  keys.forEach((key) => {
    if (source[key] !== undefined) result[key] = source[key];
  });
  return result;
}

/** Objeden belirtilen alanlari cikarir (orn. sifre). */
function omit(source, keys) {
  const result = { ...source };
  keys.forEach((key) => delete result[key]);
  return result;
}

/** "1,2,3" veya ["1","2"] -> ["1","2","3"] */
function toArray(value) {
  if (value === undefined || value === null || value === '') return [];
  if (Array.isArray(value)) return value.flatMap((v) => String(v).split(',')).map((v) => v.trim()).filter(Boolean);
  return String(value).split(',').map((v) => v.trim()).filter(Boolean);
}

/** Diziden rastgele n eleman secer. */
function sample(array, n = 1) {
  const copy = [...array];
  const result = [];
  while (copy.length && result.length < n) {
    const index = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(index, 1)[0]);
  }
  return result;
}

/** Turkce karakterleri de dikkate alan, buyuk/kucuk harf duyarsiz arama. */
function normalizeForSearch(text) {
  return slugify(text).replace(/-/g, ' ');
}

module.exports = { slugify, clamp, round, pick, omit, toArray, sample, normalizeForSearch };
