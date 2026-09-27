'use strict';

const { db } = require('../db');
const { round, toArray, normalizeForSearch } = require('../utils/helpers');

/**
 * ============================================================
 *  FILM SERVISI
 * ============================================================
 * Controller katmani "istegi al -> cevap don" isini yapar.
 * Filtreleme, siralama, sayac guncelleme gibi is mantigi burada durur.
 */

/** Tur slug degerlerinden tur objelerine hizli erisim icin index. */
function buildGenreIndex() {
  const index = new Map();
  db.genres.raw().forEach((genre) => index.set(genre.slug, genre));
  return index;
}

/**
 * Bir filmi API cevabina hazirlar.
 * Kullanici giris yapmissa "ben begendim mi / favorimde mi / kac puan verdim"
 * bilgileri de eklenir; frontend kalp ikonunu buna gore doldurur.
 */
function serializeMovie(movie, { user = null, genreIndex = null } = {}) {
  const index = genreIndex || buildGenreIndex();

  const result = {
    ...movie,
    genreDetails: (movie.genres || []).map((slug) => {
      const genre = index.get(slug);
      return genre
        ? { slug: genre.slug, name: genre.name, nameTr: genre.nameTr, color: genre.color }
        : { slug, name: slug, nameTr: slug, color: '#94a3b8' };
    }),
  };

  if (user) {
    result.isLiked = db.likes.exists({ userId: user.id, movieId: movie.id });
    result.isFavorite = db.favorites.exists({ userId: user.id, movieId: movie.id });
    result.isInWatchlist = db.watchlist.exists({ userId: user.id, movieId: movie.id });
    const myRating = db.ratings.findOne({ userId: user.id, movieId: movie.id });
    result.myRating = myRating ? myRating.score : null;
  } else {
    result.isLiked = false;
    result.isFavorite = false;
    result.isInWatchlist = false;
    result.myRating = null;
  }

  return result;
}

function serializeMovies(movies, options = {}) {
  const genreIndex = options.genreIndex || buildGenreIndex();
  return movies.map((movie) => serializeMovie(movie, { ...options, genreIndex }));
}

/**
 * Bir filmin tum sayaclarini ham verilerden yeniden hesaplar.
 * Begeni/favori/puan degistiginde cagrilir; boylece sayaclar
 * hicbir zaman gercek veriden sapmaz.
 */
async function recomputeMovieStats(movieId) {
  const movie = db.movies.findById(movieId);
  if (!movie) return null;

  const likeCount = db.likes.count({ movieId });
  const favoriteCount = db.favorites.count({ movieId });
  const watchlistCount = db.watchlist.count({ movieId });
  const commentCount = db.comments.count((c) => c.movieId === movieId && !c.isDeleted);

  const scores = db.ratings.find({ movieId }).map((r) => r.score);
  const ratingCount = scores.length;
  const rating = ratingCount ? round(scores.reduce((sum, s) => sum + s, 0) / ratingCount, 1) : 0;

  // Basit populerlik formulu: etkilesimlerin agirlikli toplami.
  // Ogrenci bunu degistirerek trend siralamasinin nasil degistigini gorebilir.
  const popularity = round(
    likeCount * 2 +
      favoriteCount * 3 +
      watchlistCount * 1.5 +
      commentCount * 2.5 +
      rating * 4 +
      (movie.viewCount || 0) * 0.01,
    2
  );

  return db.movies.updateById(movieId, {
    likeCount,
    favoriteCount,
    watchlistCount,
    commentCount,
    ratingCount,
    rating,
    popularity,
  });
}

/** Desteklenen siralama alanlari. Basindaki "-" isareti azalan siralama demektir. */
const SORT_FIELDS = {
  rating: (a, b) => a.rating - b.rating,
  popularity: (a, b) => a.popularity - b.popularity,
  year: (a, b) => a.year - b.year,
  title: (a, b) => a.title.localeCompare(b.title, 'tr'),
  runtime: (a, b) => a.runtime - b.runtime,
  likes: (a, b) => a.likeCount - b.likeCount,
  favorites: (a, b) => a.favoriteCount - b.favoriteCount,
  comments: (a, b) => a.commentCount - b.commentCount,
  views: (a, b) => a.viewCount - b.viewCount,
  ratingCount: (a, b) => a.ratingCount - b.ratingCount,
  createdAt: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  releaseDate: (a, b) => new Date(a.releaseDate) - new Date(b.releaseDate),
};

const SORT_KEYS = Object.keys(SORT_FIELDS);

