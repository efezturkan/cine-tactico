# CINE-XOX — SESSION HANDOVER & MASTER ART DIRECTION SPEC
**Tarih:** 1 Kasım 2026  
**Durum:** ONAYLI & TEST EDİLMİŞ (133/133 Test Yeşil, Next.js 14 Build Başarılı)  
**Hedef Kitle:** Yeni Sohbette Devralacak Kıdemli Creative Director & Technical Lead  

---

# 1. YÖNETİCİ ÖZETİ & PROJE MEVCUT DURUMU

Bu doküman, CINE-XOX projesinde elde edilen onaylı görsel kimliği, mimari disiplini ve kullanıcının özel olarak beğendiği tüm görsel varlıkları eksiksiz bir şekilde yeni sohbete aktarmak üzere hazırlanmıştır.

* **Depo Sağlığı:** `git status` temiz.
* **Test Durumu:** `npm test` -> 9 test süiti, **133 / 133 test BAŞARILI** (yeşil).
* **Derleme Durumu:** `npm run build` -> Next.js 14.2.15 statik ve dinamik rota optimizasyonu **0 hata** ile tamamlanıyor.
* **Kritik Yapılandırma:** `tailwind.config.ts` içerisine `"./src/features/**/*.{js,ts,jsx,tsx,mdx}"` yolu kalıcı olarak işlendi.

---

# 2. ONAYLANAN SANAT YÖNETİMİ & GÖRSEL KİMLİK

### A. Temel Tasarım Felsefesi
CINE-XOX genel bir "siyah-kırmızı sinema teması" değildir. Aşağıdaki 4 referansın sentezidir:
1. **Chess.com:** Rekabetçi netlik, oyun durumu (game-state) okunabilirliği, sıfır dikkat dağıtıcı süsleme.
2. **Letterboxd:** Sinema kültürü, editorial tipografi, zevk ve prestij kimliği.
3. **Balatro:** Fiziksel ve kinetik tokluk, doyurucu dokunma hissi (slam-stamp).
4. **Leica & Kodak 35mm Analog Ekipman:** Mekanik hassasiyet, emülsiyon damgaları, ölçülü ve zarif teknik detaylar.

### B. Renk Sistemi (3 Katmanlı Mimari)
* **Katman A (Marka & Atmosfer - Velvet Screening Room):**
  - `--cine-void` (`#07080B`): Derin film bazı siyahı canvas.
  - `--cine-slate` (`#0E1018`): 35mm film karesi kartı ve kurgu masası tablası yüzeyi.
  - `--cine-border` (`#1A1C24`): 1px hassas ayırıcı çerçeve.
  - `--cinema-red` (`#8B151B`): Kadife sinema perdesi bordosu (Logo ve marka anları).
  - `--cinema-amber` (`#D97706`): Kodak 1970 film kehribarı. Zaman, gerilim ve emülsiyon detayları.
  - `--cinema-gold` (`#F59E0B`): Rarity puanı, prestij ve altın makara göbeği.
* **Katman B (Rekabetçi Kimlik):**
  - `--player-one` (`#06B6D4` - Optic Cyan): Kamera netleme parantezleri `[ + ]` ve P1 vizörü.
  - `--player-two` (`#FF2A55` - Iris Crimson): Objektif diyafram halkası `[ ◎ ]` ve P2 vizörü.
* **Katman C (Fonksiyonel Durum):**
  - `--state-neutral-lock` (`#333B4A`): İki tarafın da bilemediği sahipsiz kilitli hücre (`LOCKED_NEUTRAL`).
  - `--state-error` (`#EF4444`): Hata uyarısı ve kritik son saniye uyarısı.

---

# 3. KESİNLİKLE DOKUNULMAZ (UNTOUCHABLE) BİLEŞENLER

Aşağıdaki bileşenler kullanıcının bizzat onayladığı ve görselini çok beğendiği öğelerdir. Yeni sohbette **asla silinmeyecek, baştan yazılmayacak veya bozulmayacaktır**:

