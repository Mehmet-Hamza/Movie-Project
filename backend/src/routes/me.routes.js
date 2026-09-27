'use strict';

const router = require('express').Router();
const users = require('../controllers/users.controller');
const { requireAuth } = require('../middleware/auth');

/**
 * /api/me/... kisayollari.
 * Frontend'in "kendi listem" ekranlarinda kullanici id'sini
 * tasimasina gerek kalmaz; token yeterlidir.
 */
const asSelf = (handler) => (req, res, next) => {
  req.params.id = req.user.id;
  return handler(req, res, next);
};

router.use(requireAuth);

router.get('/', asSelf(users.getUser));
router.get('/favorites', asSelf(users.getUserFavorites));
router.get('/likes', asSelf(users.getUserLikes));
router.get('/watchlist', asSelf(users.getUserWatchlist));
router.get('/ratings', asSelf(users.getUserRatings));
router.get('/comments', asSelf(users.getUserComments));
router.get('/recommendations', asSelf(users.getRecommendations));

module.exports = router;
