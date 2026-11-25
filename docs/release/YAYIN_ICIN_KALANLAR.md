# Yayın için kalanlar (24 Kasım 2026, dal: `release/round-2`, `main` = `00c7aec`)

## Karar: HAZIR DEĞİL (NOT READY)

Kod tarafında bilinen engel kalmadı. Yayın; senin Apple hesabına, gerçek iPhone testine ve aşağıdaki açık kararlara bağlı.

## 1. Kod tarafında tamamlananlar (kanıtlı)

| Konu | Düzeltme | Kanıt |
|---|---|---|
| Boşta bırakılan günlük "Sahne senin!" gösteriyordu | 0 kare artık sayı; boşta kalan kazanmaz | Önce kırılan test, simülatörde "Bu çekim olmadı." |
| Günlük sonuç penceresi kapanmıyordu | Kapat → Gişe | Simülatör |
| Günlük tekrar oynanıyordu | Sonuç UTC gününe göre kaydedilir | Simülatör + testler |
| Tek şans: tarih/UTC/saat oynama | Günler ayrı saklanır (14 gün) | 14 test: UTC 23:59:59 / 00:00:00, İstanbul 02:59 / 03:00, saat ileri-geri, saat geri |
| PAYLAŞ iOS'ta hiçbir şey yapmıyordu | `navigator.share` WKWebView'da sessizce takılıyor; `@capacitor/share` ile yerel sayfa, sonra web, sonra pano; iptal panoyu tetiklemez | Simülatörde gerçek iOS paylaşım sayfası açıldı; 11 test |
| Paylaşılan bağlantı `capacitor://localhost` idi | Herkese açık adres kullanılıyor | Pano çıktısı |
| Arka plana alınca tur yanıyordu, bot hamle yapıyordu | Gizliyken sayaç işlemez, süre geri verilir, başlangıç "şimdi"yi aşamaz | Simülatörde Klasik ve Ters Kadraj; 8 test. Sayaç 36 göstermesi (limit 12) bu sırada yakalanıp düzeltildi |
| Gerçek zafer kartı | Simülatörde görüldü | "Sahne senin!", sağda 3 altın X, ortada mavi O; pano "4/9 Kare · Sahne senin!" |
| Ters Kadraj | Baştan sona oynandı (tarayıcı derlemesi) | 3-3, nadirlikle karar, sonuç kartı doğru |
| Sinefil Konsept | Açıldı, cevap kabul edildi, bot oynadı, kayıp kartı doğru | Tarayıcı derlemesi |
| Günlük modda rakip yoktu, oyuncu X ve O'yu sırayla oynuyordu | Yalnızca X; 9 kare, kare başına tek hak, sonuç sonda | 18 yeni test; tarayıcıda 9 süre aşımı: sıra hep X, 9 kilit, "Not this take", kayıt yazıldı; simülatörde başlıkta rakip yok |
| Günlük kartı dile uymuyordu (EN arayüzde TR kart) | Kart, paylaşım başlığı/metni ve düğmeler sözlükten (`dailyCard`), TR/EN | 5 yeni test; simülatör İngilizce açılışı |
| "Memento" aramada iki satır çıkıyordu | Toplu içe aktarılan kopya, elle seçilen kayıt varken düşer | Simülatörde yakalandı; test düzeltmeden önce 1/3, sonra 3/3 |
| Ters Kadraj ve Sinefil Konsept simülatörde | Açıldı, cevap sayfası açıldı, bot hamle yaptı, süre işledi (iOS Simulator, iPhone 17 Pro Max) | Ekran görüntüleri; tam maç değil (12 sn tur, araç gecikmesi) |
| Küçük yazılar, renk körlüğü işareti | Önceki turdan | Ekran görüntüleri, daltonlens |

Testler: `tsc` temiz, `npm test` 0 hata.

**Dalgalanan test: KÖK NEDEN BULUNDU.** `game-engine.test.ts` → "Bot finds valid move on empty board" rastgele bota bağlıydı: bot bir kareyi "hatırlayamayınca" (kasıtlı `miss`, recall 0,75) `movie: null` döner ve test düşüyordu. 5000 denemede 81 düşüş (%1,6), hepsi miss. Test `recall: 1` ile sabitlendi, miss kararı ayrı bir testle doğrulanıyor. Aşağıdaki eski araştırma notu geçmiş kaydıdır:

**(Eski not)** daha önce bir tam turda tek bir test bir kez düştü, hangisi olduğunu o an kaydetmemiştim. Şimdi 12 tam tur (tüm test dosyaları ayrı ayrı) ve `game-engine` testi 40 kez tekrar edildi: 0 hata. Rastgelelik kullanan yerler tarandı: bot gecikmeleri (aralık testi geniş, sınır ihlali yok), `getRandomOpponent` (seviye aralıkları örtüşmüyor: EASY 1-3, MEDIUM 5-7, HARD 8-10), rastgele tahta seçimi (`getBoardForMode`). Simülasyon testleri sabit tohumlu. **Kaynağı bulunamadı**, yeniden üretilemedi. Olası aday: bir turda yakalanan, koşu sırasında yan yana çalışan derlemeden gelen zamanlama; kanıtım yok. Tekrar düşerse test çıktısını kaydet.

## 2. Gerçek iPhone'da senin test etmen gerekenler

1. **PAYLAŞ**: gerçek paylaşım sayfası (Mesajlar, WhatsApp, X), metin ve bağlantı doğru mu.
2. **Uçak modu**: paketlenmiş uygulama çevrimdışı açılıyor, bot maçı ve günlük çalışıyor mu (kodda ağ çağrısı yok, cihazda doğrula).
3. **Ses**: sessiz anahtarı, hoparlör/kulaklık geçişi, ses düzeyi kaydırıcısı, bir telefon araması sonrası ses geri geliyor mu.
4. **Arka plan / ön plan**: maç ortasında ana ekran, kilit ekranı, bildirim; süre ve hamleler korunuyor mu (simülatörde doğrulandı, gerçek cihazda JS askıya alınır).
5. **Türkçe klavye**: ş, ğ, ı, İ, ö, ü, ç ile film arama (normalleştirme birim testli, elle yazma simülatörde denenmedi).
6. **Günlük gece yarısı**: Türkiye saatiyle 03:00'te (UTC 00:00) yeni kadraj geliyor mu, cihaz saatini değiştirince ikinci şans yok mu.
7. **Sinefil Konsept ve Ters Kadraj** gerçek cihazda dokunarak; arama sonuçları özgün adı gösteriyor ("Parasite" yazınca "Gisaengchung"), bu kasıtlı tasarım ama oyuncuyu şaşırtabilir.
8. Küçük ekran (iPhone SE benzeri) okunabilirlik.

## 3. Apple Developer ve App Store Connect tarafında yapman gerekenler

1. Apple Developer üyeliği (99 USD/yıl) ve sözleşmeler.
2. Xcode: `ios/App/App.xcodeproj` → target App → Signing & Capabilities → **Team** (`DEVELOPMENT_TEAM` boş).
3. `npm run build:ios`, Xcode'da Any iOS Device → Archive → Upload.
4. App Store Connect: yeni uygulama, metinler `APP_STORE_SUBMISSION.md`'den, ekran görüntüleri `docs/release/screenshots/` (son tasarımla yenile).
5. Yaş derecelendirmesi anketi, gizlilik "beslenme etiketi" (veri toplanmıyor, `PrivacyInfo.xcprivacy` ve `/privacy` hazır).
6. TestFlight iç testi, sonra Add for Review (`APP_REVIEW_NOTES.md` hazır).

Hazır olanlar: gizlilik manifesti, gizlilik sayfası, inceleme notları, sürüm 1.0 (1), reklam/IAP yok.

## 4. Açık kararlar, önem ve yayın gerekliliğine göre (hiçbirini ben değiştirmedim)

### A. Yayından önce karar şart
1. ~~Günlük modun kuralı~~ **Çözüldü (kullanıcı kararı: yalnızca X, kelime oyunu gibi, 9 kare, kademeli sonuç).** Rakip ve O turu yok. Kare başına tek hak: yanlış cevap ya da süre aşımı kareyi kilitler. Hat oyunu bitirmez. 9 kare bitince kademe, doldurulan kare sayısına göre (`dailyTier.ts`):