/**
 * ?sort=-rating        -> puana gore azalan
 * ?sort=year           -> yila gore artan
 * ?sort=-rating,title  -> once puan (azalan), esitse basliga gore
 */
function sortMovies(movies, sortParam) {
  const parts = toArray(sortParam);
  if (!parts.length) return movies;

  const comparators = parts
    .map((part) => {
      const desc = part.startsWith('-');
      const key = desc ? part.slice(1) : part;
      const comparator = SORT_FIELDS[key];
      if (!comparator) return null;
      return (a, b) => (desc ? -comparator(a, b) : comparator(a, b));
    })
    .filter(Boolean);

  if (!comparators.length) return movies;

  return [...movies].sort((a, b) => {
    for (const comparator of comparators) {
      const result = comparator(a, b);
      if (result !== 0) return result;
    }
    return 0;
  });
}

/**
 * Query string parametrelerine gore filmleri filtreler.
 * Desteklenen tum parametreler README dosyasinda listelenmistir.
 */
function filterMovies(movies, query = {}) {
  let result = [...movies];

  // Serbest metin arama: baslik, ozet, yonetmen ve oyuncular
  if (query.search) {
    const term = normalizeForSearch(query.search);
    if (term) {
      result = result.filter((movie) => {
        const haystack = normalizeForSearch(
          [movie.title, movie.originalTitle, movie.overview, movie.director, (movie.cast || []).join(' ')].join(' ')
        );
        return haystack.includes(term);
      });
    }
  }

  // Tur: ?genre=action veya ?genre=action,drama (varsayilan: herhangi biri eslesirse)
  const genres = toArray(query.genre);
  if (genres.length) {
    const matchAll = String(query.genreMatch || 'any').toLowerCase() === 'all';
    result = result.filter((movie) =>
      matchAll ? genres.every((g) => movie.genres.includes(g)) : genres.some((g) => movie.genres.includes(g))
    );
  }

  if (query.year) {
    const years = toArray(query.year).map(Number).filter((n) => !Number.isNaN(n));
    if (years.length) result = result.filter((movie) => years.includes(movie.year));
  }
  if (query.yearMin) result = result.filter((movie) => movie.year >= Number(query.yearMin));
  if (query.yearMax) result = result.filter((movie) => movie.year <= Number(query.yearMax));

  if (query.minRating) result = result.filter((movie) => movie.rating >= Number(query.minRating));
  if (query.maxRating) result = result.filter((movie) => movie.rating <= Number(query.maxRating));

  if (query.minRuntime) result = result.filter((movie) => movie.runtime >= Number(query.minRuntime));
  if (query.maxRuntime) result = result.filter((movie) => movie.runtime <= Number(query.maxRuntime));

  if (query.director) {
    const term = normalizeForSearch(query.director);
    result = result.filter((movie) => normalizeForSearch(movie.director || '').includes(term));
  }

  if (query.cast) {
    const term = normalizeForSearch(query.cast);
    result = result.filter((movie) => normalizeForSearch((movie.cast || []).join(' ')).includes(term));
  }

  if (query.language) result = result.filter((movie) => movie.language === query.language);
  if (query.country) result = result.filter((movie) => movie.country === query.country);
  if (query.status) result = result.filter((movie) => movie.status === query.status);

  if (query.featured !== undefined) {
    const wantFeatured = String(query.featured) === 'true';
    result = result.filter((movie) => Boolean(movie.featured) === wantFeatured);
  }

  return result;
}

/**
 * Benzer film onerisi: ortak tur sayisi + yil yakinligi + puan.
 * Film detay sayfasindaki "Bunlari da sevebilirsin" bolumu icin.
 */
function findSimilarMovies(movie, limit = 6) {
  return db.movies
    .raw()
    .filter((candidate) => candidate.id !== movie.id)
    .map((candidate) => {
      const sharedGenres = candidate.genres.filter((g) => movie.genres.includes(g)).length;
      const yearGap = Math.abs(candidate.year - movie.year);
      const score = sharedGenres * 10 - Math.min(yearGap, 30) * 0.2 + candidate.rating;
      return { candidate, score, sharedGenres };
    })
    .filter((entry) => entry.sharedGenres > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => ({ ...entry.candidate }));
}

module.exports = {
  buildGenreIndex,
  serializeMovie,
  serializeMovies,
  recomputeMovieStats,
  sortMovies,
  filterMovies,
  findSimilarMovies,
  SORT_KEYS,
};
