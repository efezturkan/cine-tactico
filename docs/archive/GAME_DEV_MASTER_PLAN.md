# CINE-XOX (Tactico Cinema) — Cross-Platform Production Architecture & Zero-Trust Master Blueprint

**Rol:** Lead Game Developer & Cross-Platform Systems Architect  
**Hedef:** iOS, Android, Tablet (iPad/Android) ve Web (PWA/Link) üzerinde %100 senkron, sıfır-gecikmeli, offline destekli sinema XOX oyunu.  
**Sürüm:** 1.0 Production-Ready Blueprint  
**Tarih:** Ekim 2026  

---

## 1. "Neye Göre Tamam?" — Kabul ve Hazırlık Kriterleri (Readiness Audit)

Bir oyun projesi "fikir güzel" diye tamamlanmış sayılmaz. Bu proje aşağıdaki **5 Hayati Standart** sağlandığı için tamamdır:

```
[1. MATEMATİKSEL TAMAMLIK] ➔ 0 Çıkmaz Kare: Her 3x3 tahtada her hücre için >= 3 doğrulanmış film garantisi.
[2. PLATFORM PARİTESİ]     ➔ iOS + Android + Tablet + Web: Tek kod tabanı, sıfır mantık farkı.
[3. AĞ & OFFLINE TAMAMLIK]  ➔ Sıfır İnternet Desteği: İnternet kopsa bile Pass&Play ve Bot çalışır.
[4. MAĞAZA UYUMU]          ➔ Apple App Store & Google Play kurallarına (Guideline 4.2 & 5.1.1) %100 uyum.
[5. PERFORMANS GARANTİSİ]   ➔ 0-ms Arama (Local Index) + 60 FPS Dokunmatik Haptic Tepki.
```

---

## 2. Kapatılan Eksiklikler ve Sıfır-Güven (Zero-Trust) Çözümleri

### Eksiklik 1: "Sadece Web/PWA Yaparsak Ne Olur?" (Mobil Mağaza Riski)
* **Tehlike:** Handoff sadece PWA önermişti. PWA web için harikadır ama kullanıcıların %85'i oyunları App Store ve Google Play'den indirir. Saf PWA mağazada reddedilir (Apple Guideline 4.2: Minimum Functionality).
* **Mühendislik Çözümü (Unified Hybrid-Native):**
  * **Çekirdek:** React / Next.js + TypeScript (Modern UI, Web paylaşım linkleri).
  * **Mobil Motor (Capacitor 6+):** Tek bir komutla Xcode (iOS/iPadOS) ve Android Studio (Gradle) projelerine derlenir.
  * **Native Entegrasyonlar:**
    * `@capacitor/haptics`: Hamle yapıldığında ve süre bitiminde haptic titreşim motoru.
    * `@capacitor/share`: Yerel iOS/Android paylaşım sayfası (WhatsApp, Instagram Stories, X).
    * `@capacitor/network`: Ağ durumunu dinleyerek offline moda kesintisiz geçiş.

### Eksiklik 2: "İnternette Bir Şey Olursa Ne Olur?" (Offline & Network Resiliency)
* **Senaryo A: İnternet Hiç Yokken (Metro, Uçak, Kesinti)**
  * Oyun kesinlikle kilitlenmez veya "İnternet Yok" hatasıyla kapanmaz.
  * İstemciye paketlenen **Yerel SQLite / JSON Çekirdeği (En popüler 2.500 film ve 50 hazır tahta)** sayesinde:
    * **Pass & Play (Yanındaki arkadaşınla oyna):** Tamamen çevrimdışı çalışır.
    * **Solo AI Antrenman Modu:** Çevrimdışı çalışır.
* **Senaryo B: Canlı Online Maç Sırasında İnternet Koparsa**
  * **30 Saniyelik Kurtarma Penceresi (Reconnection Window):** Oyuncunun interneti kesilirse maç anında düşmez; "Bağlantı bekleniyor (30s)" sayacı çalışır. Oyuncu 30 saniye içinde Wi-Fi/4G'ye bağlandığında WebSocket durumu senkronize eder ve oyun kaldığı yerden devam eder.

### Eksiklik 3: Tablet (iPad ve Android Tablet) Deneyimi
* **Tehlike:** Telefon arayüzünü tablete genişletirseniz butonlar devasa, tahta boşlukta kalır; amatör hissettirir.
* **Responsive Breakpoint Mimarisi:**
  * **Mobile (< 768px - Portrait):**
    * Dikey akış. Üstte oyuncular ve shot-clock, ortada 3x3 tahta, altta arama ve klavye alanı.
  * **Tablet / Desktop (>= 768px - Landscape/Split):**
    * **Sol Panel (30%):** Canlı maç istatistikleri, oyuncu avatarları, süre göstergesi ve maç sohbet/emoji tepkileri.
    * **Orta Alan (45%):** Geniş, dokunmatik 3x3 Cine-XOX Tahtası.
    * **Sağ Panel (25%):** "Oynanan Filmler Arşivi": Tahtaya yerleştirilen filmlerin afişleri, yönetmenleri, hasılatları ve IMDb puanları detaylı kartlar olarak canlı akar.

