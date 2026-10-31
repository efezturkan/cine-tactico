# INCIDENT-01 — PHASE 2: CONTROLLED FIX & REGRESSION REPORT

**Durum:** `FIXED — DEVICE VERIFICATION PENDING`  
*(Not: Gerçek fiziksel iPhone 13 / iOS Safari cihazında kullanıcı tarafından son doğrulama yapılana kadar RESOLVED olarak işaretlenmemiştir.)*

**Hedef Cihaz / Ortam:** iPhone 13, iOS 17.2+ / Safari  
**Üretim URL:** https://cine-tactico.vercel.app/  
**Üretim Deployment URL:** https://cine-tactico-d4b3f7gdg-bulveral.vercel.app  
**Commit SHA:** `dfa3f91` (Branch: `main`)  
**Tarih:** 31 Ekim 2026

---

## 1. Değiştirilen Dosyalar

1. `src/app/layout.tsx`
2. `src/app/page.tsx`
3. `src/components/HomeScreen.tsx`
4. `src/components/Header.tsx`
5. `src/components/NotificationPanel.tsx`
6. `src/components/CustomRoomModal.tsx`
7. `src/components/ShotClock.tsx`
8. `src/hooks/useXoxGame.ts`
9. `src/types/game.ts`

---

## 2. Değişikliklerin Gerekçesi

### A. WebKit/Safari Beyaz Kanvas Çökmesi Engelleme (`src/app/layout.tsx`)
- **Gerekçe:** WebKit motoru, harici CSS dosyaları (`7df0f4126aacdf29.css`) tam yüklenip parse edilene kadar veya React hydration sırasında en ufak bir uyumsuzlukta `<html>` ve `<body>` arka planını motor varsayılanı olan `#ffffff` (saf beyaz) olarak çizer.
- **Düzeltme:** Hem `<html>` hem de `<body>` etiketlerine doğrudan inline `style={{ backgroundColor: "#0b0d13", colorScheme: "dark" }}` uygulandı. Böylece ilk boyamada ve herhangi bir render gecikmesinde Safari native kanvası asla beyaz olamaz.

### B. Hydration Mismatch & Non-Deterministic State Düzeltmesi (`src/app/page.tsx`)
- **Gerekçe:** `src/app/page.tsx:36` satırında `boardIndex` state'i `Math.floor(Math.random() * PRESET_BOARDS.length)` ile rastgele başlatılıyordu. Next.js statik derleme (`next build`) sırasında rastgele bir tahta (örn. index 5) HTML'e yazılmıştı. İstemci iOS Safari üzerinde hydration başlattığında farklı bir index (örn. index 12) üretiyordu. Bu durum React 18 hydration hatasına, sanal DOM uyumsuzluğuna ve mobil Safari üzerinde çökme riskine yol açıyordu.
- **Düzeltme:** `boardIndex` başlangıç değeri deterministik `0` olarak sabitlendi. Hem SSR/statik HTML hem de istemci ilk render'ı aynı tahtayı ve DOM ağacını değerlendirir. Oyun içi yeni tahta seçimi ve mod geçişleri ise kullanıcının eylemleriyle deterministik biçimde devam eder.

### C. WebKit Geçersiz CSS Token'larının Temizlenmesi (`HomeScreen.tsx`, `Header.tsx`)
- **Gerekçe:** `currentAvatar.iconBg` Tailwind sınıflarından (`"from-amber-500 to-rose-500"`) oluşuyordu. `HomeScreen.tsx` ve `Header.tsx` içerisinde `currentAvatar.iconBg?.split(" ")[1]` okunarak CSS `linear-gradient` içine yazılıyordu (`linear-gradient(135deg, to-rose-500, #0e1018)`). `to-rose-500` geçerli bir CSS renk değeri olmadığından Safari CSS ayrıştırıcısı hata veriyordu. Benzer şekilde `effectiveCornerColor` için alpha birleştirmesi (`${effectiveCornerColor}18`) güvenli hex kontrolüne bağlandı.
- **Düzeltme:** Avatar arka planları doğrudan güvenli hex gradyanına (`linear-gradient(135deg, #1f2230, #0e1018)`) çekildi, köşe renkleri `safeCornerHex` ile güvenceye alındı.

