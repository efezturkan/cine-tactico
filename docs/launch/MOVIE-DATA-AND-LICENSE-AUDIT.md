# CINE-TACTICO — MEVCUT PROJE, VERİ KAYNAKLARI VE LİSANS DENETİM RAPORU

**Belge Kodu:** CT-AUDIT-DATA-01  
**Tarih:** 31 Ekim 2026  
**Denetçi:** Antigravity  
**Kapsam:** Veri Kaynakları, API Bağımlılıkları, Film Şeması, Telif & Ticari Lisanslar, Maliyet ve Uzun Vadeli Vizyon  
**Denetim Türü:** Sıfır Varsayım / Salt Dosya ve Kod Düzeyinde İnceleme (Kod Değişikliği Yapılmadı)

---

## 1. Yönetici Özeti

Cine-Tactico projesinin veri altyapısı, harici API bağımlılıkları, görsel kullanım hakları ve ticari lisans riskleri baştan sona denetlendi.

### En Temel Bulgular:
1. **Canlı API ve Sunucu Yok:** Projede şu an çalışan hiçbir canlı film API'si (TMDB API, IMDb API, OMDb vb.) bulunmamaktadır. Hiçbir HTTP `fetch` veya `axios` çağrısı yapılmamaktadır. Supabase veya Firebase veritabanı kurulu değildir.
2. **Statik TypeScript Veritabanı:** Tüm film ve dizi verisi, doğrudan istemci koduna gömülü olan `src/data/movies.ts` dosyası içerisindeki statik bir JavaScript dizisinde (`MOVIES_DATABASE`) saklanmaktadır.
3. **Katalog Büyüklüğü:** Toplamda tam **100 kayıt** bulunmaktadır (85 Film, 15 Dizi).
4. **Puanların Kaynağı:** Kayıtlardaki puanlar `imdbRating: 8.8` şeklinde sabit sayılar olarak elle yazılmıştır. Canlı bir IMDb bağlantısı veya doğrulanmış lisanslı IMDb veri seti yoktur.
5. **Görsellerin Kaynağı (TMDB CDN Hotlinking):** 100 kaydın **48 tanesinde** TMDB CDN'ine (`https://image.tmdb.org/t/p/w500/...`) yönlendiren doğrudan resim URL'si bulunmaktadır. Kalan **52 kayıtta hiç afiş görseli yoktur** (UI placeholder göstermektedir).
6. **Ticari Lisans Uyuşmazlığı:**
   - Reklam destekli veya gelir üreten bir mobil uygulamada TMDB verilerini ve görsellerini ücretsiz API lisansıyla kullanmak TMDB Hizmet Şartları'na aykırıdır (TMDB ticari lisans sözleşmesi gerektirir).
   - Uygulama içinde "IMDb" adını ve puanlarını ticari bir üründe doğrudan telif/marka izni olmadan kullanmak hem Apple/Google mağaza incelemesinde ret hem de Amazon/IMDb nezdinde marka ihlali riski doğurur.

---

## 2. Mevcut Teknik Mimari

```
+-------------------------------------------------------------+
|                     Cine-Tactico Client                     |
|                 (Next.js 14 / Capacitor)                    |
+-------------------------------------------------------------+
                              |
      +-----------------------+-----------------------+
      | (Yerel Bellek)                                | (Ağ Çağrısı - Sadece 48 Afiş)
      v                                               v
+-----------------------------+               +-------------------------------+
|     src/data/movies.ts      |               |      image.tmdb.org           |
| (100 Adet Statik Film/Dizi) |               |  (TMDB Image Hosting CDN)     |
+-----------------------------+               +-------------------------------+
      |                                               |
      +-----------------------+-----------------------+
                              |
                              v
              +-------------------------------+
              |   CineXOX 3x3 Oyun Tahtası    |
              | (Yerel Doğrulama & Bot AI)    |
              +-------------------------------+
```

* **Çalışma Şekli:** Oyun açılırken herhangi bir sunucuya bağlanmaz. 100 kayıtlık film dizisi uygulamanın JavaScript paketinin (171 kB) içine gömülüdür.
* **İnternetsiz (Offline) Çalışma:** Oyun internetsiz %100 çalışabilmektedir. İnternet kesilirse yalnızca TMDB CDN'inden çekilen 48 afiş yüklenemez; bu durumda oyun çökmeyip `SearchMovieThumbnail` bileşeni üzerinden zarif bir film ikonu ve yıl etiketi (placeholder) gösterir.

---

## 3. Veri Kaynakları ve API Envanteri

