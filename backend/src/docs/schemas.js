'use strict';

/**
 * OpenAPI şemaları (components.schemas).
 * Swagger arayüzünde her endpoint'in hangi alanları döndüğü buradan okunur.
 */
const schemas = {
  Success: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      data: { description: 'Asıl veri' },
      meta: { type: 'object', description: 'Sayfalama ve ek bilgiler' },
    },
  },

  Error: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      error: {
        type: 'object',
        properties: {
          code: { type: 'string', example: 'VALIDATION_ERROR' },
          message: { type: 'string', example: 'Doğrulama hatası' },
          details: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', example: 'password' },
                message: { type: 'string', example: 'En az 6 karakter olmalıdır.' },
              },
            },
          },
        },
      },
    },
  },

  Pagination: {
    type: 'object',
    properties: {
      page: { type: 'integer', example: 1 },
      limit: { type: 'integer', example: 12 },
      total: { type: 'integer', example: 85 },
      totalPages: { type: 'integer', example: 8 },
      hasPrevPage: { type: 'boolean', example: false },
      hasNextPage: { type: 'boolean', example: true },
      prevPage: { type: 'integer', nullable: true, example: null },
      nextPage: { type: 'integer', nullable: true, example: 2 },
    },
  },

  GenreRef: {
    type: 'object',
    properties: {
      slug: { type: 'string', example: 'science-fiction' },
      name: { type: 'string', example: 'Science Fiction' },
      nameTr: { type: 'string', example: 'Bilim Kurgu' },
      color: { type: 'string', example: '#06b6d4' },
    },
  },
};

