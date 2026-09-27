'use strict';

/**
 * ============================================================
 *  SEED (DUMMY VERI) SCRIPTI
 * ============================================================
 *  Kullanim:
 *    npm run seed    -> veri yoksa doldurur
 *    npm run reset   -> mevcut veriyi silip bastan doldurur
 *
 *  Film adi, yili, oyuncu kadrosu, ozeti ve poster gorseli
 *  Wikipedia film veri setinden gelir (scripts/source-movies.json).
 *  Puanlar, begeniler, yorumlar ve kullanicilar ise bu script
 *  tarafindan uretilen sahte (dummy) verilerdir.
 */

const path = require('path');
const fs = require('fs');

const { db, loadAll, pauseAll, flushAll } = require('../src/db');
const { hashPassword } = require('../src/utils/security');
const { slugify, round } = require('../src/utils/helpers');
const movieService = require('../src/services/movie.service');

const SOURCE = require('./source-movies.json');
const META = require('./movie-meta');

// ---------------------------------------------------------------------------
// Deterministik rastgelelik: her calistirmada AYNI dummy veri uretilir.
// Boylece ogrenci ile ayni veriyi konusabilirsiniz.
// ---------------------------------------------------------------------------
function mulberry32(seed) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(20240519);

const randInt = (min, max) => Math.floor(rnd() * (max - min + 1)) + min;
const pickOne = (arr) => arr[Math.floor(rnd() * arr.length)];
const pickMany = (arr, n) => {
  const copy = [...arr];
  const out = [];
  while (copy.length && out.length < n) out.push(copy.splice(Math.floor(rnd() * copy.length), 1)[0]);
  return out;
};
/** Gecmise dogru rastgele bir tarih uretir (son 400 gun icinde). */
const randomDate = (maxDaysAgo = 400) => {
  const base = Date.UTC(2025, 5, 1); // sabit referans: 1 Haziran 2025
  return new Date(base - randInt(0, maxDaysAgo) * 86400000 - randInt(0, 86399) * 1000).toISOString();
};

// ---------------------------------------------------------------------------
// TURLER
// ---------------------------------------------------------------------------
const GENRE_INFO = {
  Action: { nameTr: 'Aksiyon', color: '#ef4444', icon: 'zap', emoji: '💥' },
  Adventure: { nameTr: 'Macera', color: '#f97316', icon: 'compass', emoji: '🧭' },
  Animated: { nameTr: 'Animasyon', color: '#a855f7', icon: 'palette', emoji: '🎨' },
  Biography: { nameTr: 'Biyografi', color: '#0ea5e9', icon: 'user', emoji: '👤' },
  Comedy: { nameTr: 'Komedi', color: '#facc15', icon: 'laugh', emoji: '😂' },
  Crime: { nameTr: 'Suç', color: '#64748b', icon: 'fingerprint', emoji: '🕵️' },
  Drama: { nameTr: 'Dram', color: '#6366f1', icon: 'drama', emoji: '🎭' },
  Family: { nameTr: 'Aile', color: '#22c55e', icon: 'users', emoji: '👨‍👩‍👧' },
  Fantasy: { nameTr: 'Fantastik', color: '#8b5cf6', icon: 'wand', emoji: '🪄' },
  Historical: { nameTr: 'Tarihi', color: '#b45309', icon: 'landmark', emoji: '🏛️' },
  Horror: { nameTr: 'Korku', color: '#1f2937', icon: 'ghost', emoji: '👻' },
  Independent: { nameTr: 'Bağımsız', color: '#14b8a6', icon: 'sparkles', emoji: '✨' },
  'Martial Arts': { nameTr: 'Dövüş Sanatları', color: '#dc2626', icon: 'swords', emoji: '🥋' },
  Musical: { nameTr: 'Müzikal', color: '#ec4899', icon: 'music', emoji: '🎵' },
  Mystery: { nameTr: 'Gizem', color: '#7c3aed', icon: 'search', emoji: '🔎' },
  Noir: { nameTr: 'Kara Film', color: '#334155', icon: 'moon', emoji: '🌑' },
  Romance: { nameTr: 'Romantik', color: '#f43f5e', icon: 'heart', emoji: '❤️' },
  'Science Fiction': { nameTr: 'Bilim Kurgu', color: '#06b6d4', icon: 'rocket', emoji: '🚀' },
  Superhero: { nameTr: 'Süper Kahraman', color: '#2563eb', icon: 'shield', emoji: '🦸' },
  Suspense: { nameTr: 'Sürükleyici', color: '#475569', icon: 'hourglass', emoji: '⏳' },
  Thriller: { nameTr: 'Gerilim', color: '#0f766e', icon: 'alert-triangle', emoji: '⚠️' },
  War: { nameTr: 'Savaş', color: '#78716c', icon: 'flag', emoji: '🎖️' },
  Western: { nameTr: 'Western', color: '#ca8a04', icon: 'sun', emoji: '🤠' },
};

