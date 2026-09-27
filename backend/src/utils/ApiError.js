'use strict';

/**
 * Uygulama genelinde kullanilan hata sinifi.
 * throw new ApiError(404, 'Film bulunamadi', 'MOVIE_NOT_FOUND')
 * seklinde firlatilir ve errorHandler middleware'i bunu JSON'a cevirir.
 */
class ApiError extends Error {
  constructor(status, message, code = 'ERROR', details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Gecersiz istek', details = null) {
    return new ApiError(400, message, 'BAD_REQUEST', details);
  }

  static unauthorized(message = 'Giris yapmaniz gerekiyor') {
    return new ApiError(401, message, 'UNAUTHORIZED');
  }

  static forbidden(message = 'Bu islem icin yetkiniz yok') {
    return new ApiError(403, message, 'FORBIDDEN');
  }

  static notFound(message = 'Kayit bulunamadi', code = 'NOT_FOUND') {
    return new ApiError(404, message, code);
  }

  static conflict(message = 'Kayit zaten mevcut', code = 'CONFLICT') {
    return new ApiError(409, message, code);
  }

  static validation(details, message = 'Dogrulama hatasi') {
    return new ApiError(422, message, 'VALIDATION_ERROR', details);
  }
}

module.exports = ApiError;
