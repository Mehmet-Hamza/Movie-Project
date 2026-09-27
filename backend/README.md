# 🎬 Movie API

Node.js + Express ile yazılmış, **dosya tabanlı JSON veritabanı** kullanan film API'si.
MongoDB / PostgreSQL kurmaya gerek yoktur; veritabanı `data/` klasöründeki JSON dosyalarıdır ve proje kopyalandığında veriyle birlikte taşınır.

Frontend öğrencilerinin gerçek bir API'ye bağlanarak pratik yapması için hazırlanmıştır:
film listeleme, arama, filtreleme, sıralama, sayfalama, giriş/kayıt, beğenme, favori,
izleme listesi, puanlama, yorum ve yoruma cevap yazma gibi tüm akışlar hazırdır.

---

## Hızlı başlangıç

```bash
npm install
npm start
```

Sunucu varsayılan olarak **http://localhost:4000** adresinde çalışır.

| Adres | Ne var? |
|---|---|
| `http://localhost:4000/swagger` | **Swagger UI** — tüm uçlar, istek/yanıt şemaları, "Try it out" ile canlı deneme |
| `http://localhost:4000/docs` | Aynı içeriğin sade, Türkçe anlatımlı hâli + tek tıkla deneme |
| `http://localhost:4000/openapi.json` | Ham OpenAPI 3 tanımı (Postman / Insomnia'ya içe aktarılabilir) |
| `http://localhost:4000/` | Karşılama sayfası, hızlı başlangıç örnekleri |
| `http://localhost:4000/api` | Endpoint listesinin JSON hâli |
| `http://localhost:4000/api/health` | Sunucu sağlık kontrolü |

### Komutlar

```bash
npm start     # sunucuyu başlatır
npm run dev   # dosya değişince otomatik yeniden başlatır (node --watch)
npm run seed  # veritabanı boşsa dummy verileri oluşturur
npm run reset # mevcut veriyi silip dummy verileri sıfırdan üretir
```

> Veri zaten `data/` klasöründe hazır geldiği için ilk kullanımda seed çalıştırmanız gerekmez.
> Bir şeyleri bozarsanız `npm run reset` ile başlangıç durumuna dönebilirsiniz.

---

## Swagger dokümantasyonu

Sunucuyu başlattıktan sonra **http://localhost:4000/swagger** adresini açın.
Tüm uçlar; parametreleri, istek gövdeleri, yanıt şemaları ve örnek değerleriyle listelenir.

Korumalı (🔒) uçları denemek için:

1. `Kimlik Doğrulama → POST /auth/login` ucunu açın, **Try it out** deyin.
2. Gövdeyi `{ "identifier": "admin", "password": "123456" }` olarak gönderin.
3. Yanıttaki `data.token` değerini kopyalayın.
4. Sayfanın sağ üstündeki **Authorize** düğmesine basıp token'ı yapıştırın.
5. Artık kilitli uçların hepsi Swagger üzerinden çalışır.

`openapi.json` dosyasını Postman veya Insomnia'ya içe aktararak hazır bir istek
koleksiyonu da oluşturabilirsiniz (Postman: *Import → Link →* `http://localhost:4000/openapi.json`).

---

## Veri seti hakkında

- **Film adı, yılı, oyuncu kadrosu, özeti ve poster görselleri** açık kaynaklı Wikipedia film veri setinden alınmıştır. Poster adresleri `upload.wikimedia.org` üzerinde canlıdır, doğrudan `<img src="...">` ile kullanabilirsiniz.
- **Yönetmen, süre ve Türkçe açıklamalar** (`overviewTr`) proje içinde elle tanımlanmıştır (`scripts/movie-meta.js`).
- **Puanlar, beğeniler, favoriler, yorumlar, kullanıcılar, bütçe/hasılat** ise `scripts/seed.js` tarafından üretilen **örnek (dummy) verilerdir**; gerçek değerler değildir.

İçerik: **85 film · 23 tür · 40 kullanıcı · ~450 yorum · ~1500 beğeni · ~1800 puan**

---

## Test hesapları

Tüm hesapların şifresi: **`123456`**

| Kullanıcı adı | Rol | Notlar |
|---|---|---|
| `admin` | admin | Film ve tür ekleyip silebilir, her yorumu silebilir |
| `elif`, `mert`, `zeynep`, `can`, `selin`, `burak`, … | user | Toplam 39 normal kullanıcı |

Giriş `identifier` alanına kullanıcı adı **veya** e-posta yazılarak yapılır
(e-postalar `kullaniciadi@movieapi.dev` şeklindedir).

---

## Proje yapısı

```
movie-api/
├── server.js                 # Giriş noktası: sunucuyu ayağa kaldırır
├── data/                     # ← VERİTABANI (JSON dosyaları)
│   ├── movies.json           #   filmler
│   ├── genres.json           #   türler
│   ├── users.json            #   kullanıcılar (şifreler bcrypt ile hash'li)
│   ├── comments.json         #   yorumlar ve cevaplar
│   ├── likes.json            #   kullanıcı ↔ film beğenileri
│   ├── favorites.json        #   favoriler
│   ├── watchlist.json        #   izleme listesi
│   ├── ratings.json          #   puanlar
│   └── comment-likes.json    #   yorum beğenileri
├── public/                   # Karşılama sayfası ve dokümantasyon
├── scripts/
│   ├── seed.js               # dummy veri üretici
│   ├── source-movies.json    # ham film verisi (Wikipedia)
│   └── movie-meta.js         # yönetmen / süre / Türkçe açıklama
└── src/
    ├── app.js                # Express uygulaması, middleware zinciri
    ├── config.js             # ayarlar (.env okunur)
    ├── db/
    │   ├── JsonDB.js         # dosyaya güvenli yazma motoru
    │   ├── Collection.js     # find / insert / update / remove
    │   └── index.js          # koleksiyonlar
    ├── middleware/
    │   ├── auth.js           # requireAuth, optionalAuth, requireRole
    │   └── errorHandler.js   # merkezi hata yönetimi
    ├── routes/               # URL → controller eşleşmeleri
    ├── controllers/          # istek/yanıt katmanı
    ├── services/             # iş mantığı (filtreleme, sayaçlar, benzer filmler)
    └── utils/                # yardımcılar (doğrulama, sayfalama, JWT, hash)
```

---

## Yanıt formatı

Tüm başarılı yanıtlar aynı zarf içinde döner:

```json
{
  "success": true,
  "data": { ... },
  "meta": { "pagination": { ... } }
}
```

Hatalar da tek tiptir:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Doğrulama hatası",
    "details": [{ "field": "password", "message": "\"password\" en az 6 karakter olmalıdır." }]
  }
}
```

| Kod | Anlamı |
|---|---|
| `200 / 201 / 204` | Başarılı |
| `400 BAD_REQUEST` | Eksik/anlamsız istek |
| `401 UNAUTHORIZED` | Token yok veya geçersiz |
| `403 FORBIDDEN` | Yetki yetersiz (örn. admin gerekiyor) |
| `404 NOT_FOUND` | Kayıt yok |
| `409 CONFLICT` | Çakışma (kullanıcı adı alınmış, tür kullanımda…) |
| `422 VALIDATION_ERROR` | Alan doğrulama hatası, `details` dizisi gelir |

---

## Kimlik doğrulama

1. `POST /api/auth/login` ile token alınır.
2. Korumalı isteklerde header'a eklenir: `Authorization: Bearer <token>`
3. Token 7 gün geçerlidir (`.env` içinden değiştirilebilir).

```js
const { data } = await fetch("http://localhost:4000/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ identifier: "elif", password: "123456" }),
}).then((r) => r.json());