const GENRE_DESC = {
  Action: 'Tempolu kovalamacalar, dövüşler ve büyük set parçaları.',
  Adventure: 'Uzak diyarlara uzanan yolculuklar ve keşif hikâyeleri.',
  Animated: 'Her yaşa hitap eden çizgi ve bilgisayar animasyonları.',
  Biography: 'Gerçek hayat hikâyelerinden uyarlanan filmler.',
  Comedy: 'Güldüren, hafifleten, iyi hissettiren filmler.',
  Crime: 'Suç dünyası, soygunlar ve yeraltı hesaplaşmaları.',
  Drama: 'İnsan ilişkilerini merkeze alan güçlü anlatılar.',
  Family: 'Ailece izlenebilecek sıcak yapımlar.',
  Fantasy: 'Büyü, efsane ve hayal gücünün sınırlarını zorlayan dünyalar.',
  Historical: 'Tarihî dönemlerde geçen, döneme sadık yapımlar.',
  Horror: 'Gerilimi tırmandıran, korkutan filmler.',
  Independent: 'Bağımsız yapımcılıkla çekilmiş özgün filmler.',
  'Martial Arts': 'Koreografisi güçlü dövüş sahneleri.',
  Musical: 'Şarkıların hikâyeyi taşıdığı filmler.',
  Mystery: 'Çözülmeyi bekleyen bilmeceler ve sırlar.',
  Noir: 'Karanlık atmosferli, karamsar suç filmleri.',
  Romance: 'Aşkın merkezde olduğu hikâyeler.',
  'Science Fiction': 'Bilim, teknoloji ve geleceğe dair sorular.',
  Superhero: 'Süper güçlerin ve büyük sorumlulukların dünyası.',
  Suspense: 'Nefes kesen, merak duygusunu diri tutan filmler.',
  Thriller: 'Gerilimi sonuna kadar taşıyan filmler.',
  War: 'Savaşın içindeki insan hikâyeleri.',
  Western: 'Vahşi Batı, kovboylar ve çöl kasabaları.',
};

