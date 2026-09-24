'use strict';

const { db } = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../utils/validate');
const paginate = require('../utils/paginate');
const ApiError = require('../utils/ApiError');
const { ok, created, noContent, paginated } = require('../utils/response');
const { slugify, sample, round } = require('../utils/helpers');
const movieService = require('../services/movie.service');

/** id ya da slug ile film bulur; bulamazsa 404 firlatir. */
function getMovieOr404(idOrSlug) {
  const movie = db.movies.findById(idOrSlug) || db.movies.findOne({ slug: idOrSlug });
  if (!movie) throw ApiError.notFound(`Film bulunamadi: ${idOrSlug}`, 'MOVIE_NOT_FOUND');
  return movie;
}

/**
 * GET /api/movies
 * Filtreleme + siralama + sayfalama.
 * Ornek: /api/movies?genre=action&minRating=8&sort=-rating&page=1&limit=12
 */
const listMovies = asyncHandler(async (req, res) => {
  const genreIndex = movieService.buildGenreIndex();

  let movies = movieService.filterMovies(db.movies.raw(), req.query);
  movies = movieService.sortMovies(movies, req.query.sort || '-popularity');

  const { data, pagination } = paginate(movies, req.query);
  const items = movieService.serializeMovies(data, { user: req.user, genreIndex });

  return paginated(res, items, pagination, {
    filters: {
      search: req.query.search || null,
      genre: req.query.genre || null,
      sort: req.query.sort || '-popularity',
    },
    availableSorts: movieService.SORT_KEYS,
  });
});

/**
 * GET /api/movies/:idOrSlug
 * Detay sayfasi. Her goruntulemede viewCount artar.
 */
const getMovie = asyncHandler(async (req, res) => {
  const movie = getMovieOr404(req.params.id);

  const updated = await db.movies.updateById(movie.id, { viewCount: (movie.viewCount || 0) + 1 });
  const data = movieService.serializeMovie(updated, { user: req.user });

  data.similar = movieService
    .findSimilarMovies(updated, 6)
    .map((item) => movieService.serializeMovie(item, { user: req.user }));

  return ok(res, data);
});

/** GET /api/movies/:idOrSlug/similar - benzer filmler */
const getSimilar = asyncHandler(async (req, res) => {
  const movie = getMovieOr404(req.params.id);
  const limit = Math.min(Number(req.query.limit) || 6, 24);
  const similar = movieService.findSimilarMovies(movie, limit);
  return ok(res, movieService.serializeMovies(similar, { user: req.user }));
});

/** GET /api/movies/top-rated - en yuksek puanlilar */
const getTopRated = asyncHandler(async (req, res) => {
  const minVotes = Number(req.query.minVotes) || 0;
  const movies = movieService.sortMovies(
    db.movies.raw().filter((m) => m.ratingCount >= minVotes),
    '-rating,-ratingCount'
  );
  const { data, pagination } = paginate(movies, { limit: req.query.limit || 10, page: req.query.page });
  return paginated(res, movieService.serializeMovies(data, { user: req.user }), pagination);
});

/** GET /api/movies/trending - populerlik puanina gore */
const getTrending = asyncHandler(async (req, res) => {
  const movies = movieService.sortMovies(db.movies.raw(), '-popularity');
  const { data, pagination } = paginate(movies, { limit: req.query.limit || 10, page: req.query.page });
  return paginated(res, movieService.serializeMovies(data, { user: req.user }), pagination);
});

/** GET /api/movies/latest - en yeni filmler */
const getLatest = asyncHandler(async (req, res) => {
  const movies = movieService.sortMovies(db.movies.raw(), '-releaseDate');
  const { data, pagination } = paginate(movies, { limit: req.query.limit || 10, page: req.query.page });
  return paginated(res, movieService.serializeMovies(data, { user: req.user }), pagination);
});

