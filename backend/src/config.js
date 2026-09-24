'use strict';

require('dotenv').config();
const path = require('path');

/**
 * Uygulama ayarlari tek bir yerden okunur.
 * .env dosyasi yoksa asagidaki varsayilanlar kullanilir, yani proje
 * hicbir ek kurulum yapmadan "npm start" ile calisir.
 */
const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 4000,

  jwt: {
    secret: process.env.JWT_SECRET || 'movie-api-super-secret-key-degistir-beni',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },

  pagination: {
    defaultLimit: Number(process.env.DEFAULT_PAGE_SIZE) || 12,
    maxLimit: Number(process.env.MAX_PAGE_SIZE) || 100,
  },

  // Dosya tabanli veritabaninin durdugu klasor.
  // Proje kopyalandiginda veri de birlikte tasinir.
  dataDir: path.join(__dirname, '..', 'data'),
};

module.exports = config;