localStorage.setItem("token", data.token);
```

**Önemli:** Token gönderdiğinizde film yanıtlarına şu alanlar eklenir:

| Alan | Anlamı |
|---|---|
| `isLiked` | Bu kullanıcı filmi beğenmiş mi |
| `isFavorite` | Favorilerinde mi |
| `isInWatchlist` | İzleme listesinde mi |
| `myRating` | Kaç puan vermiş (yoksa `null`) |

Yani kalp/yıldız ikonlarının dolu mu boş mu olacağını ayrı istek atmadan öğrenirsiniz.

---

## Endpoint listesi

### Kimlik doğrulama

| Metod | Yol | Açıklama |
|---|---|---|
| POST | `/api/auth/register` | Kayıt ol (token döner) |
| POST | `/api/auth/login` | Giriş yap |
| GET | `/api/auth/me` | 🔒 Profilim |
| PATCH | `/api/auth/me` | 🔒 Profilimi güncelle |
| PATCH | `/api/auth/me/password` | 🔒 Şifre değiştir |

### Filmler

| Metod | Yol | Açıklama |
|---|---|---|
| GET | `/api/movies` | Filtreleme + sıralama + sayfalama ile listeler |
| GET | `/api/movies/top-rated` | En yüksek puanlılar |
| GET | `/api/movies/trending` | Popülerlik puanına göre |
| GET | `/api/movies/latest` | En yeni çıkanlar |
| GET | `/api/movies/featured` | Öne çıkanlar (anasayfa slider'ı) |
| GET | `/api/movies/random` | Rastgele film — "bugün ne izlesem?" |
| GET | `/api/movies/:id` | Detay (id **veya** slug ile: `mv_043` ya da `inception-2010`) |
| GET | `/api/movies/:id/similar` | Benzer filmler |
| POST | `/api/movies` | 🔒 admin — film ekle |
| PUT | `/api/movies/:id` | 🔒 admin — tamamen güncelle |
| PATCH | `/api/movies/:id` | 🔒 admin — kısmen güncelle |
| DELETE | `/api/movies/:id` | 🔒 admin — sil (yorum/beğeni/puanları da temizler) |

### Beğeni, favori, izleme listesi, puan

| Metod | Yol | Açıklama |
|---|---|---|
| POST / DELETE | `/api/movies/:id/like` | 🔒 Beğen / geri al |
| POST | `/api/movies/:id/like/toggle` | 🔒 Beğeniyi aç-kapat |
| POST / DELETE | `/api/movies/:id/favorite` | 🔒 Favoriye ekle / çıkar |
| POST | `/api/movies/:id/favorite/toggle` | 🔒 Favoriyi aç-kapat |
| POST / DELETE | `/api/movies/:id/watchlist` | 🔒 İzleme listesine ekle / çıkar |
| POST | `/api/movies/:id/watchlist/toggle` | 🔒 İzleme listesini aç-kapat |
| POST | `/api/movies/:id/rate` | 🔒 1-10 puan ver (tekrar verirseniz günceller) |
| DELETE | `/api/movies/:id/rate` | 🔒 Puanı geri çek |
| GET | `/api/movies/:id/ratings` | Puan dağılımı (grafik için hazır) |

### Yorumlar

| Metod | Yol | Açıklama |
|---|---|---|
| GET | `/api/movies/:id/comments` | Filmin yorumları + cevapları |
| POST | `/api/movies/:id/comments` | 🔒 Yorum yaz veya cevap ver (`parentId`) |
| GET | `/api/comments` | Tüm yorumlar (`?movieId=`, `?userId=`, `?search=`) |
| GET | `/api/comments/:id` | Yorum detayı |
| PATCH | `/api/comments/:id` | 🔒 Düzenle (sadece sahibi) |
| DELETE | `/api/comments/:id` | 🔒 Sil (sahibi veya admin) |
| POST | `/api/comments/:id/like` | 🔒 Yorumu beğen / geri al |

### Türler

| Metod | Yol | Açıklama |
|---|---|---|
| GET | `/api/genres` | Film sayısı, ortalama puan ve kapak görseliyle |
| GET | `/api/genres/:slug` | Tür detayı |
| GET | `/api/genres/:slug/movies` | Türe ait filmler (sıralama + sayfalama) |
| POST / PATCH / DELETE | `/api/genres` | 🔒 admin |

### Kullanıcılar

| Metod | Yol | Açıklama |
|---|---|---|
| GET | `/api/users` | Kullanıcı listesi (`?search=`) |
| GET | `/api/users/:idOrUsername` | Profil + istatistikler |
| GET | `/api/users/:id/favorites` | Favori filmleri |
| GET | `/api/users/:id/likes` | Beğendiği filmler |
| GET | `/api/users/:id/watchlist` | İzleme listesi |
| GET | `/api/users/:id/ratings` | Verdiği puanlar |
| GET | `/api/users/:id/comments` | Yorumları |
| GET | `/api/users/:id/recommendations` | Zevkine göre öneriler |
| POST / PATCH / DELETE | `/api/users` | 🔒 admin (PATCH'i kullanıcı kendisi için de yapabilir) |

### Kısayollar — "ben"

Token yeterlidir, kullanıcı id'si taşımanız gerekmez:

`GET /api/me` · `/api/me/favorites` · `/api/me/likes` · `/api/me/watchlist` · `/api/me/ratings` · `/api/me/comments` · `/api/me/recommendations`

### İstatistikler

| Metod | Yol | Açıklama |
|---|---|---|
| GET | `/api/stats/overview` | Toplam sayılar, on yıllara göre dağılım, en iyiler |
| GET | `/api/stats/genres` | Tür bazlı dağılım (pasta/bar grafiği için) |
| GET | `/api/stats/activity` | Son yorum ve puanlardan aktivite akışı |

---

## Filtreleme, sıralama, sayfalama

Tüm liste uçları aynı parametreleri kabul eder.

| Parametre | Örnek | Açıklama |
|---|---|---|
| `search` | `?search=nolan` | Başlık, özet, yönetmen ve oyuncularda arar |
| `genre` | `?genre=action,drama` | Tür slug'ı, virgülle çoklu |
| `genreMatch` | `?genreMatch=all` | Çoklu türde "hepsi" mi "herhangi biri" mi (varsayılan `any`) |
| `year` / `yearMin` / `yearMax` | `?yearMin=2010&yearMax=2020` | Yıl filtresi |
| `minRating` / `maxRating` | `?minRating=8` | Puan aralığı |
| `minRuntime` / `maxRuntime` | `?maxRuntime=120` | Süre (dakika) |
| `director` / `cast` | `?cast=leonardo` | İsme göre |
| `featured` | `?featured=true` | Sadece öne çıkanlar |
| `sort` | `?sort=-rating,title` | Sıralama, `-` = azalan, virgülle çoklu |
| `page` / `limit` | `?page=2&limit=24` | Sayfalama (limit en fazla 100) |
| `delay` | `?delay=1500` | Yapay gecikme — loading state test etmek için |

**Sıralanabilir alanlar:** `rating`, `popularity`, `year`, `title`, `runtime`, `likes`,
`favorites`, `comments`, `views`, `ratingCount`, `releaseDate`, `createdAt`

Örnekler:

```
/api/movies?genre=science-fiction&minRating=8&sort=-rating&limit=12
/api/movies?search=batman&sort=year
/api/movies?yearMin=2015&sort=-likes&page=2&limit=8
/api/genres/animated/movies?sort=-popularity
```

Sayfalama bilgisi her zaman `meta.pagination` içinde döner:

```json
{
  "page": 2, "limit": 12, "total": 85, "totalPages": 8,
  "hasPrevPage": true, "hasNextPage": true, "prevPage": 1, "nextPage": 3
}
```

---

## Veri modeli

### Film (`movies.json`)

```jsonc
{
  "id": "mv_043",
  "title": "Inception",
  "slug": "inception-2010",
  "year": 2010,
  "releaseDate": "2010-07-16",
  "runtime": 148,                 // dakika
  "genres": ["action", "science-fiction"],
  "director": "Christopher Nolan",
  "cast": ["Leonardo DiCaprio", "..."],
  "overview": "İngilizce özet (Wikipedia)",
  "overviewTr": "Türkçe kısa özet",
  "tagline": "Kısa slogan",
  "posterUrl": "https://upload.wikimedia.org/...jpg",
  "backdropUrl": null,            // veri setinde geniş görsel yok
  "trailerUrl": "https://www.youtube.com/results?search_query=...",
  "language": "en",
  "country": "United States",
  "budget": 160000000,
  "revenue": 830000000,
  "status": "released",
  "featured": true,
  "rating": 8.4,                  // kullanıcı puanlarının ortalaması
  "ratingCount": 27,
  "likeCount": 21,
  "favoriteCount": 7,
  "watchlistCount": 5,
  "commentCount": 4,
  "viewCount": 12480,             // detay sayfası her açıldığında artar
  "popularity": 96.4,             // etkileşimlerden hesaplanan skor
  "createdAt": "2024-11-02T09:12:44.031Z",
  "updatedAt": "2025-05-30T18:03:10.115Z",

  // sadece istek anında eklenen alanlar:
  "genreDetails": [{ "slug": "action", "name": "Action", "nameTr": "Aksiyon", "color": "#ef4444" }],
  "isLiked": false, "isFavorite": false, "isInWatchlist": false, "myRating": null
}
```

### Yorum (`comments.json`)

```jsonc
{
  "id": "cm_0007",
  "movieId": "mv_043",
  "userId": "us_002",
  "parentId": null,        // dolu ise bu bir cevaptır
  "content": "Kurgusuna bayıldım...",
  "rating": 9,             // yorumla birlikte verilen puan (opsiyonel)
  "spoiler": false,
  "likeCount": 3,
  "replyCount": 1,
  "isEdited": false,
  "isDeleted": false,
  "createdAt": "...",
  "user": { "id": "us_002", "username": "elif", "fullName": "Elif Yılmaz", "avatar": "..." },
  "isLikedByMe": false,
  "replies": [ /* aynı yapıda */ ]
}
```

### Tür (`genres.json`)

```jsonc
{
  "id": "gn_action", "name": "Action", "nameTr": "Aksiyon", "slug": "action",
  "description": "Tempolu kovalamacalar...", "color": "#ef4444",
  "icon": "zap", "emoji": "💥",
  "movieCount": 24, "averageRating": 7.9, "coverUrl": "https://..."
}
```

---

## Frontend entegrasyonu

### 1) Küçük bir API istemcisi

```js
// src/lib/api.js
const BASE_URL = "http://localhost:4000/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(BASE_URL + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 204) return null;

  const json = await res.json();
  if (!json.success) {
    // details varsa form hatalarını buradan alırsınız
    throw Object.assign(new Error(json.error.message), { code: json.error.code, details: json.error.details });
  }
  return json;
}

