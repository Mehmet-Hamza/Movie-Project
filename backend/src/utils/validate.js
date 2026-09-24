'use strict';

const ApiError = require('./ApiError');

/**
 * Kucuk ve bagimliliksiz bir dogrulama yardimcisi.
 * Kural formati:
 *   { field: 'title', type: 'string', required: true, min: 1, max: 200 }
 *
 * Hatalar tek seferde toplanip 422 ile birlikte donulur; boylece
 * frontend tum form hatalarini ayni anda gosterebilir.
 */
const validators = {
  string: (value) => typeof value === 'string',
  number: (value) => typeof value === 'number' && Number.isFinite(value),
  integer: (value) => Number.isInteger(value),
  boolean: (value) => typeof value === 'boolean',
  array: (value) => Array.isArray(value),
  object: (value) => value !== null && typeof value === 'object' && !Array.isArray(value),
  email: (value) => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  url: (value) => typeof value === 'string' && /^https?:\/\/.+/i.test(value),
};

function validate(payload, rules) {
  const errors = [];
  const result = {};

  for (const rule of rules) {
    const { field, type = 'string', required = false, min, max, enum: allowed, default: fallback } = rule;
    let value = payload[field];

    if (value === undefined || value === null || value === '') {
      if (required) {
        errors.push({ field, message: `"${field}" alani zorunludur.` });
      } else if (fallback !== undefined) {
        result[field] = fallback;
      }
      continue;
    }

    // Query string'den gelen sayilari otomatik cevir
    if ((type === 'number' || type === 'integer') && typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) value = parsed;
    }
    if (type === 'boolean' && typeof value === 'string') {
      if (value === 'true') value = true;
      else if (value === 'false') value = false;
    }

    if (!validators[type](value)) {
      errors.push({ field, message: `"${field}" alani ${type} tipinde olmalidir.` });
      continue;
    }

    if (type === 'string') {
      value = value.trim();
      if (min !== undefined && value.length < min) {
        errors.push({ field, message: `"${field}" en az ${min} karakter olmalidir.` });
        continue;
      }
      if (max !== undefined && value.length > max) {
        errors.push({ field, message: `"${field}" en fazla ${max} karakter olabilir.` });
        continue;
      }
    }

    if (type === 'number' || type === 'integer') {
      if (min !== undefined && value < min) {
        errors.push({ field, message: `"${field}" en az ${min} olmalidir.` });
        continue;
      }
      if (max !== undefined && value > max) {
        errors.push({ field, message: `"${field}" en fazla ${max} olabilir.` });
        continue;
      }
    }

    if (type === 'array') {
      if (min !== undefined && value.length < min) {
        errors.push({ field, message: `"${field}" en az ${min} eleman icermelidir.` });
        continue;
      }
      if (max !== undefined && value.length > max) {
        errors.push({ field, message: `"${field}" en fazla ${max} eleman icerebilir.` });
        continue;
      }
    }

    if (allowed && !allowed.includes(value)) {
      errors.push({ field, message: `"${field}" su degerlerden biri olmalidir: ${allowed.join(', ')}` });
      continue;
    }

    result[field] = value;
  }

  if (errors.length) throw ApiError.validation(errors);
  return result;
}

module.exports = validate;
