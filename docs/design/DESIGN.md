# CineXOX Tasarım Anayasası (v2 - Nihai Kilit)

CineXOX bir sinema oyunudur; form, panel, dashboard, SaaS veya "web uygulaması" hissi KESİNLİKLE barındırmaz.
Geliştirici veya tasarımcı değil, **yönetmen** gibi hissettirir. Ekranlar tek dilden konuşur: tek renk sistemi, tek buton, tek modal mantığı, tek ses tonu.

---

## 1. DİL VE TON

### 1.1 Ton: SEN Dili
Tüm kullanıcı metinleri doğrudan oyuncuya "sen" ile konuşur. "-sınız / -abilirsiniz / -ınız / -inizde" YASAK.
- "Cihazınızda kayıtlı" → "Cihazında kayıtlı"
- "yeniden başlatabilirsiniz" → "yeniden başlat"
Kısa, insan gibi, buyruk kipi. Robotik ve resmi cümle yok.

### 1.2 Nihai Sözlük

| Eski / Yanlış | Yeni / Onaylı |
|---|---|
| Lobi | Gişe |
| Arena, Masa, Aktif Masalar | Vizyondakiler (ekran adı), tek tek öğe: seans |
| Tahta, Matris | Kadraj |
| Maç, Oyun (bir tur için) | Düello |
| Maç geçmişi, Karşılaşmalar, Form şeridi | Arşiv |
| Tekrar oyna, Tekrar çek | Yeni çekim |
| Sıra sende | Hamle sende |
| Rakip çekiyor, Rakip düşünüyor | Rakip hamlede |
| Beraberlik | Kör kadraj (alt satır: "Berabere.") |
| Zafer | Kesin! |
| Mağlubiyet | Kurgu masasına dönüyoruz. |
| Profil | Sinefil Kartı |
| İstatistikler | Sinefil sicili |
| Özel Oda | Özel Gösterim (ekran), "Oda kur" / "Koda katıl" (seçenekler) |
| Onayla ve mühürle | Onayla |
| TAP TO SKIP | (kaldırıldı, doğal akış) |
| Kadraj kontrolü, Hedef kesişim · 35mm arama | (kaldırıldı, gereksiz etiket) |
| Host, Private, Blitz, BO1, BO3, MEDIUM, HARD | Kullanıcıya gösterilmez |
| Gizli/Açık, Turnuva | MVP'de yok (FLAGS arkasında) |

Parantezli İngilizce eklemeler YASAK ("Aksiyon", "Marvel", "Karakter × Karakter").

### 1.3 Durum Metinleri
- Rakip aranıyor: "Salon loş, rakip aranıyor…"
- Bağlantı koptu: "Bağlantı koptu, yeniden kuruluyor…"
- Çökme: "Makara koptu." / "Beklenmedik bir şey oldu. Seansı yeniden başlat."
- Çevrimdışı: "Projeksiyon odasına ulaşılamıyor. İnternetini kontrol et."
- Rakip ayrıldı: "Rakip salondan ayrıldı."
- Süre doldu: "Süre doldu, hamle kaçtı."
- Arşiv boş: "Arşivde henüz kayıt yok."
- Film arama boş: "Bu adla bir yapım bulamadık." + "Yazımı kontrol et."
- Günün Kadrası bitti: "Bugünün kadrajı çekildi. Yarın yeni bir tane var."
- Geçersiz kod: "Bu kodla açık bir salon bulunamadı." / "Salon dolu." / "Kodun süresi dolmuş."
- Boş isim (ortak oyuncu): "Bir isim yaz."
- Hatalı oyuncu: "Bu isim arşivde yok." / "Bu iki yapımda birlikte oynamamış."
- Düelloyu bırakma onayı: "Düelloyu bırakırsan yenilmiş sayılırsın." [Devam et] [Bırak]

---

## 2. TASARIM SİSTEMİ & BİLEŞEN STANDARTLARI