export const api = {
  getMovies:   (params) => request("/movies?" + new URLSearchParams(params)),
  getMovie:    (id)     => request(`/movies/${id}`),
  toggleLike:  (id)     => request(`/movies/${id}/like/toggle`, { method: "POST" }),
  toggleFav:   (id)     => request(`/movies/${id}/favorite/toggle`, { method: "POST" }),
  rate:        (id, score) => request(`/movies/${id}/rate`, { method: "POST", body: JSON.stringify({ score }) }),
  comments:    (id)     => request(`/movies/${id}/comments`),
  addComment:  (id, content, rating) =>
                 request(`/movies/${id}/comments`, { method: "POST", body: JSON.stringify({ content, rating }) }),
  login:       (identifier, password) =>
                 request("/auth/login", { method: "POST", body: JSON.stringify({ identifier, password }) }),
  me:          ()       => request("/me"),
  genres:      ()       => request("/genres"),
};
```

### 2) Filtre + sıralama + sayfalama (React)

```jsx
const [filters, setFilters] = useState({ genre: "", sort: "-rating", page: 1, limit: 12 });
const [movies, setMovies]   = useState([]);
const [meta, setMeta]       = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  setLoading(true);
  api.getMovies(filters)
     .then((res) => { setMovies(res.data); setMeta(res.meta.pagination); })
     .finally(() => setLoading(false));
}, [filters]);
```

### 3) İyimser (optimistic) beğeni

Sunucu yanıtı beklemeden kalbi doldurun, yanıt gelince gerçek sayıyla düzeltin:

```jsx
async function handleLike(movie) {
  setMovie((m) => ({ ...m, isLiked: !m.isLiked, likeCount: m.likeCount + (m.isLiked ? -1 : 1) }));
  try {
    const res = await api.toggleLike(movie.id);
    setMovie(res.data.movie);          // sunucudaki kesin hâli
  } catch {
    setMovie(movie);                   // hata olursa geri al
  }
}
```

### 4) Yükleniyor (loading) ve boş durum testi

```js
// 2 saniye geciken istek → skeleton / spinner tasarımınızı rahatça test edin
fetch("http://localhost:4000/api/movies?delay=2000");

