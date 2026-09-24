'use strict';

const router = require('express').Router();
const genres = require('../controllers/genres.controller');
const { optionalAuth, requireAuth, requireRole } = require('../middleware/auth');

router.get('/', genres.listGenres);
router.post('/', requireAuth, requireRole('admin'), genres.createGenre);

router.get('/:id', genres.getGenre);
router.patch('/:id', requireAuth, requireRole('admin'), genres.updateGenre);
router.delete('/:id', requireAuth, requireRole('admin'), genres.deleteGenre);

router.get('/:id/movies', optionalAuth, genres.getGenreMovies);

module.exports = router;
