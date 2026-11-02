# CineXOX: Tur 6 → 9 Tek Paket v2 (ekran denetimi sonrası, MVP'yi kapatan iş)

Bu dosya `TUR_6-9_TEK_PAKET.md` dosyasının YERİNE geçer. Eski dosyayı arşive al, bunu uygula.
DESIGN.md ve MVP_SCOPE.md ile birlikte oku. Çakışmada sıra: bu dosya > DESIGN.md > MVP_SCOPE.md > eski dokümanlar.

---

## 0. ÇALIŞMA KURALLARI

**Amaç:** Baştan sona tek bir sinema oyunu hissi. Form, panel, dashboard, "web uygulaması" hissi kalmayacak. Ekranlar tek dilden konuşacak: tek renk sistemi, tek buton, tek modal mantığı, tek ses tonu.

**Sıra:** Tur 6 → Tur 7 → [DURAK 1] → Tur 8 → Tur 9 → [DURAK 2]. Her tur ayrı commit. Push yok, ben onaylayınca. DURAK 1'de dur, "devam" demeden Tur 8'e geçme.

**"Boşlukları akıllıca tamamla" ne demek:**
- YAPABİLİRSİN: Bir kuralı listedeki örnekle sınırlı bırakma, uygulamadaki AYNI hatayı taşıyan her yere uygula (aynı bileşen, aynı renk, aynı kelime, aynı desen). Eksik durumları tamamla (boş, yükleme, hata, çevrimdışı, ilk açılış). Kırık yerleşimi düzelt.
- YAPMA: Yeni mod, yeni özellik, yeni bağımlılık, yeni görsel/ses dosyası ekleme. Oyun mantığına (eşleşme, sıra, kazanma kontrolü, anti-cheat, arama verisi, test paketleri) dokunma.
- Bu dosyada olmayan ama bu dosyadaki bir kuralı ihlal eden bir yer görürsen: düzelt ve raporla. Yeni bir KARAR gerektiriyorsa dokunma, raporun sonundaki "Bulunan ama düzeltmediğim" listesine yaz.
- Emin değilsen en sade seçeneği seç, silme, FLAGS arkasında gizle, raporla.

**Silme kuralı:** Özellik silme, FLAGS arkasında gizle. İmza öğeleri korunur: film şeridi kenarı, viewfinder köşeleri, serif başlık, altın vurgu, REC + timecode, klaket, "Kesin!" anı.

**Her turun sonunda:** `npx tsc --noEmit` ve `npm test` çalıştır, son satırları rapora yapıştır. Yeşil değilse sonraki tura geçme.

**Rapor formatı (her tur):** tablo: Madde | Durum (Yapıldı / Kısmen / Atlandı) | Dosya | Not. Altına "Bulunan ama düzeltmediğim" listesi. Her tur için ilgili ekranların yeni ekran görüntülerini (390×844) al ve adlandır.

---

## 1. DİL VE TON (tüm kullanıcı metinleri)

### 1.1 Ton: SEN dili
Tüm metin "sen" ile konuşur. "-sınız / -abilirsiniz / -ınız / -inizde" YASAK.
- "Cihazınızda kayıtlı" → "Cihazında kayıtlı"
- "yeniden başlatabilirsiniz" → "yeniden başlat"
- Kısa, insan gibi, buyruk kipi. Robotik ve resmî cümle yok.

### 1.2 Nihai sözlük (DESIGN.md "Dil" bölümünün yerini alır)

| Eski / yanlış | Yeni |
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
| TAP TO SKIP | Geçmek için dokun |
| Kadraj kontrolü, Hedef kesişim · 35mm arama | (kaldır, etiket gereksiz) |
| Host, Private, Blitz, BO1, BO3, MEDIUM, HARD | Kullanıcıya gösterme |
| Gizli/Açık, Turnuva | MVP'de yok (FLAGS) |

Parantezli İngilizce eklemeler YASAK: "Aksiyon (Action)" → "Aksiyon", "Marvel (MCU)" → "Marvel", "Karakter × Karakter (Co-Stars)" → "Karakter × Karakter". Film adları özgün adıyla kalabilir. Tüm İngilizce kullanıcı metinlerini `grep` ile tara (IDENTITY, TAP TO SKIP, Co-Stars, Action, Private, Host, Blitz…), listele, çevir.

### 1.3 Durum metinleri
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

## 2. TASARIM SİSTEMİ SERTLEŞTİRME (Tur 6A, her şeyden önce)

Denetimde ekranlar arasında farklı bir "ağızdan" konuşan öğeler çıktı. Hepsi aşağıdaki tek sisteme çekilecek.

