# CINE-XOX — MASTER SPECIFICATION v3.0

### Nihai Oyun Tasarımı, Mekanikler, Kullanıcı Deneyimi ve Ürün Yol Haritası

**Doküman Durumu:** Projenin Değiştirilemez Ana Tasarım ve Mimari Anayasası  
**Ürün:** Cine-Tactico / CineXOX (FİLMSEL)  
**Platform Hedefi:** Web, iOS, Android (Capacitor Hibrit Native)  
**Oyun Türü:** Sinema Kültürü + Taktiksel Rekabet (XOX) + Sosyal Düello  
**Temel Yaklaşım:** Single Player (Bot) ve Multiplayer (Canlı/Lobi) Ortak Oyun Motoru  
**Tarih:** 31 Ekim 2026 (FAZ 0 Mimari ve Kural Konsolidasyonu Eklenmiştir)  

---

# 0. ÜRÜN VİZYONU & KONUMLANDIRMA

CineXOX, oyuncuların sinema bilgisini kullanarak rakipleriyle mücadele ettiği, 3x3 oyun tahtası üzerinde doğru film ve oyuncu cevaplarıyla hücre kazandığı, nadir cevaplarla stratejik avantaj elde ettiği rekabetçi bir sinema oyunudur.

CineXOX klasik bir film bilgi yarışması değildir. Oyuncu yalnızca doğru filmi bulmaya çalışmaz; aynı zamanda:
- Rakibinin hamlelerini takip eder ve bloklar.
- Kendi kazanma hattını (3'lü hat) oluşturmaya çalışır.
- Rakibin kazanma ihtimalini engeller.
- Daha nadir ve kült cevaplar bulmaya çalışarak puan avantajı elde eder.
- 15 saniyelik süre baskısı altında karar verir.
- Sinema bilgisini rekabetçi bir avantaja dönüştürür.

## Ürün Konumlandırması & Slogan

> **"Filmleri bilmek yetmez. Rakibini de yenmelisin."**  
> **"9 KARE. 2 SİNEFİL. 1 KAZANAN."**

CineXOX, Letterboxd gibi sinema günlüğü ve film keşif ürünlerinin yerine geçmeye çalışmaz. Sinema kültürünü kısa süreli rekabet deneyimine dönüştüren bir "Gladyatör Arenası"dır.

---

# 1. TEMEL TASARIM İLKELERİ

1. **Deneyim Farkı:** Her oyun modu gerçekten farklı bir bilişsel oyun deneyimi sunmalıdır.
2. **Veri Güvencesi:** Oyuncunun doğru cevabı, veri tabanı eksikliği yüzünden reddedilmemelidir.
3. **Rekabet Paritesi:** Rekabetçi oyunlarda iki oyuncu tamamen aynı kurallara tabidir.
4. **Ortak Motor:** Single Player ve Multiplayer aynı doğrulama ve oyun kurallarını kullanır.
5. **Sıfır Pay-to-Win:** Satın alınan veya kazanılan kozmetikler asla rekabet avantajı sağlamaz.
6. **Şeffaf Skor:** Oyuncunun maç sonucu ve puanı her zaman matematiksel olarak açıklanabilir olmalıdır.
7. **Öğrenmesi Kolay, Ustalaşması Zor:** XOX basitliğinde başlar, sinefil derinliğinde ilerler.
8. **Sıfır Dağınıklık:** Gereksiz özellikler ana oyun deneyiminin önüne geçemez.
9. **Offline Desteği:** İnternet bağlantısı olmayan oyuncular tek oyunculu modları oynayabilmelidir.
10. **Doğrulanabilir Maç Kaydı:** Her rekabetçi maç, doğrulanabilir bir oyun durumuna sahiptir.

---

# 2. OYUN MODLARI & KURALLAR

Üç ana mod bulunur:

| Mod | Temel Yetenek | Ana Rekabet |
|---|---|---|
| **1. Klasik Düello** | Sinema bilgisi + XOX Stratejisi | 3'lü Hat (Yatay/Dikey/Çapraz) |
| **2. Ters Kadraj** | Oyuncu ve film hafızası (Hızlı Aktör) | En Çok Hücre Kapatan |
| **3. Sinefil Konsept** | 14 Kült Tema ve sinema kültürü | 3'lü Hat (Yatay/Dikey/Çapraz) |

---

## 2.1 KLASİK DÜELLO (Ana Oyun Modu)

### Tahta Yapısı
3x3 toplam 9 hücre. Satırlar ve sütunlar birbirinden bağımsız kriterler içerir (Yönetmen, Oyuncu, Tür, Dönem, Oscar, vb.).  
*Örnek:* Christopher Nolan × Leonardo DiCaprio = *Inception*.

### Hamle Sistemi & Hak Modeli
- Oyuncular sırayla oynar.
- Her hamle için 15 saniye shot-clock bulunur.
- Oyuncu boş bir hücre seçer. Manuel cevap giriş alanı açılır.
- Oyuncu film adını yazar (otomatik tamamlama/öneri destekli).
- Sistem cevabı doğrular.
- **Doğru cevap:** Hücreyi oyuncuya kazandırır (X veya O damgası ve Rarity puanı mühürlenir). Hücre bir kez kazanıldıktan sonra asla çalınamaz veya değiştirilemez (**Kare Çalma / Cell Stealing iptal edilmiştir**).
- **Yanlış cevap:** Hücre boş kalır ve sıra rakibe geçer. Yanlış cevap verilen hücre rakibe devredilmez; ancak yanlış yapan oyuncunun o hücredeki **deneme hakkı tükenir** (`attempts[player] = true`).
- **Zaman Aşımı (Shot-Clock Timeout):** 15 saniye dolduğunda geçerli hamle yapılmamışsa, bu durum 1 yanlış deneme hakkı olarak sayılır ve sıra rakibe geçer.
- **Sahipsiz Hücre Emniyeti (Deadlock Prevention):** Her hücre için her iki oyuncunun da sırayla 1'er kez cevap deneme hakkı vardır. İki oyuncu da aynı hücrede yanlış cevap verirse veya süresini tüketirse, o hücre **SONUÇLANDIRILMIŞ VE SAHİPSİZ / KİLİTLİ (`LOCKED_NEUTRAL`)** olarak işaretlenir. Hücre karartılır, asma kilit simgesi alır ve o maç için kapatılır. Böylece sonsuz döngü engellenir.
- **Film Tekrar Kullanım Yasağı:** Bir maç boyunca herhangi bir hücrede kullanılmış bir film, başka bir hücrede tekrar kullanılamaz; girilirse hatalı hamle sayılır.

### Kazanma Koşulu
- 8 kazanma hattından (3 yatay, 3 dikey, 2 çapraz) birini ilk tamamlayan oyuncu maçı ANINDA kazanır.
- 3'lü hat oluştuğunda oyun biter; hücre puanları ve rarity skorları bu galibiyeti **ASLA GEÇERSİZ KILAMAZ** (Spec v3 Madde 80 & Madde 199).

### Tahta Sonuçlandığında (Altın Makara)
9 hücrenin tamamı kazanılmış veya sahipsiz kalmışsa ve 3'lü hat oluşmamışsa **Altın Makara (Sudden Death)** devreye girer.

---

## 2.2 RARITY SİSTEMİ (Puanlama & Galibiyet Modeli)

Rarity, CineXOX'un en önemli stratejik mekaniklerinden biridir. Yalnızca görsel bir süs değildir; hücre puanına ve maç sonucuna doğrudan etki eder.

### Puan Modeli
Her doğru hücre için temel puan: **10 puan**  
Nadirlik Bonusu:

| Cevap Sıklığı | Rarity Seviyesi | Bonus Puan | Toplam Hücre Değeri |
|---|---|---|---|
| Çok Yaygın | Common | +0 | 10 Puan |
| Yaygın | Uncommon | +2 | 12 Puan |
| Nadir | Rare | +5 | 15 Puan |
| Çok Nadir | Epic | +8 | 18 Puan |
| Olağanüstü Nadir | Legendary | +12 | 22 Puan |

*Örnek:*
- *Inception*: 10 puan (Common)
- *The Prestige*: 15 puan (Rare)
- *Following*: 22 puan (Legendary)

### Hesaplama İlkesi ve Güvenlik (Anti-Inflation)
- **Film Başına Sabit Rarity Yasaktır:** Bir film bir kesişimde popüler iken başka bir kesişimde çok nadirdir. Rarity, ilgili hücrenin (satır × sütun) geçerli çözüm havuzu içindeki bilinirlik sırasına göre hesaplanır.
- **Yetersiz Veri Havuzu Koruması:** Eğer bir hücrenin toplam geçerli film sayısı $N < 3$ ise veya veri havuzu yetersizse, sisteme rastgele **Legendary üretme yasağı** getirilmiştir. Bu tür kısıtlı hücrelerde tavan seviye **Rare (+5)** ile sınırlandırılır.

### Maç Sonucuna Etkisi
1. Kazanılan her hücrenin toplam puanını yükseltir.
2. **3'lü hat çıkmayan maçlarda toplam puan kazananı belirler.**  
*(Önemli: 3'lü hat ile kazanılmış bir maçta rakibin toplam rarity puanının yüksek olması galibiyeti asla değiştiremez).*

---

## 2.3 TERS KADRAJ (Ortak Oyuncu / Co-Star Ajanı)

En hızlı ve viral potansiyeli en yüksek oyun modu.  
Oyuncuya iki film gösterilir. Görevi, **bu iki filmde ortak olarak yer alan bir oyuncuyu bulmaktır.**  
*Örnek:* *Inception* × *The Dark Knight Rises* $\rightarrow$ Ortak: *Tom Hardy*, *Cillian Murphy*, *Marion Cotillard*, *Michael Caine*.

### Cevap Sistemi (Manuel Hatırlama İlkesi)
- **Hazır oyuncu çipleri / butonları BULUNMAZ.** Çoktan seçmeli sistem KESİNLİKLE kullanılmaz.
- Oyuncu klavye ile aktörün adını **kendisi yazar**.
- **Doğrulama Hiyerarşisi:**
  1. Önce normalize edilmiş tam isim eşleşmesi (`normalize(input) === normalize(target)`).
  2. Eşleşmezse tescilli takma ad (alias) kontrolü (`"Leo DiCaprio"` $\rightarrow$ `"Leonardo DiCaprio"`).
  3. Son çare olarak 6+ karakterli isimlerde kontrollü 1 harf yazım hatası toleransı (fuzzy-matching). Belirsiz veya çoklu eşleşmeler otomatik kabul edilmez.
- **Klavye Açıldığında Ekran Koruması:** Klavye açıldığında tahta ve shot-clock göstergesi görünür kalır (modern `100dvh` ve dinamik ölçekleme ile).

### Hamle ve Kazanma Koşulları
- Sırayla 15 saniye shot-clock.
- **Bu modda 3'lü hat zorunlu DEĞİLDİR.**
- 9 hücre tamamlandığında **en fazla hücreyi kazanan oyuncu** maçı kazanır.
- Eşit hücre sayısında (örn: 4-4 ve 1 sahipsiz) **toplam rarity puanı** karşılaştırılır.
- Rarity eşitliğinde toplam doğru cevap süresi değerlendirilir.
- **Ters Kadraj'da Altın Makara KULLANILMAZ.** Modun yüksek temposu korunur.

---

## 2.4 SİNEFİL KONSEPT (14 Kült Tema Düellosu)

Sinema kültürü ve tematik bilgi odaklı mod. Satır ve sütunlarda doğrudan kült temalar yarışır.  
*Örnek:* *Plot Twist* × *Leonardo DiCaprio* = *Shutter Island*.

### 14 Kült Tema Havuzu
1. **Plot Twist (Ters Köşe)**
2. **Whodunnit (Katil Kim?)**
3. **Zaman Yolculuğu**
4. **Doğrusal Olmayan Kurgu**
5. **Tek Mekan (Single Location)**
6. **Büyük Soygun (Heist)**
7. **İntikam (Revenge)**
8. **Tek Başına Hayatta Kalma (Survival)**
9. **Karanlık Gelecek (Distopya)**
10. **Derin Uzay (Space Odyssey)**
11. **Yapay Zekâ (AI & Tech)**
12. **Neo-Noir (Karanlık Şehir)**
13. **"Literally Me" (Yabancılaşmış Anti-Kahraman)**
14. **Kült Gişe Fiyaskosu (Flop)**

### Kurallar
Klasik Düello ile tamamen aynı XOX kuralları geçerlidir: 15 saniye, sıralı hamle, 3'lü hat ile anında galibiyet, 3'lü hat çıkmazsa Altın Makara.

---

# 3. İMZA MEKANİK: "ALTIN MAKARA" (SUDDEN DEATH)

Klasik Düello ve Sinefil Konsept modlarında 9 hücre sonuçlandığı halde 3'lü hat çıkmamışsa devreye girer.

### Sinematik Akış ve Durum Makinesi
```
                  [9 Hücre Sonuçlandı]
                            │
              3'lü Hat Tamamlandı mı?
                 ├─── EVET ───> [Normal Galibiyet İlanı]
                 │
                HAYIR
                 │
                 ▼
     [🚨 KİLİTLENME! ALTIN MAKARA DEVREDE!]
  (Tahta kararır, 35mm perde kapanış animasyonu, çift haptic)
                 │
                 ▼
  [Ortak Final Sorusu Açılır (Tek Kesişim)]
       (12 Saniyelik Buzzer-Beater)
                 │
       ┌─────────┴─────────┐
       ▼                   ▼
[İlk Geçerli Cevap]  [12s Süre Doldu / İki Taraf da Bilemedi]
       │                   │
[ANINDA GALİBİYET]         ▼
                     [🏁 FOTO-FİNİŞ]
              (Maç boyu kazanılan hücrelerin
               toplam Rarity puanları kıyaslanır)
                           │
              Yüksek Rarity Puanı Olan Kazanır!
```

### Sonuç ve Foto-Finiş Kuralı
- İlk geçerli doğru cevabı gönderen oyuncu maçı anında kazanır.
- İki oyuncu da 12 saniyede cevap veremezse: Maç boyunca kazanılmış hücrelerin **toplam Rarity puanları** karşılaştırılır. Rarity puanı yüksek olan maçı çalar (**Foto-finiş**). Beraberlik oranı %0'dır.

---

# 4. SINGLE PLAYER & MULTIPLAYER ORTAK MİMARİSİ

- Tek oyun motoru (`rules.ts`, `validator.ts`) her iki deneyimi de yönetir. Motor UI'dan ve ağdan tamamen izole deterministik saf fonksiyonlardan oluşur.
- **Bot Seviyeleri:**
  - **Easy:** Yaygın popüler filmleri bilir, taktiksel hatalar yapar.
  - **Medium:** Kendi hattını kurar, rakibin 2'li hattını engeller.
  - **Cinephile (Hard):** Geniş kült film havuzu, daha nadir cevaplar.
- Bot maçları gerçek oyuncu istatistiklerinden ayrı tutulur.
- **Multiplayer Geçiş Sınırları:** 
  - İlk aşamada Single Player (Bot) ve Pass & Play (Aynı Cihazda İki Kişi) modları %100 offline olarak tamamlanacaktır.
  - Gerçek bir backend seçilip bağlanmadan sahte "çevrimiçi oda açıldı" illüzyonlarına izin verilmez.
  - Çok oyunculu modlar sunucu tarafı otorite (Server-Authoritative State, senkron shot-clock deadline, 30s reconnect grace period) ile Faz 5'te hayata geçirilecektir.

---

# 5. NEO-NOIR CINE-HUD TASARIM SİSTEMİ (ÖZET ŞARTNAME)

*Tam teknik detaylar, hareket eğrileri ve akustik spesifikasyon için [NEO_NOIR_CINE_HUD_MASTER_SPEC.md](file:///Users/efe/.gemini/antigravity/brain/20c8c16d-e8b6-4450-a72f-391921098fc9/NEO_NOIR_CINE_HUD_MASTER_SPEC.md) belgesi esastır.*

Oyun, Letterboxd tipografik asaleti, ARRI/RED yönetmen monitörü HUD disiplini ve Chess.com'un gözü dinlendiren mat zemin sadeliğini birleştiren 35mm analog sinema arcade kimliği taşır.

### 5.1 Renk Paleti ve Tasarım Tokenları (Centralized Tokens)
- `cine-void` (`#0D0F12`): Derin mat antrasit zemin; OLED siyahı, yansıma yapmaz, gözü dinlendirir.
- `cine-slate` (`#15181E`): Kurgu masası tablası ve hücre kartı gövdesi.
- `cine-border` (`#232834`): İnce 1px çerçeve ve vizör kılcalları.
- `optic-cyan` (`#00E5FF`): Oyuncu 1 odak rengi; kamera netleme parantezleri `[ + ]` ve `[ + · P1 ]` damgası.
- `iris-crimson` (`#FF2A55`): Oyuncu 2 diyafram rengi; objektif diyafram halkası `[ ◎ ]` ve `[ ◎ · P2 ]` damgası.
- `kodak-amber` (`#FFB800`): 35mm emülsiyon damgası (`KODAK 5219`), dinamik gerilim barı ve Rarity altını.
- `deadlock-steel` (`#333B4A`): Kilitli sahipsiz hücre kaplama rengi (`LOCKED_NEUTRAL`).
- `text-ivory` (`#F1F5F9`) / `text-muted` (`#94A3B8`): 16.5:1 kontrastlı Criterion tarzı kristal metin hiyerarşisi.

### 5.2 Görsel Hiyerarşi ve Hücre Anatomisi
- **Perforasyon Kuralı:** Görsel gürültüyü önlemek için 35mm perforasyon delikleri her karede kontrolsüzce kullanılmaz; sadece tahtanın dış çerçevesinde ve doğru bilinip açılan hücrelerin kenarlarında mühür olarak yer alır.
- **Kazanan Hat Önceliği:** 3'lü kombinasyon oluştuğunda kazanan 3 kare altın ışık huzmesiyle birbirine bağlanır (`z-index: 30`); diğer hücreler `opacity: 0.45` seviyesine çekilerek şampiyon hamle öne çıkarılır.
- **Neon Disiplini:** Sürekli açık kalan statik neon glow yasaktır; neon vurgular yalnızca hamle anı (280ms) ve son saniye geriliminde reaktif olarak yanar.

### 5.3 Mod Bazlı Zaman Yönetimi (Decoupled Shot-Clock)
- **Ranked Blitz:** 15s katı shot-clock (Sunucu otoriter deadline).
- **Solo Bot:** Esnek zamanlayıcı (Süresiz / 15s / 30s seçenekli).
- **Pass & Play:** 30s veya Süresiz (Cihaz el değiştirme süresi).
- **Günün Cine-XOX'u:** Tur düşmesi olmayan skor odaklı ileri kronometre (Stopwatch).
- **Katman Ayrımı:** `ShotClock.tsx` sadece sunum katmanıdır; oyun motoru zamanı epoch ms olarak bağımsız yönetir.

### 5.4 Hareket ve Akustik Mimarisi
- **GPU Hızlandırmalı Kinetik:** `transform: scale(0.96)` dokunma tepkisi, `the-slam-stamp` (280ms, 1.06x overshoot) ve 120ms flaş. `prefers-reduced-motion` tam uyumluluğu.
- **Çok Harmonikli Ses (Multi-Harmonic Layering):** Mobil hoparlörlerin bas kaybını telafi etmek için 1200Hz transient klik, 180Hz gövde darbesi ve 75Hz sub-bas katmanlı sentezi.
- **Fail-Silent Audio & Haptic:** Web Audio kilidi ilk kullanıcı dokunuşunda açılır; ses veya titreşim hataları oyun durumunu asla kesintiye uğratmaz.

---

# 6. DEĞİŞTİRİLEMEZ 15 ÜRÜN KARARI

1. Üç ana oyun modu korunur (Klasik, Ters Kadraj, Konsept).
2. Klasik Düello ve Sinefil Konsept 3'lü hat mantığını kullanır.
3. Yanlış cevap verilen hücre boş kalır (rakibe devredilmez, kare çalınamaz).
4. İki oyuncu da bilemezse hücre sahipsiz kilitlenir (`LOCKED_NEUTRAL`, deadlock engellenir).
5. Rarity hücre puanını ve hatsız maç sonucunu doğrudan belirler; film başına sabit olamaz.
6. 3'lü hat, rarity/puan üstünlüğünden daima önce gelir.
7. Ters Kadraj'da hazır oyuncu çipleri bulunmaz; oyuncu klavyeyle yazar.
8. Ters Kadraj manuel cevap girişine dayanır (15 saniye, kontrollü normalizasyon).
9. Ters Kadraj'da Altın Makara bulunmaz.
10. Altın Makara'da iki oyuncu da bilemezse Rarity puanı kazananı belirler (Foto-Finiş).
11. Single Player ve Multiplayer ortak oyun motoruyla geliştirilir.
12. İki deneyim tek bir doğruluk kaynağı kullanır.
13. Bot maçları gerçek oyuncu maçlarından ayrı istatistiklendirilir.
14. Kozmetik mağazası asla pay-to-win olamaz.
15. Rekabetçi maç sonuçları sunucu otoritesiyle doğrulanır; sahte multiplayer illüzyonu kurulamaz.

---
**Belge Durumu:** v3.0 Onaylandı & Kilitlendi.