/** GET /api/movies/featured - one cikarilan filmler (anasayfa slider) */
const getFeatured = asyncHandler(async (req, res) => {
  const movies = movieService.sortMovies(db.movies.raw().filter((m) => m.featured), '-rating');
  return ok(res, movieService.serializeMovies(movies, { user: req.user }));
});

/** GET /api/movies/random - rastgele film(ler); "bugun ne izlesem" butonu icin */
const getRandom = asyncHandler(async (req, res) => {
  const count = Math.min(Number(req.query.count) || 1, 20);
  const pool = movieService.filterMovies(db.movies.raw(), req.query);
  if (!pool.length) throw ApiError.notFound('Kritere uyan film yok.', 'NO_MOVIE_FOUND');

  const picked = sample(pool, count);
  const data = movieService.serializeMovies(picked, { user: req.user });
  return ok(res, count === 1 ? data[0] : data);
});

/** Film olusturma/guncelleme icin ortak dogrulama kurallari. */
const movieRules = (isCreate) => [
  { field: 'title', type: 'string', required: isCreate, min: 1, max: 200 },
  { field: 'originalTitle', type: 'string', max: 200 },
  { field: 'overview', type: 'string', max: 4000 },
  { field: 'tagline', type: 'string', max: 200 },
  { field: 'year', type: 'integer', required: isCreate, min: 1888, max: 2100 },
  { field: 'releaseDate', type: 'string', max: 10 },
  { field: 'runtime', type: 'integer', min: 1, max: 600 },
  { field: 'genres', type: 'array', min: 1, max: 8 },
  { field: 'director', type: 'string', max: 120 },
  { field: 'cast', type: 'array', max: 40 },
  { field: 'posterUrl', type: 'url' },
  { field: 'backdropUrl', type: 'url' },
  { field: 'trailerUrl', type: 'url' },
  { field: 'language', type: 'string', max: 8 },
  { field: 'country', type: 'string', max: 60 },
  { field: 'budget', type: 'integer', min: 0 },
  { field: 'revenue', type: 'integer', min: 0 },
  { field: 'status', type: 'string', enum: ['released', 'upcoming', 'in-production'] },
  { field: 'featured', type: 'boolean' },
];

/** Gonderilen tur slug degerlerinin gercekten var oldugunu kontrol eder. */
function assertGenresExist(genres) {
  if (!genres) return;
  const known = new Set(db.genres.raw().map((g) => g.slug));
  const unknown = genres.filter((g) => !known.has(g));
  if (unknown.length) {
    throw ApiError.validation([
      { field: 'genres', message: `Bilinmeyen tur(ler): ${unknown.join(', ')}. /api/genres ile listeyi gorebilirsiniz.` },
    ]);
  }
}

/** POST /api/movies (admin) */
const createMovie = asyncHandler(async (req, res) => {
  const body = validate(req.body, movieRules(true));
  assertGenresExist(body.genres);

  let slug = slugify(`${body.title}-${body.year}`);
  if (db.movies.exists({ slug })) slug = `${slug}-${Date.now().toString(36)}`;

  const movie = await db.movies.insert({
    title: body.title,
    originalTitle: body.originalTitle || body.title,
    slug,
    overview: body.overview || '',
    tagline: body.tagline || '',
    year: body.year,
    releaseDate: body.releaseDate || `${body.year}-01-01`,
    runtime: body.runtime || 100,
    genres: body.genres || [],
    director: body.director || 'Bilinmiyor',
    cast: body.cast || [],
    posterUrl: body.posterUrl || null,
    backdropUrl: body.backdropUrl || null,
    trailerUrl: body.trailerUrl || null,
    language: body.language || 'en',
    country: body.country || 'United States',
    budget: body.budget || 0,
    revenue: body.revenue || 0,
    status: body.status || 'released',
    featured: body.featured || false,
    rating: 0,
    ratingCount: 0,
    likeCount: 0,
    favoriteCount: 0,
    watchlistCount: 0,
    commentCount: 0,
    viewCount: 0,
    popularity: 0,
    createdBy: req.user.id,
  });

  return created(res, movieService.serializeMovie(movie, { user: req.user }));
});

