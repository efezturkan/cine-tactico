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
3. **Ters Kadraj adı**: ana ekranda "Reverse Frame", oyun başlığı ve sonuç kartında "Ters Kadraj" (simülatörde İngilizce arayüzde doğrulandı). Tek bir dile bağlanmalı.
4. **Süre çubuğu** (`ShotClock.tsx`, korumalı): ince ve tahtadan uzak. Sayaç rakamı görünür, bu yüzden engel değil.
5. **Korumalı dosyalardaki küçük kriter etiketleri** (9-10px) ve gizli ekranlardaki küçük yazılar.
6. **Beraberlik oyunda olamaz** (Altın Makara ve nadirlik hep bir galip seçer): "Beraberlik" metni beklenmemeli, belgede ve mağaza metninde "berabere" denmesin.

### C. Yayından sonraya bırakılabilir (MVP için zorunlu değil, eklenmeyecek)
7. **Ses**: earshot örnekleri mi, mevcut sentez + ana kanal mı. Mevcut sentez çalışıyor; gerçek cihazda dinleme sonrası karar.
8. **Rarity** yalnızca beraberlik bozucu (hat kazanımını etkilemiyor). Tasarım tercihi, hata değil.
9. **Online Oda**: bayrak kapalı, mağaza sürümünde görünmüyor. Açılmadan önce sunucu `submit_move` yeniden yazılmalı.

## 5. Pil, boyut, modlar

- Paket: `out/` yaklaşık 4,8 MB; zamanlayıcılar yalnızca oyunda ve modallarda; arka planda sayaç artık durur.
- Klasik, Ters Kadraj, Sinefil Konsept ve Günlük çalışıyor; Ters Kadraj ve Konsept simülatör yerine aynı web paketinin tarayıcı derlemesinde oynandı.
