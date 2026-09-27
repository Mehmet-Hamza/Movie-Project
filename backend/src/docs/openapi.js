'use strict';

const pkg = require('../../package.json');
const schemas = require('./schemas');

/* ------------------------------------------------------------------ */
/*  Kısa yollar: aynı yanıt yapılarını tekrar tekrar yazmamak için     */
/* ------------------------------------------------------------------ */

const json = (schema) => ({ content: { 'application/json': { schema } } });

/** { success, data: <şema> } */
const dataOf = (ref, isArray = false) =>
  json({
    allOf: [
      { $ref: '#/components/schemas/Success' },
      {
        type: 'object',
        properties: {
          data: isArray ? { type: 'array', items: { $ref: `#/components/schemas/${ref}` } } : { $ref: `#/components/schemas/${ref}` },
        },
      },
    ],
  });

/** { success, data: [...], meta: { pagination } } */
const pagedOf = (ref) =>
  json({
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      data: { type: 'array', items: { $ref: `#/components/schemas/${ref}` } },
      meta: {
        type: 'object',
        properties: { pagination: { $ref: '#/components/schemas/Pagination' } },
      },
    },
  });

const errorOf = (description) => ({ description, ...json({ $ref: '#/components/schemas/Error' }) });

const ERR = {
  400: errorOf('Geçersiz istek'),
  401: errorOf('Token yok veya geçersiz'),
  403: errorOf('Yetki yetersiz'),
  404: errorOf('Kayıt bulunamadı'),
  409: errorOf('Çakışma (zaten var / kullanımda)'),
  422: errorOf('Doğrulama hatası — error.details dizisinde alan bazlı mesajlar döner'),
};

const bodyOf = (properties, required = []) => ({
  required: true,
  content: { 'application/json': { schema: { type: 'object', required, properties } } },
});

const secured = [{ bearerAuth: [] }];

/* ------------------------------------------------------------------ */
/*  Tekrar eden parametreler                                          */
/* ------------------------------------------------------------------ */

