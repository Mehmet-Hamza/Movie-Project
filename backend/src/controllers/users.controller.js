'use strict';

const { db } = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../utils/validate');
const paginate = require('../utils/paginate');
const ApiError = require('../utils/ApiError');
const { ok, created, noContent, paginated } = require('../utils/response');
const { hashPassword } = require('../utils/security');
const { serializeUser, getUserMovies } = require('../services/user.service');
const { serializeComment } = require('../services/comment.service');
const movieService = require('../services/movie.service');

function getUserOr404(idOrUsername) {
  const user =
    db.users.findById(idOrUsername) || db.users.findOne({ username: String(idOrUsername).toLowerCase() });
  if (!user) throw ApiError.notFound(`Kullanici bulunamadi: ${idOrUsername}`, 'USER_NOT_FOUND');
  return user;
}

/** GET /api/users - kullanici listesi (arama + sayfalama) */
const listUsers = asyncHandler(async (req, res) => {
  let users = db.users.all();

  if (req.query.search) {
    const term = String(req.query.search).toLocaleLowerCase('tr');
    users = users.filter(
      (u) =>
        u.username.toLocaleLowerCase('tr').includes(term) ||
        (u.fullName || '').toLocaleLowerCase('tr').includes(term)
    );
  }
  if (req.query.role) users = users.filter((u) => u.role === req.query.role);

  users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const { data, pagination } = paginate(users, req.query);
  return paginated(res, data.map((u) => serializeUser(u, { viewer: req.user })), pagination);
});

/** GET /api/users/:idOrUsername - herkese acik profil */
const getUser = asyncHandler(async (req, res) => {
  const user = getUserOr404(req.params.id);
  return ok(res, serializeUser(user, { viewer: req.user }));
});

/** Favori / begeni / izleme listesi endpoint'lerini ureten yardimci. */
function buildUserMovieList(collectionName) {
  return asyncHandler(async (req, res) => {
    const user = getUserOr404(req.params.id);
    let movies = getUserMovies(user.id, collectionName);

    movies = movieService.filterMovies(movies, req.query);
    if (req.query.sort) movies = movieService.sortMovies(movies, req.query.sort);

    const { data, pagination } = paginate(movies, req.query);
    return paginated(res, movieService.serializeMovies(data, { user: req.user }), pagination, {
      user: { id: user.id, username: user.username, fullName: user.fullName, avatar: user.avatar },
    });
  });
}

const getUserFavorites = buildUserMovieList('favorites');
const getUserLikes = buildUserMovieList('likes');
const getUserWatchlist = buildUserMovieList('watchlist');

/** GET /api/users/:id/ratings - kullanicinin puanladigi filmler */
const getUserRatings = asyncHandler(async (req, res) => {
  const user = getUserOr404(req.params.id);
  const ratings = db.ratings
    .find({ userId: user.id })
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .map((rating) => {
      const movie = db.movies.findById(rating.movieId);
      return movie ? { ...rating, movie: movieService.serializeMovie(movie, { user: req.user }) } : null;
    })
    .filter(Boolean);

  const { data, pagination } = paginate(ratings, req.query);
  return paginated(res, data, pagination);
});

/** GET /api/users/:id/comments - kullanicinin yorumlari */
const getUserComments = asyncHandler(async (req, res) => {
  const user = getUserOr404(req.params.id);
  const comments = db.comments
    .find((c) => c.userId === user.id && !c.isDeleted)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const { data, pagination } = paginate(comments, req.query);
  return paginated(res, data.map((c) => serializeComment(c, { user: req.user, withMovie: true })), pagination);
});

/**
 * GET /api/users/:id/recommendations
 * Kullanicinin favori ve begenilerindeki turlerden yola cikarak
 * daha once etkilesime girmedigi filmleri onerir.
 */
const getRecommendations = asyncHandler(async (req, res) => {
  const user = getUserOr404(req.params.id);

  const interacted = new Set([
    ...db.favorites.find({ userId: user.id }).map((f) => f.movieId),
    ...db.likes.find({ userId: user.id }).map((l) => l.movieId),
    ...db.ratings.find({ userId: user.id }).map((r) => r.movieId),
  ]);

  // Kullanicinin hangi turleri sevdigini agirlik olarak cikar
  const weights = new Map();
  interacted.forEach((movieId) => {
    const movie = db.movies.findById(movieId);
    if (!movie) return;
    movie.genres.forEach((slug) => weights.set(slug, (weights.get(slug) || 0) + 1));
  });

  const scored = db.movies
    .raw()
    .filter((movie) => !interacted.has(movie.id))
    .map((movie) => ({
      movie,
      score: movie.genres.reduce((sum, slug) => sum + (weights.get(slug) || 0) * 3, 0) + movie.rating,
    }))
    .sort((a, b) => b.score - a.score);

  const limit = Math.min(Number(req.query.limit) || 12, 50);
  const items = scored.slice(0, limit).map((entry) => movieService.serializeMovie(entry.movie, { user: req.user }));

  const basedOn = [...weights.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([slug, count]) => ({ slug, count }));

  return ok(res, items, { basedOn });
});