// Sonuç dönmeyen arama → "sonuç bulunamadı" ekranı
fetch("http://localhost:4000/api/movies?search=zzzzzz");
```

### 5) Görseller

`posterUrl` doğrudan kullanılabilir. Poster oranı yaklaşık **2:3**'tür:

```jsx
<img src={movie.posterUrl} alt={movie.title} loading="lazy"
     style={{ aspectRatio: "2 / 3", objectFit: "cover", width: "100%" }} />
```

`backdropUrl` bu veri setinde yoktur (`null`). Geniş bir hero alanı için posteri
büyütüp bulanıklaştırmak (`filter: blur(40px)`) güzel bir çözümdür; her türün
`color` alanı da arka plan/etiket rengi olarak kullanılabilir.

---

## Sık karşılaşılan durumlar

**CORS hatası alıyorum.**
Varsayılan olarak tüm origin'lere izin verilir. Kısıtlamak isterseniz `.env` içine
`CORS_ORIGIN=http://localhost:5173` yazın.

**Port 4000 dolu.**
`.env` dosyasında `PORT=5000` yapın.

**Verileri bozdum.**
`npm run reset` — dummy veriler her seferinde aynı şekilde yeniden üretilir.

**Yaptığım değişiklikler kayboluyor mu?**
Hayır. Beğeni, yorum, puan gibi her işlem anında `data/*.json` dosyalarına yazılır.
Sunucuyu kapatıp açtığınızda veriler yerinde durur.

**Kendi filmimi ekleyebilir miyim?**
Evet: `admin` ile giriş yapıp `POST /api/movies` kullanın veya doğrudan
`data/movies.json` dosyasını elle düzenleyin (sunucuyu yeniden başlatmayı unutmayın).

---

## Öğrenciler için

Bu API ile yapılacak proje görevleri ve değerlendirme kriterleri için: **[ODEV.md](./ODEV.md)**

## Lisans

MIT — eğitim amaçlı serbestçe kullanılabilir.
