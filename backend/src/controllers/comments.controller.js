'use strict';

const { db } = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../utils/validate');
const paginate = require('../utils/paginate');
const ApiError = require('../utils/ApiError');
const { ok, created, noContent, paginated } = require('../utils/response');
const { serializeComment, recomputeCommentStats } = require('../services/comment.service');
const movieService = require('../services/movie.service');
const { getMovieOr404 } = require('./movies.controller');

function getCommentOr404(id) {
  const comment = db.comments.findById(id);
  if (!comment || comment.isDeleted) throw ApiError.notFound('Yorum bulunamadi.', 'COMMENT_NOT_FOUND');
  return comment;
}

/** Yorumlar icin siralama secenekleri */
const COMMENT_SORTS = {
  newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  likes: (a, b) => b.likeCount - a.likeCount,
  rating: (a, b) => (b.rating || 0) - (a.rating || 0),
};

/**
 * GET /api/movies/:id/comments
 * Sadece ana yorumlar donulur; cevaplar her yorumun "replies" alaninda gelir.
 */
const listMovieComments = asyncHandler(async (req, res) => {
  const movie = getMovieOr404(req.params.id);

  const sortFn = COMMENT_SORTS[req.query.sort] || COMMENT_SORTS.newest;
  const comments = db.comments
    .find((c) => c.movieId === movie.id && !c.isDeleted && !c.parentId)
    .sort(sortFn);

  const { data, pagination } = paginate(comments, { ...req.query, limit: req.query.limit || 10 });
  const items = data.map((comment) => serializeComment(comment, { user: req.user, withReplies: true }));

  return paginated(res, items, pagination, { movieId: movie.id, totalComments: db.comments.count((c) => c.movieId === movie.id && !c.isDeleted) });
});

/**
 * POST /api/movies/:id/comments
 * Body: { "content": "...", "rating": 8, "parentId": "cm_..." }
 * rating alani opsiyoneldir; gonderilirse ayni anda filme puan da verilir.
 */
const createComment = asyncHandler(async (req, res) => {
  const movie = getMovieOr404(req.params.id);
  const body = validate(req.body, [
    { field: 'content', type: 'string', required: true, min: 2, max: 1000 },
    { field: 'rating', type: 'number', min: 1, max: 10 },
    { field: 'parentId', type: 'string', max: 40 },
    { field: 'spoiler', type: 'boolean' },
  ]);

  if (body.parentId) {
    const parent = getCommentOr404(body.parentId);
    if (parent.movieId !== movie.id) {
      throw ApiError.badRequest('Cevap verilen yorum bu filme ait degil.');
    }
    if (parent.parentId) {
      throw ApiError.badRequest('Bir cevaba tekrar cevap verilemez (tek seviye yanit).');
    }
  }

  const comment = await db.comments.insert({
    movieId: movie.id,
    userId: req.user.id,
    parentId: body.parentId || null,
    content: body.content,
    rating: body.rating || null,
    spoiler: body.spoiler || false,
    likeCount: 0,
    replyCount: 0,
    isEdited: false,
    isDeleted: false,
  });

  // Yorumla birlikte puan gonderildiyse kullanicinin puanini da kaydet
  if (body.rating && !body.parentId) {
    const existing = db.ratings.findOne({ userId: req.user.id, movieId: movie.id });
    if (existing) await db.ratings.updateById(existing.id, { score: body.rating });
    else await db.ratings.insert({ userId: req.user.id, movieId: movie.id, score: body.rating, review: '' });
  }

  if (body.parentId) await recomputeCommentStats(body.parentId);
  await movieService.recomputeMovieStats(movie.id);

  return created(res, serializeComment(db.comments.findById(comment.id), { user: req.user, withReplies: true }));
});

/**
 * GET /api/comments
 * Tum yorumlar (admin paneli veya "son yorumlar" bolumu icin).
 * ?movieId=... &userId=... ile filtrelenebilir.
 */
const listComments = asyncHandler(async (req, res) => {
  let comments = db.comments.find((c) => !c.isDeleted);

  if (req.query.movieId) comments = comments.filter((c) => c.movieId === req.query.movieId);
  if (req.query.userId) comments = comments.filter((c) => c.userId === req.query.userId);
  if (req.query.onlyRoot === 'true') comments = comments.filter((c) => !c.parentId);
  if (req.query.search) {
    const term = req.query.search.toLocaleLowerCase('tr');
    comments = comments.filter((c) => c.content.toLocaleLowerCase('tr').includes(term));
  }

  comments.sort(COMMENT_SORTS[req.query.sort] || COMMENT_SORTS.newest);

  const { data, pagination } = paginate(comments, req.query);
  const items = data.map((comment) => serializeComment(comment, { user: req.user, withMovie: true }));
  return paginated(res, items, pagination);
});

/** GET /api/comments/:id */
const getComment = asyncHandler(async (req, res) => {
  const comment = getCommentOr404(req.params.id);
  return ok(res, serializeComment(comment, { user: req.user, withReplies: true, withMovie: true }));
});

/** PATCH /api/comments/:id - sadece yorum sahibi duzenleyebilir */
const updateComment = asyncHandler(async (req, res) => {
  const comment = getCommentOr404(req.params.id);
  const body = validate(req.body, [
    { field: 'content', type: 'string', min: 2, max: 1000 },
    { field: 'rating', type: 'number', min: 1, max: 10 },
    { field: 'spoiler', type: 'boolean' },
  ]);

  if (!Object.keys(body).length) throw ApiError.badRequest('Guncellenecek alan gonderilmedi.');

  const updated = await db.comments.updateById(comment.id, { ...body, isEdited: true });
  return ok(res, serializeComment(updated, { user: req.user, withReplies: true }));
});

/**
 * DELETE /api/comments/:id
 * Yorum sahibi veya admin silebilir. Cevaplari olan yorum "soft delete"
 * yapilir; boylece cevap zinciri bozulmaz.
 */
const deleteComment = asyncHandler(async (req, res) => {
  const comment = getCommentOr404(req.params.id);
  const hasReplies = db.comments.count((c) => c.parentId === comment.id && !c.isDeleted) > 0;

  if (hasReplies) {
    await db.comments.updateById(comment.id, { isDeleted: true, content: '[silinmis yorum]' });
  } else {
    await db.commentLikes.removeWhere((cl) => cl.commentId === comment.id);
    await db.comments.removeById(comment.id);
  }

  if (comment.parentId) await recomputeCommentStats(comment.parentId);
  await movieService.recomputeMovieStats(comment.movieId);
  return noContent(res);
});

/** POST /api/comments/:id/like - yorum begenme (tekrar cagirinca geri alir) */
const toggleCommentLike = asyncHandler(async (req, res) => {
  const comment = getCommentOr404(req.params.id);
  const existing = db.commentLikes.findOne({ userId: req.user.id, commentId: comment.id });

  if (existing) await db.commentLikes.removeById(existing.id);
  else await db.commentLikes.insert({ userId: req.user.id, commentId: comment.id });

  const updated = await recomputeCommentStats(comment.id);
  return ok(res, {
    commentId: comment.id,
    isLikedByMe: !existing,
    likeCount: updated.likeCount,
  });
});

module.exports = {
  listMovieComments,
  createComment,
  listComments,
  getComment,
  updateComment,
  deleteComment,
  toggleCommentLike,
};