| Soru | Durum | Kanıt & Dosya Yolu |
| :--- | :--- | :--- |
| **Hangi API kullanılıyor?** | **Hiçbir canlı API kullanılmıyor.** | `src/` dizininde 0 adet `fetch()`, 0 adet `axios` çağrısı vardır. |
| **TMDB API kullanılıyor mu?** | Yalnızca statik görsel linkleri var. | `src/data/movies.ts` içinde 48 adet `https://image.tmdb.org/` URL'si. |
| **IMDb API var mı?** | **Hayır.** | Canlı bağlantı yoktur, sadece `imdbRating` adlı statik sayısal alan vardır. |
| **TheTVDB / OMDb / Wikidata?** | **Hayır.** | Projede bu servislerin izi dahi yoktur. |
| **API Anahtarları var mı?** | **Hayır.** | Proje kökünde `.env` veya `.env.local` dosyası yoktur. |
| **Veritabanı var mı?** | **Hayır.** | Supabase, Firebase veya SQLite yüklü değildir (`package.json` temizdir). |
| **Veri ne zaman yükleniyor?** | **Uygulama derlenirken.** | `src/data/movies.ts` Next.js derleme anında JS chunk'ına gömülür. |
| **Katalog Büyüklüğü:** | **100 Eser.** | 85 Film, 15 TV Dizisi (`src/data/movies.ts`). |
| **Aynı film tekrarı var mı?** | **Hayır.** | 100 eserin tüm ID'leri (`m_*`, `s_*`) tekildir. |
| **Film / Dizi ayrımı var mı?** | **Kısmen.** | `mediaType?: "FILM" \| "SERIES"` alanı mevcuttur. |

---

## 4. Film Kayıtlarının Şeması

Tip tanımı `src/types/game.ts` (satır 14-29) içerisinde `Movie` arayüzü olarak belirlenmiştir:

```typescript
// Dosya: src/types/game.ts
export interface Movie {
  id: string;                                    // Benzersiz kimlik (örn: "m_inception")
  title: string;                                 // Film adı (bazen parantezli TR isim)
  originalTitle?: string;                        // Orijinal adı (yalnızca 40 filmde var)
  year: number;                                  // Çıkış yılı
  director: string;                              // Yönetmen
  cast: string[];                                // Başrol oyuncuları listesi
  genres: string[];                              // Türler (İngilizce: "Action", "Drama" vb.)
  imdbRating: number;                            // IMDb puanı (elle girilmiş ondalıklı sayı)
  hasOscar: boolean;                             // Oscar kazandı mı? (true / false)
  boxOfficeCategory?: "BLOCKBUSTER" | "INDIE" | "STANDARD";
  franchise?: "DC" | "MARVEL" | "LOTR" | "HARRY_POTTER" | "DUNE" | "STAR_WARS" | "OTHER" | string;
  mediaType?: "FILM" | "SERIES";                 // Dizi veya Film ayrımı
  posterUrl?: string;                            // TMDB CDN afiş linki (48 eserde var, 52 eserde boş)
  overview?: string;                             // İngilizce kısa sinopsis
}
```

### Gerçek Veri Örneği 1 (Afişli Film):
```typescript
// Dosya: src/data/movies.ts (Satır 5-18)
{
  id: "m_inception",
  title: "Inception",
  originalTitle: "Inception",
  year: 2010,
  director: "Christopher Nolan",
  cast: ["Leonardo DiCaprio", "Cillian Murphy", "Joseph Gordon-Levitt", "Elliot Page", "Tom Hardy"],
  genres: ["Sci-Fi", "Action", "Thriller"],
  imdbRating: 8.8,
  hasOscar: true,
  boxOfficeCategory: "BLOCKBUSTER",
  posterUrl: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
  overview: "A thief who steals corporate secrets through dream-sharing technology."
}
```

### Gerçek Veri Örneği 2 (Afişsiz TV Dizisi):
```typescript
// Dosya: src/data/movies.ts (Satır 1061-1072)
{
  id: "s_breaking_bad",
  title: "Breaking Bad",
  year: 2008,
  director: "Vince Gilligan",
  cast: ["Bryan Cranston", "Aaron Paul", "Bob Odenkirk"],
  genres: ["Crime", "Drama", "Thriller"],
  imdbRating: 9.5,
  hasOscar: false,
  mediaType: "SERIES",
  overview: "A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing methamphetamine."
}
```

