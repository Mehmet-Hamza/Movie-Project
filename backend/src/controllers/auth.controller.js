'use strict';

const { db } = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../utils/validate');
const ApiError = require('../utils/ApiError');
const { ok, created } = require('../utils/response');
const { hashPassword, verifyPassword, signToken } = require('../utils/security');
const { serializeUser } = require('../services/user.service');

/**
 * POST /api/auth/register
 * Yeni kullanici olusturur ve dogrudan token doner
 * (kayittan sonra tekrar giris yapmaya gerek kalmasin diye).
 */
const register = asyncHandler(async (req, res) => {
  const body = validate(req.body, [
    { field: 'username', type: 'string', required: true, min: 3, max: 24 },
    { field: 'email', type: 'email', required: true },
    { field: 'password', type: 'string', required: true, min: 6, max: 72 },
    { field: 'fullName', type: 'string', min: 2, max: 60 },
  ]);

  const username = body.username.toLowerCase();
  const email = body.email.toLowerCase();

  if (db.users.exists({ username })) {
    throw ApiError.conflict('Bu kullanici adi zaten alinmis.', 'USERNAME_TAKEN');
  }
  if (db.users.exists({ email })) {
    throw ApiError.conflict('Bu e-posta adresi zaten kayitli.', 'EMAIL_TAKEN');
  }

  const user = await db.users.insert({
    username,
    email,
    password: hashPassword(body.password),
    fullName: body.fullName || body.username,
    avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(username)}`,
    bio: '',
    role: 'user',
    isActive: true,
  });

  return created(res, {
    token: signToken(user),
    user: serializeUser(user, { viewer: user }),
  });
});

/**
 * POST /api/auth/login
 * Kullanici adi VEYA e-posta ile giris yapilabilir.
 */
const login = asyncHandler(async (req, res) => {
  const body = validate(req.body, [
    { field: 'identifier', type: 'string', min: 3, max: 80 },
    { field: 'username', type: 'string', min: 3, max: 80 },
    { field: 'email', type: 'string', min: 3, max: 80 },
    { field: 'password', type: 'string', required: true, min: 1 },
  ]);

  const identifier = (body.identifier || body.username || body.email || '').toLowerCase();
  if (!identifier) {
    throw ApiError.validation([{ field: 'identifier', message: 'Kullanici adi veya e-posta gonderin.' }]);
  }

  const user =
    db.users.findOne({ username: identifier }) || db.users.findOne({ email: identifier });

  if (!user || !verifyPassword(body.password, user.password)) {
    throw new ApiError(401, 'Kullanici adi veya sifre hatali.', 'INVALID_CREDENTIALS');
  }
  if (!user.isActive) {
    throw ApiError.forbidden('Hesabiniz devre disi birakilmis.');
  }

  await db.users.updateById(user.id, { lastLoginAt: new Date().toISOString() });

  return ok(res, {
    token: signToken(user),
    user: serializeUser(db.users.findById(user.id), { viewer: user }),
  });
});

/** GET /api/auth/me - token ile giris yapmis kullanicinin bilgileri */
const me = asyncHandler(async (req, res) => {
  const user = db.users.findById(req.user.id);
  return ok(res, serializeUser(user, { viewer: req.user }));
});

/** PATCH /api/auth/me - profil guncelleme */
const updateMe = asyncHandler(async (req, res) => {
  const body = validate(req.body, [
    { field: 'fullName', type: 'string', min: 2, max: 60 },
    { field: 'bio', type: 'string', max: 280 },
    { field: 'avatar', type: 'url' },
    { field: 'email', type: 'email' },
  ]);

  if (body.email) {
    const email = body.email.toLowerCase();
    const owner = db.users.findOne({ email });
    if (owner && owner.id !== req.user.id) {
      throw ApiError.conflict('Bu e-posta adresi baska bir hesapta kayitli.', 'EMAIL_TAKEN');
    }
    body.email = email;
  }

  const updated = await db.users.updateById(req.user.id, body);
  return ok(res, serializeUser(updated, { viewer: req.user }));
});

/** PATCH /api/auth/me/password - sifre degistirme */
const changePassword = asyncHandler(async (req, res) => {
  const body = validate(req.body, [
    { field: 'currentPassword', type: 'string', required: true, min: 1 },
    { field: 'newPassword', type: 'string', required: true, min: 6, max: 72 },
  ]);

  const user = db.users.findById(req.user.id);
  if (!verifyPassword(body.currentPassword, user.password)) {
    throw new ApiError(401, 'Mevcut sifreniz hatali.', 'INVALID_CREDENTIALS');
  }

  await db.users.updateById(user.id, { password: hashPassword(body.newPassword) });
  return ok(res, { message: 'Sifreniz guncellendi.' });
});

module.exports = { register, login, me, updateMe, changePassword };