Object.assign(schemas, {
  Movie: {
    type: 'object',
    properties: {
      id: { type: 'string', example: 'mv_043' },
      title: { type: 'string', example: 'Inception' },
      originalTitle: { type: 'string', example: 'Inception' },
      slug: { type: 'string', example: 'inception-2010' },
      year: { type: 'integer', example: 2010 },
      releaseDate: { type: 'string', format: 'date', example: '2010-07-16' },
      runtime: { type: 'integer', description: 'Dakika cinsinden süre', example: 148 },
      genres: { type: 'array', items: { type: 'string' }, example: ['action', 'science-fiction'] },
      genreDetails: { type: 'array', items: { $ref: '#/components/schemas/GenreRef' } },
      director: { type: 'string', example: 'Christopher Nolan' },
      cast: { type: 'array', items: { type: 'string' } },
      overview: { type: 'string', description: 'İngilizce özet (Wikipedia veri seti)' },
      overviewTr: { type: 'string', description: 'Türkçe kısa özet' },
      tagline: { type: 'string' },
      posterUrl: { type: 'string', format: 'uri', description: 'Gerçek poster görseli, doğrudan img src olarak kullanılabilir' },
      backdropUrl: { type: 'string', nullable: true, description: 'Bu veri setinde geniş görsel yok (null)' },
      trailerUrl: { type: 'string', format: 'uri' },
      language: { type: 'string', example: 'en' },
      country: { type: 'string', example: 'United States' },
      budget: { type: 'integer', example: 160000000 },
      revenue: { type: 'integer', example: 830000000 },
      status: { type: 'string', enum: ['released', 'upcoming', 'in-production'] },
      featured: { type: 'boolean', description: 'Anasayfa slider için öne çıkarılmış mı' },
      rating: { type: 'number', description: 'Kullanıcı puanlarının ortalaması (0-10)', example: 8.4 },
      ratingCount: { type: 'integer', example: 27 },
      likeCount: { type: 'integer', example: 21 },
      favoriteCount: { type: 'integer', example: 7 },
      watchlistCount: { type: 'integer', example: 5 },
      commentCount: { type: 'integer', example: 4 },
      viewCount: { type: 'integer', description: 'Detay sayfası her açıldığında artar' },
      popularity: { type: 'number', description: 'Etkileşimlerden hesaplanan popülerlik skoru' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
      isLiked: { type: 'boolean', description: 'Token gönderilirse dolar' },
      isFavorite: { type: 'boolean', description: 'Token gönderilirse dolar' },
      isInWatchlist: { type: 'boolean', description: 'Token gönderilirse dolar' },
      myRating: { type: 'integer', nullable: true, description: 'Token gönderilirse dolar' },
    },
  },

  User: {
    type: 'object',
    properties: {
      id: { type: 'string', example: 'us_002' },
      username: { type: 'string', example: 'elif' },
      email: { type: 'string', description: 'Sadece kişinin kendisine ve admin kullanıcıya görünür' },
      fullName: { type: 'string', example: 'Elif Yılmaz' },
      avatar: { type: 'string', format: 'uri' },
      bio: { type: 'string' },
      role: { type: 'string', enum: ['user', 'admin'] },
      isActive: { type: 'boolean' },
      createdAt: { type: 'string', format: 'date-time' },
      stats: {
        type: 'object',
        properties: {
          favoriteCount: { type: 'integer' },
          likeCount: { type: 'integer' },
          watchlistCount: { type: 'integer' },
          ratingCount: { type: 'integer' },
          commentCount: { type: 'integer' },
        },
      },
    },
  },
});

Object.assign(schemas, {
  Comment: {
    type: 'object',
    properties: {
      id: { type: 'string', example: 'cm_0007' },
      movieId: { type: 'string', example: 'mv_043' },
      userId: { type: 'string', example: 'us_002' },
      parentId: { type: 'string', nullable: true, description: 'Doluysa bu kayıt bir cevaptır' },
      content: { type: 'string', example: 'Kurgusuna bayıldım, ikinci izleyişte yeni detaylar çıktı.' },
      rating: { type: 'integer', nullable: true, description: 'Yorumla birlikte verilen puan' },
      spoiler: { type: 'boolean', description: 'Spoiler uyarısı gösterilmeli mi' },
      likeCount: { type: 'integer' },
      replyCount: { type: 'integer' },
      isEdited: { type: 'boolean' },
      isDeleted: { type: 'boolean' },
      createdAt: { type: 'string', format: 'date-time' },
      user: { $ref: '#/components/schemas/User' },
      isLikedByMe: { type: 'boolean' },
      isMine: { type: 'boolean' },
      replies: { type: 'array', items: { type: 'object' }, description: 'Tek seviye cevaplar' },
    },
  },

  Genre: {
    type: 'object',
    properties: {
      id: { type: 'string', example: 'gn_action' },
      name: { type: 'string', example: 'Action' },
      nameTr: { type: 'string', example: 'Aksiyon' },
      slug: { type: 'string', example: 'action' },
      description: { type: 'string' },
      color: { type: 'string', example: '#ef4444', description: 'Etiket / arka plan rengi' },
      icon: { type: 'string', example: 'zap', description: 'Lucide ikon adı' },
      emoji: { type: 'string', example: 'zap emoji' },
      movieCount: { type: 'integer' },
      averageRating: { type: 'number' },
      coverUrl: { type: 'string', nullable: true, description: 'Kategori kartı için poster görseli' },
    },
  },

  AuthResponse: {
    type: 'object',
    properties: {
      token: { type: 'string', description: 'JWT. Authorization: Bearer <token> olarak gönderilir' },
      user: { $ref: '#/components/schemas/User' },
    },
  },

  InteractionResult: {
    type: 'object',
    description: 'Beğeni / favori / izleme listesi işlemlerinin ortak yanıtı',
    properties: {
      movieId: { type: 'string', example: 'mv_043' },
      isLiked: { type: 'boolean', description: 'İlgili uca göre isFavorite / isInWatchlist olur' },
      likeCount: { type: 'integer', description: 'İlgili uca göre favoriteCount / watchlistCount olur' },
      movie: { $ref: '#/components/schemas/Movie' },
    },
  },

  RatingResult: {
    type: 'object',
    properties: {
      movieId: { type: 'string' },
      myRating: { type: 'integer', nullable: true },
      rating: { type: 'number', description: 'Filmin güncel ortalaması' },
      ratingCount: { type: 'integer' },
      movie: { $ref: '#/components/schemas/Movie' },
    },
  },

  RatingDistribution: {
    type: 'object',
    properties: {
      movieId: { type: 'string' },
      average: { type: 'number', example: 8.4 },
      total: { type: 'integer', example: 27 },
      distribution: {
        type: 'array',
        description: 'Puan dağılımı grafiği için hazır veri',
        items: {
          type: 'object',
          properties: { score: { type: 'integer', example: 9 }, count: { type: 'integer', example: 11 } },
        },
      },
      ratings: { type: 'array', items: { type: 'object' } },
    },
  },
});

module.exports = schemas;
