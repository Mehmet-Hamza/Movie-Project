'use strict';

const router = require('express').Router();
const users = require('../controllers/users.controller');
const { optionalAuth, requireAuth, requireRole, requireOwnerOrAdmin } = require('../middleware/auth');

/** Kullanici kendi profilini duzenleyebilir, admin herkesinkini. */
const userOwner = requireOwnerOrAdmin((req) => {
  const user = users.getUserOr404(req.params.id);
  return user.id;
});

router.get('/', optionalAuth, users.listUsers);
router.post('/', requireAuth, requireRole('admin'), users.createUser);

router.get('/:id', optionalAuth, users.getUser);
router.patch('/:id', requireAuth, userOwner, users.updateUser);
router.delete('/:id', requireAuth, requireRole('admin'), users.deleteUser);

router.get('/:id/favorites', optionalAuth, users.getUserFavorites);
router.get('/:id/likes', optionalAuth, users.getUserLikes);
router.get('/:id/watchlist', optionalAuth, users.getUserWatchlist);
router.get('/:id/ratings', optionalAuth, users.getUserRatings);
router.get('/:id/comments', optionalAuth, users.getUserComments);
router.get('/:id/recommendations', optionalAuth, users.getRecommendations);

module.exports = router;
