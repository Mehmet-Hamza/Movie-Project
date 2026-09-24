'use strict';

const { db } = require('../db');
const { omit } = require('../utils/helpers');

/**
 * Kullaniciyi API cevabina hazirlar.
 * Sifre alani HER ZAMAN cikarilir. E-posta sadece kisinin kendisine
 * ve admin'e gosterilir.
 */
function serializeUser(user, { viewer = null, includeStats = true } = {}) {
  if (!user) return null;

  const isSelf = viewer && viewer.id === user.id;
  const isAdmin = viewer && viewer.role === 'admin';

  const result = omit(user, ['password']);
  if (!isSelf && !isAdmin) delete result.email;

  if (includeStats) {
    result.stats = {
      favoriteCount: db.favorites.count({ userId: user.id }),
      likeCount: db.likes.count({ userId: user.id }),
      watchlistCount: db.watchlist.count({ userId: user.id }),
      ratingCount: db.ratings.count({ userId: user.id }),
      commentCount: db.comments.count((c) => c.userId === user.id && !c.isDeleted),
    };
  }

  return result;
}

/** Kullanicinin bir koleksiyondaki (favori/begeni/izleme listesi) filmlerini getirir. */
function getUserMovies(userId, collectionName) {
  const collection = db[collectionName];
  const entries = collection
    .find({ userId })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return entries
    .map((entry) => {
      const movie = db.movies.findById(entry.movieId);
      return movie ? { ...movie, addedAt: entry.createdAt } : null;
    })
    .filter(Boolean);
}

module.exports = { serializeUser, getUserMovies };
