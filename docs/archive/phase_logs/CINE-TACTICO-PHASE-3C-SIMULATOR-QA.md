# CINE-TACTICO — PHASE 3C: SIMULATOR QA & MOBILE OPTIMIZATION REPORT

**Task ID:** CT-P3C-SIMULATOR-QA  
**Status:** COMPLETED & VERIFIED  
**Date:** 2026-10-31  
**Evaluator:** Antigravity Autonomous Engine  

---

## 1. Executive Summary

Phase 3C establishes rigorous physical-tier simulation on iOS, applies core mobile touch and viewport optimizations, and outlines distribution protocols for iOS testing among peers.

- **Simulator Deployment Verified:** Cine-Tactico (`com.cinetactico.game`) deployed and launched on `iPhone 16e` simulator via `xcrun simctl` (PID: 41011).
- **Zero-Latency Mobile Touch Optimizations:**
  - `touch-action: manipulation` applied globally to eliminate the 300ms double-tap delay on WebKit.
  - `overscroll-behavior: none` applied to `html` and `body` to disable rubber-band bouncing on iOS.
  - `-webkit-touch-callout: none` applied to disable default iOS long-press callout menus during gameplay.
  - Dynamic viewport height support (`min-height: 100dvh`) wired to prevent keyboard/chrome layout jumps.
- **Visual Capture Verified:** High-resolution screenshots captured directly from simulator framebuffer (`screenshots/ios_sim_home_v2.png`).
- **All Core Unit Tests Passing:** 27/27 game engine tests passing (100%).

---

## 2. Technical Explanation: Expo Go vs. Capacitor 8

### Soru: "Expo Go ne işe yarıyor, onu mu indirtip deneteceksin?"

**Cevap: Hayır, Expo Go bizim projemiz için KULLANILAMAZ.**

#### Neden?
- **Expo Go Nedir?** Expo Go, yalnızca **React Native** (iOS ve Android için native UI bileşenleri kullanan) projeler için bir test kabuğudur.
- **Bizim Mimarimiz:** Cine-Tactico bir React Native projesi değil; **Next.js 14 (React Web) + Tailwind CSS + Capacitor 8** mimarisidir.
- Expo Go, Web ve Capacitor projelerini çalıştıramaz. Projeyi Expo Go ile çalıştırmaya çalışmak, mevcut tüm UI, animasyon ve Next.js kodlarımızı sıfırdan React Native formatına yeniden yazmak anlamına gelir (bu hem gereksizdir hem de aylar sürer).

---

## 3. iOS Kullanan Arkadaşlarına Nasıl Oynatabilirsin? (3 Yöntem)

Apple ekosistemi Android gibi `.apk` dosyasını doğrudan WhatsApp'tan indirip kurmaya izin vermez (Apple Sandbox ve imzalama kuralları nedeniyle). iOS kullanıcıları için mağaza öncesi testin **3 resmî ve pratik yolu** vardır:

### Yöntem 1: PWA (Ana Ekrana Ekle) — EN HIZLI & SIFIR MALİYET (Önerilen)
Uygulamayı bir kez genel bir HTTPS adresine (örn. Vercel veya Cloudflare Pages) yükleriz.
1. Arkadaşına WhatsApp'tan linki atarsın (örn. `https://cine-tactico.vercel.app`).
2. Arkadaşın linki iPhone'unda **Safari** ile açar.
3. Safari'nin altındaki **"Paylaş"** (kare içinden yukarı ok çıkan simge) butonuna basar.
4. Listeden **"Ana Ekrana Ekle" (Add to Home Screen)** seçeneğini tıklar.
5. **Sonuç:** Telefonun ana ekranına tıpkı App Store'dan inmiş gibi Cine-Tactico ikonu gelir. Açtığında adres çubuğu veya Safari butonları olmadan, tam ekran, çentik uyumlu ve donanımsal titreşimli (Taptic Engine) olarak yerel uygulama gibi çalışır.

### Yöntem 2: Apple TestFlight (Resmî App Store Öncesi Beta)
1. Apple Developer Program hesabı ($99/yıl) açıldığında, Xcode üzerinden derlenen `.ipa` App Store Connect'e yüklenir.
2. Arkadaşlarına App Store'dan ücretsiz **TestFlight** uygulamasını indirtirsin.
3. Onlara bir TestFlight davet linki gönderirsin. Linke tıkladıklarında uygulama doğrudan telefonlarına yerel native iOS uygulaması olarak kurulur. (Expo Go'nun React Native için yaptığını, Apple TestFlight tüm yerel iOS uygulamaları için yapar).

### Yöntem 3: Kablolu Yükleme (Kendi Cihazın İçin)
Kendi iPhone'unu Mac'ine kabloyla bağlayıp Xcode'da `Run` dediğinde, uygulama doğrudan senin telefonuna ücretsiz geliştirici sertifikasıyla yüklenir.

---

## 4. Simulator Test Kanıtları

- **Test Edilen Cihaz:** `iPhone 16e (D733FA0C-41F3-4AAC-B4C6-76107C870E1D)`
- **İşletim Sistemi:** iOS 18+ (Simulator Runtime)
- **Süreç Durumu:** `com.cinetactico.game` (PID: 41011) — ACTIVE & RESPONDING
- **Ekran Görüntüsü:** `screenshots/ios_sim_home_v2.png`

---

## 5. Doğrulama ve Test Sonuçları

1. **Next.js Static Build:**
   ```bash
   $ npm run build
   Route (app)                              Size     First Load JS
   ┌ ○ /                                    84.3 kB         172 kB
   └ ○ /_not-found                          875 B          88.2 kB
   ○  (Static)  prerendered as static content
   ```
2. **Capacitor Sync:**
   ```bash
   $ npx cap sync
   [info] Sync finished in 0.073s
   ```
3. **Xcode Build:**
   ```bash
   $ cd ios/App && xcodebuild -project App.xcodeproj -scheme App ...
   ** BUILD SUCCEEDED **
   ```
4. **Game Engine Unit Tests:**
   ```bash
   $ npx tsx src/tests/game-engine.test.ts
   TOTAL RESULT: 27/27 PASSED (100%)
   ```