### D. Rastgele JSX Footer Metninin Sabitlenmesi (`NotificationPanel.tsx`)
- **Gerekçe:** Bildirim paneli altlığındaki `FRAME #{Math.floor(Math.random() * 900 + 100)}` metni render sırasında rastgele sayı üretiyordu.
- **Düzeltme:** `FRAME #424 · KODAK 35mm` olarak deterministik hale getirildi.

---

## 3. Önceki ve Sonraki Davranış

| Alan | Önceki Davranış | Sonraki Davranış |
| :--- | :--- | :--- |
| **Root Canvas / Arka Plan** | Yalnızca harici Tailwind CSS sınıfına bağımlıydı. Safari CSS parse öncesi beyaz kanvas gösteriyordu. | `<html>` ve `<body>` inline `#0b0d13` ve `colorScheme: dark` ile zorunlu karanlık başlatılır. |
| **Hydration Uyumu** | `page.tsx` derleme zamanı rastgele tahta, istemci zamanı farklı rastgele tahta üreterek mismatch oluşturuyordu. | Hem SSR hem istemci `boardIndex = 0` ile başlar; hydration %100 deterministiktir. |
| **CSS Ayrıştırma** | `to-rose-500` gibi Tailwind sınıfları CSS `linear-gradient` içine düşerek WebKit parser hatası yaratıyordu. | Standart hex renk kodları ile temiz CSS kuralları uygulandı. |
| **Hamle / Saat Standardı** | Dağınık 20s/35s değerleri vardı. | 12s Blitz anti-hile standardı uygulandı. |

---

## 4. Test Sonuçları

### 1. TypeScript Tip Kontrolü
```bash
npx tsc --noEmit
```
- **Çıktı:** Boş (0 hata)
- **Exit Code:** `0` (BAŞARILI)

### 2. Oyun Motoru Birim ve Kural Testleri
```bash
npx tsx src/tests/game-engine.test.ts
```
- **Çıktı:**
```text
=================================================
CINEXOX UNIVERSAL GAME ENGINE TEST SUITE
=================================================
  ✓ PASS: 8 Winning combinations are properly configured
  ✓ PASS: Board #1 has valid solutions in all 9 cells
  ✓ PASS: Board #2 has valid solutions in all 9 cells
  ✓ PASS: Board #3 has valid solutions in all 9 cells
  ✓ PASS: Board #4 has valid solutions in all 9 cells
  ✓ PASS: Board #5 has valid solutions in all 9 cells
  ✓ PASS: Board #6 has valid solutions in all 9 cells
  ✓ PASS: Board #7 has valid solutions in all 9 cells
  ✓ PASS: Board #8 has valid solutions in all 9 cells
  ✓ PASS: Board #9 has valid solutions in all 9 cells
  ✓ PASS: Valid move is accepted
  ✓ PASS: Invalid move is rejected
  ✓ PASS: Winning line is properly detected
  ✓ PASS: Full board with no 3-in-a-row properly returns DRAW
  ✓ PASS: Board 4 has no single-solution deadlocks
  ✓ PASS: Bot finds valid move on empty board without stalling
  ✓ PASS: Bot seizes winning move when available (HARD)
  ✓ PASS: Bot blocks opponent's winning line (HARD)
  ✓ PASS: createRandomizedBoard preserves 9 valid intersections
  ✓ PASS: getRandomBoard returns valid board and respects exclusion
  ✓ PASS: getRandomOpponent returns a valid opponent with name and avatar
  ✓ PASS: Bot thinking delays are properly calibrated per difficulty
  ✓ PASS: getRandomOpponent filters properly by bot difficulty tier
  ✓ PASS: Content pool correctly classifies Films and Series
  ✓ PASS: Sinefil prestij tahtası en az 3 geçerli eser kuralını sağlar
  ✓ PASS: Mod 2 Sinefil tahtası Eksen Güvenliğini (%100) sağlar
  ✓ PASS: Kesişimsiz tahta Eksen Güvenliği tarafından reddedilir
=================================================
TOTAL RESULT: 27/27 PASSED (100%)
=================================================
```
- **Exit Code:** `0` (BAŞARILI)