| Kare | Kademe (TR / EN) | Makara ödülü |
|---|---|---|
| 9/9 | Kusursuz Kadraj! / Perfect Reel! (iki yandan altın konfeti) | +50 |
| 7-8 | Başrol sensin! / Lead role! | +30 |
| 5-6 (çoğunluk) | Sahne senin! / Scene's yours! | +20 |
| 3-4 | Yarım çekim. / Half a take. | +10 |
| 0-2 | Bu çekim olmadı. / Not this take. | +5 |

   Eşikler ve ödüller tek yerde (`DAILY_TIER_MIN`, `DAILY_REWARD_REELS`); Wordle benzeri oyunlar cezalandırmaz, derecelendirir, bu yüzden en düşük kademe de küçük ödül alır. Ödül yalnızca kozmetik para birimidir (anayasa madde 5). **Varsayım, kullanıcı onaylamadı:** bu eşik ve ödül sayıları. Günlük artık "bot düellosu" olarak maç geçmişine yazılmaz.
2. ~~Bot adları~~ **Karar: kalıyor.** Üç zorlukta şaka niteliğinde adlar sorun görülmedi (kullanıcı kararı). Mağaza incelemesi gerçek kişi adı için soru sorarsa `NolanZihni`, `TarantinoKult`, `ScorseseAilesi`, `OscarAvcisi` yeniden adlandırılır (veri değişikliği).

### B. Yayın kalitesi için düzeltilmeli, engel değil
3. ~~Ters Kadraj adı~~ **Çözüldü:** oyun içi başlık artık ana ekrandaki mod adıyla aynı (EN: Reverse Frame / Cinephile Concept, TR: Ters Kadraj / Sinefil Konsept). Kalan küçük tutarsızlık: Sinefil Kartı'ndaki maç geçmişi etiketi (`modeLabel`) kayıt anında Türkçe yazılıyor.
4. ~~Süre çubuğu~~ **İncelendi:** `ShotClock.tsx` projede hiçbir yerde kullanılmıyor (ölü kod); oyunun gerçek sayacı GameView'daki zaman kodu ve alt çubuk. Bu dosyaya dokunulmadı, silinmedi.
5. ~~Korumalı dosyalardaki küçük yazılar, emoji, Sahipsiz etiketi~~ **Çözüldü (kullanıcı korumalı dosyalara izin verdi):** `XoxBoard.tsx` kriter etiketleri 7,5px → 11px, kategori 10px, yıl 10-11px; "Sahipsiz" ve klaket "SAHNE 01 · ÇEKİM 01 / AKSİYON!" metinleri TR/EN sözlüğünden (EN: Unclaimed, SCENE 01 · TAKE 01, ACTION!). `MatchmakingQueueModal.tsx`: emoji yerine lucide simgeleri, zorluk rengine metin eşlik ediyor, kapat düğmesi 44pt. Yapı (3x3 + başlık satırı/sütunu, makara modalı) değişmedi.
6. **Beraberlik oyunda olamaz** (Altın Makara ve nadirlik hep bir galip seçer): "Beraberlik" metni beklenmemeli, belgede ve mağaza metninde "berabere" denmesin.

### C. Yayından sonraya bırakılabilir (MVP için zorunlu değil, eklenmeyecek)
7. **Ses**: earshot örnekleri mi, mevcut sentez + ana kanal mı. Mevcut sentez çalışıyor; gerçek cihazda dinleme sonrası karar.
8. **Rarity** yalnızca beraberlik bozucu (hat kazanımını etkilemiyor). Tasarım tercihi, hata değil.
9. **Online Oda**: bayrak kapalı, mağaza sürümünde görünmüyor. Açılmadan önce sunucu `submit_move` yeniden yazılmalı.

## 4b. Skill kontrolü (puzzle, game-feel, audio-design, game-docs, unslop-ui, web araştırması)