// ---------------------------------------------------------------------------
// KULLANICILAR  (hepsinin şifresi: 123456)
// ---------------------------------------------------------------------------
const USERS = [
  { username: 'admin', fullName: 'Site Yöneticisi', role: 'admin', bio: 'Bu API demo projesinin yöneticisi.' },
  { username: 'elif', fullName: 'Elif Yılmaz', role: 'user', bio: 'Bilim kurgu ve Nolan bağımlısı. Salonda ilk gün izlerim.' },
  { username: 'mert', fullName: 'Mert Kaya', role: 'user', bio: 'Kore sineması, gerilim ve iyi bir kurgu her şeydir.' },
  { username: 'zeynep', fullName: 'Zeynep Demir', role: 'user', bio: 'Animasyon izlemek için çocuk olmak gerekmiyor.' },
  { username: 'can', fullName: 'Can Öztürk', role: 'user', bio: 'Tarantino ve Scorsese ekolü. Uzun filmden korkmam.' },
  { username: 'selin', fullName: 'Selin Aydın', role: 'user', bio: 'Romantik komedi savunucusu, ara sıra korku denerim.' },
  { username: 'burak', fullName: 'Burak Çelik', role: 'user', bio: 'Süper kahraman filmlerini kronolojik sırayla izlerim.' },
  { username: 'ayse', fullName: 'Ayşegül Doğan', role: 'user', bio: 'Bağımsız sinema ve festival filmleri.' },
  { username: 'emre', fullName: 'Emre Koç', role: 'user', bio: 'Aksiyon, patlama, kovalamaca. Fazlası gereksiz.' },
  { username: 'defne', fullName: 'Defne Arslan', role: 'user', bio: 'Film müziği koleksiyoncusu.' },
  { username: 'kaan', fullName: 'Kaan Yıldırım', role: 'user', bio: 'Klasikleri yeniden izlemeyi seviyorum.' },
  { username: 'irem', fullName: 'İrem Şahin', role: 'user', bio: 'Gerilim ve gizem. Sonu tahmin edilen film sevmem.' },
  { username: 'oguz', fullName: 'Oğuzhan Polat', role: 'user', bio: 'Savaş ve tarih filmleri arşivcisi.' },
  { username: 'nazli', fullName: 'Nazlı Şen', role: 'user', bio: 'Pixar çıkarsa her şeyi bırakır izlerim.' },
  { username: 'furkan', fullName: 'Furkan Aksoy', role: 'user', bio: 'Backend yazarım, film izlerken de API düşünürüm.' },
  { username: 'ece', fullName: 'Ece Tunç', role: 'user', bio: 'A24 çıkışlı ne varsa izlemişimdir.' },
  { username: 'berk', fullName: 'Berk Yavuz', role: 'user', bio: 'Uzun soluklu serileri baştan sona izlemeyi severim.' },
  { username: 'sude', fullName: 'Sude Erdem', role: 'user', bio: 'Kostüm ve sanat yönetimi benim için filmin yarısı.' },
  { username: 'tolga', fullName: 'Tolga Şimşek', role: 'user', bio: 'Western ve klasik Hollywood arşivi.' },
  { username: 'melis', fullName: 'Melis Ünal', role: 'user', bio: 'Cumartesi geceleri korku maratonu.' },
  { username: 'baris', fullName: 'Barış Aktaş', role: 'user', bio: 'Sinemada oturmadan önce fragman izlemem.' },
  { username: 'gizem', fullName: 'Gizem Kurt', role: 'user', bio: 'Senaryo okumayı film izlemek kadar seviyorum.' },
  { username: 'onur', fullName: 'Onur Bulut', role: 'user', bio: 'IMDb ilk 250 listesini bitirmeye çalışıyorum.' },
  { username: 'ceren', fullName: 'Ceren Kılıç', role: 'user', bio: 'Animasyon ve stop-motion tutkunu.' },
  { username: 'yusuf', fullName: 'Yusuf Tekin', role: 'user', bio: 'Bilim kurgu kitaplarının uyarlamalarını takip ediyorum.' },
  { username: 'aylin', fullName: 'Aylin Bozkurt', role: 'user', bio: 'Kısa film festivallerinde gönüllüyüm.' },
  { username: 'serkan', fullName: 'Serkan Güneş', role: 'user', bio: 'Aksiyon koreografisi üzerine yazı yazıyorum.' },
  { username: 'derya', fullName: 'Derya Aslan', role: 'user', bio: 'Belgesel ve biyografi filmleri.' },
  { username: 'ali', fullName: 'Ali Korkmaz', role: 'user', bio: 'Klasikleri 35 mm izleyebilmek için gösterim takip ederim.' },
  { username: 'buse', fullName: 'Buse Yalçın', role: 'user', bio: 'Film müzikleri ve müzikaller.' },
  { username: 'deniz', fullName: 'Deniz Ergin', role: 'user', bio: 'Kurgu ve ses tasarımı detaylarına takılırım.' },
  { username: 'ozan', fullName: 'Ozan Çetin', role: 'user', bio: 'Süper kahraman filmlerinde çizgi roman uyumu ararım.' },
  { username: 'pinar', fullName: 'Pınar Duman', role: 'user', bio: 'Romantik dramları ağlayarak izlerim, pişman değilim.' },
  { username: 'hakan', fullName: 'Hakan Sarı', role: 'user', bio: 'Gerilim ve polisiye. Sonu tahmin ettiysem beğenmem.' },
  { username: 'ilayda', fullName: 'İlayda Öz', role: 'user', bio: 'Yeni yönetmen keşfetmeyi seviyorum.' },
  { username: 'murat', fullName: 'Murat Eren', role: 'user', bio: 'Savaş filmlerinde tarihsel doğruluk peşindeyim.' },
  { username: 'sena', fullName: 'Sena Balcı', role: 'user', bio: 'Pazar günleri Pixar günüdür.' },
  { username: 'cem', fullName: 'Cem Doğru', role: 'user', bio: 'Bağımsız Amerikan sineması ve mumblecore.' },
  { username: 'esra', fullName: 'Esra Yıldız', role: 'user', bio: 'Kadın yönetmenlerin filmlerini takip ediyorum.' },
  { username: 'kerem', fullName: 'Kerem Acar', role: 'user', bio: 'Bilim kurgu ve zaman yolculuğu paradoksları.' },
];