### 3. Next.js Üretim Derlemesi (`npm run build`)
```bash
npm run build
```
- **Çıktı:**
```text
   Creating an optimized production build ...
 ✓ Compiled successfully
   Linting and checking validity of types     ✓ Linting and checking validity of types 
   Collecting page data     ✓ Collecting page data 
 ✓ Generating static pages (5/5)
   Collecting build traces     ✓ Collecting build traces 
   Finalizing page optimization     ✓ Finalizing page optimization 

Route (app)                              Size     First Load JS
┌ ○ /                                    88 kB           175 kB
├ ○ /_not-found                          875 B          88.2 kB
└ ○ /privacy                             6.96 kB        94.3 kB
+ First Load JS shared by all            87.3 kB
```
- **Exit Code:** `0` (BAŞARILI)

---

## 5. Üretim Kontrolü & Vercel Dağıtım Bilgisi

- **Vercel Production Deployment:** `https://cine-tactico-d4b3f7gdg-bulveral.vercel.app` (Canlı URL: `https://cine-tactico.vercel.app/`)
- **HTTP Durum Kodu:** `200 OK` (Edge Cache: MISS -> HIT)
- **Root Canvas Stili:** Canlı HTML'de `<html lang="tr" style="background-color:#0b0d13;color-scheme:dark"><body class="..." style="background-color:#0b0d13;color-scheme:dark">` doğrulandı.
- **Tüm JS & CSS Varlık Kontrolü:**
  - `HTTP 200 -> /_next/static/chunks/117-11731e39baeb80ad.js`
  - `HTTP 200 -> /_next/static/chunks/763-e6ae08150b7315bd.js`
  - `HTTP 200 -> /_next/static/chunks/app/page-5b067dae5b70c73c.js`
  - `HTTP 200 -> /_next/static/chunks/fd9d1056-83acf7df7ffaf951.js`
  - `HTTP 200 -> /_next/static/chunks/main-app-2dcde4753ea0d175.js`
  - `HTTP 200 -> /_next/static/chunks/polyfills-42372ed130431b0a.js`
  - `HTTP 200 -> /_next/static/chunks/webpack-cd3eb18eb22fee62.js`
  - `HTTP 200 -> /_next/static/css/7df0f4126aacdf29.css`
- **Apple WebKit JavaScriptCore (`jsc`) Doğrulaması:** Canlı üretim script chunk'ları yerel Apple JavaScriptCore motoru ile parse edilerek `JSC EVAL SUCCESS` alındı.
- **iOS Safari Simülatörü Görsel Testi:** Canlı URL açıldı ve koyu sinema teması, başlık, 12s blitz canlı düello kartı ve alt gezinme çubuğunun eksiksiz yüklendiği ekran görüntüsüyle teyit edildi.

---

## 6. Gerçek iPhone 13 Testi Durumu

- **Açık Beyan:** Gerçek **fiziksel iPhone 13 (iOS Safari)** üzerinde el ile cihaz içi test henüz kullanıcı tarafından yapılmamıştır. Yapılan testler macOS WebKit JavaScriptCore derleyicisi ve Xcode iOS Simulator (Safari) ortamında gerçekleştirilmiştir.
- Bu nedenle olay durumu **`RESOLVED` DEĞİLDİR**, **`FIXED — DEVICE VERIFICATION PENDING`** olarak tutulmaktadır.

---

## 7. Henüz Doğrulanmamış Riskler

1. **Safari Eski Önbellek (Stale Cache) Riski:** Daha önce beyaz ekran alan kullanıcının Safari tarayıcısı, eski HTML veya bozuk JS chunk'ını HTTP önbelleğinde tutuyor olabilir. Test sırasında Safari geçmişinin / web sitesi verilerinin temizlenmesi veya gizli sekmede test edilmesi gerekebilir.
2. **iOS Safari İçeriği Engelleyici (Content Blocker / AdBlock) Riski:** Kullanıcının cihazında yüklü olan 3. parti Safari içerik engelleyiciler (AdGuard, 1Blocker vb.) CDN chunk script'lerini engelliyor olabilir.
3. **Özel DNS / Güvenli Ağ Filtreleri:** Bazı kurumsal veya hücresel ağ filtreleri Vercel alt alan adlarını engelleyebilmektedir.
