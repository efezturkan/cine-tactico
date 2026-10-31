# CINE-XOX — MASTER SPECIFICATION v3.0

### Nihai Oyun Tasarımı, Mekanikler, Kullanıcı Deneyimi ve Ürün Yol Haritası

**Doküman Durumu:** Projenin Değiştirilemez Ana Tasarım ve Mimari Anayasası  
**Ürün:** Cine-Tactico / CineXOX (FİLMSEL)  
**Platform Hedefi:** Web, iOS, Android (Capacitor Hibrit Native)  
**Oyun Türü:** Sinema Kültürü + Taktiksel Rekabet (XOX) + Sosyal Düello  
**Temel Yaklaşım:** Single Player (Bot) ve Multiplayer (Canlı/Lobi) Ortak Oyun Motoru  
**Tarih:** 31 Ekim 2026  

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

### Hamle Sistemi
- Oyuncular sırayla oynar.
- Her hamle için 15 saniye shot-clock bulunur.
- Oyuncu boş bir hücre seçer. Manuel cevap giriş alanı açılır.
- Oyuncu film adını yazar (otomatik tamamlama/öneri destekli).
- Sistem cevabı doğrular.
- **Doğru cevap:** Hücreyi oyuncuya kazandırır (X veya O damgası ve Rarity puanı yanar).
- **Yanlış cevap:** Hücre boş kalır ve sıra rakibe geçer. Yanlış cevap verilen hücre rakibe devredilmez.
- **Sahipsiz Hücre Emniyeti (Deadlock Prevention):** Her hücre için her iki oyuncunun da sırayla 1'er kez cevap deneme hakkı vardır. İki oyuncu da aynı hücrede yanlış cevap verirse, o hücre **SONUÇLANDIRILMIŞ VE SAHİPSİZ (KİLİTLİ)** olarak işaretlenir. Böylece sonsuz döngü engellenir.

### Kazanma Koşulu
- 8 kazanma hattından (3 yatay, 3 dikey, 2 çapraz) birini ilk tamamlayan oyuncu maçı ANINDA kazanır.
- 3'lü hat oluştuğunda oyun biter; hücre puanları ve rarity skorları bu galibiyeti geçersiz kılamaz.

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
- **Hazır oyuncu çipleri / butonları BULUNMAZ.**
- Çoktan seçmeli sistem KESİNLİKLE kullanılmaz.
- Oyuncu klavye ile aktörün adını **kendisi yazar**.
- Yazım toleransı ve alternatif isim doğrulaması (fuzzy matching) uygulanır.
- Klavye açıldığında tahta ve süre göstergesi görünür kalır.

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

### Sinematik Akış
1. Tahta kararır.
2. 35mm perde kapanış animasyonu oynar, haptic çift titreşim verir.
3. Altın film makarası çılgınca döner ve anons patlar: **"🚨 KİLİTLENME! ALTIN MAKARA DEVREDE!"**
4. Ortada tek bir ortak final sorusu açılır (Örn: *Quentin Tarantino × 1990'lar*).
5. İki oyuncunun 12 saniyelik buzzer-beater süresi başlar.

### Sonuç ve Foto-Finiş Kuralı
- İlk geçerli doğru cevabı gönderen oyuncu maçı anında kazanır.
- İki oyuncu da 12 saniyede cevap veremezse: Maç boyunca kazanılmış hücrelerin **toplam Rarity puanları** karşılaştırılır. Rarity puanı yüksek olan maçı çalar (**Foto-finiş**). Beraberlik oranı %0'dır.

---

# 4. SINGLE PLAYER & MULTIPLAYER ORTAK MİMARİSİ

- Tek oyun motoru (`rules.ts`, `validator.ts`) her iki deneyimi de yönetir.
- Bot Seviyeleri:
  - **Easy:** Yaygın popüler filmleri bilir, taktiksel hatalar yapar.
  - **Medium:** Kendi hattını kurar, rakibin 2'li hattını engeller.
  - **Cinephile:** Geniş kült film havuzu, daha nadir cevaplar.
- Bot maçları gerçek oyuncu istatistiklerinden ayrı tutulur.

---

# 5. DEĞİŞTİRİLEMEZ 15 ÜRÜN KARARI

1. Üç ana oyun modu korunur (Klasik, Ters Kadraj, Konsept).
2. Klasik Düello ve Sinefil Konsept 3'lü hat mantığını kullanır.
3. Yanlış cevap verilen hücre boş kalır (rakibe devredilmez).
4. İki oyuncu da bilemezse hücre sahipsiz kilitlenir (deadlock engellenir).
5. Rarity hücre puanını ve hatsız maç sonucunu doğrudan belirler.
6. 3'lü hat, rarity/puan üstünlüğünden daima önce gelir.
7. Ters Kadraj'da hazır oyuncu çipleri bulunmaz; oyuncu yazar.
8. Ters Kadraj manuel cevap girişine dayanır (15 saniye).
9. Ters Kadraj'da Altın Makara bulunmaz.
10. Altın Makara'da iki oyuncu da bilemezse Rarity puanı kazananı belirler.
11. Single Player ve Multiplayer ortak oyun motoruyla paralel geliştirilir.
12. İki deneyim tek bir doğruluk kaynağı kullanır.
13. Bot maçları gerçek oyuncu maçlarından ayrı istatistiklendirilir.
14. Kozmetik mağazası asla pay-to-win olamaz.
15. Rekabetçi maç sonuçları sunucu otoritesiyle doğrulanır.

---
**Belge Durumu:** Onaylandı & Kilitlendi.