### 2.1 Renk Sistemi
Sabit inline renk yok, tek kaynak tokenlardır:
- Zemin: `#0B0D12` (varsayılan), yüzey `#14171D`, kart/ikincil `#181B22`
- Metin: `#E8E6E1`, soluk metin: `#8A8F9A`
- Altın (tek ana vurgu): `#D9A441`
- Muted mavi (sadece O oyuncusu ve rakip): `#4FA3C7`
- REC kırmızısı (sadece REC noktası ve hata): `#E5484D`
- Mod köşe vurguları: Klasik Düello (`#D9A441`), Ters Kadraj (`#5FB3A8`), Sinefil Konsept (`#9A8FD8`), Günün Kadrası (`#C9A27A`).

### 2.2 Tipografi
- Serif (Newsreader): Ekran başlıkları, afiş başlıkları, büyük anlar (Kesin!, AKSİYON!).
- Sans (Inter): Gövde metinleri, butonlar, sekmeler, filtre çipleri.
- Mono (JetBrains Mono): Sayaç, timecode, oda kodları, mikro etiketler ("35MM · 24 FPS").

### 2.3 Buton Sistemi (`Button.tsx`)
1. **Primary (`variant="primary"`)**: 52px yükseklik, 3px alt bevel (`border-b-[3px] border-[#a07420]`), altın zemin (`#D9A441`), siyah yazı, sans font-black, büyük harf.
2. **Secondary (`variant="secondary"`)**: 52px yükseklik, 1px sınır, `#181B22` zemin, bevel yok, beyaz yazı.
3. **Icon (`variant="icon"`)**: 44×44px dokunma alanı, 1px sınır, `#181B22` zemin, bevel yok.
4. **Inline (`variant="inline"`)**: 36px yükseklik, liste satırı ve çip içi.

### 2.4 Modal ve Ekran Mantığı (3 Tip Kuralı)
1. **Tam Ekran Sayfa**: Gişe, Vizyondakiler, Özel Gösterim, Sinefil Kartı. Alt gezinme çubuğu (`BottomNav`) sabit kalır.
2. **Alt Sheet (Bottom Sheet)**: Arama, Arşiv, Ayarlar, Salon Işığı, Avatar Seçici. `rounded-t-[24px]`, tepe sürükleme çubuğu, alttan açılır.
3. **Orta Kart (Alert / Confirmation)**: Düellodan çıkış onayı, Nasıl Oynanır rehberi, Hata ekranı ("Makara koptu.").

### 2.5 İmza Sinematik Öğeleri
- 35mm film şeridi perforasyonları (CSS tekrar deseni)
- Viewfinder vizör köşe işaretleri
- REC + timecode sayacı
- Klaket açılışı
- "Kesin!" anı

---

## 3. EKRAN MİMARİSİ

- **Gişe**: Tek odaklı hero düello alanı, altında 3 mod çipi, Günün Kadrası bilet kartı, üstte avatar/isim, seri ve ayarlar dişlisi.
- **Vizyondakiler**: 2 sütunlu afiş kataloğu, büyük serif başlıklar, soluk altın oklar `→`.
- **Özel Gösterim**: Tam ekran sayfa, "Oda kur" ve "Koda katıl" sekmeleri, 6 haneli kod kopyalama/paylaşma.
- **Sinefil Kartı**: Tam ekran sayfa, avatar seçici alt sheet, tek satır favori yönetmen, galibiyet/mağlubiyet/oran dökümü, Arşiv açılış satırı.
- **Kadraj (Oyun)**: REC + timecode, tek satır serif başlık, 44px 'X' butonu, SEN (X) vs RAKİP (O) şeridi, ortalanmış kadraj, 12s sayaç çubuğu (son 3s kırmızı), durum metni.
- **Sonuç**: "Kesin!" veya "Kurgu masasına dönüyoruz.", ortalanmış 3x3 `MiniKadrajPreview`, SEN / RAKİP / NADİRLİK özeti, "Yeni çekim" ve "Gişe'ye dön".
- **Ayarlar & Salon Işığı**: Ses, titreşim, Salon ışığı (Kadife, Analog, Gümüş, Gece mavisi), Nasıl oynanır, Gizlilik politikası, Kullanım koşulları.
