'use strict';

const createApp = require('./src/app');
const config = require('./src/config');
const { db } = require('./src/db');

async function bootstrap() {
  const app = createApp();

  // Veritabanı boşsa (örneğin data/ klasörü silinmişse) dummy verileri üret.
  // Sunucu, veri hazır olmadan istek almasın diye burada bekliyoruz.
  if (db.movies.raw().length === 0) {
    console.log('\nVeritabanı boş görünüyor, dummy veriler oluşturuluyor...');
    await require('./scripts/seed')();
  }

  const server = app.listen(config.port, () => {
    const url = `http://localhost:${config.port}`;
    console.log('');
    console.log('  🎬  Movie API hazır!');
    console.log('  ─────────────────────────────────────────────');
    console.log(`  Sunucu     : ${url}`);
    console.log(`  Swagger    : ${url}/swagger`);
    console.log(`  Dokümanlar : ${url}/docs`);
    console.log(`  API kökü   : ${url}/api`);
    console.log(`  Sağlık     : ${url}/api/health`);
    console.log(`  Ortam      : ${config.env}`);
    console.log('  ─────────────────────────────────────────────');
    console.log(`  ${db.movies.raw().length} film · ${db.users.raw().length} kullanıcı · örnek giriş: admin / 123456`);
    console.log('');
  });

  // Ctrl+C ile düzgün kapanış
  const shutdown = (signal) => {
    console.log(`\n${signal} alındı, sunucu kapatılıyor...`);
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  return server;
}

module.exports = bootstrap();
