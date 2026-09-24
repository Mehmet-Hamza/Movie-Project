'use strict';

const { db } = require('../db');
const ApiError = require('../utils/ApiError');
const { verifyToken } = require('../utils/security');
const { omit } = require('../utils/helpers');

/** Authorization: Bearer <token> header'indan token'i cikarir. */
function extractToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  // Kolaylik olsun diye ?token=... da destekleniyor (sadece egitim amacli)
  if (req.query.token) return String(req.query.token);
  return null;
}

/**
 * Token varsa kullaniciyi req.user'a koyar, yoksa sessizce devam eder.
 * Film listesinde "bu filmi begendim mi?" bilgisini donebilmek icin kullanilir.
 */
function optionalAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) return next();

  const payload = verifyToken(token);
  if (!payload) return next();

  const user = db.users.findById(payload.sub);
  if (user) req.user = omit(user, ['password']);
  return next();
}

/** Token zorunlu. Yoksa 401 doner. */
function requireAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) return next(ApiError.unauthorized('Token gonderilmedi. Authorization: Bearer <token>'));

  const payload = verifyToken(token);
  if (!payload) return next(ApiError.unauthorized('Token gecersiz veya suresi dolmus.'));

  const user = db.users.findById(payload.sub);
  if (!user) return next(ApiError.unauthorized('Token sahibi kullanici bulunamadi.'));

  req.user = omit(user, ['password']);
  return next();
}

/** Sadece belirtilen rollere izin verir: requireRole('admin') */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden(`Bu islem icin gerekli rol: ${roles.join(' veya ')}`));
    }
    return next();
  };
}

/**
 * Kayit sahibi ya da admin olmayi zorunlu kilar.
 * Ornek: kullanici sadece kendi yorumunu silebilir, admin hepsini silebilir.
 */
function requireOwnerOrAdmin(getOwnerId) {
  return (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (req.user.role === 'admin') return next();

    const ownerId = getOwnerId(req);
    if (ownerId && ownerId === req.user.id) return next();
    return next(ApiError.forbidden('Sadece kendi kaydiniz uzerinde islem yapabilirsiniz.'));
  };
}

module.exports = { optionalAuth, requireAuth, requireRole, requireOwnerOrAdmin };
