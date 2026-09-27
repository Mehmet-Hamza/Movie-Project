'use strict';

const { db } = require('../db');

/**
 * Yorumu API cevabina hazirlar: yazar bilgisi, begeni sayisi,
 * "ben begendim mi" bayragi ve varsa cevaplar (replies).
 */
function serializeComment(comment, { user = null, withReplies = false, withMovie = false } = {}) {
  const author = db.users.findById(comment.userId);

  const result = {
    ...comment,
    user: author
      ? { id: author.id, username: author.username, fullName: author.fullName, avatar: author.avatar, role: author.role }
      : { id: comment.userId, username: 'silinmis-kullanici', fullName: 'Silinmis Kullanici', avatar: null, role: 'user' },
    isLikedByMe: user ? db.commentLikes.exists({ userId: user.id, commentId: comment.id }) : false,
    isMine: user ? user.id === comment.userId : false,
  };

  if (withMovie) {
    const movie = db.movies.findById(comment.movieId);
    result.movie = movie
      ? { id: movie.id, title: movie.title, slug: movie.slug, year: movie.year, posterUrl: movie.posterUrl }
      : null;
  }

  if (withReplies) {
    result.replies = db.comments
      .find((c) => c.parentId === comment.id && !c.isDeleted)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map((reply) => serializeComment(reply, { user, withReplies: false }));
  }

  return result;
}

/** Bir yorumun begeni sayacini yeniden hesaplar. */
async function recomputeCommentStats(commentId) {
  const likeCount = db.commentLikes.count({ commentId });
  const replyCount = db.comments.count((c) => c.parentId === commentId && !c.isDeleted);
  return db.comments.updateById(commentId, { likeCount, replyCount });
}

module.exports = { serializeComment, recomputeCommentStats };