### Eksik Olan Alanlar (Bu Şemada Hiç Bulunmayanlar):
- ❌ **Kaynak ID** (TMDB ID veya IMDb `tt1375666` ID'si yok, kendi uydurduğumuz `m_inception` var).
- ❌ **Oy Sayısı (Vote Count)** bulunmuyor.
- ❌ **Ülke ve Orijinal Dil** bulunmuyor.
- ❌ **Film Karesi / Still / Backdrop** bulunmuyor (sadece dikey afiş URL'si var).
- ❌ **Ödül Ayrıntısı** yok (Sadece boolean `hasOscar` var; kaç Oscar aldığı veya adaylıkları yok).

---

## 5. CineXOX Veri Akışı ve Oyun Mantığı

1. **Hücre Seçimi:** Kullanıcı 3x3 tahtada bir hücreye tıklar. Her hücre Satır ve Sütun kriterlerinin kesişimidir (Örn: *Christopher Nolan* × *Leonardo DiCaprio*).
2. **Arama ve Doğrulama (`src/engine/validator.ts`):**
   * Kullanıcı arama kutusuna harf yazdığında, yerel `MOVIES_DATABASE` üzerinde `filter` çalıştırılır.
   * `validateMove(movie, rowCriterion, colCriterion)` fonksiyonu filmin yönetmenini, oyuncu kadrosunu, türünü, yılını ve Oscar durumunu kontrol eder.
   * Yalnızca iki kriteri de sağlayan filmler arama sonucunda listelenir.
3. **Puanın Kullanımı (Kare Çalma):**
   * Eğer hücre boşsa, geçerli film doğrudan yerleşir.
   * Eğer hücre rakip tarafından önceden doldurulmuşsa ve oyun modunda "Kare Çalma" (`allowCellStealing`) açıksa; yeni konulacak filmin `imdbRating` değeri rakip filmin `imdbRating` değerinden **kesinlikle daha yüksek** olmak zorundadır (`src/hooks/useXoxGame.ts`, Satır 116).
4. **Çok Oyunculu ve Doğrulama Durumu:**
   * Doğrulama tamamen **istemci tarafında (telefonda)** yapılır.
   * Oyun modlarındaki iki oyuncu da cihazdaki aynı `src/data/movies.ts` dosyasını görür.
   * Merkezi bir sunucu olmadığı için veri senkronizasyonu veya eski maçların veritabanından bozulması gibi bir risk şu an yoktur.

---

## 6. Görsel ve Medya Kaynakları

| Medya Türü | Kaynak | Saklama Biçimi | Lisans / Atıf Durumu |
| :--- | :--- | :--- | :--- |
| **Film Afişleri (48 adet)** | `image.tmdb.org` | Harici URL (Cihazda saklanmıyor, runtime'da çekiliyor) | **RESTRICTED / UNVERIFIED** (Ticari lisans yok, atıf eksik) |
| **Film Afişleri (52 adet)** | Yok | Projede yok, SVG ikonu gösteriliyor | Güvenli (Kendi vektör ikonumuz) |
| **Film Kareleri (Stills)** | **Hiç yok** | Projede film sahne görseli bulunmamaktadır | İlerideki oyun modu için sıfırdan planlanmalı |
| **Oyun Sesleri** | Web Audio API | Kodla sentezlenen osilatörler (`audio.ts`) | **VERIFIED** (Telif riski yok, tamamen yerel kod) |
| **Görsel Filigranlar / Noise** | Inline SVG | `data:image/svg+xml` formatında kod içinde | **VERIFIED** (Telif riski yok, matematiksel gürültü) |

---

## 7. Lisans ve Ticari Kullanım Riskleri

Cine-Tactico'nun **reklam destekli** ve **gelir modelli** bir platforma dönüşeceği kesinleştiğinden, mevcut kaynaklar aşağıdaki riskleri taşır:

| Kaynak | Kullanılan Veri | Ticari Kullanım | Yerel Saklama | Görsel Kullanımı | Durum | Risk Açıklaması |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TMDB (Görseller)** | 48 Afiş URL'si | ❌ İzin verilmez | ❓ CDN önbelleği | ❌ Reklamlı uygulamada ticari sözleşme şart | **RESTRICTED** | TMDB ücretsiz geliştirici API'sini reklam destekli uygulamalarda kullandırmaz. Ticari lisans başvurusu yapılmalıdır. |
| **IMDb (Puan & Marka)** | Sabit Puanlar | ❌ Kesinlikle yasak | ❌ Scraping / dağıtım yasak | ❌ Logo / Marka yasak | **RESTRICTED** | IMDb verileri ve markası Amazon'a aittir. Ticari lisansı yıllık on binlerce dolardır. "IMDb" adı mağazada doğrudan ret/dava gerekçesidir. |
| **El Yazması 100 Kayıt** | İsim, Yıl, Oyuncu |  Yasal (Saf Gerçekler) |  Kod içine gömülü | N/A | **VERIFIED** | Yönetmen adı, oyuncu adı, vizyon yılı gibi nesnel biyografik olgular telife tabi değildir. |
| **İngilizce Özetler** | Sinopsis (`overview`)| ⚠️ Belirsiz |  Kod içine gömülü | N/A | **UNVERIFIED** | 1 cümlelik özetler muhtemelen Wikipedia veya TMDB'den kopyalanmıştır. Ticari sürümde telif riski doğurabilir. |

> [!WARNING]
> **Kritik Mağaza Riski:** Kodlarımızda ve arayüzde yer alan `"IMDb 8.8"`, `"imdbRating"` ifadeleri App Store Reviewer'ları tarafından üçüncü taraf marka ihlali (Trademark Infringement) olarak işaretlenebilir.

---

## 8. Maliyet ve Kota Analizi

* **Mevcut Aylık Maliyet:** **$0 / Ay**.
* **API Kota Riski:** **Sıfır.** (Çünkü çalışan bir API bağlantısı yoktur; 100.000 kişi oyunu indirse bile sunucuya istek gitmez).
* **Veritabanı Maliyeti:** **$0.** (Veri paketin içinde statik gelir).
* **Mevcut Sistemin Sınırı:** 100 film bittiğinde oyun kendini tekrar eder. 101. bir film aranamaz.

---

## 9. Gelecekteki Ürün Vizyonuyla Uyumluluk

Kullanıcının hedeflediği geniş kapsamlı sinema platformu ile mevcut altyapının uyumluluk tablosu:

| Gelecek Özellik | Mevcut Altyapı Destekliyor mu? | Neden / Eksik Ne? |
| :--- | :---: | :--- |
| **CineXOX Klasik & Sinefil** |  **EVET** | Mevcut 100 film ve 9 tahta bu mod için zaten çalışır durumdadır. |
| **Günün Filmi / Günün Dizisi** | ❌ **HAYIR** | Yılda 365 gün için en az 365+ detaylı filme ihtiyaç vardır. 100 film yetersizdir. |
| **6 Aşamalı Film Karesi Tahmini**| ❌ **HAYIR** | Projede tek bir film karesi (scene/still) yoktur. Yalnızca 48 afiş vardır. |
| **Rastgele Film & Dizi Keşfi** | ❌ **HAYIR** | 100 film ile keşif platformu hissi verilemez; kullanıcı 10 dakikada kataloğu tüketir. |
| **İzleme Listesi (Watchlist)** | ⚠️ **KISMEN** | Cihazın `localStorage`'ına kaydedilebilir ancak geniş bir katalog aranamaz. |
| **Kullanıcı Profili & Sinefil DNA**|  **EVET** | Kriter bazlı DNA algoritması (`TasteDnaCard.tsx`) zaten mevcuttur. |
| **Film / Yönetmen / Oyuncu Keşfi**| ❌ **HAYIR** | Oyuncu ve yönetmenlerin biyografileri, filmografileri ve fotoğrafları yoktur. |
| **Dizi Ayrımı** | ⚠️ **KISMEN** | `mediaType` var ancak sadece 15 dizi var ve hiçbirinin afişi yok. |
| **Gerçek Zamanlı Multiplayer** | ❌ **HAYIR** | WebSocket / Sunucu altyapısı yoktur. |
| **Reklam & Ödüllü Reklam** | ⚠️ **MİMARİ RİSK** | Reklam eklendiği an TMDB'nin ücretsiz kullanım şartı ihlal edilmiş olur. |

---

## 10. Alternatif Veri Stratejisi Değerlendirmesi

Gelecekte sistemi baştan yazmak zorunda kalmamak için kullanılabilecek veri stratejileri:

| Strateji | Ticari Kullanım (Reklamlı) | Maliyet | Görsel Hakları | Çevrimdışı Çalışma | Atıf / Şartlar | Tavsiye Notu |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Wikidata (Açık Veri)** |  **Tamamen Serbest (CC0)** | **$0** (Ücretsiz) | ❌ Görseller Wikimedia Commons'ta karmaşıktır |  JSON olarak paketlenebilir | Atıf bile zorunlu değil | Metadata (Yönetmen, oyuncu, yıl, ödül) için en güvenli yasal temel. |
| **2. TMDB Ticari Lisans** |  Resmî onay ile serbest | Başvuru gerektirir (Girişimler için esnek olabilir) |  Geniş afiş ve backdrop kütüphanesi | ⚠️ Canlı API veya kısmi cache gerektirir | Logo ve atıf zorunlu | Keşif ve afişler için en temiz profesyonel çözüm. |
| **3. TheTVDB** |  Ticari abonelikle serbest | Yıllık ücretli (Tier bazlı) |  Dizi ve filmlerde yüksek görsel kalitesi |  API bazlı | Ticari lisans şart | Dizi ağırlıklı platformlar için ideal. |
| **4. Küratörlü Yerel Katalog (Özgün)** |  **%100 Güvenli** | **$0** | ⚠️ Görseller dikkatle seçilmeli |  %100 Çevrimdışı | Hiçbir üçüncü tarafa bağımlı değil | **CineXOX MVP'si için en doğru model.** |

---

## 11. Tespit Edilen Sorunlar

1. **"IMDb" İsimlendirmesi:** Kodda `imdbRating` değişkeni, arayüzde ise "IMDb 8.8" yazısı geçiyor. Resmi bir anlaşmamız olmadığı için bu doğrudan marka hakkı riskidir.
2. **Kataloğun Yarısında Afiş Yok:** 100 filmden 52'sinde `posterUrl` tanımsızdır.
3. **Dizilerin Tamamı Afişsiz:** 15 TV dizisinin hiçbirinde afiş görseli yoktur.
4. **Harici Kaynak ID'si Yok:** Filmlerde TMDB ID veya IMDb ID saklanmadığı için ileride harici bir API'ye bağlanmak istendiğinde filmleri otomatik eşleştirmek (mapping) zorlaşacaktır.
5. **Afişlerin Hotlink Olması:** 48 afiş doğrudan TMDB CDN'ine bağlıdır. TMDB yarın bu linkleri kısıtlarsa veya kullanıcı internetsizse afişler açılmaz.

---

## 12. Önerilen Kararlar

1. **CineXOX MVP'si İçin (Kısa Vade):**
   * **Hiçbir harici API'ye bağlanma.** 100 filmlik mevcut statik mimariyi koru. Bu sayede uygulama sıfır sunucu maliyetiyle, sıfır API kotasıyla ve %100 çevrimdışı çalışır.
   * **Marka Temizliği:** Arayüzdeki ve koddaki "IMDb Puanı" ibarelerini **"Sinefil Puanı"** veya **"Kült Puanı"** olarak revize et.
   * **Afiş Güvenliği:** 48 adet TMDB afişini ve eksik 52 afişi ya telifsiz/lisanslı düşük çözünürlüklü biçimde yerel varlıklara (`assets/`) al ya da TMDB atıfını eksiksiz göster.
2. **Sinema Platformu Vizyonu İçin (Orta/Uzun Vade):**
   * CineXOX yayınlandıktan ve ilk kitle kazanıldıktan sonra; "Günün Filmi" ve "Keşif" özellikleri için **Wikidata (CC0 metadatası)** + **TMDB Ticari API** kombinasyonuna geçilmeli.
   * Supabase gibi hafif bir veritabanı ancak bu aşamada (kullanıcı izleme listeleri ve günün filmi geldiğinde) mimariye dahil edilmelidir.

---

## 13. Açık Sorular ve Doğrulanamayan Hususlar

- **TMDB Ticari Fiyatlandırması:** TMDB, ticari kullanım için standart bir fiyat listesi yayınlamamaktadır; her proje için başvuru formu üzerinden teklif vermektedir. İleride reklam açılmadan önce TMDB ile resmi yazışma yapılmalıdır.
- **52 Filmin Neden Afişsiz Olduğu:** Kod incelemesinde bu filmlerin bilinçli olarak mı afişsiz bırakıldığı, yoksa listenin sonradan mı genişletildiği doğrulanamamıştır.

---

## 14. İncelenen Dosyaların Listesi

1. `src/data/movies.ts` (1.378 satır — Tüm veri kaynağı)
2. `src/data/boards.ts` (665 satır — Tahta ve kriter tanımları)
3. `src/types/game.ts` (Movie ve oyun şemaları)
4. `src/components/MovieSearchModal.tsx` (Arama algoritması ve afiş gösterimi)
5. `src/components/XoxBoard.tsx` (Afiş renderlama ve placeholder mantığı)
6. `src/engine/validator.ts` (Kriter eşleştirme fonksiyonları)
7. `src/hooks/useXoxGame.ts` (Kare çalma ve puan karşılaştırma mantığı)
8. `CINE_ARENA_Product_Handoff/05_TECHNICAL_BLUEPRINT.md` (Mimari tasarım dokümanı)
9. `CINE_ARENA_Product_Handoff/07_RISK_REGISTER_AND_ACCEPTANCE.md` (Risk kayıtları)
10. `package.json` (Kurulu paketler ve bağımlılık kontrolü)