// ---------------------------------------------------------------------------
// YORUM SABLONLARI (puana gore secilir)
// ---------------------------------------------------------------------------
const POSITIVE_COMMENTS = [
  'Yıllar sonra tekrar izledim, hâlâ ilk günkü gibi etkiliyor.',
  'Senaryo o kadar sıkı ki tek bir sahnesi bile fazlalık değil.',
  'Görüntü yönetmenliği başlı başına bir sanat eseri. Büyük ekranda izlenmeli.',
  'Final sahnesinden sonra bir süre koltuktan kalkamadım.',
  'Oyunculuklar inanılmaz, özellikle başroldeki performans tek kelimeyle sınıf atlatmış.',
  'Müzikleri filmin yarısı. Soundtrack listemde sabit.',
  'Kurgusuna bayıldım, ikinci izleyişte kaçırdığım onlarca detay çıktı.',
  'Türünün en iyilerinden. Herkese gönül rahatlığıyla öneririm.',
  'Bu kadar uzun bir film olmasına rağmen hiç sıkılmadım.',
  'Atmosferi öyle güçlü ki filmin dünyasına gerçekten giriyorsun.',
  'Karakterlerin hiçbiri siyah beyaz değil, hepsinin bir haklılığı var. Çok başarılı.',
  'Tekrar tekrar izlenecek filmlerden. Listemde ilk üçe girer.',
  'Beklentim yüksekti ama yine de beni şaşırtmayı başardı.',
  'Sadece görsel şölen değil, anlattığı şey de çok değerli.',
  'Arkadaş grubunda izlemeyen kalmasın diye herkese zorla izlettim.',
];

const NEUTRAL_COMMENTS = [
  'Güzeldi ama abartıldığı kadar değil bence. Yine de bir kez izlenir.',
  'İlk yarısı çok iyiydi, ikinci yarıda tempo biraz düştü.',
  'Teknik olarak kusursuz ama duygusal olarak bana ulaşamadı.',
  'Beklentiyi biraz yüksek tutmuşum sanırım. Fena değil.',
  'Hikâye tanıdık geliyor ama işçiliği iyi.',
  'Bir kere izlenir, tekrar izler miyim bilmiyorum.',
  'Oyunculuklar iyi, senaryo ortalama.',
  'Ortalamanın üzerinde ama başyapıt demeye dilim varmıyor.',
];

const CRITICAL_COMMENTS = [
  'Bana göre gereğinden uzun, en az yarım saat kısalabilirdi.',
  'Konuyu sevdim ama anlatım çok dağınıktı, takip etmekte zorlandım.',
  'Görsel efektler iyi de senaryo aynı özeni görmemiş.',
  'Karakter gelişimi zayıf kalmış, kimseye bağlanamadım.',
  'Sonu benim için hayal kırıklığıydı, çok aceleye gelmiş.',
  'Popülerliğini anlamış değilim açıkçası.',
];

const REPLIES = [
  'Kesinlikle katılıyorum, aynı şeyi düşünmüştüm.',
  'Bence de finali tartışmaya çok açık, herkes farklı yorumluyor.',
  'Bir de yönetmenin diğer filmini izle, aynı hissi veriyor.',
  'Ben tam tersini düşünüyorum ama yorumun için teşekkürler.',
  'İkinci izleyişte fikrin değişebilir, bende öyle oldu.',
  'Altyazılı mı dublajlı mı izledin? Fark yaratıyor bence.',
  'Bu yorumu okuyunca tekrar izleme isteği geldi.',
  'Aynı türde başka öneri var mı?',
  'Katılmıyorum, o sahne bence filmin en güçlü anı.',
  'Müzikleri için ayrı bir paragraf yazmak lazım gerçekten.',
];

