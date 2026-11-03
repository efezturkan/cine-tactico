# CINE-XOX — APP STORE ÖZGÜNLÜK VE İNCELEME RİSK DENETİMİ (ORIGINALITY & REVIEW RISK AUDIT)

**Uygulama Adı:** Cine-XOX  
**Paket Kimliği (Bundle ID):** `com.cinetactico.game`  
**Platform:** Apple iOS (Universal) / iPadOS  
**Sürüm / Build:** 1.0.0 (Build 1)  
**Denetim Tarihi:** 3 Kasım 2026  
**Denetim Standardı:** Apple App Store Review Guidelines (4.1, 4.2, 4.3(a), 4.3(b), 5.2)  
**Nihai Durum:** **FINAL VALIDATION REQUIRED (Nihai Doğrulama Gerekli)**

> **Hukuki ve İnceleme Uyarısı:** Bu rapor Apple App Store inceleme sürecindeki olası ret gerekçelerini teknik ve içerik kanıtlarıyla analiz eder. Apple App Review ekibinin kararları bağımsız ve takdir yetkisine bağlı olduğundan hiçbir denetim kesin bir onay garantisi veremez. İmzalı iOS arşivi (`xcodebuild archive`) ve fiziksel cihazda Uçak Modu doğrulaması henüz tamamlanmadığı için nihai durum "FINAL VALIDATION REQUIRED" olarak belirlenmiştir.

---

## 1. ŞUT SAATİ (SHOT CLOCK) ÇELİŞKİSİNİN ÇÖZÜMÜ

- **Eski Taslak / Dokümantasyon Çelişkisi:** Önceki tasarım dokümanlarında (ör. Ekim 2026 tarihli Spec v3 taslağı) 15 saniye ifadesi yer alırken, yayın dokümanlarının bazı kısımlarında 12 saniye geçmiş ve çelişki doğmuştur.
- **Gerçek Kod Tabanı Doğrulaması:**
  - `src/features/gameplay/hooks/useGameSession.ts` (satır 39): `shotClockLimit: number = 12` (Anti-cheat & blitz standardı).
  - `src/app/page.tsx` (satır 67): `const [customShotClock, setCustomShotClock] = useState<number>(12);`
  - `src/features/multiplayer/components/CustomRoomModal.tsx` (satırlar 88 ve 148): varsayılan `shotClockSeconds: 12`.
  - `src/core/types/index.ts` (satır 179): `shotClockSeconds: 10 | 12 | 20 | 30;`
- **Sonuç:** CINE-XOX'un aktif varsayılan şut saati **12 saniyedir**. Özel odalarda oyuncu tercihine göre 10, 12, 20 veya 30 saniye olarak ayarlanabilmektedir. Tüm dokümantasyon bu gerçek kod standardına (12 saniye) eşitlenmiştir.

---

## 2. APPLE GUIDELINE KAPSAM VE RİSK SINIFLANDIRMASI

### 2.1 Guideline 4.1 — Copycats (Taklit Uygulamalar)
- **Apple Standardı:** Başka bir geliştiricinin uygulamasının tasarımını, simgesini, adını veya arayüzünü taklit ederek kullanıcıları yanıltmayı yasaklar.
- **CINE-XOX Değerlendirmesi:** 
  - Görsel dil olarak 35mm analog film makarası, klakör sayacı ve sıcak noir estetiği (`#0B0D12`, `#D9A441`) kullanmaktadır.
  - Oynanış, sadece soru bilme (trivia) veya sadece 3 kutu çizme (Tic-Tac-Toe) değildir; kriter kesişimi ile tahta pozisyonunu harmanlayan hibrit bir yapıdır.
  - **Risk:** Bir incelemecinin 3×3 ızgarayı ilk bakışta Movie Grid veya basit bir XOX varyasyonu sanma riski vardır.
- **Risk Seviyesi:** **LOW-TO-MEDIUM (Düşük-Orta Risk)**

