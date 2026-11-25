# Yenileme ve dürüst hüküm (26 Kasım 2026)

00, 01 ve 02 numaralı belgeler rakipleri, lisans yaklaşımlarını ve kurul görüşlerini zaten kapsıyor. Bu belge onları tekrar etmez; yalnızca bugün (26 Kasım) yeniden doğrulananı, yeni bulguyu ve hükmü yazar.

## 1. Bugün doğrulananlar
Doğrulama: iTunes Lookup/Search (ABD) ve açık HTTP başlıkları. Mağaza açıklaması ile çalışan özellik ayrımı yalnızca sayılarla yapıldı; uygulamaları cihaza indirip oynamadım.

| Ürün | Bugünkü durum |
|---|---|
| Callback | v1.1.7, son güncelleme 16 Kas 2026, 5,0★ / **4 oy** |
| CineQuizz | v1.0.1, son güncelleme 29 Mar 2025, **0 oy**, terk edilmiş |
| Actorle | v2.0.3, 28 Eki 2026, 4,39★ / **122 oy** (4,5 yılda) |
| Absolute Popcorn | v2.0.4, 15 Kas 2026, **0 oy** |
| CinemaXOX (en yakın mekanik) | 13 Kas 2026, **0 oy** |
| Web bağlantıları | Vulture/Cinematrix, cinenerdle.app, cinenerdle2.app, moviegrid.org, film-alchemy.web.app: hepsi HTTP 200 |

