# 🎯 Frontend Projesi — Film Uygulaması

Bu API'yi kullanarak baştan sona çalışan bir film uygulaması arayüzü geliştireceksin.
Backend hazır; senden beklenen **arayüz tasarımı** ve **API entegrasyonu**.

**Teknoloji serbest:** React, Next.js, Vue, Svelte ya da sade HTML + CSS + JavaScript.
Hangi aracı seçersen seç, aşağıdaki maddeleri karşılamak yeterli.

Başlamadan önce **`http://localhost:4000/swagger`** adresini aç. Bütün uçlar orada;
hangi parametreleri aldıklarını, hangi alanları döndürdüklerini ve örnek yanıtlarını
buradan görebilirsin. **Try it out** ile her ucu çalıştır, dönen JSON'u incele.
Dönen veriyi görmeden tasarıma başlama.

Daha sade, Türkçe anlatımlı bir liste istersen: `http://localhost:4000/docs`

---

## 1. Zorunlu ekranlar

### 🏠 Anasayfa
- Öne çıkan filmlerden bir **slider / hero** alanı — `GET /api/movies/featured`
- "Popüler", "En yüksek puanlı", "Yeni çıkanlar" başlıklı yatay film şeritleri
  — `/api/movies/trending`, `/api/movies/top-rated`, `/api/movies/latest`
- Tür kartları — `GET /api/genres` (her türün `color`, `emoji` ve `coverUrl` alanı var)
- İstatistik şeridi (toplam film / kullanıcı / yorum) — `GET /api/stats/overview`

### 🎞️ Film listesi
- Kart görünümünde grid — poster, başlık, yıl, puan, tür etiketleri
- **Arama kutusu** (yazarken 300-500 ms debounce uygula) — `?search=`
- **Tür filtresi** (çoklu seçim) — `?genre=action,drama`
- **Sıralama** açılır menüsü — puan / yıl / popülerlik / alfabetik
- **Yıl ve puan aralığı** filtresi
- **Sayfalama** veya sonsuz kaydırma — `meta.pagination` bilgisini kullan
- Filtreler URL'ye yansısın (`/movies?genre=action&sort=-rating`) ki sayfa
  yenilenince veya link paylaşılınca aynı sonuç gelsin

### 🎬 Film detayı
- Poster, başlık, yıl, süre, yönetmen, türler, Türkçe özet (`overviewTr`)
- Puan göstergesi ve **puan dağılımı grafiği** — `GET /api/movies/:id/ratings`
- Beğen / Favoriye ekle / İzleme listesine ekle butonları (dolu-boş durumları çalışsın)
- Yıldızla **puan verme** (1-10) — `POST /api/movies/:id/rate`
- **Yorumlar bölümü:** yorum yazma, cevap yazma, yorum beğenme, kendi yorumunu
  düzenleme ve silme
- "Benzer filmler" şeridi — `GET /api/movies/:id/similar`
- Spoiler işaretli yorumlar varsayılan olarak gizli olsun, tıklayınca açılsın

### 🔐 Giriş / Kayıt
- Form doğrulaması (boş alan, kısa şifre, geçersiz e-posta)
- Sunucudan gelen `error.details` dizisini ilgili input'un altında göster
- Token'ı sakla, sayfa yenilenince oturum kaybolmasın
- Giriş yapmamış kullanıcı beğenmeye çalışırsa giriş modalı / yönlendirmesi

### 👤 Profil
- Kullanıcı bilgileri ve istatistikleri — `GET /api/users/:username`
- Sekmeler: Favoriler · Beğeniler · İzleme listesi · Puanladıklarım · Yorumlarım
- Kendi profilinde profil düzenleme formu — `PATCH /api/auth/me`
- "Sana özel öneriler" bölümü — `GET /api/me/recommendations`

### 🏷️ Tür sayfası
- `/tur/action` gibi bir adres, o türe ait filmler — `GET /api/genres/:slug/movies`

---

## 2. Zorunlu davranışlar

| Konu | Beklenen |
|---|---|
| **Yükleniyor** | Her istekte skeleton veya spinner. Test için `?delay=2000` ekleyebilirsin |
| **Boş durum** | Sonuç yoksa "film bulunamadı" ekranı, sadece boş grid değil |
| **Hata** | İstek başarısızsa kullanıcıya anlaşılır mesaj + "tekrar dene" |
| **Responsive** | Mobil, tablet, masaüstü. Grid sütun sayısı ekrana göre değişsin |
| **Optimistic UI** | Beğeni/favori tıklanınca ikon anında değişsin, hata olursa geri alınsın |
| **Görseller** | `loading="lazy"`, 2:3 oran, yüklenirken placeholder |
| **Erişilebilirlik** | Butonlarda `aria-label`, klavyeyle gezilebilirlik, yeterli kontrast |

---

## 3. Bonus (puan getirir)

- 🌙 Karanlık / aydınlık tema geçişi
- ⌨️ `Ctrl+K` ile açılan hızlı arama paleti
- 🎲 "Bugün ne izlesem?" butonu — `GET /api/movies/random`
- 📊 Tür dağılımı grafiği — `GET /api/stats/genres`
- 📰 Aktivite akışı — `GET /api/stats/activity`
- 🛠️ Admin paneli: `admin` hesabıyla film ekleme / düzenleme / silme formları
- 🔍 Arama sonuçlarında aranan kelimenin vurgulanması
- 💾 İsteklerin önbelleklenmesi (React Query / SWR veya kendi çözümün)
- ↕️ Sonsuz kaydırma (infinite scroll)

---

## 4. Değerlendirme

| Kriter | Ağırlık |
|---|---|
| Tasarım kalitesi ve tutarlılık (tipografi, boşluk, renk, hiyerarşi) | %30 |
| API entegrasyonunun doğruluğu ve eksiksizliği | %25 |
| Durum yönetimi: loading / error / empty / optimistic | %20 |
| Responsive davranış ve erişilebilirlik | %15 |
| Kod düzeni: klasör yapısı, bileşen ayrımı, tekrar etmeyen kod | %10 |

---

## 5. Yol haritası önerisi

1. **Gün 1** — API'yi keşfet. `/docs` sayfasında tüm uçları dene, dönen JSON'u incele.
   Tasarım taslağını çıkar (Figma veya kâğıt).
2. **Gün 2** — Proje kurulumu, API istemcisi (README'deki `api.js` örneği), film listesi
   ve kart bileşeni.
3. **Gün 3** — Arama, filtre, sıralama, sayfalama. Filtrelerin URL'ye yansıması.
4. **Gün 4** — Film detay sayfası, benzer filmler, puan dağılımı.
5. **Gün 5** — Giriş/kayıt, token yönetimi, beğeni ve favori akışları.
6. **Gün 6** — Yorumlar ve cevaplar, profil sayfası.
7. **Gün 7** — Responsive düzeltmeleri, boş/hata durumları, cilalama, bonuslar.

---

## 6. Teslim

- Kaynak kod (git deposu tercih edilir, anlamlı commit mesajlarıyla)
- Kısa bir `README`: nasıl çalıştırılır, hangi teknolojileri kullandın, neyi neden seçtin
- Birkaç ekran görüntüsü veya kısa bir ekran kaydı

Takıldığın yerde önce `http://localhost:4000/swagger` sayfasından ilgili endpoint'i dene;
sorunun frontend'te mi backend'te mi olduğunu böyle ayırt edersin.

Kolay gelsin 🎬
