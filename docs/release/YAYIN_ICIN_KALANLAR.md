# Yayın için kalanlar (24 Kasım 2026, dal: `release/final-polish`)

Bu dal main'e **birleştirilmedi, push edilmedi**. Aşağıdaki her "Kanıtlandı" satırı için test çıktısı veya simülatör ekranı var; "Kanıtlanamadı" satırları gerçek cihaz ister.

## Karar: HAZIR DEĞİL (NOT READY)

Kod tarafında bu turda bulunan iki engelleyici hata düzeltildi, ama yayın **senin Apple hesabına ve gerçek iPhone'a bağlı** adımlar yapılmadan mümkün değil. Nedenler:

1. Apple Developer üyeliği / Team imzası yok (`DEVELOPMENT_TEAM` boş). Archive alınamaz.
2. Gerçek iPhone'da hiç denenmedi: paylaşım sayfası, ses (sessiz anahtarı), uçak modu, arka plan/ön plan.
3. TestFlight, yaş derecelendirmesi ve App Store Connect kaydı yapılmadı.

Kod için engel kalmadı: `tsc` temiz, `npm test` 0 hata.

## 1. Bu turda bulunup düzeltilenler (simülatörde kanıtlı)

| Hata | Etki | Düzeltme | Kanıt |
|---|---|---|---|
| Günlük kadrajı hiç oynamadan bırakmak "Sahne senin!" gösteriyordu | Boş tahtada sahte galibiyet, paylaşılan kartta yalan | `resolveFotoFinish` ve Ters Kadraj'da 0 kare artık sayı; boşta kalan oyuncu kazanmaz (29f82d6) | Önce kırılan test, sonra geçen test; cihazda "Bu çekim olmadı." |
| Günlük sonuç penceresi kapanmıyordu | Oyuncu ekranda kilitleniyordu, uygulamayı kapatmak gerekiyordu | Kapat → Gişe'ye dön (05e6479) | Simülatör: X Gişe'ye döndü |
| Günlük yeniden açılınca tekrar oynanıyordu | "Her gün tek şans" vaadi bozuktu | Sonuç UTC gününe göre kaydedilir, yeniden açılışta gösterilir | Test 6/6; simülatör: kapat-aç sonrası kayıtlı sonuç |
| Küçük yazılar (9-10px) | Okunamıyordu | 169 yazının tamamı büyütülmedi; bilgi taşıyan 103 aktif kullanım 11px (d16698d) | 320px ve iOS ekran görüntüleri |
| Hücre sahipliği yalnızca renkti | Renk körü oyuncu ayıramazdı | X/O işareti, CSS ile (korumalı `XoxBoard.tsx`e dokunulmadı) (5bb9fac) | daltonlens: protan/deutan/tritan; `a11y-ownership.test.ts` |

## 2. Maç akışı testleri

| Senaryo | Sonuç |
|---|---|
| Kayıp (Günlük, boşta) | Kanıtlandı: kart "Bu çekim olmadı.", boş ızgara, panoya kopyalama doğru metni verdi |
| Zafer kartı | Birim testle kanıtlandı (`daily-share.test.ts`); **cihazda gerçek zafer ekranı yakalanmadı** (gerçek film cevabı girişi gerekir) |
| Beraberlik | **Oyunda olamaz.** Altın Makara ve foto-finiş her zaman bir galip seçer (`golden-reel.test.ts`, 1500 simülasyon, kural ihlali 0) |
| Yeniden başlatma | Kanıtlandı: temiz açılış, günlük kaydı korunuyor |
| Türkçe arama | Kanıtlandı: `İstanbul`, `ISPARTA`, `Şahin`, `ÖĞÜŞ`, `Amélie` doğru normalleşiyor. Simülatör klavyesinde elle yazma denenmedi |
| Uçak modu | Paket denetimi: HTML/CSS'te uzak varlık yok, oyun çevrimdışı çalışır. Simülatör uçak modunu kapatamaz, cihazda denenmeli |
| Panoya kopyala | Kanıtlandı |
| **PAYLAŞ (iOS paylaşım sayfası)** | **Kanıtlanamadı.** Simülatörde sayfa görünmedi, hata düşüşü de tetiklenmedi. `navigator.share` var ve söz bekliyor. Gerçek iPhone'da bakılmalı; olmazsa Capacitor Share eklentisi gerekir |
| Arka plana alıp dönme (maç ortasında) | **Kanıtlanamadı.** Uygulamada yaşam döngüsü yönetimi yok (`visibilitychange`/`appStateChange` yok). Süre davranışı cihazda gözlenmeli |
| Ses kanalları | Ana kanal, limiter, ses düzeyi testli (`audio-bus.test.ts`); AudioContext `resume()` var. Sessiz anahtarı ve hoparlör/kulaklık geçişi cihazda |

## 3. Karar bekleyenler (ben değiştirmedim)

1. **Bot adları**: `NolanZihni`, `TarantinoKult` gerçek kişi adı içeriyor; `OscarAvcisi` düşük-orta kişilik hakkı/ticari marka riski. Seçenek: genel adlar.
2. **Süre çubuğu** (`ShotClock.tsx`, korumalı): tahtadan uzakta, ince. Görünürlüğü artırılsın mı?
3. **Ses**: earshot'tan üretilen gerçek örnekler mi, mevcut sentez + ana kanal mı?
4. **Rarity** yalnızca beraberlik bozucu; hat kazanımını etkilemiyor. Bu bilinçli mi?
5. **Online Oda** bayrağı kapalı. Açılmadan önce sunucu `submit_move` yeniden yazılmalı (cevap doğrulaması yok).
6. **Korumalı dosyalarda** (27 kullanım) küçük kriter etiketleri 9-10px kaldı; yalnızca sen izin verirsen dokunulur.
7. **Gizli ekranlardaki** (39) küçük yazılar yeniden açılırsa gözden geçirilmeli.

## 4. App Store kontrol listesi: durum

| Madde | Durum | Kim |
|---|---|---|
| Gizlilik manifesti (`PrivacyInfo.xcprivacy`) | Var | Hazır |
| Gizlilik sayfası (`/privacy`) | Var | Hazır |
| İnceleme notları, metinler, ekran görüntüleri | `docs/release/` altında | Hazır, ekran görüntüleri son tasarımla yenilenmeli |
| Sürüm / build numarası | 1.0 / 1 | Hazır |
| Reklam, uygulama içi satın alma | Yok, kapsam dışı | Hazır |
| Apple Developer üyeliği (99 USD/yıl), sözleşmeler | Yok | **Sen** |
| Xcode: Signing & Capabilities → Team | Boş | **Sen** |
| `npm run build:ios`, Archive, Upload | Yapılmadı | **Sen** (Team sonrası) |
| App Store Connect kaydı, yaş derecelendirmesi, gizlilik "beslenme etiketi" | Yok | **Sen** |
| Gerçek iPhone testi (paylaşım, ses, uçak modu, arka plan) | Yok | **Sen** |
| TestFlight iç testi, Add for Review | Yok | **Sen** |

## 5. Pil, boyut, modlar

- Paket: `out/` 4,8 MB, JS yaklaşık 2,6 MB. Zamanlayıcılar yalnızca oyun ve modallarda çalışır.
- Arka planda süreyi durduran mantık yok; cihazda gözlenmeli (madde 2).
- Modlar: Klasik Düello ve Günün Kadrajı simülatörde açıldı. Ters Kadraj ve Sinefil Konsept kural düzeyinde testli (`mode-separation.test.ts`, stres testi 46/46), simülatörde oynanmadı.
