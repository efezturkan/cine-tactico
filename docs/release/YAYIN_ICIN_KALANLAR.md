# Yayın için kalanlar (24 Kasım 2026, dal: `release/final-polish`)

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
| Küçük yazılar, renk körlüğü işareti | Önceki turdan | Ekran görüntüleri, daltonlens |

Testler: `tsc` temiz, `npm test` 0 hata. Bir kez tek bir rastgele test dalgalandı, 8 tur × 5 rastgele test ve 4 tam tur tekrarında çıkmadı (kaynağı bulunamadı).

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

## 4. Açık kararlar (hiçbirini ben değiştirmedim)

1. **Günlük modda bot yok; sırayla hem X hem O'yu aynı kişi oynuyor** (sıra O'dayken girilen cevap O'ya yazılıyor, boşta kalan O turu 12 sn bekliyor). Fiilen aynı telefonda sırayla oynama; anayasa madde 3 ile çelişiyor ve modun kuralı hiçbir belgede yazmıyor. Öneri: Günlük'te yalnızca X (oyuncu) oynasın, O turu atlansın ya da bot oynasın. **Bu en önemli karar.**
2. **Günlük kartı yerelleştirilmemiş**: uygulama İngilizce iken oyun içi başlık "Scene's yours!", kart "Sahne senin!". Kart ve paylaşım metni sabit Türkçe. Hangi dillerle yayınlanacak?
3. Ters Kadraj adı: ana ekranda İngilizce "Reverse Frame", sonuç kartında "Ters Kadraj".
4. **Bot adları**: `NolanZihni`, `TarantinoKult`, `ScorseseAilesi` gerçek kişi adı içeriyor; `OscarAvcisi` ticari marka/kişilik hakkı riski.
5. **Süre çubuğu** (`ShotClock.tsx`, korumalı): ince ve tahtadan uzak.
6. **Ses**: earshot örnekleri mi, mevcut sentez + ana kanal mı.
7. **Rarity** yalnızca beraberlik bozucu (hat kazanımını etkilemiyor).
8. **Online Oda** kapalı; açılmadan önce sunucu `submit_move` yeniden yazılmalı.
9. Korumalı dosyalardaki küçük kriter etiketleri (9-10px) ve gizli ekranlardaki küçük yazılar.
10. Beraberlik oyunda olamaz (Altın Makara ve nadirlik hep bir galip seçer); "Beraberlik" ekranı beklenmemeli.

## 5. Pil, boyut, modlar

- Paket: `out/` yaklaşık 4,8 MB; zamanlayıcılar yalnızca oyunda ve modallarda; arka planda sayaç artık durur.
- Klasik, Ters Kadraj, Sinefil Konsept ve Günlük çalışıyor; Ters Kadraj ve Konsept simülatör yerine aynı web paketinin tarayıcı derlemesinde oynandı.