/** PUT /api/movies/:id (admin) - tam guncelleme */
const replaceMovie = asyncHandler(async (req, res) => {
  const movie = getMovieOr404(req.params.id);
  const body = validate(req.body, movieRules(true));
  assertGenresExist(body.genres);

  const updated = await db.movies.updateById(movie.id, {
    ...body,
    slug: slugify(`${body.title}-${body.year}`),
  });
  return ok(res, movieService.serializeMovie(updated, { user: req.user }));
});

/** PATCH /api/movies/:id (admin) - kismi guncelleme */
const updateMovie = asyncHandler(async (req, res) => {
  const movie = getMovieOr404(req.params.id);
  const body = validate(req.body, movieRules(false));
  assertGenresExist(body.genres);

  if (!Object.keys(body).length) throw ApiError.badRequest('Guncellenecek alan gonderilmedi.');
  if (body.title || body.year) {
    body.slug = slugify(`${body.title || movie.title}-${body.year || movie.year}`);
  }

  const updated = await db.movies.updateById(movie.id, body);
  return ok(res, movieService.serializeMovie(updated, { user: req.user }));
});

/**
 * DELETE /api/movies/:id (admin)
 * Filme bagli tum begeni, favori, puan ve yorumlari da temizler
 * (iliskisel veritabanindaki "cascade delete" davranisinin taklidi).
 */
const deleteMovie = asyncHandler(async (req, res) => {
  const movie = getMovieOr404(req.params.id);
  const movieId = movie.id;

  const commentIds = db.comments.find({ movieId }).map((c) => c.id);
  await db.commentLikes.removeWhere((cl) => commentIds.includes(cl.commentId));
  await db.comments.removeWhere((c) => c.movieId === movieId);
  await db.likes.removeWhere((l) => l.movieId === movieId);
  await db.favorites.removeWhere((f) => f.movieId === movieId);
  await db.watchlist.removeWhere((w) => w.movieId === movieId);
  await db.ratings.removeWhere((r) => r.movieId === movieId);
  await db.movies.removeById(movieId);

  return noContent(res);
});

/* =========================================================================
 *  ETKILESIMLER: BEGENME / FAVORI / IZLEME LISTESI
 * =========================================================================
 * Ucu de ayni mantikta calistigi icin tek bir fabrika fonksiyonu ile
 * uretiliyor. Boylece kod tekrari olmuyor.
 *   POST   /api/movies/:id/like          -> ekle (zaten varsa hata vermez)
 *   DELETE /api/movies/:id/like          -> kaldir
 *   POST   /api/movies/:id/like/toggle   -> varsa kaldir, yoksa ekle
 */
function buildInteraction({ collection, flagName, countName }) {
  const respond = async (res, movieId, active, user) => {
    const updated = await movieService.recomputeMovieStats(movieId);
    return ok(res, {
      movieId,
      [flagName]: active,
      [countName]: updated[countName],
      movie: movieService.serializeMovie(updated, { user }),
    });
  };

  return {
    add: asyncHandler(async (req, res) => {
      const movie = getMovieOr404(req.params.id);
      const existing = db[collection].findOne({ userId: req.user.id, movieId: movie.id });
      if (!existing) {
        await db[collection].insert({ userId: req.user.id, movieId: movie.id });
      }
      return respond(res, movie.id, true, req.user);
    }),

    remove: asyncHandler(async (req, res) => {
      const movie = getMovieOr404(req.params.id);
      const existing = db[collection].findOne({ userId: req.user.id, movieId: movie.id });
      if (existing) await db[collection].removeById(existing.id);
      return respond(res, movie.id, false, req.user);
    }),

    toggle: asyncHandler(async (req, res) => {
      const movie = getMovieOr404(req.params.id);
      const existing = db[collection].findOne({ userId: req.user.id, movieId: movie.id });
      if (existing) {
        await db[collection].removeById(existing.id);
        return respond(res, movie.id, false, req.user);
      }
      await db[collection].insert({ userId: req.user.id, movieId: movie.id });
      return respond(res, movie.id, true, req.user);
    }),
  };
}