---

## 3. Sistem Mimarisi & Teknoloji Yığını

```
                     +---------------------------------------+
                     |   CINE-XOX Universal Codebase         |
                     |   React 19 / Next.js / TypeScript     |
                     +---------------------------------------+
                                    |
          +-------------------------+-------------------------+
          |                                                   |
          v                                                   v
+-------------------+                               +-------------------+
|    WEB RUNTIME    |                               | CAPACITOR RUNTIME |
|  - Vercel Edge    |                               |  - iOS (Swift)    |
|  - PWA Link Play  |                               |  - Android (Kotlin|
|  - Social Shares  |                               |  - iPad / Tablets |
+-------------------+                               +-------------------+
          |                                                   |
          +-------------------------+-------------------------+
                                    |
                                    v
+-----------------------------------------------------------------------+
|                       SHARED BACKEND (SUPABASE)                       |
| - PostgreSQL 15: Movies, People, Credits, Pre-validated Boards        |
| - Supabase Realtime: WebSockets ile 0-Gecikmeli 1v1 Eşleşme           |
| - Edge Functions: Server-Authoritative Hamle Doğrulama & Anti-Cheat   |
| - Offline Edge Cache: İstemci içi SQLite/IndexedDB (0-ms Search)      |
+-----------------------------------------------------------------------+
```

---

## 4. Güncellenmiş ve Kesinleştirilmiş Zaman Takvimi (4 Haftalık Sprint)

| Hafta | Odak | Yapılacaklar | Doğrulama & Çıktı |
|---|---|---|---|
| **Hafta 1** | **Veri, Matris & Offline Motoru** | • TMDB ETL: 2.500 film, 1.200 oyuncu, 250 yönetmen.<br>• SQLite / Local JSON fihristi oluşturma.<br>• Matris Üretici: Her hücresi >= 3 film içeren 50 adet önceden doğrulanmış tahta tohumu.<br>• Postgres şeması kurulumu. | Çevrimdışı yerel arama testi (0 ms) ve 50 tahtanın %100 çözülebilirlik kontrolü. |
| **Hafta 2** | **XOX Çekirdeği, UI & Tablet/Mobil Uyumu** | • XOX State Machine (Yatay/Dikey/Çapraz kazanma).<br>• Mobile + Tablet Responsive Adaptive UI (Tailwind + Framer Motion).<br>• Haptic Feedback entegrasyonu.<br>• **Pass & Play Modu (Tamamen Offline çalışabilir).** | Telefonda ve iPad simülatöründe internet kapalıyken 2 kişilik maçın hatasız tamamlanması. |
| **Hafta 3** | **Canlı 1v1 Çok Oyunculu & Dayanıklılık** | • Supabase Realtime WebSocket odaları.<br>• Tek tıkla oda açma ve link üretme (`cinexox.app/play/ABC12`).<br>• 15s Shot-Clock + 30s Reconnection Window (Kopma kurtarma).<br>• İstemci-sunucu senkronizasyonu. | İki ayrı cihaz arasında canlı maç; 4G kapatılıp açıldığında maçın kopmadan sürmesi. |
| **Hafta 4** | **Günlük Solo Mod, Native Build & Mağaza Paketi** | • Günün XOX'u (Daily Solo) + Emojili skor paylaşımı.<br>• Maç sonu interaktif "Neler yazılabilirdi?" analizi.<br>• Capacitor ile iOS (.ipa) ve Android (.apk/.aab) buildlerinin alınması.<br>• App Store & Google Play kabul testleri. | Web'de canlı yayına alma + iOS TestFlight ve Android dahili test paketlerinin oluşturulması. |

---

## 5. Sıfır Güven Test Senaryoları (Tamam Olmanın Kanıtı)

1. `TEST_OFFLINE_PASS_AND_PLAY`: Uçak modundayken uygulama açılır, yerel arama çalışır, 3x3 maç biter.
2. `TEST_TABLET_LAYOUT_ADAPTATION`: Ekran 768px üzerine çıktığında arayüz 3 panelli masaüstü/tablet düzenine kusursuz geçer.
3. `TEST_CONCURRENT_MOVE_COLLISION`: İki oyuncu milisaniye farkıyla aynı kareye bastığında sunucu kilidi (Row Lock) ilkini onaylar, ikincisini reddeder.
4. `TEST_RECONNECTION_GRACE_PERIOD`: Canlı maçta oyuncunun interneti koptuğunda sunucu 30 saniye bekler; oyuncu geri gelince son tahta durumu anında yüklenir.
5. `TEST_VALID_INTERSECTION_MATRIX`: Kriter kesişiminde yer almayan hiçbir film (örneğin Nolan filminde oynamamış bir oyuncu) sisteme kabul edilmez.