const SPOILER_COMMENTS = [
  'Finaldeki o dönüşü hiç beklemiyordum, film boyunca ipuçları varmış meğer.',
  'Ana karakterin son kararı bence tüm hikâyeyi baştan anlamlandırıyor.',
];

// ---------------------------------------------------------------------------
// YARDIMCILAR
// ---------------------------------------------------------------------------

/** Film adından YouTube fragman arama bağlantısı üretir. */
function trailerLink(title, year) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} ${year} trailer`)}`;
}

/** Filmin türlerine göre kısa bir Türkçe slogan üretir (dummy). */
function makeTagline(genresTr, year) {
  const templates = [
    `${genresTr[0]} sevenler için ${year} yapımı bir klasik.`,
    `${year}: ${genresTr.join(' ve ')} bir arada.`,
    `${genresTr[0]} türünde unutulmaz bir sinema deneyimi.`,
    `Bir kez izlemek asla yetmiyor.`,
    `${year} yapımı, hâlâ konuşulan bir film.`,
  ];
  return pickOne(templates);
}

// ---------------------------------------------------------------------------
// ANA AKIS
// ---------------------------------------------------------------------------
async function seed() {
  const force = process.argv.includes('--force') || process.argv.includes('-f');
  loadAll();

  if (db.movies.raw().length > 0 && !force) {
    console.log('\n⚠️  Veritabanında zaten kayıt var.');
    console.log('   Sıfırlayıp yeniden doldurmak için:  npm run reset\n');
    return;
  }

  console.log('\n🌱  Dummy veriler oluşturuluyor...\n');

  // Binlerce kayıt eklenirken her adımda diske yazmamak için toplu işlem
  // modunu açıyoruz; değişiklikler en sonda tek seferde kaydedilir.
  pauseAll();

  // --- 0) Temizlik --------------------------------------------------------
  for (const collection of Object.values(db)) await collection.clear();

  // --- 1) Türler ----------------------------------------------------------
  const usedGenres = [...new Set(SOURCE.flatMap((m) => m.genres))].sort();
  const genreDocs = usedGenres.map((name) => {
    const info = GENRE_INFO[name] || { nameTr: name, color: '#6366f1', icon: 'film', emoji: '🎬' };
    return {
      id: `gn_${slugify(name)}`,
      name,
      nameTr: info.nameTr,
      slug: slugify(name),
      description: GENRE_DESC[name] || '',
      color: info.color,
      icon: info.icon,
      emoji: info.emoji,
      createdAt: randomDate(500),
    };
  });
  await db.genres.insertMany(genreDocs);
  console.log(`   ✓ ${genreDocs.length} tür eklendi`);

  // --- 2) Kullanıcılar ----------------------------------------------------
  const passwordHash = hashPassword('123456');
  const userDocs = USERS.map((user, index) => ({
    id: `us_${String(index + 1).padStart(3, '0')}`,
    username: user.username,
    email: `${user.username}@movieapi.dev`,
    password: passwordHash,
    fullName: user.fullName,
    avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(user.username)}`,
    bio: user.bio,
    role: user.role,
    isActive: true,
    createdAt: randomDate(500),
    lastLoginAt: randomDate(30),
  }));
  await db.users.insertMany(userDocs);
  console.log(`   ✓ ${userDocs.length} kullanıcı eklendi (şifre: 123456)`);

  // --- 3) Filmler ---------------------------------------------------------
  const countries = ['United States', 'United Kingdom', 'New Zealand', 'Canada', 'Australia'];
  const movieDocs = SOURCE.map((source, index) => {
    const meta = META[source.title] || {};
    const year = meta.year || source.year;
    const genres = source.genres.map((g) => slugify(g));
    const genresTr = source.genres.map((g) => (GENRE_INFO[g] ? GENRE_INFO[g].nameTr : g));

    const budget = randInt(5, 250) * 1000000;
    const revenue = Math.round(budget * (0.6 + rnd() * 6));

    return {
      id: `mv_${String(index + 1).padStart(3, '0')}`,
      title: source.title,
      originalTitle: source.title,
      slug: slugify(`${source.title}-${year}`),
      year,
      releaseDate: `${year}-${String(randInt(1, 12)).padStart(2, '0')}-${String(randInt(1, 28)).padStart(2, '0')}`,
      runtime: meta.runtime || randInt(95, 155),
      genres,
      director: meta.director || 'Bilinmiyor',
      cast: source.cast,
      overview: source.overview,
      overviewTr: meta.overviewTr || '',
      tagline: makeTagline(genresTr, year),
      posterUrl: source.posterUrl,
      backdropUrl: null,
      trailerUrl: trailerLink(source.title, year),
      language: 'en',
      country: pickOne(countries),
      budget,
      revenue,
      status: 'released',
      featured: false,
      rating: 0,
      ratingCount: 0,
      likeCount: 0,
      favoriteCount: 0,
      watchlistCount: 0,
      commentCount: 0,
      viewCount: randInt(400, 48000),
      popularity: 0,
      createdBy: 'us_001',
      createdAt: randomDate(400),
      // seed sırasında kullanılan gizli kalite katsayısı (kayda yazılmaz)
      _base: round(6.6 + rnd() * 2.6, 2),
    };
  });

  const baseByMovie = new Map(movieDocs.map((m) => [m.id, m._base]));
  await db.movies.insertMany(movieDocs.map(({ _base, ...rest }) => rest));
  console.log(`   ✓ ${movieDocs.length} film eklendi (gerçek poster görselleriyle)`);

  // --- 4) Beğeni / favori / izleme listesi / puanlar ----------------------
  const movieIds = movieDocs.map((m) => m.id);
  const userIds = userDocs.map((u) => u.id);

  const likes = [];
  const favorites = [];
  const watchlist = [];
  const ratings = [];
  const ratingByUserMovie = new Map();

  // Etkileşimleri film başına üretiyoruz; böylece her filmin makul
  // sayıda oyu, beğenisi ve favorisi olur (ortalama puanlar tutarlı çıkar).
  for (const movieId of movieIds) {
    const base = baseByMovie.get(movieId);
    // Kaliteli filmler daha çok etkileşim alsın
    const popularityBias = (base - 6.6) / 2.6; // 0 ile 1 arası

    const likers = pickMany(userIds, randInt(6, 18) + Math.round(popularityBias * 14));
    likers.forEach((userId) => likes.push({ userId, movieId, createdAt: randomDate(300) }));

    pickMany(likers, randInt(1, 4) + Math.round(popularityBias * 5)).forEach((userId) =>
      favorites.push({ userId, movieId, createdAt: randomDate(300) })
    );

    const notLikers = userIds.filter((id) => !likers.includes(id));
    pickMany(notLikers, randInt(2, 9)).forEach((userId) =>
      watchlist.push({ userId, movieId, createdAt: randomDate(200) })
    );

    const raters = pickMany(userIds, randInt(9, 22) + Math.round(popularityBias * 12));
    raters.forEach((userId) => {
      const score = Math.max(1, Math.min(10, Math.round(base + (rnd() * 2.6 - 1.3))));
      ratingByUserMovie.set(`${userId}:${movieId}`, score);
      ratings.push({ userId, movieId, score, review: '', createdAt: randomDate(300) });
    });
  }

  await db.likes.insertMany(likes);
  await db.favorites.insertMany(favorites);
  await db.watchlist.insertMany(watchlist);
  await db.ratings.insertMany(ratings);
  console.log(
    `   ✓ ${likes.length} beğeni, ${favorites.length} favori, ${watchlist.length} izleme listesi, ${ratings.length} puan eklendi`
  );

  // --- 5) Yorumlar ve cevaplar -------------------------------------------
  const comments = [];
  let commentCounter = 0;

  for (const movieId of movieIds) {
    const commenters = pickMany(userIds, randInt(1, 7));

    for (const userId of commenters) {
      const score = ratingByUserMovie.get(`${userId}:${movieId}`) || null;
      const isSpoiler = rnd() < 0.08;

      let content;
      if (isSpoiler) content = pickOne(SPOILER_COMMENTS);
      else if (score === null) content = pickOne(NEUTRAL_COMMENTS);
      else if (score >= 8) content = pickOne(POSITIVE_COMMENTS);
      else if (score >= 6) content = pickOne(NEUTRAL_COMMENTS);
      else content = pickOne(CRITICAL_COMMENTS);

      commentCounter += 1;
      comments.push({
        id: `cm_${String(commentCounter).padStart(4, '0')}`,
        movieId,
        userId,
        parentId: null,
        content,
        rating: score,
        spoiler: isSpoiler,
        likeCount: 0,
        replyCount: 0,
        isEdited: rnd() < 0.05,
        isDeleted: false,
        createdAt: randomDate(250),
      });
    }
  }

  // Bazı yorumlara cevap yaz
  const rootComments = [...comments];
  for (const parent of rootComments) {
    if (rnd() > 0.28) continue;
    const replyCount = randInt(1, 2);
    const responders = pickMany(
      userIds.filter((id) => id !== parent.userId),
      replyCount
    );
    for (const userId of responders) {
      commentCounter += 1;
      comments.push({
        id: `cm_${String(commentCounter).padStart(4, '0')}`,
        movieId: parent.movieId,
        userId,
        parentId: parent.id,
        content: pickOne(REPLIES),
        rating: null,
        spoiler: false,
        likeCount: 0,
        replyCount: 0,
        isEdited: false,
        isDeleted: false,
        createdAt: new Date(new Date(parent.createdAt).getTime() + randInt(1, 72) * 3600000).toISOString(),
      });
    }
  }

  await db.comments.insertMany(comments);

  // Yorum beğenileri
  const commentLikes = [];
  for (const comment of comments) {
    const likers = pickMany(userIds, randInt(0, 6));
    likers.forEach((userId) => commentLikes.push({ userId, commentId: comment.id, createdAt: randomDate(200) }));
  }
  await db.commentLikes.insertMany(commentLikes);
  console.log(`   ✓ ${comments.length} yorum ve ${commentLikes.length} yorum beğenisi eklendi`);

  // --- 6) Sayaçları hesapla ve öne çıkanları belirle ---------------------
  for (const movieId of movieIds) await movieService.recomputeMovieStats(movieId);
  for (const comment of comments) {
    const likeCount = db.commentLikes.count({ commentId: comment.id });
    const replyCount = db.comments.count((c) => c.parentId === comment.id);
    await db.comments.updateById(comment.id, { likeCount, replyCount });
  }

  // Biriken değişiklikleri diske yaz
  await flushAll();
  pauseAll();

  const featuredIds = db.movies
    .all()
    .filter((m) => m.ratingCount >= 10)
    .sort((a, b) => b.rating - a.rating || b.ratingCount - a.ratingCount)
    .slice(0, 8)
    .map((m) => m.id);
  for (const movieId of featuredIds) await db.movies.updateById(movieId, { featured: true });

  await flushAll();

  // --- 7) Özet ------------------------------------------------------------
  const top = db.movies
    .all()
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  console.log('\n   En yüksek puanlı 5 film:');
  top.forEach((m, i) => console.log(`     ${i + 1}. ${m.title} (${m.year}) — ${m.rating} / 10  [${m.ratingCount} oy]`));

  const sizes = fs
    .readdirSync(path.join(__dirname, '..', 'data'))
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      const size = fs.statSync(path.join(__dirname, '..', 'data', f)).size;
      return `${f} (${(size / 1024).toFixed(1)} KB)`;
    });
  console.log(`\n   Oluşturulan dosyalar: ${sizes.join(', ')}`);
  console.log('\n✅  Hazır! Sunucuyu başlatmak için:  npm start\n');
}

// Doğrudan çalıştırıldıysa (npm run seed) hemen başla.
// require ile çağrıldıysa sadece fonksiyonu dışarı ver.
if (require.main === module) {
  seed().catch((err) => {
    console.error('\n❌  Seed sırasında hata:', err);
    process.exit(1);
  });
}

module.exports = seed;