### 2.2 Guideline 4.2 — Minimum Functionality (Minimum İşlevsellik)
- **Apple Standardı:** Uygulamanın zengin bir kullanıcı deneyimi sunmasını, basit bir web sitesi veya webview sarmalayıcısı olmamasını şart koşar.
- **CINE-XOX Değerlendirmesi:**
  - Uygulama Capacitor 8 hibrit mimarisi (WKWebView) üzerinde çalışmaktadır. Apple incelemecileri hibrit uygulamaları "web sitesinden farksız" bularak 4.2 maddesinden sorgulamaya yatkındır.
  - **Yerel/Teknik Ayırt Ediciler:**
    1. Cihaz üzerinde internet olmadan çalışan yerel film grafı ve otonom yapay zekâ botu (`bot-engine.ts`).
    2. `@capacitor/haptics` ile iOS Taptic Engine dokunsal titreşim entegrasyonu.
    3. `Web Audio API` ile cihazın ses işlemcisinde üretilen sıfır gecikmeli mekanik sinema ses sentezleyicisi.
    4. Cihaz saat diliminden bağımsız UTC 00:00 günlük senkronizasyon motoru.
- **Risk Seviyesi:** **MEDIUM (Orta Risk — Webview mimarisi nedeniyle incelemecinin algısına bağlıdır)**

### 2.3 Guideline 4.3(a) — Spam / Clones (Aynı Uygulamanın Çoğaltılması)
- **Apple Standardı:** Geliştiricilerin aynı kod tabanını birden fazla Bundle ID veya hesap üzerinden App Store'a yükleyerek mağazayı klonlarla doldurmasını engeller.
- **CINE-XOX Değerlendirmesi:**
  - CINE-XOX tek bir Bundle ID (`com.cinetactico.game`) üzerinden dağıtılmaktadır.
  - Geliştirici hesabında aynı veya benzer bir başka varyasyon, reskin veya şablon ürün bulunmamaktadır.
- **Risk Seviyesi:** **LOW (Düşük Risk)**

### 2.4 Guideline 4.3(b) — Saturated Categories (Doygun Kategori ve Farklılaşma Eksikliği)
- **Apple Standardı:** Fener, osuruk sesi, fal veya standart Tic-Tac-Toe (XOX) gibi App Store'da aşırı doymuş kategorilerde, belirgin ve özgün bir katma değer sunmayan uygulamaların reddedileceğini belirtir.
- **CINE-XOX Değerlendirmesi:**
  - **Asıl Kritik İnceleme Riski Buradadır.** "XOX / Tic-Tac-Toe" kategorisi Apple tarafından örnek gösterilen en doygun kategorilerden biridir.
  - Eğer bir incelemeci CINE-XOX'u "film soruları eklenmiş sıradan bir XOX" olarak yorumlarsa 4.3(b) reddi verebilir.
  - **Farklılaşma Kanıtı:** 12 saniyelik shot-clock, çift taraflı hatalarda devreye giren sahipsiz hücre kilidi (`LOCKED_NEUTRAL`), berabere bitmeyen Altın Makara & Foto-Finiş nadirlik puanlama sistemi ve Ters Kadraj aktör kesişimi. İnceleme notları (`APP_REVIEW_NOTES.md`) bu mekanikleri ilk dakikada göstermek üzere kurgulanmıştır.
- **Risk Seviyesi:** **MEDIUM-TO-HIGH (Orta-Yüksek Risk)**

### 2.5 Guideline 5.2 — Intellectual Property (Fikri Mülkiyet ve Marka Hakları)
- **Apple Standardı:** Uygulamada kullanılan tüm marka, görsel, telifli içerik ve materyallerin lisanslı veya yasal hak sahibinden izinli olduğunu kanıtlamayı zorunlu kılar.
- **CINE-XOX Değerlendirmesi:**
  - **Afişler:** Stüdyolara ait telifli film afişleri veya TMDb görsel linkleri tamamen kaldırılmıştır (0 afiş barındırılır).
  - **Portreler:** Aktör ve yönetmen portreleri Wikimedia Commons üzerinden temin edilmiş olup `CC BY` ve `CC BY-SA` lisanslıdır. Ancak uygulama içi ayarlarda kullanıcı tarafından görüntülenebilir bir lisans/atıf ekranının bulunmaması açık bir uyumluluk riskidir.
  - **Film Bilgileri:** Film isimleri ve filmografi eşleşmeleri olgusal tarihsel veridir. Ancak bu durum için "nominative fair use" tabirine sığınmak uluslararası App Store dağıtımında mutlak hukuki bağışıklık sağlamaz; stüdyo franchise isimleri (Marvel, DC, Star Wars) hassasiyet taşır.
