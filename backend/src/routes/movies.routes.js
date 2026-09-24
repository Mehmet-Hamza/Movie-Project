'use strict';

const router = require('express').Router();
const movies = require('../controllers/movies.controller');
const comments = require('../controllers/comments.controller');
const { optionalAuth, requireAuth, requireRole } = require('../middleware/auth');

/**
 * DIKKAT: Sabit yollar (/top-rated gibi) mutlaka /:id'den ONCE tanimlanmali.
 * Aksi halde Express "top-rated" degerini :id parametresi saniyor.
 */
router.get('/top-rated', optionalAuth, movies.getTopRated);
router.get('/trending', optionalAuth, movies.getTrending);
router.get('/latest', optionalAuth, movies.getLatest);
router.get('/featured', optionalAuth, movies.getFeatured);
router.get('/random', optionalAuth, movies.getRandom);

// Liste ve olusturma
router.get('/', optionalAuth, movies.listMovies);
router.post('/', requireAuth, requireRole('admin'), movies.createMovie);

// Tekil film
router.get('/:id', optionalAuth, movies.getMovie);
router.put('/:id', requireAuth, requireRole('admin'), movies.replaceMovie);
router.patch('/:id', requireAuth, requireRole('admin'), movies.updateMovie);
router.delete('/:id', requireAuth, requireRole('admin'), movies.deleteMovie);

router.get('/:id/similar', optionalAuth, movies.getSimilar);

// Begenme
router.post('/:id/like', requireAuth, movies.like.add);
router.delete('/:id/like', requireAuth, movies.like.remove);
router.post('/:id/like/toggle', requireAuth, movies.like.toggle);

// Favoriler
router.post('/:id/favorite', requireAuth, movies.favorite.add);
router.delete('/:id/favorite', requireAuth, movies.favorite.remove);
router.post('/:id/favorite/toggle', requireAuth, movies.favorite.toggle);

// Izleme listesi
router.post('/:id/watchlist', requireAuth, movies.watchlist.add);
router.delete('/:id/watchlist', requireAuth, movies.watchlist.remove);
router.post('/:id/watchlist/toggle', requireAuth, movies.watchlist.toggle);

// Puanlama
router.get('/:id/ratings', optionalAuth, movies.listMovieRatings);
router.post('/:id/rate', requireAuth, movies.rateMovie);
router.delete('/:id/rate', requireAuth, movies.unrateMovie);

// Yorumlar
router.get('/:id/comments', optionalAuth, comments.listMovieComments);
router.post('/:id/comments', requireAuth, comments.createComment);

module.exports = router;
