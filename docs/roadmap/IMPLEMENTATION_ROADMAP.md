# CINE-XOX — Uygulama Yol Haritası ve Faz Takip Planı
**Doküman:** `docs/roadmap/IMPLEMENTATION_ROADMAP.md`  
**Durum:** AKTİF — FAZ 1 BAŞLANGICI  
**Tarih:** 31 Ekim 2026 (Konsolide Sürüm)  
**İlgili Belgeler:** `MASTER_SPECIFICATION_v3.md`, `docs/architecture/DATA_GOVERNANCE.md`

---

## 1. Faz Özeti ve İlerleme Durumu

| Faz | Kapsam | Durum | Doğrulama Yöntemi |
|---|---|---|---|
| **FAZ 0** | Mimari Konsolidasyon, Kural & Yönetişim Şartnamesi | **TAMAMLANDI** | Şartname ve Dokümanlar Onaylandı |
| **FAZ 1** | Test Standardizasyonu & Veri/Lisans Güvenliği | **TAMAMLANDI** | `npm test` + `npm run build` Sıfır Hata |
| **FAZ 2** | Ortak Oyun Motoru & Kural Durum Makinesi | **TAMAMLANDI** | 64/64 Test Suite (%100 Başarı) |
| **FAZ 3** | Oyun Modları (Ters Kadraj & 14 Kült Tema) | **TAMAMLANDI** | 14 Tema & %100 Eksen Güvenliği (77/77 Test) |
| **FAZ 4** | 35mm Tipografik Arayüz & Görsel Kimlik | **TAMAMLANDI** | Lucide SVG + 35mm Slate + 100dvh Responsive |
| **FAZ 5** | Çok Oyunculu & Kalıcılık Altyapısı | **TAMAMLANDI** | Supabase Realtime + RLS + Match History + 35mm Viral Card |

---

## 2. Faz 1: Test Standardizasyonu & Veri/Lisans Güvenliği

### Mikro-Adım 1.1: Test Standardizasyonu (Şu Anki İşlem)
* **İşlem:** `package.json` içine `"test": "tsx src/tests/game-engine.test.ts"` eklenmesi.
* **Başarı Kriteri:** Terminalde `npm test` komutu çalıştırıldığında 27 testin tamamının (27/27 - %100) başarıyla geçmesi.
* **Geri Dönüş (Rollback):** `package.json`'ın git üzerinden geri yüklenmesi.

### Mikro-Adım 1.2: IMDb ve TMDb Bağımlılıklarının Tasfiyesi
* **İşlem:** 
  1. `movies.ts` içindeki `posterUrl` alanlarının temizlenmesi (Git geçmişi korunarak).
  2. `imdbRating` alanının ve buna dayalı 7 kritik kod yolunun (kare çalma, bot sıralaması, yapay nadirlik) motordan ve testlerden temizlenmesi.
  3. `IMDB_8_PLUS` kriterinin editoryal tescilsiz başarı kriteriyle güncellenmesi.
* **Başarı Kriteri:** Kod tabanında sıfır `imdbRating` bağımlılığı ve `npm test`'in yeşil kalması.

### Mikro-Adım 1.3: Veri Modellerinin ve Provenance'ın Entegrasyonu
* **İşlem:** `src/types/game.ts` içine `FieldProvenance`, `Actor` ve `CellState` modellerinin geriye dönük uyumlu eklenmesi.
* **Başarı Kriteri:** TypeScript derlemesinin (`npm run build`) sıfır hata ile tamamlanması.

---

## 3. Faz 2: Kural Motoru ve Durum Makinesi

* **Mikro-Adım 2.1:** Kare çalma sisteminin motordan tamamen çıkarılması; hücre başına oyuncu başına 1 deneme hakkı ve 15s shot-clock timeout tüketiminin bağlanması.
* **Mikro-Adım 2.2:** İki yanlış cevapta `LOCKED_NEUTRAL` (Sahipsiz Hücre / Deadlock Prevention) kilitlenmesinin uygulanması.
* **Mikro-Adım 2.3:** 9 hücre sonuçlandığında 3'lü hat yoksa Beraberlik yerine `GOLDEN_REEL` (Altın Makara - 12s Buzzer-beater) durumunun tetiklenmesi ve iki taraf bilemezse toplam Rarity kıyasının (Foto-Finiş) bağlanması.
* **Mikro-Adım 2.4:** Rarity formülünün hücre içi geçerli çözüm havuzu dilimine bağlanması; yetersiz veri havuzunda ($N < 3$) Legendary üretiminin engellenmesi.
* **Mikro-Adım 2.5 (Yeni Testler):** 7 yeni kritik senaryonun `game-engine.test.ts` içine eklenerek toplam test sayısının 34'e çıkarılması ve `npm test` ile doğrulanması.

---

## 4. Faz 3: Oyun Modları ve İçerik

* **Mikro-Adım 3.1:** Ters Kadraj modu için klavyeli manuel giriş arayüzü; tam eşleşme $\rightarrow$ alias $\rightarrow$ kontrollü fuzzy matching doğrulama hiyerarşisi; en çok hücre kapatanın kazanması kuralı.
* **Mikro-Adım 3.2:** 14 Kült Tema için `boards.ts` içine yeni tahtaların eklenmesi ve her hücrede en az 3 geçerli film olduğunun (Eksen Güvenliği) doğrulanması.

---

## 5. Faz 4: Neo-Noir Cine-HUD & Game Feel Revizyonu

Şartname Referansı: `NEO_NOIR_CINE_HUD_MASTER_SPEC.md` (SPEC-CINE-HUD-2026-V4)

