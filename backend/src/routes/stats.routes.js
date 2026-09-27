'use strict';

const router = require('express').Router();
const stats = require('../controllers/stats.controller');
const { optionalAuth } = require('../middleware/auth');

router.get('/overview', stats.overview);
router.get('/genres', stats.genreStats);
router.get('/activity', optionalAuth, stats.activity);

module.exports = router;
