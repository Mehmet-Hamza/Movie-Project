'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');

/** Duz metin sifreyi hash'ler. Veritabaninda asla duz sifre tutulmaz. */
function hashPassword(plain) {
  return bcrypt.hashSync(plain, 10);
}

/** Girilen sifre ile kayitli hash'i karsilastirir. */
function verifyPassword(plain, hash) {
  return bcrypt.compareSync(plain, hash);
}

/** Kullanicidan JWT uretir. Frontend bunu Authorization header'inda gonderir. */
function signToken(user) {
  return jwt.sign(
    { sub: user.id, username: user.username, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

/** Token'i dogrular; gecersizse null doner. */
function verifyToken(token) {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch {
    return null;
  }
}

module.exports = { hashPassword, verifyPassword, signToken, verifyToken };