* **Mikro-Adım 4.1 (Art Direction Lock & Design Tokens):**
  - *Amaç:* Merkezi CSS custom properties (`--cine-void`, `--optic-cyan`, `--iris-crimson`, `--kodak-amber`) tanımlanması; Tailwind tokenlarının senkronizasyonu.
  - *Etkilenecek Dosyalar:* `src/app/globals.css`, `tailwind.config.ts`.
  - *Bağımlılıklar:* Yok.
  - *Kabul Kriteri:* Kontrast ve renk semantiğinin tüm ekranlarda tutarlı olması; WCAG 2.1 AA uyumu.
  - *Test Gereksinimi:* CSS token ayrıştırma kontrolü.
  - *Regresyon Riski:* Düşük.

* **Mikro-Adım 4.2 (Static HUD & Semantic Board Layout):**
  - *Amaç:* 3x3 tahtanın mat 35mm film slaytlarına dönüştürülmesi; aşırı perforasyon gürültüsünün elenmesi; tipografik hiyerarşinin ve en az 96px dokunma alanlarının kurulması; kazanan 3'lü kombinasyonun görsel önceliğinin (`z-index: 30`) tanımlanması.
  - *Etkilenecek Dosyalar:* `src/features/gameplay/components/XoxBoard.tsx`, `src/features/gameplay/components/GameView.tsx`.
  - *Bağımlılıklar:* 4.1.
  - *Kabul Kriteri:* Film isimlerinin kristal netliğinde okunması; hücre sembollerinin P1 `[ + ]` ve P2 `[ ◎ ]` olarak SVG render edilmesi; ARIA etiketlerinin eksiksiz olması.
  - *Test Gereksinimi:* `modal-render.test.tsx` ve DOM snapshot testleri.
  - *Regresyon Riski:* Orta (`onCellClick` fonksiyon parametrelerinin korunması şart).

* **Mikro-Adım 4.3 (Motion System & Micro-Interactions):**
  - *Amaç:* `transform: scale(0.96)` içe göçme, `the-slam-stamp` (280ms, 1.06x overshoot), 120ms deklanşör flaşı ve `winning-beam` animasyonlarının keyframe entegrasyonu.
  - *Etkilenecek Dosyalar:* `src/app/globals.css`, `src/features/gameplay/components/XoxBoard.tsx`.
  - *Bağımlılıklar:* 4.2.
  - *Kabul Kriteri:* Bütün animasyonların sadece `transform` ve `opacity` ile çalışması (60 FPS); `prefers-reduced-motion` modunda anında geçiş sağlanması; zafer animasyonunun oyun durumunu geciktirmemesi.
  - *Test Gereksinimi:* Reduced-motion CSS kuralları ve animasyon süresi testleri.
  - *Regresyon Riski:* Düşük.

* **Mikro-Adım 4.4 (Audio & Haptics Synthesis Engine):**
  - *Amaç:* Web Audio API çok katmanlı transient tasarımı (1200Hz klik + 180Hz punch + 75Hz sub-bass) ve iOS Safari uyumlu fail-silent ses/haptik motorunun kurulması.
  - *Etkilenecek Dosyalar:* `src/utils/audio.ts`, `src/utils/haptics.ts`.
  - *Bağımlılıklar:* 4.1.
  - *Kabul Kriteri:* İlk kullanıcı hareketinde AudioContext'in açılması; sessiz modda sıfır CPU tüketimi; mobil hoparlörlerde tok darbenin duyulması.
  - *Test Gereksinimi:* AudioService birim testleri ve mute kontrol testleri.
  - *Regresyon Riski:* Düşük (Fail-silent try-catch izolasyonu).

* **Mikro-Adım 4.5 (Game Mode Integration & Timer Decoupling):**
  - *Amaç:* Shot Clock görselinin (`ShotClock.tsx`) oyun motorundan ayrılması (decoupling); Solo Bot, Pass & Play ve Günün Oyunu için mod bazlı zamanlayıcı profillerinin bağlanması.
  - *Etkilenecek Dosyalar:* `src/features/gameplay/components/ShotClock.tsx`, `src/features/gameplay/hooks/useGameSession.ts`.
  - *Bağımlılıklar:* 4.2, 4.4.
  - *Kabul Kriteri:* Pass & Play modunda sürenin opsiyonel olması; Günün XOX'unda ileri sayım yapılması; çok oyunculu modda istemci `setInterval`'ının otorite kabul edilmemesi.
  - *Test Gereksinimi:* `game-engine.test.ts` ve zaman aşımı geçiş testleri.
  - *Regresyon Riski:* Yüksek (Oyun motoru sıra değişim mantığı korunmalı).

* **Mikro-Adım 4.6 (QA, Accessibility & Mobile Performance):**
  - *Amaç:* 133 birim testin eksiksiz yeşil kalması, iOS Safari `100dvh` ve sanal klavye uyumluluğu, 60 FPS performans denetimi.
  - *Etkilenecek Dosyalar:* Tüm oyun görünümü.
  - *Bağımlılıklar:* 4.1 – 4.5.
  - *Kabul Kriteri:* `npm test` %100 başarılı; `npm run build` hatasız; layout thrashing sıfır.
  - *Test Gereksinimi:* Tam test süiti (`npm test`).
  - *Regresyon Riski:* Sıfır (Nihai kalite kapısı).

---

## 6. Faz 5: Çok Oyunculu (Multiplayer) Altyapısı

* **Mikro-Adım 5.1:** Ortak motor sınırları korunarak Supabase Realtime veya Firebase RTDB üzerinden sunucu otoritesine sahip oda ve senkron shot-clock sisteminin kurulması.