1. **`MatchmakingQueueModal.tsx` (Dönen Film Makarası):**
   - Dosya: `src/features/multiplayer/components/MatchmakingQueueModal.tsx`
   - Ortada dönen 35mm altın film makarası, perforasyon delikleri, ters dönen dış ve iç halkalar (`w-44 h-44` ve `w-36 h-36`).
   - Bu bileşenin hiyerarşisi, animasyon süreleri (`5s`, `14s`, `20s`) ve görsel dili kilitlidir.
2. **`ShotClock.tsx` (Sıra Göstergesi & Radar Animasyonu):**
   - Dosya: `src/features/gameplay/components/ShotClock.tsx`
   - Sıra kimdeyse (`SIRA OYUNCU X'DE` / `O'DA`), içte sürekli yanan neon çekirdek (`h-2 w-2 shadow-[0_0_8px]`) ve dışta sürekli dalgalanan `animate-ping` radarı birlikte çalışır. Asla kaybolmaz.
3. **4x4 Matris Düzeni (`XoxBoard.tsx`):**
   - Sol üstte Clapperboard logolu köşe rozeti.
   - Üstte 3 sütun kriter rozeti (baş harfli dairesel avatarlar, ödül ve tür ikonları).
   - Solda 3 satır kriter rozeti.
   - Ortada 9 adet 35mm film plakası hücresi (başlık, yıl, yönetmen, rarity rozeti ve P1/P2 vizör rozetleri).

---

# 4. ÜRETİLEN GÖRSEL KONSEPT ARŞİVİ

Mevcut sohbette üretilen ve tasarım kararlarına yön veren referans görsel varlıkları:
* `cine_xox_match_arena_mockup_1793486505423.jpg` (Oyun arenası ana kurgu)
* `cine_xox_leica_cineboard_final_1793485289038.jpg` (Leica analog kurgu masası estetiği)
* `cine_xox_chesscom_ui_concept_refined_1793485037300.jpg` (Chess.com okunabilirlik standardı)
* `cine_xox_concept_tiles_1793485776656.jpg` (35mm film karesi hücre detayları)

---

# 5. YENİ SOHBETE GİRERKEN KULLANILACAK AÇILIŞ PROMPT'U

Yeni sohbete başladığınızda aşağıdaki metni doğrudan yapıştırabilirsiniz:

```markdown
# CINE-XOX DEVAM PROMPT'U

Rol: Kıdemli Creative Director, Lead Game Designer, Technical Art Director ve Full-Stack Mühendisi.
Proje: CINE-XOX (Next.js 14, Tailwind CSS, Supabase, Web Audio API, TypeScript).

## KRİTİK KURALLAR & DİSİPLİN:
1. Projede sıfırdan tasarım YAPILMAYACAKTIR. Onaylanmış "Neo-Noir Cine-HUD / Leica 35mm Velvet Screening Room" tasarım dili ve `docs/design/DESIGN_SYSTEM.md` yürürlüktedir.
2. `MatchmakingQueueModal.tsx` içindeki dönen 35mm film makarası görseli ve animasyonu KESİNLİKLE DOKUNULMAZDIR (UNTOUCHABLE).
3. `ShotClock.tsx` içindeki çift katmanlı radar sıra animasyonu (`animate-ping` + solid neon çekirdek) korunacaktır.
4. `tailwind.config.ts` dosyasından `"./src/features/**/*.{js,ts,jsx,tsx,mdx}"` yolu ASLA silinmeyecektir.
5. 133 adet birim/entegrasyon testi mevcuttur ve her adımda `npm test` yeşil kalacaktır.
6. Kod yazmadan önce her adım küçük parçalar halinde sunulacak, benden onay alınmadan büyük ve kör değişiklikler yapılmayacaktır.

Önce `git status` ve `docs/design/DESIGN_SYSTEM.md` dosyasını incele, hazır olduğunu bildir.
```