const parameters = {
  MovieId: {
    name: 'id', in: 'path', required: true,
    description: 'Film id\'si (mv_043) veya slug (inception-2010)',
    schema: { type: 'string', default: 'inception-2010' },
  },
  Page: { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Sayfa numarası' },
  Limit: { name: 'limit', in: 'query', schema: { type: 'integer', default: 12, maximum: 100 }, description: 'Sayfa başına kayıt (en fazla 100)' },
  Delay: { name: 'delay', in: 'query', schema: { type: 'integer' }, description: 'Yapay gecikme (ms). Loading state test etmek için.' },
  Sort: {
    name: 'sort', in: 'query',
    description: 'Sıralama alanı. Başına "-" koyunca azalan olur, virgülle çoklu verilebilir.',
    schema: {
      type: 'string', default: '-popularity',
      enum: ['-popularity', '-rating', 'rating', '-year', 'year', 'title', '-title', '-likes', '-favorites', '-comments', '-views', '-releaseDate', '-ratingCount', 'runtime'],
    },
  },
  Search: { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Başlık, özet, yönetmen ve oyuncularda arar' },
  Genre: { name: 'genre', in: 'query', schema: { type: 'string' }, description: 'Tür slug\'ı. Virgülle çoklu: action,drama' },
  GenreMatch: { name: 'genreMatch', in: 'query', schema: { type: 'string', enum: ['any', 'all'], default: 'any' }, description: 'Çoklu türde "herhangi biri" mi "hepsi" mi' },
  YearMin: { name: 'yearMin', in: 'query', schema: { type: 'integer' } },
  YearMax: { name: 'yearMax', in: 'query', schema: { type: 'integer' } },
  MinRating: { name: 'minRating', in: 'query', schema: { type: 'number' } },
  MaxRating: { name: 'maxRating', in: 'query', schema: { type: 'number' } },
  Director: { name: 'director', in: 'query', schema: { type: 'string' } },
  Cast: { name: 'cast', in: 'query', schema: { type: 'string' }, description: 'Oyuncu adına göre filtre' },
  Featured: { name: 'featured', in: 'query', schema: { type: 'boolean' } },
};

const P = (name) => ({ $ref: `#/components/parameters/${name}` });

const LIST_FILTERS = ['Search', 'Genre', 'GenreMatch', 'YearMin', 'YearMax', 'MinRating', 'MaxRating', 'Director', 'Cast', 'Featured', 'Sort', 'Page', 'Limit', 'Delay'].map(P);

/* ------------------------------------------------------------------ */
/*  Endpoint tanımları                                                 */
/* ------------------------------------------------------------------ */

const paths = {};

/* ---------------------------- Kimlik ------------------------------ */

paths['/auth/register'] = {
  post: {
    tags: ['Kimlik Doğrulama'],
    summary: 'Kayıt ol',
    description: 'Yeni kullanıcı oluşturur ve doğrudan JWT token döner; ayrıca giriş yapmaya gerek kalmaz.',
    requestBody: bodyOf({
      username: { type: 'string', minLength: 3, maxLength: 24, example: 'yenikullanici' },
      email: { type: 'string', format: 'email', example: 'yeni@ornek.com' },
      password: { type: 'string', minLength: 6, example: '123456' },
      fullName: { type: 'string', example: 'Yeni Kullanıcı' },
    }, ['username', 'email', 'password']),
    responses: { 201: { description: 'Oluşturuldu', ...dataOf('AuthResponse') }, 409: ERR[409], 422: ERR[422] },
  },
};

paths['/auth/login'] = {
  post: {
    tags: ['Kimlik Doğrulama'],
    summary: 'Giriş yap',
    description: 'identifier alanına kullanıcı adı **veya** e-posta yazılabilir. Tüm demo hesaplarının şifresi 123456.',
    requestBody: bodyOf({
      identifier: { type: 'string', example: 'admin', description: 'Kullanıcı adı veya e-posta' },
      password: { type: 'string', example: '123456' },
    }, ['identifier', 'password']),
    responses: { 200: { description: 'Giriş başarılı', ...dataOf('AuthResponse') }, 401: ERR[401], 422: ERR[422] },
  },
};

paths['/auth/me'] = {
  get: {
    tags: ['Kimlik Doğrulama'], summary: 'Profilim', security: secured,
    responses: { 200: { description: 'Profil', ...dataOf('User') }, 401: ERR[401] },
  },
  patch: {
    tags: ['Kimlik Doğrulama'], summary: 'Profilimi güncelle', security: secured,
    requestBody: bodyOf({
      fullName: { type: 'string', example: 'Yeni Ad' },
      bio: { type: 'string', maxLength: 280, example: 'Film izlemeyi seviyorum.' },
      avatar: { type: 'string', format: 'uri' },
      email: { type: 'string', format: 'email' },
    }),
    responses: { 200: { description: 'Güncellendi', ...dataOf('User') }, 401: ERR[401], 409: ERR[409], 422: ERR[422] },
  },
};

paths['/auth/me/password'] = {
  patch: {
    tags: ['Kimlik Doğrulama'], summary: 'Şifre değiştir', security: secured,
    requestBody: bodyOf({
      currentPassword: { type: 'string', example: '123456' },
      newPassword: { type: 'string', minLength: 6, example: 'yenisifre' },
    }, ['currentPassword', 'newPassword']),
    responses: { 200: { description: 'Şifre güncellendi' }, 401: ERR[401], 422: ERR[422] },
  },
};

/* ---------------------------- Filmler ----------------------------- */

const movieBody = {
  title: { type: 'string', example: 'Yeni Film' },
  originalTitle: { type: 'string' },
  year: { type: 'integer', example: 2024 },
  releaseDate: { type: 'string', format: 'date', example: '2024-05-17' },
  runtime: { type: 'integer', example: 118 },
  genres: { type: 'array', items: { type: 'string' }, example: ['drama'] },
  director: { type: 'string', example: 'Yönetmen Adı' },
  cast: { type: 'array', items: { type: 'string' }, example: ['Oyuncu Bir', 'Oyuncu İki'] },
  overview: { type: 'string', example: 'Kısa özet.' },
  tagline: { type: 'string' },
  posterUrl: { type: 'string', format: 'uri' },
  trailerUrl: { type: 'string', format: 'uri' },
  language: { type: 'string', example: 'en' },
  country: { type: 'string', example: 'United States' },
  budget: { type: 'integer' },
  revenue: { type: 'integer' },
  status: { type: 'string', enum: ['released', 'upcoming', 'in-production'] },
  featured: { type: 'boolean' },
};

paths['/movies'] = {
  get: {
    tags: ['Filmler'],
    summary: 'Filmleri listele',
    description:
      'Arama, tür filtresi, yıl/puan aralığı, sıralama ve sayfalama destekler.\n\n' +
      'Örnekler:\n' +
      '- `/api/movies?genre=science-fiction&minRating=8&sort=-rating`\n' +
      '- `/api/movies?search=batman&sort=year`\n' +
      '- `/api/movies?yearMin=2015&page=2&limit=8`\n\n' +
      'Token gönderilirse her filme `isLiked`, `isFavorite`, `isInWatchlist`, `myRating` alanları eklenir.',
    parameters: LIST_FILTERS,
    responses: { 200: { description: 'Film listesi', ...pagedOf('Movie') } },
  },
  post: {
    tags: ['Filmler'], summary: 'Film ekle (admin)', security: secured,
    requestBody: bodyOf(movieBody, ['title', 'year']),
    responses: { 201: { description: 'Oluşturuldu', ...dataOf('Movie') }, 401: ERR[401], 403: ERR[403], 422: ERR[422] },
  },
};

const quickList = (summary, description) => ({
  get: {
    tags: ['Filmler'], summary, description,
    parameters: [P('Limit'), P('Page'), P('Delay')],
    responses: { 200: { description: 'Film listesi', ...pagedOf('Movie') } },
  },
});

paths['/movies/top-rated'] = quickList('En yüksek puanlı filmler', 'minVotes parametresiyle en az kaç oy almış filmlerin listeleneceği belirlenebilir.');
paths['/movies/top-rated'].get.parameters.push({ name: 'minVotes', in: 'query', schema: { type: 'integer', default: 0 } });
paths['/movies/trending'] = quickList('Popüler filmler', 'Beğeni, favori, yorum ve puanlardan hesaplanan popülerlik skoruna göre sıralanır.');
paths['/movies/latest'] = quickList('En yeni filmler', 'Çıkış tarihine göre azalan sırada döner.');

paths['/movies/featured'] = {
  get: {
    tags: ['Filmler'], summary: 'Öne çıkan filmler',
    description: 'Anasayfa slider / hero alanı için işaretlenmiş filmler.',
    responses: { 200: { description: 'Film listesi', ...dataOf('Movie', true) } },
  },
};

paths['/movies/random'] = {
  get: {
    tags: ['Filmler'], summary: 'Rastgele film',
    description: '"Bugün ne izlesem?" butonu için. Filtre parametreleri de geçerlidir.',
    parameters: [{ name: 'count', in: 'query', schema: { type: 'integer', default: 1, maximum: 20 } }, P('Genre'), P('MinRating')],
    responses: { 200: { description: 'count=1 ise tek film, değilse dizi döner', ...dataOf('Movie') }, 404: ERR[404] },
  },
};

paths['/movies/{id}'] = {
  get: {
    tags: ['Filmler'], summary: 'Film detayı',
    description: 'id veya slug ile çağrılabilir. Her çağrıda `viewCount` bir artar ve yanıta `similar` (benzer filmler) dizisi eklenir.',
    parameters: [P('MovieId')],
    responses: { 200: { description: 'Film detayı', ...dataOf('Movie') }, 404: ERR[404] },
  },
  put: {
    tags: ['Filmler'], summary: 'Filmi tamamen güncelle (admin)', security: secured,
    parameters: [P('MovieId')],
    requestBody: bodyOf(movieBody, ['title', 'year']),
    responses: { 200: { description: 'Güncellendi', ...dataOf('Movie') }, 401: ERR[401], 403: ERR[403], 404: ERR[404], 422: ERR[422] },
  },
  patch: {
    tags: ['Filmler'], summary: 'Filmi kısmen güncelle (admin)', security: secured,
    parameters: [P('MovieId')],
    requestBody: bodyOf({ featured: { type: 'boolean', example: true }, tagline: { type: 'string' }, runtime: { type: 'integer' } }),
    responses: { 200: { description: 'Güncellendi', ...dataOf('Movie') }, 401: ERR[401], 403: ERR[403], 404: ERR[404], 422: ERR[422] },
  },
  delete: {
    tags: ['Filmler'], summary: 'Filmi sil (admin)', security: secured,
    description: 'Filme bağlı tüm yorum, beğeni, favori, izleme listesi ve puan kayıtları da silinir.',
    parameters: [P('MovieId')],
    responses: { 204: { description: 'Silindi' }, 401: ERR[401], 403: ERR[403], 404: ERR[404] },
  },
};

paths['/movies/{id}/similar'] = {
  get: {
    tags: ['Filmler'], summary: 'Benzer filmler',
    description: 'Ortak tür sayısı, yıl yakınlığı ve puana göre önerilir.',
    parameters: [P('MovieId'), P('Limit')],
    responses: { 200: { description: 'Benzer filmler', ...dataOf('Movie', true) }, 404: ERR[404] },
  },
};

/* ------------------- Beğeni / favori / izleme listesi -------------- */

const interaction = (label, pathSuffix, verb) => ({
  tags: ['Beğeni, Favori, Puan'],
  summary: label,
  security: secured,
  parameters: [P('MovieId')],
  responses: { 200: { description: 'Güncel sayaçlar ve filmin son hâli', ...dataOf('InteractionResult') }, 401: ERR[401], 404: ERR[404] },
});

paths['/movies/{id}/like'] = {
  post: interaction('Filmi beğen (tekrar çağrılırsa hata vermez)'),
  delete: interaction('Beğeniyi geri al'),
};
paths['/movies/{id}/like/toggle'] = { post: interaction('Beğeniyi aç / kapat') };

paths['/movies/{id}/favorite'] = {
  post: interaction('Favorilere ekle'),
  delete: interaction('Favorilerden çıkar'),
};
paths['/movies/{id}/favorite/toggle'] = { post: interaction('Favoriyi aç / kapat') };

paths['/movies/{id}/watchlist'] = {
  post: interaction('İzleme listesine ekle'),
  delete: interaction('İzleme listesinden çıkar'),
};
paths['/movies/{id}/watchlist/toggle'] = { post: interaction('İzleme listesini aç / kapat') };

paths['/movies/{id}/rate'] = {
  post: {
    tags: ['Beğeni, Favori, Puan'], summary: 'Filme puan ver (1-10)', security: secured,
    description: 'Aynı kullanıcı tekrar puan verirse eski puanı güncellenir; filmin ortalaması her seferinde yeniden hesaplanır.',
    parameters: [P('MovieId')],
    requestBody: bodyOf({ score: { type: 'number', minimum: 1, maximum: 10, example: 9 }, review: { type: 'string', maxLength: 500 } }, ['score']),
    responses: { 200: { description: 'Puan kaydedildi', ...dataOf('RatingResult') }, 401: ERR[401], 404: ERR[404], 422: ERR[422] },
  },
  delete: {
    tags: ['Beğeni, Favori, Puan'], summary: 'Puanı geri çek', security: secured,
    parameters: [P('MovieId')],
    responses: { 200: { description: 'Puan silindi', ...dataOf('RatingResult') }, 401: ERR[401], 404: ERR[404] },
  },
};

paths['/movies/{id}/ratings'] = {
  get: {
    tags: ['Beğeni, Favori, Puan'], summary: 'Puan dağılımı',
    description: '1-10 arası her puandan kaç tane verildiğini döner; grafik çizmek için hazırdır.',
    parameters: [P('MovieId')],
    responses: { 200: { description: 'Dağılım', ...dataOf('RatingDistribution') }, 404: ERR[404] },
  },
};

/* ---------------------------- Yorumlar ---------------------------- */

paths['/movies/{id}/comments'] = {
  get: {
    tags: ['Yorumlar'], summary: 'Filmin yorumları',
    description: 'Sadece ana yorumlar döner; cevaplar her yorumun `replies` dizisinde gelir.',
    parameters: [
      P('MovieId'),
      { name: 'sort', in: 'query', schema: { type: 'string', enum: ['newest', 'oldest', 'likes', 'rating'], default: 'newest' } },
      P('Page'), P('Limit'),
    ],
    responses: { 200: { description: 'Yorum listesi', ...pagedOf('Comment') }, 404: ERR[404] },
  },
  post: {
    tags: ['Yorumlar'], summary: 'Yorum yaz veya cevap ver', security: secured,
    description: '`parentId` gönderilirse cevap olur (tek seviye). `rating` gönderilirse aynı anda filme puan da verilir.',
    parameters: [P('MovieId')],
    requestBody: bodyOf({
      content: { type: 'string', minLength: 2, maxLength: 1000, example: 'Kurgusu muhteşemdi, herkese öneririm.' },
      rating: { type: 'number', minimum: 1, maximum: 10, example: 9 },
      parentId: { type: 'string', description: 'Cevap yazılacak yorumun id\'si' },
      spoiler: { type: 'boolean', default: false },
    }, ['content']),
    responses: { 201: { description: 'Yorum eklendi', ...dataOf('Comment') }, 400: ERR[400], 401: ERR[401], 404: ERR[404], 422: ERR[422] },
  },
};

paths['/comments'] = {
  get: {
    tags: ['Yorumlar'], summary: 'Tüm yorumlar',
    description: '"Son yorumlar" bölümü veya admin paneli için. Her yorumla birlikte ait olduğu film bilgisi de döner.',
    parameters: [
      { name: 'movieId', in: 'query', schema: { type: 'string' } },
      { name: 'userId', in: 'query', schema: { type: 'string' } },
      { name: 'onlyRoot', in: 'query', schema: { type: 'boolean' }, description: 'Cevapları hariç tut' },
      { name: 'search', in: 'query', schema: { type: 'string' } },
      { name: 'sort', in: 'query', schema: { type: 'string', enum: ['newest', 'oldest', 'likes', 'rating'], default: 'newest' } },
      P('Page'), P('Limit'),
    ],
    responses: { 200: { description: 'Yorum listesi', ...pagedOf('Comment') } },
  },
};

const commentId = { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Yorum id\'si (cm_0001)' };

paths['/comments/{id}'] = {
  get: {
    tags: ['Yorumlar'], summary: 'Yorum detayı', parameters: [commentId],
    responses: { 200: { description: 'Yorum', ...dataOf('Comment') }, 404: ERR[404] },
  },
  patch: {
    tags: ['Yorumlar'], summary: 'Yorumu düzenle (sadece sahibi)', security: secured, parameters: [commentId],
    requestBody: bodyOf({ content: { type: 'string', minLength: 2, maxLength: 1000 }, rating: { type: 'number' }, spoiler: { type: 'boolean' } }),
    responses: { 200: { description: 'Güncellendi', ...dataOf('Comment') }, 401: ERR[401], 403: ERR[403], 404: ERR[404], 422: ERR[422] },
  },
  delete: {
    tags: ['Yorumlar'], summary: 'Yorumu sil (sahibi veya admin)', security: secured, parameters: [commentId],
    description: 'Cevapları olan bir yorum tamamen silinmez, içeriği "[silinmiş yorum]" olarak işaretlenir; böylece cevap zinciri bozulmaz.',
    responses: { 204: { description: 'Silindi' }, 401: ERR[401], 403: ERR[403], 404: ERR[404] },
  },
};

paths['/comments/{id}/like'] = {
  post: {
    tags: ['Yorumlar'], summary: 'Yorumu beğen / beğeniyi geri al', security: secured, parameters: [commentId],
    responses: { 200: { description: 'Güncel beğeni durumu' }, 401: ERR[401], 404: ERR[404] },
  },
};

/* ----------------------------- Türler ----------------------------- */

const genreId = { name: 'id', in: 'path', required: true, schema: { type: 'string', default: 'action' }, description: 'Tür id\'si veya slug' };

paths['/genres'] = {
  get: {
    tags: ['Türler'], summary: 'Tüm türler',
    description: 'Her tür; film sayısı, ortalama puan, renk, emoji ve kategori kartı için kapak görseliyle döner.',
    parameters: [{ name: 'sort', in: 'query', schema: { type: 'string', enum: ['name', 'movieCount'], default: 'name' } }],
    responses: { 200: { description: 'Tür listesi', ...dataOf('Genre', true) } },
  },
  post: {
    tags: ['Türler'], summary: 'Tür ekle (admin)', security: secured,
    requestBody: bodyOf({
      name: { type: 'string', example: 'Documentary' },
      nameTr: { type: 'string', example: 'Belgesel' },
      description: { type: 'string' },
      color: { type: 'string', example: '#22d3ee' },
      icon: { type: 'string', example: 'video' },
    }, ['name']),
    responses: { 201: { description: 'Oluşturuldu', ...dataOf('Genre') }, 401: ERR[401], 403: ERR[403], 409: ERR[409], 422: ERR[422] },
  },
};

paths['/genres/{id}'] = {
  get: { tags: ['Türler'], summary: 'Tür detayı', parameters: [genreId], responses: { 200: { description: 'Tür', ...dataOf('Genre') }, 404: ERR[404] } },
  patch: {
    tags: ['Türler'], summary: 'Tür güncelle (admin)', security: secured, parameters: [genreId],
    requestBody: bodyOf({ nameTr: { type: 'string' }, description: { type: 'string' }, color: { type: 'string' } }),
    responses: { 200: { description: 'Güncellendi', ...dataOf('Genre') }, 401: ERR[401], 403: ERR[403], 404: ERR[404] },
  },
  delete: {
    tags: ['Türler'], summary: 'Tür sil (admin)', security: secured,
    description: 'Tür bir filmde kullanılıyorsa 409 döner; yine de silmek için `?force=true` ekleyin.',
    parameters: [genreId, { name: 'force', in: 'query', schema: { type: 'boolean' } }],
    responses: { 204: { description: 'Silindi' }, 401: ERR[401], 403: ERR[403], 404: ERR[404], 409: ERR[409] },
  },
};

paths['/genres/{id}/movies'] = {
  get: {
    tags: ['Türler'], summary: 'Türe ait filmler',
    parameters: [genreId, P('Sort'), P('Page'), P('Limit'), P('Search'), P('MinRating')],
    responses: { 200: { description: 'Film listesi', ...pagedOf('Movie') }, 404: ERR[404] },
  },
};

/* --------------------------- Kullanıcılar ------------------------- */

const userId = { name: 'id', in: 'path', required: true, schema: { type: 'string', default: 'elif' }, description: 'Kullanıcı id\'si veya kullanıcı adı' };

paths['/users'] = {
  get: {
    tags: ['Kullanıcılar'], summary: 'Kullanıcı listesi',
    parameters: [P('Search'), { name: 'role', in: 'query', schema: { type: 'string', enum: ['user', 'admin'] } }, P('Page'), P('Limit')],
    responses: { 200: { description: 'Kullanıcılar', ...pagedOf('User') } },
  },
  post: {
    tags: ['Kullanıcılar'], summary: 'Kullanıcı ekle (admin)', security: secured,
    requestBody: bodyOf({
      username: { type: 'string' }, email: { type: 'string', format: 'email' },
      password: { type: 'string' }, fullName: { type: 'string' },
      role: { type: 'string', enum: ['user', 'admin'] },
    }, ['username', 'email', 'password']),
    responses: { 201: { description: 'Oluşturuldu', ...dataOf('User') }, 401: ERR[401], 403: ERR[403], 409: ERR[409], 422: ERR[422] },
  },
};

paths['/users/{id}'] = {
  get: { tags: ['Kullanıcılar'], summary: 'Kullanıcı profili', parameters: [userId], responses: { 200: { description: 'Profil', ...dataOf('User') }, 404: ERR[404] } },
  patch: {
    tags: ['Kullanıcılar'], summary: 'Kullanıcı güncelle (kendisi veya admin)', security: secured, parameters: [userId],
    requestBody: bodyOf({ fullName: { type: 'string' }, bio: { type: 'string' }, avatar: { type: 'string' }, role: { type: 'string', enum: ['user', 'admin'], description: 'Sadece admin' }, isActive: { type: 'boolean', description: 'Sadece admin' } }),
    responses: { 200: { description: 'Güncellendi', ...dataOf('User') }, 401: ERR[401], 403: ERR[403], 404: ERR[404] },
  },
  delete: {
    tags: ['Kullanıcılar'], summary: 'Kullanıcı sil (admin)', security: secured, parameters: [userId],
    description: 'Kullanıcının tüm yorum, beğeni, favori ve puanları da silinir; etkilenen filmlerin sayaçları yeniden hesaplanır.',
    responses: { 204: { description: 'Silindi' }, 400: ERR[400], 401: ERR[401], 403: ERR[403], 404: ERR[404] },
  },
};

const userList = (summary, description) => ({
  get: {
    tags: ['Kullanıcılar'], summary, description,
    parameters: [userId, P('Sort'), P('Page'), P('Limit')],
    responses: { 200: { description: 'Film listesi', ...pagedOf('Movie') }, 404: ERR[404] },
  },
});

paths['/users/{id}/favorites'] = userList('Kullanıcının favori filmleri');
paths['/users/{id}/likes'] = userList('Kullanıcının beğendiği filmler');
paths['/users/{id}/watchlist'] = userList('Kullanıcının izleme listesi');

paths['/users/{id}/ratings'] = {
  get: {
    tags: ['Kullanıcılar'], summary: 'Kullanıcının verdiği puanlar',
    parameters: [userId, P('Page'), P('Limit')],
    responses: { 200: { description: 'Puanlar (film bilgisiyle)' }, 404: ERR[404] },
  },
};

paths['/users/{id}/comments'] = {
  get: {
    tags: ['Kullanıcılar'], summary: 'Kullanıcının yorumları',
    parameters: [userId, P('Page'), P('Limit')],
    responses: { 200: { description: 'Yorumlar', ...pagedOf('Comment') }, 404: ERR[404] },
  },
};

paths['/users/{id}/recommendations'] = {
  get: {
    tags: ['Kullanıcılar'], summary: 'Kişiye özel film önerileri',
    description: 'Kullanıcının favori, beğeni ve puanlarındaki türlerden yola çıkarak henüz etkileşime girmediği filmleri önerir.',
    parameters: [userId, P('Limit')],
    responses: { 200: { description: 'Öneriler', ...dataOf('Movie', true) }, 404: ERR[404] },
  },
};

/* ------------------------------- Ben ------------------------------ */

const meEndpoint = (summary, ref, paged) => ({
  get: {
    tags: ['Ben (kısayollar)'], summary, security: secured,
    parameters: [P('Page'), P('Limit')],
    responses: { 200: { description: 'Sonuç', ...(paged ? pagedOf(ref) : dataOf(ref)) }, 401: ERR[401] },
  },
});

paths['/me'] = meEndpoint('Kendi profilim', 'User', false);
paths['/me'].get.parameters = [];
paths['/me/favorites'] = meEndpoint('Favorilerim', 'Movie', true);
paths['/me/likes'] = meEndpoint('Beğendiklerim', 'Movie', true);
paths['/me/watchlist'] = meEndpoint('İzleme listem', 'Movie', true);
paths['/me/ratings'] = meEndpoint('Puanladıklarım', 'Movie', true);
paths['/me/comments'] = meEndpoint('Yorumlarım', 'Comment', true);
paths['/me/recommendations'] = meEndpoint('Bana özel öneriler', 'Movie', false);

/* --------------------------- İstatistik --------------------------- */

paths['/stats/overview'] = {
  get: {
    tags: ['İstatistikler'], summary: 'Genel bakış',
    description: 'Toplam sayılar, on yıllara göre film dağılımı, en yüksek puanlı / en çok beğenilen / en çok yorumlanan filmler.',
    responses: { 200: { description: 'İstatistikler' } },
  },
};

paths['/stats/genres'] = {
  get: {
    tags: ['İstatistikler'], summary: 'Tür bazlı istatistikler',
    description: 'Pasta veya bar grafiği için tür başına film sayısı, ortalama puan ve toplam beğeni.',
    responses: { 200: { description: 'Tür istatistikleri' } },
  },
};

paths['/stats/activity'] = {
  get: {
    tags: ['İstatistikler'], summary: 'Son aktiviteler',
    description: 'Son yorum ve puanlardan oluşan zaman sıralı akış.',
    parameters: [P('Limit')],
    responses: { 200: { description: 'Aktivite akışı' } },
  },
};

paths['/health'] = {
  get: { tags: ['İstatistikler'], summary: 'Sağlık kontrolü', responses: { 200: { description: 'Sunucu durumu ve kayıt sayıları' } } },
};

/* ------------------------------------------------------------------ */
/*  OpenAPI dokümanı                                                   */
/* ------------------------------------------------------------------ */

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'Movie API',
    version: pkg.version,
    description: [
      'Node.js + Express ile yazılmış, dosya tabanlı JSON veritabanı kullanan film API\'si.',
      '',
      '### Nasıl kullanılır?',
      '1. Sağ üstteki **Authorize** düğmesine basın.',
      '2. Önce `POST /auth/login` ucunu `{ "identifier": "admin", "password": "123456" }` gövdesiyle deneyin.',
      '3. Dönen `data.token` değerini kopyalayıp Authorize kutusuna yapıştırın.',
      '4. Artık kilit simgeli (🔒) tüm uçları buradan deneyebilirsiniz.',
      '',
      '### Yanıt formatı',
      'Tüm başarılı yanıtlar `{ success: true, data, meta }`, hatalar `{ success: false, error: { code, message, details } }` şeklindedir.',
      '',
      '### Test hesapları',
      '`admin` (yönetici) ve `elif`, `mert`, `zeynep` gibi 39 normal kullanıcı. Hepsinin şifresi **123456**.',
      '',
      '### İpuçları',
      '- Token gönderdiğinizde filmler `isLiked`, `isFavorite`, `isInWatchlist`, `myRating` alanlarıyla gelir.',
      '- Herhangi bir isteğe `?delay=1500` ekleyerek yükleniyor durumlarını test edebilirsiniz.',
      '- Film uçları hem id (`mv_043`) hem slug (`inception-2010`) kabul eder.',
    ].join('\n'),
    contact: { name: 'Dokümanın sade hâli', url: 'http://localhost:4000/docs' },
    license: { name: 'MIT' },
  },
  servers: [
    { url: '/api', description: 'Bu sunucu' },
    { url: 'http://localhost:4000/api', description: 'Yerel geliştirme' },
  ],
  tags: [
    { name: 'Kimlik Doğrulama', description: 'Kayıt, giriş, profil ve şifre işlemleri' },
    { name: 'Filmler', description: 'Listeleme, filtreleme, sıralama, detay ve yönetici CRUD işlemleri' },
    { name: 'Beğeni, Favori, Puan', description: 'Kullanıcı etkileşimleri. Hepsi token ister.' },
    { name: 'Yorumlar', description: 'Yorum yazma, cevaplama, beğenme, düzenleme ve silme' },
    { name: 'Türler', description: 'Film türleri ve türe ait listeler' },
    { name: 'Kullanıcılar', description: 'Profiller ve kullanıcıya ait listeler' },
    { name: 'Ben (kısayollar)', description: 'Sadece token ile kendi listelerinize erişin' },
    { name: 'İstatistikler', description: 'Anasayfa kartları ve grafikler için hazır veri' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'POST /auth/login ucundan aldığınız token değerini buraya yapıştırın.',
      },
    },
    schemas,
    parameters,
  },
  paths,
};
