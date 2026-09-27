'use strict';

const router = require('express').Router();
const { db } = require('../db');
const pkg = require('../../package.json');

router.use('/auth', require('./auth.routes'));
router.use('/movies', require('./movies.routes'));
router.use('/genres', require('./genres.routes'));
router.use('/comments', require('./comments.routes'));
router.use('/users', require('./users.routes'));
router.use('/me', require('./me.routes'));
router.use('/stats', require('./stats.routes'));

/** GET /api/health - sunucu ayakta mi? */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      uptimeSeconds: Math.round(process.uptime()),
      version: pkg.version,
      timestamp: new Date().toISOString(),
      records: {
        movies: db.movies.raw().length,
        genres: db.genres.raw().length,
        users: db.users.raw().length,
        comments: db.comments.raw().length,
      },
    },
  });
});

/** GET /api - endpoint listesi (kendini belgeleyen kok endpoint) */
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'Movie API',
      version: pkg.version,
      description: pkg.description,
      documentation: {
        swagger: '/swagger',
        openapi: '/openapi.json',
        readable: '/docs',
      },
      endpoints: {
        auth: {
          'POST   /api/auth/register': 'Kayit ol',
          'POST   /api/auth/login': 'Giris yap (token alir)',
          'GET    /api/auth/me': 'Profilim (token gerekli)',
          'PATCH  /api/auth/me': 'Profilimi guncelle',
          'PATCH  /api/auth/me/password': 'Sifremi degistir',
        },
        movies: {
          'GET    /api/movies': 'Filmleri listele (filtre + siralama + sayfalama)',
          'GET    /api/movies/top-rated': 'En yuksek puanli filmler',
          'GET    /api/movies/trending': 'Populer filmler',
          'GET    /api/movies/latest': 'En yeni filmler',
          'GET    /api/movies/featured': 'One cikan filmler (slider)',
          'GET    /api/movies/random': 'Rastgele film',
          'GET    /api/movies/:id': 'Film detayi (id veya slug)',
          'POST   /api/movies': 'Film ekle (admin)',
          'PUT    /api/movies/:id': 'Filmi tamamen guncelle (admin)',
          'PATCH  /api/movies/:id': 'Filmi kismen guncelle (admin)',
          'DELETE /api/movies/:id': 'Film sil (admin)',
          'GET    /api/movies/:id/similar': 'Benzer filmler',
          'POST   /api/movies/:id/like': 'Begen',
          'DELETE /api/movies/:id/like': 'Begeniyi geri al',
          'POST   /api/movies/:id/like/toggle': 'Begeniyi ac/kapat',
          'POST   /api/movies/:id/favorite': 'Favorilere ekle',
          'DELETE /api/movies/:id/favorite': 'Favorilerden cikar',
          'POST   /api/movies/:id/favorite/toggle': 'Favoriyi ac/kapat',
          'POST   /api/movies/:id/watchlist': 'Izleme listesine ekle',
          'DELETE /api/movies/:id/watchlist': 'Izleme listesinden cikar',
          'POST   /api/movies/:id/watchlist/toggle': 'Izleme listesini ac/kapat',
          'POST   /api/movies/:id/rate': 'Puan ver (1-10)',
          'DELETE /api/movies/:id/rate': 'Puani geri cek',
          'GET    /api/movies/:id/ratings': 'Puan dagilimi',
          'GET    /api/movies/:id/comments': 'Filmin yorumlari',
          'POST   /api/movies/:id/comments': 'Yorum yap',
        },
        genres: {
          'GET    /api/genres': 'Tum turler (film sayisi ile)',
          'GET    /api/genres/:id': 'Tur detayi',
          'GET    /api/genres/:id/movies': 'Ture ait filmler',
          'POST   /api/genres': 'Tur ekle (admin)',
          'PATCH  /api/genres/:id': 'Tur guncelle (admin)',
          'DELETE /api/genres/:id': 'Tur sil (admin)',
        },
        comments: {
          'GET    /api/comments': 'Tum yorumlar',
          'GET    /api/comments/:id': 'Yorum detayi',
          'PATCH  /api/comments/:id': 'Yorumu duzenle (sahibi)',
          'DELETE /api/comments/:id': 'Yorumu sil (sahibi/admin)',
          'POST   /api/comments/:id/like': 'Yorumu begen/geri al',
        },
        users: {
          'GET    /api/users': 'Kullanicilar',
          'GET    /api/users/:id': 'Kullanici profili',
          'GET    /api/users/:id/favorites': 'Favori filmleri',
          'GET    /api/users/:id/likes': 'Begendigi filmler',
          'GET    /api/users/:id/watchlist': 'Izleme listesi',
          'GET    /api/users/:id/ratings': 'Verdigi puanlar',
          'GET    /api/users/:id/comments': 'Yorumlari',
          'GET    /api/users/:id/recommendations': 'Kisiye ozel oneriler',
          'POST   /api/users': 'Kullanici ekle (admin)',
          'PATCH  /api/users/:id': 'Kullanici guncelle (sahibi/admin)',
          'DELETE /api/users/:id': 'Kullanici sil (admin)',
        },
        me: {
          'GET    /api/me': 'Kendi profilim',
          'GET    /api/me/favorites': 'Favorilerim',
          'GET    /api/me/likes': 'Begendiklerim',
          'GET    /api/me/watchlist': 'Izleme listem',
          'GET    /api/me/ratings': 'Puanladiklarim',
          'GET    /api/me/comments': 'Yorumlarim',
          'GET    /api/me/recommendations': 'Bana ozel oneriler',
        },
        stats: {
          'GET    /api/stats/overview': 'Genel istatistikler',
          'GET    /api/stats/genres': 'Tur bazli istatistikler',
          'GET    /api/stats/activity': 'Son aktiviteler',
        },
        system: {
          'GET    /api/health': 'Saglik kontrolu',
        },
      },
    },
  });
});

module.exports = router;
