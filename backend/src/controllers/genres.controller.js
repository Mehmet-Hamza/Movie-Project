'use strict';

const { db } = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../utils/validate');
const paginate = require('../utils/paginate');
const ApiError = require('../utils/ApiError');
const { ok, created, noContent, paginated } = require('../utils/response');
const { slugify } = require('../utils/helpers');
const movieService = require('../services/movie.service');

function getGenreOr404(idOrSlug) {
  const genre = db.genres.findById(idOrSlug) || db.genres.findOne({ slug: idOrSlug });
  if (!genre) throw ApiError.notFound(`Tur bulunamadi: ${idOrSlug}`, 'GENRE_NOT_FOUND');
  return genre;
}

/**
 * GET /api/genres
 * Her turun kac filmi oldugu ve ortalama puani ile birlikte doner.
 * Frontend'de tur filtresi / kategori kartlari icin hazir veri.
 */
const listGenres = asyncHandler(async (req, res) => {
  const movies = db.movies.raw();

  const genres = db.genres.all().map((genre) => {
    const genreMovies = movies.filter((movie) => movie.genres.includes(genre.slug));
    const rated = genreMovies.filter((m) => m.ratingCount > 0);
    const averageRating = rated.length
      ? Math.round((rated.reduce((sum, m) => sum + m.rating, 0) / rated.length) * 10) / 10
      : 0;

    return {
      ...genre,
      movieCount: genreMovies.length,
      averageRating,
      // Kategori kartinda arka plan olarak kullanilabilecek poster
      coverUrl: genreMovies.sort((a, b) => b.popularity - a.popularity)[0]?.posterUrl || null,
    };
  });

  const sorted =
    req.query.sort === 'movieCount'
      ? genres.sort((a, b) => b.movieCount - a.movieCount)
      : genres.sort((a, b) => a.name.localeCompare(b.name, 'tr'));

  return ok(res, sorted);
});

/** GET /api/genres/:idOrSlug */
const getGenre = asyncHandler(async (req, res) => {
  const genre = getGenreOr404(req.params.id);
  const genreMovies = db.movies.raw().filter((movie) => movie.genres.includes(genre.slug));
  return ok(res, { ...genre, movieCount: genreMovies.length });
});

/**
 * GET /api/genres/:idOrSlug/movies
 * Tur sayfasi. Siralama ve sayfalama film listesiyle aynidir.
 */
const getGenreMovies = asyncHandler(async (req, res) => {
  const genre = getGenreOr404(req.params.id);

  let movies = db.movies.raw().filter((movie) => movie.genres.includes(genre.slug));
  movies = movieService.filterMovies(movies, { ...req.query, genre: undefined });
  movies = movieService.sortMovies(movies, req.query.sort || '-rating');

  const { data, pagination } = paginate(movies, req.query);
  return paginated(res, movieService.serializeMovies(data, { user: req.user }), pagination, { genre });
});

/** POST /api/genres (admin) */
const createGenre = asyncHandler(async (req, res) => {
  const body = validate(req.body, [
    { field: 'name', type: 'string', required: true, min: 2, max: 40 },
    { field: 'nameTr', type: 'string', min: 2, max: 40 },
    { field: 'description', type: 'string', max: 300 },
    { field: 'color', type: 'string', max: 20 },
    { field: 'icon', type: 'string', max: 20 },
  ]);

  const slug = slugify(body.name);
  if (db.genres.exists({ slug })) throw ApiError.conflict('Bu tur zaten mevcut.', 'GENRE_EXISTS');

  const genre = await db.genres.insert({
    name: body.name,
    nameTr: body.nameTr || body.name,
    slug,
    description: body.description || '',
    color: body.color || '#6366f1',
    icon: body.icon || 'film',
  });

  return created(res, genre);
});

/** PATCH /api/genres/:id (admin) */
const updateGenre = asyncHandler(async (req, res) => {
  const genre = getGenreOr404(req.params.id);
  const body = validate(req.body, [
    { field: 'name', type: 'string', min: 2, max: 40 },
    { field: 'nameTr', type: 'string', min: 2, max: 40 },
    { field: 'description', type: 'string', max: 300 },
    { field: 'color', type: 'string', max: 20 },
    { field: 'icon', type: 'string', max: 20 },
  ]);

  if (!Object.keys(body).length) throw ApiError.badRequest('Guncellenecek alan gonderilmedi.');
  const updated = await db.genres.updateById(genre.id, body);
  return ok(res, updated);
});

/** DELETE /api/genres/:id (admin) - kullanimda olan tur silinemez */
const deleteGenre = asyncHandler(async (req, res) => {
  const genre = getGenreOr404(req.params.id);
  const inUse = db.movies.raw().filter((movie) => movie.genres.includes(genre.slug)).length;

  if (inUse > 0 && req.query.force !== 'true') {
    throw ApiError.conflict(
      `Bu tur ${inUse} filmde kullaniliyor. Yine de silmek icin ?force=true ekleyin.`,
      'GENRE_IN_USE'
    );
  }

  if (inUse > 0) {
    for (const movie of db.movies.raw().filter((m) => m.genres.includes(genre.slug))) {
      await db.movies.updateById(movie.id, { genres: movie.genres.filter((g) => g !== genre.slug) });
    }
  }

  await db.genres.removeById(genre.id);
  return noContent(res);
});

module.exports = { listGenres, getGenre, getGenreMovies, createGenre, updateGenre, deleteGenre };