- **puzzle:** 400 günün Günlük tahtası çözücüyle denetlendi: 0 çözülemez, hücre başına en az 3 cevap (ortalama 5,4), 1 tekrar eden tahta. Süre/ödül eşikleri için model: bilgi düzeyi 0,5 / 0,75 / 0,9 olan oyuncu için 9 kareden beklenen ~4,5 / ~6,8 / ~8,1 (kademeler Yarım / Sahne senin / Başrol). Model, oyun testi değil.
- **Araştırma (Game Developer, NYT Wordle yardım sayfası):** Wordle'ın üç sütunu tek bulmaca, paylaşılabilir sonuç ızgarası ve seri; seri en güçlü bağ. Bizde seri alanı vardı ama hiç güncellenmiyordu ve Ana Ekran sahte "1" gösteriyordu: artık art arda UTC günleri sayılır (kademe fark etmez), Ana Ekran gerçek değeri gösterir.
- **game-feel:** "Yarım çekim" hata sesi ve titreşimi alıyordu (ödüllü kademeye ters). Geri bildirim artık kademeyle orantılı tek tabloda (`DAILY_FEEDBACK`), konfeti `prefers-reduced-motion`'da çalışmaz, yanıp sönme yok.
- **MVP_SCOPE.md bulgusu:** Makara ekonomisi MVP'de gizli (`SHOW_COIN_ECONOMY=false`). Kartın "+n Makara" satırı bayrağın arkasına alındı; ödül sessizce biriktirilir.
- **unslop-ui:** kademe başına 5 ayrı alt satır tek, olgusal satıra indirildi ("6/9 kare senin. Yarın yeni bir kadraj var."). Kalan "Sahne senin!" ünlemi tasarım anayasası imzası olduğu için bilerek bırakıldı.
- **game-docs:** Günlük kuralı `MVP_SCOPE.md` içindeki mevcut maddeye yerinde yazıldı (yeni belge yapısı açılmadı).
- **audio-design:** ses `audio.ts` içindeki ortak çıkış ve sınırlayıcıdan geçiyor ve tek bir sessiz anahtarı var; kademe sesleri bu tablodaki üç mevcut sesten seçiliyor. Yeni ses üretilmedi, loudness ölçümü yapılmadı (gerçek cihazda dinlenmeli).
- **Ortam notu:** 13:51'de Homebrew'da `simdjson` yükselmiş (benim işlemim değil), `node` açılmıyor. Çözüm: `brew reinstall node` (sen çalıştır). Ben geçici olarak yalnızca komutlara eski kütüphane yolunu veren bir `node` sarmalayıcısı kullandım, sisteme dokunmadım.

## 4c. Deneyim denetimi (ui-ux-pro-max kuralları, 440x956 ekran)

- **Dokunma hedefleri (≥44pt):** Ana ekran, rakip seçimi, oyun tahtası, hücre cevap sayfası, "Nasıl oynanır" kartında 44pt altı kontrol yok. 5px'lik "35MM" yazıları dekoratif film kenarı.
- **Kontrast:** metin renkleri (soluk gri, altın, mavi, turkuaz, mor) koyu yüzeylerde 5,4 ile 15,6 arası, hepsi 4,5:1 üstü.
- **İlk açılış:** "Nasıl oynanır" kartı ✕ ile geçilebiliyor (skill: zorunlu, atlanamaz tur olmamalı).
- **Etiketler ve tepki:** etiketsiz ikon düğmesi 0, alt metinsiz görsel 0, güvenli alan ve `prefers-reduced-motion` var, 29 yerde dokunma geri bildirimi.
- **Bulgular (düzeltilmedi):** (1) görünüm alanı `user-scalable=no, maximum-scale=1` (yakınlaştırma kapalı; oyun için yaygın ama erişilebilirlik önerisine aykırı, karar sende), (2) ~~`MatchmakingQueueModal.tsx` emoji~~ çözüldü.

## 4d. Tam tarama (tüm skill'ler, akışlar, güvenlik)

