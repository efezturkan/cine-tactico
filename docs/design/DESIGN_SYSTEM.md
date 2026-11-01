# CINE-XOX — DESIGN SYSTEM SPECIFICATION
**Tarih:** 1 Kasım 2026  
**Durum:** Palet kilitli. Ekranlar `docs/product/GAME_FEEL.md`.  
**Kapsam:** Renk Mimarisi, Tipografi Hiyerarşisi, Hareket & Animasyon İlkeleri, Görsel Bileşenler

---

## 1. Görsel Kimlik ve Bileşen Envanteri

| Bileşen | Dosya Yolu | Semantik Rolü | Renk & Tasarım Kuralı |
|---|---|---|---|
| **Ana Tahta (4x4 Matrix)** | `src/features/gameplay/components/XoxBoard.tsx` | 35mm film kurgu tablası ve kriter rozetleri. | `bg: #07080b`, `border: #1a1c24`, `amber: #d97706`. 4x4 matris (1 logo + 3 sütun + 3 satır + 9 hücre). |
| **Film Karesi (Hücre)** | `src/features/gameplay/components/XoxBoard.tsx` | Dolu film karesi, afiş, yıl, P1/P2 vizör rozeti. | P1: `#06b6d4` (Cyan Optic), P2: `#ff2a55` (Crimson Iris), Kilit: `bg-zinc-950`. |
| **Bekleme Ekranı (Lobi)** | `src/features/multiplayer/components/MatchmakingQueueModal.tsx` | Dönen 35mm altın film makarası ve geri sayım. | **Dokunulmaz Bileşen:** Kehribar çember (`#d97706`), altın göbek (`#f59e0b`). |
| **Zaman Sayacı (Shot Clock)** | `src/features/gameplay/components/ShotClock.tsx` | 12s Blitz satranç saati ve gerilim çubuğu. | Analog gerilim: Son 4 saniyede kırmızı nabız atışı (`#ef4444`). |
| **Arama Modalı** | `src/features/gameplay/components/MovieSearchModal.tsx` | Film ve aktör arama, IMDb/Rarity rozetleri. | `bg: #07080b`, `100dvh` mobil sanal klavye güvenliği. |
| **Lobi / Ana Menü** | `src/components/HomeScreen.tsx` | Perforasyonlu 35mm film şeridi kenarlıkları. | `bg: #07080b`, `card: #0e1018`, film şeridi delikleri. |
| **Sinefil Zevk Radarı** | `src/features/profile/components/TasteDnaCard.tsx` | Letterboxd estetiğinde kariyer ve tür analizi. | Kategori renkleri: Cyan (`#00e5ff`), Amber (`#ffb800`), Crimson (`#f43f5e`). |

---

## 2. Semantik Renk Sistemi (Tokens)

CINE-XOX renk sistemi üç ayrı katmandan oluşur ve asla birbiriyle karıştırılamaz:

1. **Katman A (Marka & Atmosfer):** 35mm kadife sinema salonu, kurgu masası metalik yüzeyleri ve Kodak kehribarı.
2. **Katman B (Rekabetçi Kimlik):** Oyuncu 1 (Cyan Optic) ve Oyuncu 2 (Crimson Iris).
3. **Katman C (Fonksiyonel Durum):** Başarı, hata, kilit, uyarı ve nötr durumlar.

