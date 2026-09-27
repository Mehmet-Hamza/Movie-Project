'use strict';

/**
 * Tum endpoint'ler ayni cevap formatini kullanir.
 * Basarili:  { success: true, data: ..., meta?: ... }
 * Hatali:    { success: false, error: { code, message, details } }
 *
 * Frontend tarafinda tek bir "apiClient" yazmayi cok kolaylastirir.
 */
function ok(res, data, meta) {
  const body = { success: true, data };
  if (meta) body.meta = meta;
  return res.status(200).json(body);
}

function created(res, data, meta) {
  const body = { success: true, data };
  if (meta) body.meta = meta;
  return res.status(201).json(body);
}

function noContent(res) {
  return res.status(204).end();
}

function paginated(res, items, pagination, extraMeta = {}) {
  return res.status(200).json({
    success: true,
    data: items,
    meta: { pagination, ...extraMeta },
  });
}

module.exports = { ok, created, noContent, paginated };