/** POST /api/users (admin) - elle kullanici olusturma */
const createUser = asyncHandler(async (req, res) => {
  const body = validate(req.body, [
    { field: 'username', type: 'string', required: true, min: 3, max: 24 },
    { field: 'email', type: 'email', required: true },
    { field: 'password', type: 'string', required: true, min: 6, max: 72 },
    { field: 'fullName', type: 'string', min: 2, max: 60 },
    { field: 'role', type: 'string', enum: ['user', 'admin'] },
  ]);

  const username = body.username.toLowerCase();
  if (db.users.exists({ username })) throw ApiError.conflict('Kullanici adi alinmis.', 'USERNAME_TAKEN');
  if (db.users.exists({ email: body.email.toLowerCase() })) throw ApiError.conflict('E-posta kayitli.', 'EMAIL_TAKEN');

  const user = await db.users.insert({
    username,
    email: body.email.toLowerCase(),
    password: hashPassword(body.password),
    fullName: body.fullName || body.username,
    avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(username)}`,
    bio: '',
    role: body.role || 'user',
    isActive: true,
  });

  return created(res, serializeUser(user, { viewer: req.user }));
});

/** PATCH /api/users/:id (admin veya kullanicinin kendisi) */
const updateUser = asyncHandler(async (req, res) => {
  const user = getUserOr404(req.params.id);
  const isAdmin = req.user.role === 'admin';

  const rules = [
    { field: 'fullName', type: 'string', min: 2, max: 60 },
    { field: 'bio', type: 'string', max: 280 },
    { field: 'avatar', type: 'url' },
  ];
  if (isAdmin) {
    rules.push({ field: 'role', type: 'string', enum: ['user', 'admin'] });
    rules.push({ field: 'isActive', type: 'boolean' });
  }

  const body = validate(req.body, rules);
  if (!Object.keys(body).length) throw ApiError.badRequest('Guncellenecek alan gonderilmedi.');

  const updated = await db.users.updateById(user.id, body);
  return ok(res, serializeUser(updated, { viewer: req.user }));
});

/**
 * DELETE /api/users/:id (admin)
 * Kullaniciya bagli tum begeni, favori, puan ve yorumlar da silinir,
 * ardindan etkilenen filmlerin sayaclari yeniden hesaplanir.
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = getUserOr404(req.params.id);
  if (user.id === req.user.id) throw ApiError.badRequest('Kendi hesabinizi silemezsiniz.');

  const affectedMovies = new Set([
    ...db.likes.find({ userId: user.id }).map((x) => x.movieId),
    ...db.favorites.find({ userId: user.id }).map((x) => x.movieId),
    ...db.watchlist.find({ userId: user.id }).map((x) => x.movieId),
    ...db.ratings.find({ userId: user.id }).map((x) => x.movieId),
    ...db.comments.find({ userId: user.id }).map((x) => x.movieId),
  ]);

  const commentIds = db.comments.find({ userId: user.id }).map((c) => c.id);
  await db.commentLikes.removeWhere((cl) => commentIds.includes(cl.commentId) || cl.userId === user.id);
  await db.comments.removeWhere((c) => c.userId === user.id);
  await db.likes.removeWhere((l) => l.userId === user.id);
  await db.favorites.removeWhere((f) => f.userId === user.id);
  await db.watchlist.removeWhere((w) => w.userId === user.id);
  await db.ratings.removeWhere((r) => r.userId === user.id);
  await db.users.removeById(user.id);

  for (const movieId of affectedMovies) await movieService.recomputeMovieStats(movieId);
  return noContent(res);
});

module.exports = {
  getUserOr404,
  listUsers,
  getUser,
  getUserFavorites,
  getUserLikes,
  getUserWatchlist,
  getUserRatings,
  getUserComments,
  getRecommendations,
  createUser,
  updateUser,
  deleteUser,
};
