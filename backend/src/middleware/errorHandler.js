'use strict';

const ApiError = require('../utils/ApiError');
const config = require('../config');

/** Eslesmeyen tum rotalar icin 404 uretir. */
function notFound(req, res, next) {
  next(new ApiError(404, `Endpoint bulunamadi: ${req.method} ${req.originalUrl}`, 'ENDPOINT_NOT_FOUND'));
}

/**
 * Merkezi hata yakalayici.
 * Uygulamadaki tum hatalar buraya duser ve ayni JSON formatinda donulur.
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  // Hatali JSON body gonderilmisse
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_JSON', message: 'Gonderilen JSON gecersiz.' },
    });
  }

  const status = err.status || 500;
  const body = {
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: status === 500 && config.env === 'production' ? 'Sunucu hatasi' : err.message,
    },
  };

  if (err.details) body.error.details = err.details;
  if (config.env !== 'production' && status === 500) body.error.stack = err.stack;

  if (status === 500) console.error('[HATA]', err);

  return res.status(status).json(body);
}

module.exports = { notFound, errorHandler };
