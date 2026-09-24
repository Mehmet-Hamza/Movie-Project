'use strict';

const { db } = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/response');
const { round } = require('../utils/helpers');
const movieService = require('../services/movie.service');
const { serializeComment } = require('../services/comment.service');

/**
 * GET /api/stats/overview
 * Anasayfa / admin paneli icin ozet rakamlar.
 * Ogrenci bu veriyle kart ve grafik tasarlayabilir.
 */
const overview = asyncHandler(async (req, res) => {
  const movies = db.movies.raw();
  const rated = movies.filter((m) => m.ratingCount > 0);

  const years = movies.map((m) => m.year);
  const decades = {};
  years.forEach((year) => {
    const decade = `${Math.floor(year / 10) * 10}s`;
    decades[decade] = (decades[decade] || 0) + 1;
  });

  return ok(res, {
    totals: {
      movies: movies.length,
      genres: db.genres.raw().length,
      users: db.users.raw().length,
      comments: db.comments.count((c) => !c.isDeleted),
      likes: db.likes.raw().length,
      favorites: db.favorites.raw().length,
      watchlist: db.watchlist.raw().length,
      ratings: db.ratings.raw().length,
    },
    averageRating: rated.length ? round(rated.reduce((s, m) => s + m.rating, 0) / rated.length, 2) : 0,
    averageRuntime: movies.length ? Math.round(movies.reduce((s, m) => s + m.runtime, 0) / movies.length) : 0,
    yearRange: { min: Math.min(...years), max: Math.max(...years) },
    moviesByDecade: Object.entries(decades)
      .map(([decade, count]) => ({ decade, count }))
      .sort((a, b) => a.decade.localeCompare(b.decade)),
    topRated: movieService
      .sortMovies(movies, '-rating,-ratingCount')
      .slice(0, 5)
      .map((m) => ({ id: m.id, title: m.title, slug: m.slug, rating: m.rating, posterUrl: m.posterUrl })),
    mostLiked: movieService
      .sortMovies(movies, '-likes')
      .slice(0, 5)
      .map((m) => ({ id: m.id, title: m.title, slug: m.slug, likeCount: m.likeCount, posterUrl: m.posterUrl })),
    mostCommented: movieService
      .sortMovies(movies, '-comments')
      .slice(0, 5)
      .map((m) => ({ id: m.id, title: m.title, slug: m.slug, commentCount: m.commentCount, posterUrl: m.posterUrl })),
  });
});

/** GET /api/stats/genres - tur bazli dagilim (pasta / bar grafigi icin) */
const genreStats = asyncHandler(async (req, res) => {
  const movies = db.movies.raw();

  const stats = db.genres.all().map((genre) => {
    const list = movies.filter((m) => m.genres.includes(genre.slug));
    const rated = list.filter((m) => m.ratingCount > 0);
    return {
      slug: genre.slug,
      name: genre.name,
      nameTr: genre.nameTr,
      color: genre.color,
      movieCount: list.length,
      averageRating: rated.length ? round(rated.reduce((s, m) => s + m.rating, 0) / rated.length, 2) : 0,
      totalLikes: list.reduce((s, m) => s + m.likeCount, 0),
      totalFavorites: list.reduce((s, m) => s + m.favoriteCount, 0),
    };
  });

  return ok(res, stats.sort((a, b) => b.movieCount - a.movieCount));
});

/** GET /api/stats/activity - son etkinlikler akisi (aktivite feed'i) */
const activity = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 20, 100);

  const comments = db.comments
    .find((c) => !c.isDeleted)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit)
    .map((c) => ({ type: 'comment', at: c.createdAt, data: serializeComment(c, { user: req.user, withMovie: true }) }));

  const ratings = db.ratings
    .all()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit)
    .map((r) => {
      const user = db.users.findById(r.userId);
      const movie = db.movies.findById(r.movieId);
      return {
        type: 'rating',
        at: r.createdAt,
        data: {
          score: r.score,
          user: user ? { id: user.id, username: user.username, avatar: user.avatar } : null,
          movie: movie ? { id: movie.id, title: movie.title, slug: movie.slug, posterUrl: movie.posterUrl } : null,
        },
      };
    });

  const feed = [...comments, ...ratings]
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, limit);

  return ok(res, feed);
});

module.exports = { overview, genreStats, activity };