### 2.1 Renk (tek kaynak: tokenlar, kodda sabit hex yok)
`grep -rE "#[0-9a-fA-F]{3,8}"` ile tüm sabit renkleri tara, tokena çevir. Özellikle şunlar bulundu ve YASAK:
- İkinci, daha parlak turuncu-sarı (`#F5A623`, `#FFC107` ailesi): Özel Gösterim seçili satır, "Gizli" anahtarı, "SEÇ →" butonları, Arama modali. Hepsi altın token (`#D9A441`).
- Camgöbeği/cyan (Oda kodu, Blitz kartı, "Odaya Katıl" seçili çerçevesi, "Hedef kesişim" çipi).
- Açık mavi bevelli "Katıl" butonu. Mavi-gri "Onayla ve mühürle" butonu.
- Lacivert zeminli Arşiv modali (`#0F172A` / `#111827` benzeri). Zemin tokenlarını kullan.
- Parlak sarı ve parlak mavi mini kadraj kareleri (Arşiv).
- Oyun kadrajı başlıklarındaki mor, kırmızı, turuncu, camgöbeği etiket renkleri (TUR, EVREN, YÖNETMEN, BAŞROL). Hepsi soluk metin tokenı.
- Yeşil "+ Puan" metni (puan sistemi MVP'de yok).
İzinli renkler: altın (vurgu, X oyuncusu), soluk mavi `#4FA3C7` (sadece O oyuncusu ve rakip bilgisi), kırmızı `#E5484D` (sadece REC noktası ve hata), nötr tonlar. Mod atmosferi (Tur 8B) sadece köşe işareti ve etiket tonu için ek renk getirir. Mod afişlerinin zemin tonları (en fazla 4 soluk ton) izinli.

### 2.2 Tipografi
- Serif: ekran başlıkları, büyük anlar (Kesin!, AKSİYON!), afiş başlıkları, kart başlıkları.
- Sans (Inter): gövde, butonlar, sekmeler, filtre çipleri, liste satırları.
- Mono: sadece timecode, oda kodu, MAKARA numarası, tek mikro etiket. Filtre çipleri, "BAŞLAT →", sekme adları mono OLMAYACAK.
- Büyük harf: ana ve ikincil buton etiketleri, mono mikro etiketler. Başka yerde yok.
- Yasak: italik ağır sans başlık (Arşiv'deki "MAÇ GEÇMİŞİ" gibi), serif ve sans karışık buton yazısı (Hata ekranındaki "Seansı Yeniden Başlat" serif Title Case).
- Ekranda en fazla 3 yazı boyutu.

### 2.3 Buton sistemi (tek `Button` bileşeni)
- **Ana:** altın zemin, koyu yazı, büyük harf sans 700, yükseklik 52, 3 px alt kenar (tek bevel), basınca `scale(.97)`. Ekranda en fazla 1 tane. Sonuç ekranındaki düz altın buton ve Gişe/Özel Gösterim'deki bevelli buton AYNI stile gelir.
- **İkincil:** saydam zemin, 1 px çerçeve, aynı yükseklik, büyük harf.
- **Simge butonu:** 44×44, bevelsiz, 1 px çerçeve veya saydam. Ses, ayarlar, X (kapat), geri. Şu an bunlar kalın bevelli, hepsini düzelt.
- **Satır içi küçük buton:** (Paylaş, İncele, Kopyala) 36 px, ikincil stil, normal harf.
- Pasif görünüm: soluk altın (mavi-gri DEĞİL). Boş girişte tıklanırsa satır içi uyarı ver, butonu "ölü" bırakma.
- Parlama (glow) veya renkli gölge yok ("SEÇ →" butonlarında vardı).

### 2.4 Modal ve sayfa sistemi (tek mantık)
Şu an 6 farklı modal tarzı var. Üçe indir:
1. **Sayfa:** Alt sekmeli dört ana yer tam ekran sayfadır: Gişe, Vizyondakiler, Özel Gösterim, Sinefil Kartı. Özel Gösterim ve Sinefil Kartı şu an MODAL (alt sekme çubuğu kayboluyor, X ile kapanıyor). Sayfaya çevir, içeriği yeniden kullan, alt sekme çubuğu hep görünsün. Bu sayfalarda X yok.
2. **Alt sheet:** (film arama, ortak oyuncu, avatar seçici, Arşiv, Ayarlar, Salon ışığı, seans seçimi) ekranın altına yapışık, üst köşe 24 px, tutamaç çizgisi, en fazla `92dvh`, TEK iç kaydırma (iç içe kaydırma YASAK), klavye açılınca `visualViewport`'a göre yükseklik, üst güvenli alan. Kapat: sağ üst simge butonu + dışına dokun.
3. **Orta kart:** (Sonuç, Hata, onay diyaloğu, ilk açılış rehberi) ortada, film kenar delikleri ve köşe işaretleriyle.
Hepsinde aynı başlık düzeni: serif başlık sol/ortada, simge butonu sağda. Başlığın üstünde mikro etiket (CINE-XOX · IDENTITY, HEDEF KESİŞİM · 35MM ARAMA) YOK.

### 2.5 Metin kısaltma yasağı
Birincil metin "…" ile kesilmeyecek. Şu an kesilenler: Gişe hero açıklaması, Günün Kadrası açıklaması, afiş başlıkları ve açıklamaları, oyun üst bar başlığı, sonuç ekranı başlığı, Özel Gösterim seans listesi, avatar etiketleri, film arama sonuçları.
- Veride `displayTitle` (kısa görünen ad) kullan: ":" öncesi kısmı başlık, sonrası alt satır. "Auteur Savaşları: Nolan vs Tarantino vs Scorsese" → başlık "Auteur Savaşları", alt satır "Nolan · Tarantino · Scorsese". Üst bar ve sonuç ekranında sadece kısa ad ("DC vs Marvel").
- Başlık en fazla 2 satır, `text-wrap: balance`. Metin sığmıyorsa metni kısalt/yeniden yaz, "…" ile kesme.
- Tek istisna: arama kutusuna kullanıcının yazdığı metin.

### 2.6 Emoji ve ikonlar
Arayüzde emoji yok (⚔️ 🏆 🔍 ➕ 🍿 ve avatarlardaki 🎬🌟🕵️🚀🧐🍿🎥🏆). Tek tip çizgi ikon seti (mevcut kütüphane). Paylaşım metni emoji içerebilir.

### 2.7 Film şeridi kenarı ve gren (performans + marka)
- Perforasyon delikleri DOM düğümü olarak değil, tek CSS arka plan deseniyle (SVG data URI veya `repeating`) çizilsin. Opaklık ~0.18. Dikey "KODAK" yazısı → "35MM".
- Ekranların üstündeki ince altın gradyan çizgi: kaldır (veya düz 1 px).
- Arka planda zaten statik bir gren dokusu var. Bunu Salon ışığındaki "Hafif" gren yap, varsayılan Hafif olsun. Animasyonluysa statik yap.

### 2.8 Boşluk ve ritim
8 px ölçeği (8, 16, 24, 32, 48). Rastgele boşluk yok. Güvenli alan: üst `env(safe-area-inset-top)`, alt `env(safe-area-inset-bottom)`. Kaydırılan listelerde alt padding = sekme çubuğu + güvenli alan (son kart çubuğun altında kalmasın).

---

## TUR 6: Tasarım sistemi + oyun ekranı + veri

**6A.** Bölüm 1 ve 2'yi uygula (sözlük, sen dili, renk/tipografi/buton/modal sistemi temeli, kısaltma, emoji, perforasyon, gren). Önce tokenlar ve `Button`, sonra ekranlara dağıt.

**6B. Veri ve görseller**
1. `FLAGS.PLAYER_PHOTOS = false`: oyuncu fotoğrafı ve film afişi hiçbir yerde render edilmesin (kadraj başlıkları, arama sonuçları, kriter çipleri, Sinefil Kartı). Ağdan görsel çekilmesin. Kod ve veri silinmez.
2. Tüm oyuncu/yönetmen/tür/evren başlık hücreleri tek bileşen: ince çerçeveli KARE, serif baş harfler (tür ve evren için tek renk çizgi ikon), yüzey-2 zemin, altın %70 harf.
3. Satır/sütun etiketleri (TUR, EVREN, YÖNETMEN, BAŞROL) tek renk soluk metin, küçük. "BAŞROL" kaldır. Etiket sadece satır ve sütun farklı türdeyse görünsün.
4. KODAK/Criterion/Letterboxd/Netflix gibi marka adları kullanıcıya görünen hiçbir yerde olmasın. Alt etiket: "35MM · 24 FPS".

**6C. Oyun ekranı**
1. Üst bar: sol REC + timecode, orta kısa ad (`displayTitle`, tek satır), sağ simge butonu (X). Başlık X ile çakışmasın.
2. "KADRAJ KONTROLÜ · 35MM" hapını kaldır.
3. Dikey düzen (şu an üstte ~360 px, altta ~320 px boşluk var, kadraj optik merkezde değil):
   - Üst bar
   - Oyuncu şeridi: solda "SEN" (X, altın), sağda "RAKİP" (O, soluk mavi), ad tek satır, süre dolduğunda taraf vurgusu
   - Kadraj (esnek alan, dikey merkez)
   - Altta: 12 saniye süre çubuğu (ince, altın, boşalır, son 3 saniyede REC kırmızısına döner + hafif haptic) ve "Hamle sende / Rakip hamlede"
   Boşluğu bu bloklar arasında eşit dağıt.
4. Hücrelerdeki "+ SEÇ" hapı yerine tek soluk "+" simgesi.
5. Geri sayımdaki "TAP TO SKIP" → "Geçmek için dokun".
6. X'e basınca onay diyaloğu (bkz. 1.3). Süre çubuğu zaten varsa buna uydur.
7. Klaket, REC+timecode, geri sayım, "Kesin!" anı aynen korunur.

**6D. Film arama (alt sheet)**
1. Başlık etiketi yok. Üstte iki kriter çipi tek tip (nötr çerçeve), aralarında soluk "×". Sığmazsa alt alta, "×" ortada (şu an ikinci çip satır atlıyor, "×" yetim kalıyor).
2. Sonuç satırı: film simgesi karosu YOK. Özgün başlık + yıl (soluk). Tüm satır dokunulabilir, sağda soluk altın "→". "SEÇ →" butonları ve parlamaları kaldır. Aynı filmin iki adını (Türkçe + özgün) yan yana basma.
3. "198 sonuç" mono sayacını kaldır. "Yalnızca yapım adına göre aranır." küçük soluk metin kalsın. En az 2 karakterde liste.
4. Boş durum: "Bu adla bir yapım bulamadık." + "Yazımı kontrol et."
5. Klavye açıkken liste görünür ve kaydırılabilir.

**6E. Ortak oyuncu (Ters Kadraj, alt sheet)**
1. Etiket rengi mod rengi (Ters Kadraj soluk teal, bkz. 8B). Işıltı ikonunu kaldır. Film çipleri nötr.
2. Giriş: "Ortak oyuncunun adı". Buton: "ONAYLA" (ana, altın). Giriş boşken soluk altın, tıklanırsa "Bir isim yaz."
3. Hata/yanlış cevap metinleri bölüm 1.3'te.

---

## TUR 7: Sayfalar, sheet'ler ve ekran ekran düzeltmeler

**7A. Gişe**
1. Hero açıklaması tek satıra sığacak şekilde yaz: "Yönetmen veya tür ile oyuncunun ortak filmini bul." Sığmazsa iki satır, kesme yok.
2. Hero kartı iç boşluk: alt köşe işaretleri butona değmesin (buton ile köşe işareti arası en az 12 px, kart alt padding en az 28 px).
3. Mod çipleri alt etiketleri: Klasik Düello → "Yönetmen × Oyuncu", Ters Kadraj → "Film × Film", Sinefil Konsept → "Tema". Seçili çipin sağ üstündeki altın noktayı kaldır.
4. Günün Kadrası: "GÜNLÜK" rozetini kaldır, alt metin "Günde bir kadraj. Sonucunu paylaş." NO.xx tarihten gelsin (sabit "NO.01" olmasın). Oynandıysa durum: "Bugünün kadrajı çekildi." + sonuç özeti + "Paylaş".
5. Üst bar: seri sayısı pill'siz (alev ikonu + sayı). Ses ve ayar simge butonu stili (bevelsiz).
6. Dikey ritim: logo bloğu üstte, hero + modlar ortada, Günün Kadrası alt sekmenin üstünde sabit aralıkla. Eşitsiz büyük boşluklar kalmasın (logo-hero, hero-modlar, modlar-bilet arası şu an tutarsız).
7. Dişli → Ayarlar alt sheet'i (bkz. 9B).

**7B. Vizyondakiler**
1. "← GİŞE" geri okunu kaldır (alt sekme var). "17 AFİŞ" ve "CINE-XOX · 35MM" etiketlerini kaldır. Başlık serif ortada.
2. Filtre çipleri sans, normal harf; sağ kenarda yarım kesilen çip yerine yumuşak solma ve kaydırma ipucu.
3. Afiş: ikon dairesini kaldır. Üstte MAKARA no + (en fazla 1) rozet, ortada `displayTitle` büyük serif (28 px civarı), altta 1–2 satır açıklama, sağ altta küçük "→". "3×3 KADRAJ" ve "BAŞLAT →" yazılarını kaldır, tüm afiş dokunulabilir ve tek dokunuşla seans başlar. Başlık/açıklama kesilmez.
4. Rozetler tek set ve kısa (Auteur, Yıldızlar, Ters Köşe, Uzay ve Zaman, Tek Mekan, Yapay Zeka gibi mevcutları kısalmadan göster).
5. Raf başlığı ekleme. Filtre yeterli.

**7C. Özel Gösterim (artık SAYFA)**
1. Başlık serif "Özel Gösterim", altında "İki telefon, bir düello." Başlık üstünde mikro etiket/hap yok.
2. İki büyük seçenek (kart/buton): "Oda kur" ve "Koda katıl". Seçimde sayfa yüksekliği zıplamasın (şu an iki sekme modalın konumunu değiştiriyor).
3. **Oda kur:** Seçili seans tek satır (displayTitle + alt satır), yanında "Değiştir" → alt sheet'te seans listesi (tek tip satır, rozet yok, Orta/Zor yok). Oda kodu büyük mono, "Kopyala" ve "Davet linkini paylaş" (`navigator.share` varsa, yoksa panoya kopyala). Ana buton: "ODAYI AÇ". Bekleme: "Salon loş, rakip aranıyor…", kod, "Vazgeç".
4. **Koda katıl:** tek kod alanı, otomatik büyük harf, "CX-" öneki otomatik, yapıştırmayı kabul et, 6 karakter. Ana buton "KATIL". Hata metinleri 1.3'te.
5. Gizle (FLAGS): 8 kişilik turnuva, BO3, Gizli/Açık anahtarı, Blitz kartı, süre seçimi (süre sabit 12 sn), Zorluk rozeti.
6. Sayfa içinde iç içe kaydırma yok, emoji yok, cyan/mavi yok.
7. Alt açıklama: "Kodu arkadaşınla paylaş. İki telefon bağlanınca düello başlar. Süre 12 saniye."

**7D. Sinefil Kartı (artık SAYFA)**
1. Başlık serif "Sinefil Kartı". "CINE-XOX · IDENTITY" etiketi kalkar, X yok.
2. Avatar + kamera rozeti → avatar seçici alt sheet. Avatarlar 8 tek renk çizgi ikon (Klaket, Yıldız, Mercek, Roket, Dedektif, Mısır, Kamera, Kupa), etiketler tek kelime ve KESİLMEZ. Emoji yok. "🍿" yok.
3. İsim satırında kalem ikonu. "Seviye 1 · Bilet Kontrolörü". "Favori yönetmen" satırı dokunulabilir olduğunu gösterir (sağda küçük ok), alt çizgi yok.
4. Sinefil sicili: Galibiyet / Mağlubiyet / Oran. Yeni kullanıcıda 0 / 0 / "—" (oran %0 değil). Mağlubiyet sayısı kırmızı değil, soluk metin.
5. "Son 5 düello" başlığı (alt başlık "Form şeridi" kalkar). Dokununca Arşiv alt sheet'i açılır. Boşken "Henüz düello yok."
6. Ses ve Titreşim anahtarları BURADAN KALKAR, Ayarlar sheet'inde yaşar (aynı ayar iki yerde olmasın). Gişe'deki ses ikonu kısayol olarak kalır.
7. Hesap satırı: "Misafir hesabı. Cihazında kayıtlı." + ikincil buton "HESAP OLUŞTUR" ("Kaydet" belirsiz). Hesap varsa "Hesabı sil" (bkz. 9D).
8. Alt etiket "35MM · 24 FPS".

**7E. Arşiv (alt sheet, eski "Maç geçmişi" modali)**
Şu an uygulamanın dışından gelmiş gibi: italik ağır başlık, lacivert zemin, parlak sarı/mavi kareler.
1. Başlık serif "Arşiv", altında "Son düellolar".
2. Satır: sonuç etiketi ("Kesin!" altın / "Kurgu masası" soluk), kısa tarih ("3 Kas"), `displayTitle`, rakip adı, sağda mini kadraj (3×3 kare: X altın, O soluk mavi, boş yüzey-2). "Paylaş" ve "İncele" satır içi küçük butonlar.
3. "+ Puan" kaldır (FLAGS). Tüm renkler token.
4. Sahte rakip adları (Nolanist, Cinephile99) gerçek veri mi mock mu doğrula. Mock ise kaldır. Bot rakip için "Sinefil Botu" gibi sabit ad. İki satırdaki aynı mini kadraj verisi hatalı mı kontrol et.
5. Boş: "Arşivde henüz kayıt yok."

**7F. Sonuç ekranı (orta kart)**
1. Başlık altı `displayTitle`. Üstteki "CINE-XOX · 35MM" kalsın, alttaki mikro etiketi kaldır (tek mikro etiket).
2. İstatistikler: SEN (X) / RAKİP (O) / "NADİR SEÇİM". "Nadirlik" anlamı belirsiz. Gerçek veriden hesaplanıyorsa etiket "NADİR SEÇİM", hesaplanmıyorsa gizle.
3. Kayıp ekranında "Sen 3 kare, Rakip 1 kare" görünüyor, bu kazanan ekranla birebir aynı. Test verisi mi gerçek mi doğrula. Kaybeden tarafta rakip 3'lü hattı kurmuş olmalı.
4. Kadraj mini önizlemesi (Arşiv bileşeni) + ikincil "PAYLAŞ" (Günün Kadrası ile aynı paylaşım mantığı). Butonlar: "YENİ ÇEKİM" (ana), "GİŞE'YE DÖN" (ikincil).
5. Kör kadraj varyantı: başlık "Kör kadraj", alt satır "Berabere."

**7G. Hata ekranları**
1. İkiye ayır: Çökme (ErrorBoundary): "Makara koptu." + "Beklenmedik bir şey oldu. Seansı yeniden başlat." + ana buton "SEANSI YENİDEN BAŞLAT" (sans, büyük harf). Bağlantı: "Bağlantı koptu, yeniden kuruluyor…" (çökme metni bağlantıymış gibi davranmasın).
2. Uyarı üçgeni yerine tek renk makara/film ikonu. "Sizin/başlatabilirsiniz" gibi resmî dil yok.
3. Çevrimdışı durumu için aynı sade ekran/banner.

**[DURAK 1]** Burada dur. Tur 6 ve 7'nin raporunu ve yeni ekran görüntülerini ver. Ben onaylayana kadar Tur 8'e geçme.

---

## TUR 8: Salon ışığı + moda göre atmosfer + ışık huzmesi

Hedef görsel: Ekteki "Salon ışığı" sheet görseli. Yerleşimi, boşlukları, metinleri ona sadık uygula.

**8A. Salon ışığı (eski "Salon Işık Masası"nın küçültülmüş hali)**
1. Önce `git log -S "Salon Işık Masası" --all` ile eski bileşeni bul. Geri ALMA, yeniden yaz.
2. Yeri: Ayarlar sheet'inde "Salon ışığı" satırı. Dokununca alttan yarım ekran sheet, arkadaki ekran canlı değişir. "Sıfırla" ve "Tamam".
3. İçerik (sadece bunlar): 4 hazır ayar (Kadife varsayılan, Analog, Gümüş, Gece mavisi), "Loşluk" (0–60, varsayılan 25), "Projeksiyon" (0–100, varsayılan 65, Gişe huzme yoğunluğu, opaklık 0–0.14), "Gren" (Kapalı / Hafif, varsayılan Hafif).
   Zemin tonları: `#0B0D12`, `#120E0A`, `#0C0E12`, `#080D16`. Huzme renkleri: `#F2D9A0`, `#F0C27A`, `#D5DEE8`, `#A9CBEA`.
4. Hazır ayar sadece zemin ve huzme rengini değiştirir. Ana buton her zaman altın. Metin kontrastı en az 4.5. Köşe rengi seçici ve filigran YOK.
5. Teknik: kök elemanda `data-salon` + CSS değişkenleri. Kaydırıcılar tek CSS değişkenini günceller, React'i yeniden render ettirmez. Karartma düz siyah katman, blur/backdrop-filter yok. Gren statik doku. Tercih `localStorage`'da, try/catch içinde.
6. Emoji yok, renkli kaydırıcı yok.

**8B. Moda göre otomatik atmosfer (yeni ayar değil)**
Köşe işareti rengi ve mod etiketi tonu moddan gelir:
- Klasik Düello: altın `#D9A441`
- Ters Kadraj: soluk teal `#5FB3A8`
- Sinefil Konsept: soluk mor `#9A8FD8`
- Günün Kadrası: sepya `#C9A27A`
Ana buton ve vurgular hep altın. Salon hazır ayarı zemin ve huzmeyi, mod köşeyi belirler (çakışmaz). Ters Kadraj ve Konsept ekranlarında bulunan mavi/cyan etiketler bu tonlara geçsin.

**8C. Işık huzmesi (sadece Gişe)**
Tek statik katman (`clip-path` + düz renk veya `mask`), animasyon yok, blur yok. Yoğunluğu "Projeksiyon" belirler. `FLAGS.LIGHT_BEAM`.

**8D. Açılış ışık sızıntısı (isteğe bağlı, en son, 40 satırı geçerse ATLA)**
İlk açılışta tek seferlik 700 ms, kenardan giren sıcak ışık şeklinin fade ile kaybolması. `prefers-reduced-motion` açıkken yok. `FLAGS.OPENING_LEAK`. Kırmızı-mor neon, synthwave, Stranger Things tarzı geçiş YOK.

---

## TUR 9: Tüm uygulama süpürmesi, rehber, ayarlar, performans, kapanış

**9A. İlk açılış rehberi ("Nasıl oynanır")**
Yeni oyuncu kuralı bilmiyor (eski yardım butonu kaldırıldı). Orta kart, tek seferlik, 3 satır:
1. "Kadrajdaki iki kriterin kesiştiği filmi bul."
2. "Hamle için 12 saniyen var."
3. "Üç kareyi yan yana getir. Kesin!"
Buton "ANLADIM". Ayarlar'dan tekrar açılır. `localStorage` ile bir kez.

**9B. Ayarlar (Gişe dişlisi, alt sheet)**
Satırlar: Ses (anahtar), Titreşim (anahtar), Salon ışığı, Nasıl oynanır, Gizlilik politikası, Kullanım koşulları, Hakkında (sürüm + "Film verileri açık kaynaklardan derlenmiştir. CineXOX, adı geçen kişi, marka ve yapımlarla bağlantılı veya onaylı değildir."). Ayar başka yerde tekrar etmesin.

**9C. Günün Kadrası ve paylaşım**
Oynama, sonuç ve oynanmış durumunu aç ve doğrula. "Paylaş" çalışıyor mu: `navigator.share` varsa kullan, yoksa panoya kopyala ("Kopyalandı"). Paylaşım metni: oyun adı, kadraj numarası, kare dizilimi (emoji OLABİLİR), sonuç.

**9D. Mağaza hazırlığı (kontrol et, eksikse raporla, yeni özellik yazma)**
Gizlilik politikası ve koşullar bağlantıları çalışıyor mu, hesap oluşturma varsa hesabı silme yolu var mı, kullanıcı adı düzenleme var (uygunsuz isim riski), izinler (sadece titreşim), uygulama ikonu ve açılış ekranı marka adı içeriyor mu.

**9E. Ekran ve durum envanteri**
Ekranlar: Açılış, Rehber, Gişe, Vizyondakiler, Klaket geri sayımı, Oyun, Film arama, Ortak oyuncu, Sonuç (Kesin! / Kurgu masası / Kör kadraj), Özel Gösterim (oda kur, bekleme, koda katıl), Günün Kadrası (oynama, sonuç, oynanmış), Sinefil Kartı, Avatar seçici, Arşiv, Ayarlar, Salon ışığı.
Durumlar: ilk açılış, tekrar ziyaret, boş arşiv, yükleme, hata, çevrimdışı, rakip ayrıldı, süre doldu, rakip aranıyor (bota düşme dahil), Günün Kadrası zaten oynanmış, hatalı oda kodu.
Her biri için: sözlük, sen dili, tek odak, token renk, tek buton stili, tek modal tipi, kesilmiş metin yok, emoji yok. Eksik durum ekranını yaz.

**9F. Metin taraması**
`grep` ile eski kelimeleri tara (Lobi, Arena, Masa, Matris, Tahta, Maç, Tekrar çek, Sıra sende, Zafer, Mağlubiyet, İstatistik, Host, Private, Blitz, BO1, BO3, IDENTITY, TAP TO SKIP, Co-Stars, KODAK, Criterion, sınız/inizde/abilirsiniz). Sonucu listele, düzelt. Test beklentilerini güncelle (oyun mantığına dokunmadan).

**9G. Performans ve pil (sert kurallar)**
1. Maç dışında sürekli animasyon yok. REC nabzı sadece maç aktifken, sadece `opacity`/`transform`. Sekme gizliyken ve `prefers-reduced-motion` açıkken durur.
2. `backdrop-filter`, `filter: blur`, büyük `box-shadow`, gereksiz `will-change` tara, kaldır.
3. Perforasyon DOM düğümü değil CSS deseni (bölüm 2.7). DOM düğüm sayısını Gişe, Vizyondakiler, Oyun ekranında ölç, raporla.
4. Ağdan görsel/font inen var mı listele. Fontları yerel veya `font-display: swap`.
5. DevTools'ta 4x CPU throttle ile Gişe, Vizyondakiler, Oyun, Geri sayım, Sheet açılışı: takılan yeri düzelt.
6. Vizyondakiler listesinde gereksiz yeniden render olmasın (`useMemo`, stabil anahtar).
7. AudioContext ilk kullanıcı dokunuşundan önce başlatılmasın. Ses ve titreşim ayardan kapanıyor mu doğrula.

**9H. Boyut ve dokunma**
360, 390, 430 px: yatay taşma yok, metin kesilmiyor, dokunma hedefi ≥ 44 px, alt sekme çubuğu içeriği örtmüyor, sheet'ler küçük ekranda taşmıyor ve klavyeyle uyumlu.

**9I. Dokümanlar**
DESIGN.md "Dil" bölümünü bu dosyadaki sözlükle ve ton kuralıyla değiştir. DESIGN.md'ye Bölüm 2'yi (renk, tipografi, buton, modal sistemi) ekle. MVP_SCOPE.md "Bitti tanımı"nı aşağıdakilerle güncelle.

---

## RAPORLA AMA DOKUNMA (karar gerektiren)
Bunları düzeltme, "Bulunan ama düzeltmediğim" listesine ayrıntılı yaz:
1. Oyuncu adı eşleşme toleransı: "leo dicaprio", "Leonardo Di Caprio", "dicaprio", Türkçe karakter ve büyük/küçük harf (İ/I) kabul ediliyor mu.
2. Aktif oyun anı (hamle sırası, süre çubuğu, dolu hücre görünümü) ve Günün Kadrası ekranlarının ekran görüntüsü bu denetimde yoktu. Kendin çek, raporla.
3. Film verisinin kaynağı. TMDB kullanılıyorsa ticari kullanım için yazılı lisans gerekir, Wikidata/Wikimedia ise lisans/atıf durumu. Kaynağı ve lisansı yaz.
4. Kullanıcıya görünen marka adları: Marvel, DC, Oscar, Netflix, Letterboxd, Criterion, KODAK. Konumlarını listele.
5. Kullanıcı adı moderasyonu (serbest metin).
6. "Nadir seçim" metriğinin hesap yöntemi.
7. Sahte/mock veri (rakip adları, sabit istatistik) üretimde var mı.
8. Hesap oluşturma + hesap silme gereksinimi (mağaza kuralı).

## MVP SONRASI (şimdi yapma, dosyaya yazılı dursun)
Seviye ile açılan salonlar, paylaşım için görsel kart (resim), gerçek analog ses kayıtları, temel olay analitiği (ilk açılış, düello başlangıç/bitiş, Günün Kadrası, paylaşım) bağımlılık eklemeden önce onay, Letterboxd RSS, CDN ile veri parçalama, gerçek zamanlı eşleştirme havuzu ve ELO, lisanslı oyuncu fotoğrafı ve afiş, Wordle tarzı günün filmi, arkadaş listesi, sıralama.

---

## BİTTİ TANIMI (hepsini tek tek işaretle, yapılamayanı açıkça yaz)
- [ ] Hiçbir ekranda kesik metin ("…"), emoji, İngilizce metin, resmî "-sınız" dili yok
- [ ] Renkler tokenlardan geliyor, ikinci altın/cyan/açık mavi/lacivert/parlak sarı kalmadı
- [ ] Tek buton sistemi, tek modal mantığı (sayfa / alt sheet / orta kart), iç içe kaydırma yok
- [ ] Özel Gösterim ve Sinefil Kartı sayfa, alt sekme çubuğu hep görünüyor
- [ ] Oyuncu/yönetmen/tür hücreleri her yerde aynı baş harf karesi, fotoğraf ve afiş yok
- [ ] Marka adı (KODAK, Criterion, Letterboxd…) kullanıcıya görünmüyor
- [ ] Oyun ekranı dikey olarak dengeli, süre çubuğu ve rakip bilgisi var, X için onay var
- [ ] Vizyondakiler afişleri büyük serif başlıklı, boş üst alan, kesik başlık, "3×3 KADRAJ" tekrarı yok
- [ ] Arşiv ve Sonuç ekranı aynı mini kadraj bileşenini kullanıyor, Paylaş çalışıyor
- [ ] Rehber ilk açılışta çıkıyor, Ayarlar'dan tekrar açılıyor, ayarlar tek yerde
- [ ] Salon ışığı çalışıyor (4 hazır ayar, Loşluk, Projeksiyon, Gren), moda göre köşe rengi çalışıyor
- [ ] Günün Kadrası açılıyor, bitiyor, oynanmış durumu var, paylaşılıyor
- [ ] 360/390/430 px'te taşma yok, 4x CPU throttle'da takılma yok, sürekli animasyon yok
- [ ] `tsc` 0 hata, `npm test` yeşil, `npm run build` hatasız

**[DURAK 2]** Bitti listesini ve "Bulunan ama düzeltmediğim" listesini ver. Push için onayımı bekle.

Ek not: 5. Geri sayımdaki "TAP TO SKIP" metnini ve tıklayınca atlama davranışını tamamen kaldır; geri sayım kendi doğal süresinde tamamlanıp klakete geçsin.

Tıkandığın yerde varsayım yapma kafan karışırsa buraya geri dön. Kodu görmeden inanma, kodları oku kodları gör. Review yapmaktan çekinme, tahmin yürütme.
---

## EN SON KURAL
Bu dosyada yazmayan ama bu dosyadaki bir kuralı ihlal eden bir yer görürsen (aynı renk, aynı kelime, aynı bileşen, aynı ton), sormadan düzelt ve raporla. Yeni bir karar gerektiren bir şey görürsen dokunma, raporla.