- **Risk Seviyesi:** **MEDIUM (Orta Risk — Uygulama içi lisans atıf ekranı eksikliği ve tescilli isimler nedeniyle)**

---

## 3. GERÇEK OYUN MODLARI VE AKIŞ SINIFLANDIRMASI

Kod tabanı ve arayüz yapısı incelenerek, uygulamadaki oyun akışları ürün mimarisindeki gerçek konumlarına göre sınıflandırılmıştır:

| Akış / Başlık | Gerçek Ürün Niteliği | Kod ve Tip Dayanağı | UI & Test Kanıtı | Durum |
|---|---|---|---|:---:|
| **Klasik Düello** | **Gerçek Ana Oyun Modu** (`CLASSIC`) | `src/core/types/index.ts` (`CoreGameMode = "CLASSIC"`) | `src/components/HomeScreen.tsx` (Kart 1), `src/tests/game-engine.test.ts` | **TEST VERIFIED** |
| **Ters Kadraj** | **Gerçek Ana Oyun Modu** (`REVERSE_CAST`) | `src/core/types/index.ts` (`CoreGameMode = "REVERSE_CAST"`), `ActorSearchModal.tsx` | `src/components/HomeScreen.tsx` (Kart 2), `src/tests/mode-separation.test.ts` | **TEST VERIFIED** |
| **Sinefil Konsept** | **Gerçek Ana Oyun Modu** (`CINE_CONCEPT`) | `src/core/types/index.ts` (`CoreGameMode = "CINE_CONCEPT"`), 14 Kült Tema | `src/components/HomeScreen.tsx` (Kart 3), `src/data/boards.ts` (`board_concept_*`) | **TEST VERIFIED** |
| **Günün XOX'u** | **Günlük Meydan Okuma Akışı** (`DAILY_SOLO`) | `src/core/types/index.ts` (`GameMode = "DAILY_SOLO"`), `board_daily_today` | `src/components/DailyShareModal.tsx`, `src/tests/daily-flow.test.ts` | **TEST VERIFIED** |
| **Yıldızlar Buluşması** | **Klasik Mod Altında Hazır Tahta Seansı** | `src/data/boards.ts` (satır 933, `id: "board_costars_legends"`, `boardMode: "CLASSIC"`) | `src/components/GameModesHubModal.tsx`, `src/tests/game-engine.test.ts` (Board #17) | **TEST VERIFIED** |

- **Mimari Netlik:** CINE-XOX çekirdek oyun motorunda tam olarak **3 ana mod** (`CLASSIC`, `REVERSE_CAST`, `CINE_CONCEPT`) bulunmaktadır. "Günün XOX'u", Klasik mod motoru üzerinde çalışan günlük tekil tahta akışıdır. "Yıldızlar Buluşması" ise bağımsız bir mod değil, Klasik Düello kütüphanesindeki bir Aktör × Aktör hazır tahtasıdır.

---

## 4. TELİF, LİSANS VE DOSYA BAZLI CC BY-SA İNCELEMESİ

Genelleyici ve toptancı ifadeler yerine, paket içindeki her görsel varlık ve lisansı dosya bazında incelenmiştir:

### 4.1 Basit Atıf Lisanslı Dosyalar (`CC BY`)
Bu dosyalar ShareAlike (copyleft) şartı taşımaz; yalnızca fotoğrafçıya atıf yapılmasını, lisans bağlantısını ve değişiklik yapıldığının belirtilmesini gerektirir:
1. `ast_act_dicaprio_portrait` (`/assets/portraits/act_dicaprio.jpg` - 14.1 KB - Checksum: `a5f1169c527d`): **CC BY 4.0** (Fotoğrafçı: Raph_PH). Kırpıldı ve 160×160 piksele ölçeklendi.
2. `ast_act_murphy_portrait` (`/assets/portraits/act_murphy.jpg` - 9.3 KB - Checksum: `ef83aded1be3`): **CC BY 4.0** (Fotoğrafçı: TIFF). Kırpıldı ve 160×160 piksele ölçeklendi.
3. `ast_act_pacino_portrait` (`/assets/portraits/act_pacino.jpg` - 15.4 KB - Checksum: `71fab927b173`): **CC BY 2.0** (Fotoğrafçı: John Bauld). Kırpıldı ve 160×160 piksele ölçeklendi.
4. `ast_act_mcconaughey_portrait` (`/assets/portraits/act_mcconaughey.jpg` - 11.1 KB - Checksum: `68b52fe2ad87`): **CC BY 4.0** (Fotoğrafçı: Raph_PH). Kırpıldı ve 160×160 piksele ölçeklendi.

### 4.2 Dosya Bazlı ShareAlike Lisans İncelemesi (`CC BY-SA`)
Aşağıdaki 7 görsel dosyası Creative Commons ShareAlike (Benzer Paylaşım) maddesi altındadır. Görseller kırpılarak ve JPEG formatında yeniden sıkıştırılarak türetilmiş eser (adapted material) oluşturulmuştur. 
Lisans şartı gereğince türetilen görsel dosyalarının kendisi de aynı lisans sürümü altında paylaşılmalı ve atıf yapılmalıdır:

1. **Robert De Niro** (`/assets/portraits/act_deniro.jpg` - 9.1 KB - Checksum: `3f62bb6ed0d8`):
   - *Lisans:* **CC BY-SA 3.0**
   - *Fotoğrafçı:* Georges Biard
   - *Kaynak:* `https://commons.wikimedia.org/wiki/File:Robert%20De%20Niro%20Cannes%202016.jpg`
   - *Yükümlülük:* Georges Biard'a atıf, CC BY-SA 3.0 lisans metnine bağlantı ve kırpma işleminin beyanı.
2. **Christian Bale** (`/assets/portraits/act_bale.jpg` - 11.3 KB - Checksum: `f3aff7accc05`):
   - *Lisans:* **CC BY-SA 4.0**
   - *Fotoğrafçı:* Harald Krichel
   - *Kaynak:* `https://commons.wikimedia.org/wiki/File:Christian%20Bale-7837.jpg`
   - *Yükümlülük:* Harald Krichel'e atıf, CC BY-SA 4.0 lisans metnine bağlantı ve kırpma işleminin beyanı.
3. **Brad Pitt** (`/assets/portraits/act_pitt.jpg` - 12.9 KB - Checksum: `60f6f0de3c1f`):
   - *Lisans:* **CC BY-SA 4.0**
   - *Fotoğrafçı:* Glenn Francis
   - *Kaynak:* `https://commons.wikimedia.org/wiki/File:Brad%20Pitt%202019%20by%20Glenn%20Francis.jpg`
   - *Yükümlülük:* Glenn Francis'e atıf, CC BY-SA 4.0 lisans metnine bağlantı ve kırpma işleminin beyanı.
4. **Timothée Chalamet** (`/assets/portraits/act_chalamet.jpg` - 15.5 KB - Checksum: `a80e94a2d574`):
   - *Lisans:* **CC BY-SA 4.0**
   - *Fotoğrafçı:* Harald Krichel
   - *Kaynak:* `https://commons.wikimedia.org/wiki/File:Timoth%C3%A9e%20Chalamet-63541%20%28cropped%29.jpg`
   - *Yükümlülük:* Harald Krichel'e atıf, CC BY-SA 4.0 lisans metnine bağlantı ve kırpma işleminin beyanı.
5. **Tom Hanks** (`/assets/portraits/act_hanks.jpg` - 11.3 KB - Checksum: `4ad73d542853`):
   - *Lisans:* **CC BY-SA 2.0**
   - *Fotoğrafçı:* Eva Rinaldi
   - *Kaynak:* `https://commons.wikimedia.org/wiki/File:Tom%20Hanks%20at%20the%20Elvis%20Premiere%202022.jpg`
   - *Yükümlülük:* Eva Rinaldi'ye atıf, CC BY-SA 2.0 lisans metnine bağlantı ve kırpma işleminin beyanı.
6. **Matt Damon** (`/assets/portraits/act_damon.jpg` - 12.8 KB - Checksum: `6f7209e52473`):
   - *Lisans:* **CC BY-SA 4.0**
   - *Fotoğrafçı:* Philip Romano
   - *Kaynak:* `https://commons.wikimedia.org/wiki/File:MattDamon-byPhilipRomano2.jpg`
   - *Yükümlülük:* Philip Romano'ya atıf, CC BY-SA 4.0 lisans metnine bağlantı ve kırpma işleminin beyanı.
7. **Christopher Nolan** (`/assets/portraits/dir_nolan.jpg` - 13.0 KB - Checksum: `84df09b0a709`):
   - *Lisans:* **CC BY-SA 4.0**
   - *Fotoğrafçı:* Republic of Korea (Kültür Bakanlığı)
   - *Kaynak:* `https://commons.wikimedia.org/wiki/File:Christopher%20Nolan.jpg`
   - *Yükümlülük:* Republic of Korea'ya atıf, CC BY-SA 4.0 lisans metnine bağlantı ve kırpma işleminin beyanı.

> **Uyumluluk Boşluğu:** Bu 11 varlığın kaynak ve atıf bilgileri proje deposunda `public/assets/portraits/pilot_manifest.json` içinde eksiksiz yer almasına rağmen, **kullanıcının uygulama arayüzünden (ör. Ayarlar -> Lisanslar & Atıflar) erişebileceği bir ekran henüz bulunmamaktadır.** Bu eksiklik Guideline 5.2 altında açık bir uyum görevi olarak kaydedilmiştir.

---

## 5. APP STORE KANIT VE DOĞRULAMA MATRİSİ (CONSOLIDATED EVIDENCE MATRIX)

| İddia / Özellik | Kod Kanıtı | Test Kanıtı | Cihaz / Canlı Durum | Doğrulama Durumu |
|---|---|---|---|:---:|
| **3×3 Kriter Kesişim Mantığı** | `src/core/engine/board-generator.ts` (`validateAxisSafety`), `src/core/engine/game-engine.ts` (`isMoveValid`) | `src/tests/game-engine.test.ts` ("Board #1 has valid solutions in all 9 cells", "Valid move accepted") | Simülatörde doğrulandı | **TEST VERIFIED** |
| **Mühürlü Hücre (Sıfır Çalma)** | `src/core/engine/game-engine.ts` (`executeMove`, `isCellOccupied`), `XoxBoard.tsx` | `src/tests/game-engine.test.ts` ("Dolu hücreler mühürlüdür; bot asla dolu hücreyi çalamaz") | Arayüzde tıklama kilitlenir | **TEST VERIFIED** |
| **Sahipsiz Hücre Kilidi (`LOCKED_NEUTRAL`)** | `src/core/engine/game-engine.ts` (`isCellDeadlocked`, `createLockedNeutralCell`) | `src/tests/game-engine.test.ts` ("isCellDeadlocked iki taraf da yanlış yaptığında true döner") | Hücre asma kilit alır | **TEST VERIFIED** |
| **Foto-Finiş & Nadirlik Puanı** | `src/core/engine/scoring.ts` (`calculateCellRarity`, `resolveFotoFinish`), `GoldenReelModal.tsx` | `src/tests/game-engine.test.ts` ("resolveFotoFinish Foto-Finiş'te toplam Rarity puanı yüksek olanı galip ilan eder") | Modal detaylı puan dökümü sunar | **TEST VERIFIED** |
| **Ters Kadraj Aktör Eşleşmesi** | `src/core/engine/game-engine.ts` (`validateActorIntersection`), `ActorSearchModal.tsx` | `src/tests/game-engine.test.ts` ("validateActorIntersection ortak aktörü tam eşleşmeyle doğrular") | Sanal klavye uyumu sağlandı | **TEST VERIFIED** |
| **12s Şut Saati (Shot Clock)** | `src/features/gameplay/hooks/useGameSession.ts` (satır 39: `shotClockLimit = 12`) | `src/tests/game-engine.test.ts`, `ShotClock.tsx` | Zamanlayıcı geri sayımı çalışır | **TEST VERIFIED** |
| **Otonom Çevrimdışı Bot** | `src/core/engine/bot-engine.ts` (`calculateBotMove`, `findWinningMove`, `findBlockingMove`) | `src/tests/game-engine.test.ts` ("Bot finds valid move", "Bot seizes winning move", "Bot blocks line") | Fiziksel iOS cihazda Uçak Modu açılışı yapılmadı | **NOT DEVICE VERIFIED** |
| **Günlük Sıfırlama (UTC 00:00)** | `src/utils/dateUtils.ts` (`getGlobalDailyDateKey`), `board_daily_today`, `DailyShareModal.tsx` | `src/tests/daily-flow.test.ts` ("UTC 00:00:00.000Z tam UTC gece yarısında yeni güne geçer") | Saat diliminden bağımsız çalışır | **TEST VERIFIED** |
| **Eşzamanlı Özel Oda (Multiplayer)** | `CustomRoomModal.tsx`, `useRealtimeMatch.ts`, `src/backend/realtime.ts` | `src/tests/server-rpc.test.ts`, `src/tests/match-lifecycle.test.ts` | 2 eşzamanlı cihaz/sekme gerektirir | **TEST VERIFIED** |
| **Hesap ve Veri Silme (5.1.1(v))** | `src/backend/supabase/auth.ts` (`deleteUserAccount`), `ProfileModal.tsx`, `20261103_faz5_account_deletion_rpc.sql` | `src/tests/auth-identity.test.ts` (İstemci RPC ve SQL sözdizimi doğrulandı) | **Canlı Supabase veritabanına migration henüz uygulanmadı** | **CODE VERIFIED / NOT PRODUCTION VERIFIED** |
| **Film Afişi Bulunmaması** | `src/data/movies.ts` (0 adet poster linki / TMDb CDN kaldırıldı) | `src/tests/asset-system.test.ts` ("Telifli film afişi uydurulmaz, isAvailable: false döner") | UI sadece tipografik kart gösterir | **VERIFIED CLEAN** |
| **CC Portre Varlıkları** | `pilot_manifest.json`, `public/assets/portraits/` (11 dosya, tam checksum eşleşmesi) | `src/tests/asset-system.test.ts` ("11 portrait checksum dosyayla eşleşir, 160 jpeg") | Uygulama içi lisans ekranı eksik | **LEGAL NOTICE GAP** |

---

## 6. NİHAİ DEĞERLENDİRME VE MAĞAZA KARARI

### Sonuç: **FINAL VALIDATION REQUIRED (Nihai Doğrulama Gerekli)**

**Gerekçeli Karar:**
Uygulama temel oyun mantığı, 12 saniyelik şut saati, hile koruması, 0 afiş kullanımı ve 209 adet birim/entegrasyon testiyle teknik açıdan sağlam bir zemindedir. Ancak aşağıdaki 4 operasyonel adım tamamlanmadan App Store'a submission yapılmamalıdır:

1. **Canlı Supabase Migration:** `20261103_faz5_account_deletion_rpc.sql` dosyasının canlı Supabase projesine uygulanması (`supabase db push`) ve canlıda hesap silme çağrısının doğrulanması (`NOT PRODUCTION VERIFIED` durumunun kapatılması).
2. **Fiziksel Cihaz Uçak Modu Doğrulaması:** Fiziksel bir iPhone üzerinde internet kapalıyken uygulamanın ilk açılışının ve bot maçının tamamlandığının test edilmesi (`NOT DEVICE VERIFIED` durumunun kapatılması).
3. **Uygulama İçi Lisans Ekranı:** `pilot_manifest.json` içindeki CC BY ve CC BY-SA atıflarının Ayarlar menüsüne bir "Lisanslar & Atıflar" sayfası olarak eklenmesi.
4. **Xcode Lisans ve İmzalı Arşiv:** Geliştirme makinesinde `sudo xcodebuild -license accept` çalıştırılarak terminal engelinin kaldırılması ve Xcode üzerinden imzalı `.ipa` / Archive üretiminin tamamlanması.
