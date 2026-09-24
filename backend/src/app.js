'use strict';

const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const config = require('./config');
const { loadAll } = require('./db');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const openapi = require('./docs/openapi');

function createApp() {
  // Tum JSON dosyalarini bellege yukle
  loadAll();

  const app = express();

  // --- Temel middleware'ler ---------------------------------------------
  app.disable('x-powered-by');

  // CORS: frontend baska bir portta calisacagi icin sart.
  // CORS_ORIGIN=* varsayilanda tum kaynaklara izin verilir.
  const allowedOrigins = config.cors.origin === '*' ? '*' : config.cors.origin.split(',').map((o) => o.trim());
  app.use(
    cors({
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  if (config.env !== 'test') app.use(morgan('dev'));

  // Basit istek gecikmesi simulasyonu: ?delay=800 (loading state denemek icin)
  app.use((req, res, next) => {
    const delay = Number(req.query.delay);
    if (delay > 0) return setTimeout(next, Math.min(delay, 5000));
    return next();
  });

  // --- Statik dosyalar ve dokumantasyon ---------------------------------
  app.use(express.static(path.join(__dirname, '..', 'public')));

  app.get('/docs', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'docs.html')));

  // Swagger UI: /swagger adresinde interaktif OpenAPI dokümanı
  app.use(
    '/swagger',
    swaggerUi.serve,
    swaggerUi.setup(openapi, {
      customSiteTitle: 'Movie API - Swagger',
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        filter: true,
        tryItOutEnabled: true,
        displayRequestDuration: true,
      },
    })
  );

  // Ham OpenAPI tanımı: Postman / Insomnia / kod üreticilerine aktarmak için
  app.get('/openapi.json', (req, res) => res.json(openapi));

  // --- API ---------------------------------------------------------------
  app.use('/api', routes);

  // Kok adres: kucuk bir karsilama sayfasi/JSON
  app.get('/', (req, res) => {
    if (req.accepts('html')) return res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
    return res.json({ success: true, data: { message: 'Movie API calisiyor. /api adresine bakin.' } });
  });

  // --- Hata yakalayicilar (en sonda olmali) ------------------------------
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