const like = buildInteraction({ collection: 'likes', flagName: 'isLiked', countName: 'likeCount' });
const favorite = buildInteraction({ collection: 'favorites', flagName: 'isFavorite', countName: 'favoriteCount' });
const watchlist = buildInteraction({ collection: 'watchlist', flagName: 'isInWatchlist', countName: 'watchlistCount' });

/**
 * POST /api/movies/:id/rate  { "score": 8 }
 * Ayni kullanici tekrar puan verirse eski puani guncellenir.
 * Filmin ortalama puani her seferinde bastan hesaplanir.
 */
const rateMovie = asyncHandler(async (req, res) => {
  const movie = getMovieOr404(req.params.id);
  const body = validate(req.body, [
    { field: 'score', type: 'number', required: true, min: 1, max: 10 },
    { field: 'review', type: 'string', max: 500 },
  ]);

  const score = round(body.score, 1);
  const existing = db.ratings.findOne({ userId: req.user.id, movieId: movie.id });

  if (existing) {
    await db.ratings.updateById(existing.id, { score, review: body.review || existing.review || '' });
  } else {
    await db.ratings.insert({ userId: req.user.id, movieId: movie.id, score, review: body.review || '' });
  }

  const updated = await movieService.recomputeMovieStats(movie.id);
  return ok(res, {
    movieId: movie.id,
    myRating: score,
    rating: updated.rating,
    ratingCount: updated.ratingCount,
    movie: movieService.serializeMovie(updated, { user: req.user }),
  });
});

/** DELETE /api/movies/:id/rate - kullanicinin puanini geri ceker */
const unrateMovie = asyncHandler(async (req, res) => {
  const movie = getMovieOr404(req.params.id);
  const existing = db.ratings.findOne({ userId: req.user.id, movieId: movie.id });
  if (!existing) throw ApiError.notFound('Bu filme daha once puan vermemissiniz.', 'RATING_NOT_FOUND');

  await db.ratings.removeById(existing.id);
  const updated = await movieService.recomputeMovieStats(movie.id);

  return ok(res, {
    movieId: movie.id,
    myRating: null,
    rating: updated.rating,
    ratingCount: updated.ratingCount,
  });
});

/** GET /api/movies/:id/ratings - filme verilen tum puanlar (puan dagilimi grafigi icin) */
const listMovieRatings = asyncHandler(async (req, res) => {
  const movie = getMovieOr404(req.params.id);
  const ratings = db.ratings.find({ movieId: movie.id });

  const distribution = Array.from({ length: 10 }, (_, i) => ({
    score: i + 1,
    count: ratings.filter((r) => Math.round(r.score) === i + 1).length,
  }));

  const items = ratings.map((rating) => {
    const author = db.users.findById(rating.userId);
    return {
      ...rating,
      user: author ? { id: author.id, username: author.username, avatar: author.avatar } : null,
    };
  });

  return ok(res, {
    movieId: movie.id,
    average: movie.rating,
    total: ratings.length,
    distribution,
    ratings: items,
  });
});

module.exports = {
  getMovieOr404,
  listMovies,
  getMovie,
  getSimilar,
  getTopRated,
  getTrending,
  getLatest,
  getFeatured,
  getRandom,
  createMovie,
  replaceMovie,
  updateMovie,
  deleteMovie,
  like,
  favorite,
  watchlist,
  rateMovie,
  unrateMovie,
  listMovieRatings,
};