- **unslop-ui + emoji:** MVP'de görünen kodda emoji yok (regresyon testi `no-emoji-ui.test.ts`; bayrakla kapalı Liderlik, Görevler, Mağaza, Bildirim yüzeyleri kapsam dışı, açılmadan önce vektör simgeye çevrilmeli). Sıfırla/Sil iletişim kutularında sızan "Apple Guideline 5.1.1(v)" notu ve çevrimdışı uygulamada "sunucuda korunur / Supabase" metni kaldırıldı.
- **Akış taraması (tarayıcı, 375-440 px):** profil, ayarlar, sekmeler, rakip seçimi, 3 mod, hücre cevap sayfası, Günlük, sonuç kartı: hepsinde çıkış yolu var, boşluğa düşen ekran yok. **Bulunan açık:** Günlük yarıda bırakılınca ya da uygulama kapanınca hak kaydedilmiyordu (tahta yeniden oynanabiliyordu); düzeltildi, hak oyun canlı olunca başlar. 10.000 oturumluk soak testi: hepsi 9 karede biter.
- **game-ai / strateji ölçümü (300 maç/hücre):** zorluk sırası düzgün (Zor > Orta > Kolay; Kolay-Zor %5, Zor-Kolay %99). Aynı seviyede ilk oynayan X %58-65 kazanıyor (hafif ilk hamle avantajı, insan X olduğu için oyuncu lehine); Zor-Zor maçların %80'i Altın Makara'ya düşüyor (tek hak kuralının sonucu). Tasarım kararı, değiştirilmedi.
- **save-systems:** profil kaydı sürüm damgalı ve doğrulanmış (bozuk/elle değiştirilmiş kayıt NaN göstermez, çökertmez, daha yeni sürüm üzerine yazılmaz). Günlük tahtası herkese aynı (altın değer testi, `Math.random`'dan bağımsız).
- **code-review (high):** 5 bulgu, 4'ü düzeltildi (giriş animasyonunda hak tüketme, canlı Günlük'te onaysız çıkış, sürüm düşürmede ezme, gevşek hücre doğrulaması), 1'i not edildi (katalog tekilleştirme, tek gerçek kopya var).
- **security-review:** yeni kod `innerHTML`, `eval`, ağ çağrısı, yeni bağımlılık içermiyor; yüksek güvenle bulgu yok. Kayıtlar beyaz listeyle doğrulanıyor.
- **simplify:** Günlük sonucunun profile etkisi iki yerde kopyaydı, tek yardımcıya alındı.
- **paranoid-qa (kaos, 375 px):** çift tıklama tek rakip seçimi/tek oyun; arama kutusuna `<script>`, `<img onerror>`, SQL, emoji, 5000 karakter, boşluk, Türkçe karakter: çökme yok, betik çalışmadı, boş durum mesajı var; yatay kaydırma yok; 44 pt altı hedef yok. **Kalanlar:** Esc ile pencere kapanmıyor (yalnızca klavyeli cihaz), yakınlaştırma kapalı (`user-scalable=no`), arama açıkken süre işlemeye devam eder (tasarım).

## 4e. Mağaza hazırlığı (25 Kasım)

- **Hazır:** TR/EN ekran görüntüleri (`docs/release/store/`), güncel metadata (`APP_STORE_SUBMISSION.md`), güncel inceleme notları (`APP_REVIEW_NOTES.md`), App Icon (1024, alfa yok), gizlilik manifesti (izleme yok, veri yok, UserDefaults gerekçesi CA92.1).
- **Doğrulandı:** canlı `/`, `/privacy`, `/support` adresleri 200 dönüyor; imzasız Release derlemesi (`generic/platform=iOS`) başarılı; cihaz ailesi yalnızca iPhone, yalnızca dikey.
- **Karar bekleyen:** uygulama adı (kodda ve mağaza metinlerinde "Cine-XOX", brief "Cine-Tactico" diyor).
- **Hâlâ senin:** Team seçimi, Archive, App Store Connect, gerçek iPhone testi, 9/9 kartı gerçek oyunla da bir kez görmek.

## 5. Pil, boyut, modlar

- Paket: `out/` yaklaşık 4,8 MB; zamanlayıcılar yalnızca oyunda ve modallarda; arka planda sayaç artık durur.
- Klasik, Ters Kadraj, Sinefil Konsept ve Günlük çalışıyor; Ters Kadraj ve Konsept simülatör yerine aynı web paketinin tarayıcı derlemesinde oynandı.
