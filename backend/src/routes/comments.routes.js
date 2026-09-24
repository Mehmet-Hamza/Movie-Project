'use strict';

const router = require('express').Router();
const { db } = require('../db');
const comments = require('../controllers/comments.controller');
const { optionalAuth, requireAuth, requireOwnerOrAdmin } = require('../middleware/auth');

/** Yorumun sahibini bulur; sadece sahibi ya da admin duzenleyip silebilir. */
const commentOwner = requireOwnerOrAdmin((req) => {
  const comment = db.comments.findById(req.params.id);
  return comment ? comment.userId : null;
});

router.get('/', optionalAuth, comments.listComments);
router.get('/:id', optionalAuth, comments.getComment);
router.patch('/:id', requireAuth, commentOwner, comments.updateComment);
router.delete('/:id', requireAuth, commentOwner, comments.deleteComment);
router.post('/:id/like', requireAuth, comments.toggleCommentLike);

module.exports = router;