Yeni bulgu, belgelerde yoktu: **Scenes – Guess the movie** (Vesselin Petkov, 2016'dan beri, son güncelleme Tem 2026, 4,56★ / 1.078 oy). On yılda yaklaşık 1.000 oy: tek kişilik "filmi tahmin et" uygulaması mobilde ölçeklenmiyor, ama ölmüyor da. Bu, "tek kişilik quiz yapma" kararını destekler.

## 2. Rakipler neyle yazılmış (herkese açık HTML/başlık parmak izi)
- cinenerdle.app: Vite tek sayfa uygulaması, Cloudflare önünde, Heroku arkasında, Google Analytics. Reklam betiği ana sayfada yok.
- moviegrid.io: Next.js, Vercel, TMDB, Google Analytics. moviegrid.org: Next.js, Vercel.
- framed.wtf: Next.js, React, Cloudflare.
- film-alchemy.web.app: Firebase Hosting.
Çıkarım: hepsi web ve hafif. Mobil uygulamaları yok (Callback ve Actorle hariç), bu yüzden fark "oyun mantığı" değil "mobilde, çevrimdışı ve düello olarak var olmak". Teknoloji bir hendek değil. Bizimki (Next + Capacitor) aynı sınıfta.

## 3. SWOT (kanıta bağlı)
**Güçlü:** çevrimdışı bot düellosu, 12 sn tur baskısı, günlük 5 kademe, reklamsız, 0 poster/temiz veri (provenance kayıtlı), 1.040 film ve 6.402 oyuncu, her hücrede doğrulanmış çözüm.
**Zayıf:** sıfır kullanıcı, sıfır geri bildirim; "rakipten iyiyiz" iddiası hiçbir oyuncuyla sınanmadı. Yalnızca TR/EN. Yönetmen havuzu dar (en az 5 filmi olan 34 yönetmen), animasyon 2, belgesel 5 film. Marka adı kararsız. Gelir yok.
**Fırsat:** web'in günlük film oyunları mobilde yok; yeni mobil film oyunlarının çoğu 0–4 oyda. Paylaşım linkiyle kurulumsuz web tahtası (1.1).
**Tehdit:** CinemaXOX aynı mekaniği 13 Kas'ta çıkardı; Actorle v2 grup modu ve Callback mikro-bulmaca yarışı; büyük bir web oyununun (Cinematrix/Vulture) mobile gelmesi; marka çakışması (CROSSCUT Sınıf 41).

## 4. "Onlardan gerçekten iyi miyiz?"
Dürüst cevap: **kanıtlanmadı.** Kanıtlanan şu: boşluk gerçek (web'in büyük oyunları mobilde yok, mobildekiler küçük) ve ürünümüz o boşluğa uyuyor. İyi olduğumuzu ancak D1/D7 ve paylaşım sayıları gösterir. İlk 90 günün tek işi bu sayıları görmek.

## 5. Bağımsız bakışlar ve itiraz
Bu bölümde dış kişiler konuşmuyor; yayımlanmış yöntemlerinden türetilmiş analiz bakışları. Tek ben yazdım, birbirimi onaylamak zorunda kalmadan çelişkileri bıraktım.
- Ürün (sadelik): tek ana döngü kalsın (düello + günlük). Mod sayısını artırma.
- Savunulabilirlik: kopyalanamayan şey kod değil; katalog kalitesi, günlük tahta kürasyonu ve topluluk alışkanlığı. 1.040 film tek başına hendek değil.
- Dağıtım: arkadaşa gönderilen tohumlu link (sunucusuz) tek gerçek büyüme kancası.
- Ekonomi: 1.0 gelirsiz; bilinçli. Ücretli katman yalnızca arşiv ve ek paket.
- **Red Team:** "Bot düellosu, gerçek rakip olmadığı için sığ kalır; günlük oyun tek kişilik ve Cinematrix'ten daha iyi olduğunu kanıtlayamayız; Wikidata verisiyle yaptığımız katalog sinefillere 'eksik' görünür; zaten sıfır kullanıcıyla 'savunulabilirlik' konuşmak erken." Bu itiraz haklı; cevabı ölçüm planı (madde 7), yeni özellik değil.
- Katalog sorusu ("2.500 film mi?"): sayı hedef değil. Ölçüt: oyuncunun yazdığı filmin bulunması ve her tahta hücresinin çözülebilir olması.

## 6. Doğru kataloglama (ölçüt, sayı değil)
1. **Bulunabilirlik > sayı:** arama başarısı (yazılan filmin %95+ bulunması) takip edilmeli; 1.1'de çerezsiz "bulunamadı" sayacı.
2. **Çözülebilir tahta:** her hücrede ≥3 cevap ve 9 hücreye 9 farklı film (Hall koşulu); Ters Kadraj'da her hücrede ≥1 ortak oyuncu, toplam ≥14 (kodda ve testte).
3. **Tanınırlık dengesi:** havuz popülerlik (sitelink) eşiğiyle süzülür; nadir kayıtlar günlükte değil yalnızca zor modda.
4. **Yenilik:** son 5 yıl payı sürdürülür (2023+ şu an 258 film); yılda iki kez betik (`fetch_wikidata_recent.py`) çalıştırılır. Günlük tahta sabit anlık görüntüye (`DAILY_POOL_VERSION`) bağlanana kadar katalog 1.0'dan sonra değiştirilmez (00 belge madde 6).
5. **Provenance:** her kayıtta kaynak kimliği; poster, IMDb/TMDb lisanslı alan yok.
6. **Bilinen delikler:** Anora yok, animasyon 2, belgesel 5, western 16, yönetmen havuzu 34. 1.0.1 işi: bunları hedefli doldurmak.

## 7. İlk 90 gün deneyleri
Hafta 1–2: 1.0 yayın, mağaza ve Reddit/Letterboxd kurulumsuz web tahtası. Hafta 3–4: paylaşım linki ve rövanş (1.1) ile çerezsiz analitik. Ay 2: Ters Kadraj/Konsept tur dağılımı ve D7. Ay 3: arşiv paketi fiyat testi. Karar kapıları: D1 < %20 ise mekaniği, paylaşım < %5 ise büyüme kancasını revize et; ürünü genişletme.

## 8. Eklenecek/revize edilecek
- Revize (1.0.1): günlük tahtayı sabit anlık görüntüye bağla; katalog delikleri; arama "bulunamadı" mesajına yazım önerisi.
- Ekle (1.1): tohumlu meydan okuma linki, yanlış cevapta hangi eksen tutmadı, hızlı rövanş, çerezsiz analitik.
- Yapma: reklam, can/enerji, çok oyunculu rastgele kuyruk, 5 mini oyunlu paket, poster.
- Karar bekleyen: ad (Crosscut / Nitrate), franchise başına Ters Kadraj sınırı (Marvel payı ~%33).