| Semantik Token | Değer (HEX) | Semantik Rolü ve Kullanım Kuralları |
|---|---|---|
| `--cine-void` | `#07080B` | Ana canvas zemin rengi; derin film bazı siyahı, sıfır parlama. |
| `--cine-slate` | `#0E1018` | 35mm film karesi kartı ve kurgu masası tablası yüzeyi. |
| `--cine-surface-raised` | `#151822` | Modallar, yükseltilmiş kartlar ve hover durumları. |
| `--cine-border` | `#1A1C24` | 1px hassas ayırıcı çerçeve; arayüzü kalabalıklaştırmayan hava boşluğu. |
| `--cinema-red` | `#8B151B` | **Marka Rengi:** Kadife sinema perdesi bordosu (Logo ve marka anları). |
| `--cinema-amber` | `#D97706` | **Zaman & Gerilim:** Kodak 1970 film kehribarı. Blitz sayacı ve emülsiyon damgaları. |
| `--cinema-gold` | `#F59E0B` | **Ödül & Prestij:** Rarity puanı, kupa ve altın makara göbeği. |
| `--player-one` | `#06B6D4` | **Oyuncu 1:** Optic Cyan. Kamera netleme parantezleri `[ + ]` ve P1 hamleleri. |
| `--player-two` | `#FF2A55` | **Oyuncu 2:** Iris Crimson. Objektif diyafram halkası `[ ◎ ]` ve P2 hamleleri. |
| `--state-neutral-lock` | `#333B4A` | **Deadlock Kilit:** İki tarafın da bilemediği sahipsiz kilitli hücre (`LOCKED_NEUTRAL`). |
| `--state-error` | `#EF4444` | **Hata Uyarısı:** Yanlış film tahmini ve kritik son saniye uyarısı. |
| `--text-ivory` | `#F8FAFC` | **Birincil Metin:** Film başlıkları ve display metinler (16.5:1 kontrast). |
| `--text-muted` | `#94A3B8` | **İkincil Metin:** Vizyon yılı ve yönetmen künyesi (7.2:1 kontrast). |
| `--text-dim` | `#64748B` | **Teknik Metin:** KODAK 5219 ve perforasyon damgaları. |

---

## 3. Tipografi Hiyerarşisi

1. **Sinematik Başlık & Display (Editorial):**  
   - Film başlıkları, zafer mesajı, maç sonucu duyurusu.  
   - Karakter: Criterion Collection ve A24 yayınlarındaki gibi yüksek kontrastlı, sıkıştırılmış display tipografi. Eksiksiz Türkçe karakter desteği (Ç, Ğ, İ, Ö, Ş, Ü).
2. **Arayüz Tipografisi (Interface UI):**  
   - Butonlar, mod seçimleri, kriter etiketleri, arama listeleri, ayarlar.  
   - Font: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`.
3. **Teknik & Kronometrik (Monospace):**  
   - `KODAK 5219`, `FRAME #04`, `00:12` Blitz sayaçları, ELO puanı, Rarity `[+5]`.

---

## 4. Hareket & Animasyon Sistemi (Motion)

1. **60 FPS Donanım Garantisi:** Yalnızca `transform` ve `opacity` özellikleri anime edilir. Layout/Reflow tetikleyen `width`, `height`, `margin` ASLA anime edilmez.
2. **Kinetik Tokluk:** Her hamle analog bir darbe tokluğu (`the-slam-stamp`) hissettirir.
3. **Bloklamayan Zafer:** Zafer animasyonları oynarken oyun durumu (state) anında sonuçlanır; oyuncu efektin bitmesini beklemeden arayüzü kullanabilir.
4. **Erişilebilirlik:** `prefers-reduced-motion` modunda tüm transform ve scale hareketleri anında statik opaklık geçişine indirgenir.

### Keyframe Matrisi:
* **Tuş Yaylanması (`tap-scale`):** `100ms ease`: `:active { transform: scale(0.96); }`
* **Doğru Hamle (`the-slam-stamp`):** `280ms cubic-bezier(0.175, 0.885, 0.32, 1.275)`: `0%: scale(0.96) -> 60%: scale(1.06) -> 100%: scale(1.0)`
* **Deklanşör Flaşı (`shutter-flash`):** `120ms cubic-bezier(0, 0, 0.2, 1)`: `0%: opacity(0.85) -> 100%: opacity(0)`
* **Kazanma Işığı (`winning-beam`):** `450ms ease-out`: Kazanan 3'lü hat üzerinde parlama ve altın kontur.
