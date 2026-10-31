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

* **Mikro-Adım 4.1 (Tasarım Sistemi & CSS Motion Engine):** Neo-Noir renk tokenlarının (`cine-void`, `optic-cyan`, `iris-crimson`, `kodak-amber`) tanımlanması ve GPU hızlandırmalı CSS yaylanma/darbe animasyonlarının (`slam-stamp`, `sprocket-glow`, `tension-pulse`) `globals.css` içine eklenmesi.
* **Mikro-Adım 4.2 (35mm Hücre Anatomisi & Vizör HUD Simgeleri):** Hücrelerin 35mm KODAK film slaytına dönüştürülmesi; kaba harfler yerine P1 Cyan odak parantezleri `[ + ]` (`[ ✕ · P1 ]`) ve P2 Crimson diyafram halkası `[ ◎ ]` (`[ ◎ · P2 ]`) filigranlarının `XoxBoard.tsx` içine işlenmesi.
* **Mikro-Adım 4.3 (15s Eriyen Kehribar Gerilim Barı):** `ShotClock.tsx` içine son 4 saniyede projeksiyon ampul titremesi (*bulb flicker*) ve eriyen lineer gerilim barının bağlanması.
* **Mikro-Adım 4.4 (Akustik Tokluk & Haptik):** Dış MP3 paketi indirilmeden `audio.ts` Web Audio osilatörleriyle 80Hz analog mühür bası (*The Chess Thud of Cinema*) ve gerilim tıkının sentezlenmesi.
* **Mikro-Adım 4.5 (Mobil 100dvh & Sıfır Hata Doğrulaması):** Mobil sanal klavye açıkken `100dvh` responsive ekran koruması ve 77/77 testin yeşil kalmasının (`npm test` & `npm run build`) onaylanması.

---

## 6. Faz 5: Çok Oyunculu (Multiplayer) Altyapısı

* **Mikro-Adım 5.1:** Ortak motor sınırları korunarak Supabase Realtime veya Firebase RTDB üzerinden sunucu otoritesine sahip oda ve senkron shot-clock sisteminin kurulması.
