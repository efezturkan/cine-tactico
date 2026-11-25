# Crosscut — App Store Gönderim Paketi (v1.0)

Bu belge, uygulamayı Apple'a gönderirken **kopyalayıp yapıştıracağın her şeyi** ve **senin onaylaman gereken adımları** içerir. Kod tarafı hazırdır; kalanlar Apple hesabına bağlı işlerdir.

---

## 0. Yol (26 Kasım 2026): sırayla, kim ne yapar

Kod kapısı kapalı: `tsc` temiz, `npm test` 0 hata (26 Kasım), gizlilik/destek adresleri HTTP 200. Aşağıda "Sen" yazan adımları ben yapamam: ödeme, kimlik doğrulama, sözleşme kabulü ve parola/2FA bende olamaz.

| # | Adım | Kim | Çıkış kriteri |
|---|---|---|---|
| 1 | **Ad kararı: KARAR VERİLDİ, Crosscut ile devam (26 Kasım).** Gerekçe: WIPO kayıtlarında oyun/yazılım için çakışma yok, canlı sınıf 41 kaydı yalnızca haber hizmeti (bölüm H). Ad değişikliği gerekirse mağaza adı sonradan değişir, Bundle ID kalıcıdır ve ada uymak zorunda değil. İstersen TÜRKPATENT'i elle de tara | Tamam | Karar yazıldı |
| 1b | **Vercel'i güncelle (ŞART, yapılmadı).** Canlı site 24 Kasım'dan kalma eski derleme: başlık "CINE-XOX", gizlilik ve destek sayfaları hâlâ "Cine-XOX" diyor, `llms.txt` ve yeni marka yok. App Store'daki gizlilik adresi bunu gösterecek, ad uyuşmazlığı inceleme riski. Yol: `release/round-2` → `main` birleştirme + push (Vercel GitHub'dan dağıtır) veya `vercel --prod`. İkisi de dışa açık ve geri alması zor işlem, **senin onayınla** yaparım | Sen onaylarsın, ben yaparım | Canlı `/privacy` sayfasında "Crosscut" |
| 2 | **Apple Developer Program** (bireysel, 99 USD/yıl): developer.apple.com/programs → Apple Kimliği + 2FA, iPhone'daki "Apple Developer" uygulamasıyla kimlik doğrulama, ödeme. Onay saatler-günler sürebilir | Sen | Hesapta "Team ID" görünüyor |
| 3 | App Store Connect: Business → sözleşmeleri kabul et (Free Apps). Apps → + → New App: iOS, ad, birincil dil İngilizce (ABD), Bundle ID, SKU `crosscut-ios-1` | Sen | Uygulama kaydı oluştu |
| 4 | Xcode → Settings → Accounts → Apple Kimliğin; `ios/App/App.xcodeproj` → App → Signing & Capabilities → Team seç | Sen | İmza hatasız |
| 5 | Bana "Team seçildi" yaz. Ben: `npm run build:ios`, sürüm/build numarası kontrolü, `xcodebuild archive` (imzalı), doğrulama | Ben | Arşiv hatasız |
| 6 | Xcode Organizer → Distribute App → App Store Connect → Upload (parola/uygulama özel parolası yazmam gerekmez, Xcode'da oturumun açık) | Sen | Derleme "İşleniyor" → "Hazır" |
| 7 | **TestFlight** iç test: gerçek iPhone'da `YAYIN_ICIN_KALANLAR.md` bölüm 2 listesi (paylaş, uçak modu, ses, arka plan, Türkçe klavye, gece yarısı) | Sen | 6 maddenin hepsi geçti |
| 8 | Metinler (bölüm C), görseller (`docs/release/store/en` ve `tr`, 6'şar, 1320×2868), kategori Games > Trivia + Strategy, fiyat Ücretsiz, Gizlilik "Veri toplanmıyor", Yaş sınırı anketi (şiddet/kumar yok → 4+), Export compliance "Hayır" (`ITSAppUsesNonExemptEncryption=false`), inceleme notları (`APP_REVIEW_NOTES.md`) | Sen (ben metni hazırladım) | Tüm zorunlu alanlar yeşil |
| 9 | Add for Review → Submit. Apple yanıtı genelde 24-48 saat | Sen | "Waiting for Review" |

**%100 hazır tanımı (hepsi doğru olmalı):** (a) ad kararı yazılı, (b) 7. adım 6/6, (c) TR ve EN metin ve görseller ASC'de, (d) gizlilik/destek adresleri çalışıyor, (e) katalog dondurulmuş, (f) `main`'e alma/etiket kararın.

Ek: gizlilik/destek adresi şu an `cine-tactico.vercel.app` (eski ad). Alan adı alırsan `SITE_URL` (`src/config/brand.ts`) ve ASC adreslerini birlikte güncelle; zorunlu değil, yayını engellemez.

---

## A. Senin yapacakların (sırayla)

| # | Adım | Nerede | Süre |
|---|---|---|---|
| 1 | **Apple Developer Program** üyeliği (99 USD/yıl). Bireysel hesap yeterli. | developer.apple.com/programs | Onay 1-2 gün sürebilir |
| 2 | App Store Connect'te **Sözleşmeler**'i (Paid/Free Apps) kabul et | appstoreconnect.apple.com → Business | 5 dk |
| 3 | Xcode → `ios/App/App.xcodeproj` → target **App** → *Signing & Capabilities* → **Team** seç ("Automatically manage signing" açık kalsın) | Xcode | 2 dk |
| 4 | App Store Connect → *Apps → +* → **New App**: iOS, ad `Crosscut: Movie Trivia Game`, dil İngilizce (ABD), ikinci dil Türkçe, Bundle ID `com.crosscutgame.app` (Xcode ilk imzada kaydeder), SKU `crosscut-ios-1` | App Store Connect | 5 dk |
| 5 | Aşağıdaki **metinleri** yapıştır (bölüm C) | App Store Connect | 15 dk |
| 6 | **Ekran görüntülerini** yükle (`docs/release/screenshots/`) | App Store Connect | 5 dk |
| 7 | Terminalde `npm run build:ios` (env’siz derleme + sync), sonra Xcode: cihaz olarak **Any iOS Device (arm64)** → *Product → Archive* → *Distribute App → App Store Connect → Upload* | Xcode | 10 dk |
| 8 | **TestFlight**: derleme işlendikten sonra (10-30 dk) iç test grubuna ekle, kendi telefonunda dene | App Store Connect | — |
| 9 | Her şey iyiyse **Add for Review → Submit** (Export compliance: bölüm D) | App Store Connect | 5 dk |

> Hesap, imza ve yükleme adımlarını senin adına yapamam: kimlik bilgisi, ödeme ve sözleşme onayı gerektirir.

---

## B. Kod tarafında hazır olanlar (doğrulandı)

- Bundle ID `com.crosscutgame.app`, sürüm `1.0`, build `1`, **yalnızca iPhone**, **dikey**, iOS 15.0+, `arm64`.
- **Uygulama ikonu**: 1024×1024, **alfa kanalı yok** (App Store şartı), marka diline uygun.
- **Gizlilik manifesti** (`PrivacyInfo.xcprivacy`): izleme yok, toplanan veri yok.
- **Export compliance**: `ITSAppUsesNonExemptEncryption = false`.
- **Tamamen çevrimdışı**: ağ isteği yok, hesap yok, reklam/analitik yok. Yazı tipleri uygulamanın içine gömülü.
- Gizlilik URL'si ve destek URL'si canlı (Vercel).
- Atıflı görseller: oyuncu portreleri Wikimedia Commons (CC BY / CC BY-SA), uygulama içinde *Ayarlar → Lisanslar* bölümünde listeli.
- Testler: motor, anti-cheat, saldırgan oyuncu/fuzz, bot kalibrasyonu, üretilen tahtalar, yerelleştirme (hepsi `npm test`).

---

## C. App Store Connect metinleri

### URL'ler
- **Gizlilik Politikası URL'si:** `https://cine-tactico.vercel.app/privacy`
- **Destek URL'si:** `https://cine-tactico.vercel.app/support`
- **Pazarlama URL'si:** (boş bırak)

### Kategori ve fiyat
- **Birincil kategori:** Games → **Trivia** · İkincil: Games → **Strategy** (veya Board)
- **Fiyat:** Ücretsiz · **Uygulama içi satın alma:** yok · **Reklam:** yok

### Türkçe (birincil dil)
- **Ad (30):** `Crosscut: Film Bilgi Yarışması` (30)
- **Alt başlık (30):** `Günlük film düellosu` (20)
- **Tanıtım metni (170):** `Her kare iki ipucunun kesişimi. Doğru filmi bul, üçlü hattı kur, botları yen. Günün Kadrası her gün yeni bir tahta getirir.`
- **Anahtar kelimeler (100 bayt, addaki ve alt başlıktaki kelimeleri tekrarlama):** `film,sinema,quiz,bilgi,oyun,tahmin,günlük,yönetmen,oyuncu,bulmaca,çevrimdışı,xox` (bayt sayısını App Store Connect doğrular)
- **Açıklama:**

```
Crosscut, her karesi iki film ipucunun kesişimi olan ücretsiz bir film bilgi yarışması oyunudur (iOS).

Filmleri bilmek yetmez. Rakibini de yenmelisin.

Crosscut, sinema bilgisini taktikle birleştiren bir XOX düellosudur. Tahtadaki her kare iki ipucunun kesişimidir: bir yönetmen ile bir tür, bir oyuncu ile bir dönem... Kesişime uyan filmi bul, kareyi mühürle, üçlü hattı kur.

NASIL OYNANIR
• 3×3 tahtada sırayla oynarsın. Her hamle için 12 saniyen var.
• Doğru film kareyi senin yapar. Yanlış cevapta sıra rakibe geçer ve o karedeki hakkın biter.
• Yatay, dikey ya da çapraz üç kareyi ilk dolduran kazanır.
• Tahta dolup hat çıkmazsa Altın Makara devreye girer: tek soru, tek şans.

RAKİPLERİNİ SEÇ
Satranç botlarındaki gibi Kolay, Orta ve Zor rakipler seni bekler. Her birinin kendi adı, rating'i, oyun stili ve repliği var: temkinli, saldırgan, kült filmlerin avcısı. Seninle olan skorunu tutarlar, rövanş her zaman açık.

ÜÇ MOD + GÜNÜN KADRASI
• Klasik Düello: yönetmen, oyuncu, tür ve dönem kesişimleri.
• Ters Kadraj: iki filmin ortak oyuncusunu kendin yaz.
• Sinefil Konsept: kült temalar, akımlar ve anlatı kalıpları.
• Günün Kadrası: herkese aynı tahta, her gün yeni. Rakip yok: 9 kareyi tek başına doldur, kare sayına göre derecelen (Kusursuz Kadraj'a kadar). Günde tek hak.

SADE VE ÇEVRİMDIŞI
Hesap yok, reklam yok, internet gerekmez. Salon Işığı ile sinema salonunun atmosferini kendin ayarla: loşluk, projeksiyon, 35mm gren.

Sinefilsen, buradasın.
```

### English (ikinci dil)
- **Name:** `Crosscut: Movie Trivia Game` (27)
- **Subtitle:** `Daily movie duel. No ads.` (25)
- **Promotional text:** `Every square is the crossing of two clues. Find the film, build the line, beat the bots. A new Daily Reel arrives every day.`
- **Keywords (100 bytes):** `film,quiz,cinema,guess,grid,puzzle,versus,bot,offline,cinephile,actor,director,tic tac toe,streak` (97 bytes; adda ve alt başlıkta geçen movie, trivia, game, daily, duel, ads tekrarlanmaz; "Oscar", stüdyo, oyuncu adı, rakip adı yok)
- **Description:**

```
Crosscut is a free iOS movie trivia game where each square of a 3x3 grid is the crossing of two film clues.

Knowing movies isn't enough. You have to beat your opponent too.

Crosscut is tic-tac-toe played with cinema knowledge. Every square is the crossing of two clues: a director and a genre, an actor and a decade... Find the film that fits, seal the square, build the line.

HOW IT PLAYS
• Take turns on a 3×3 board. You get 12 seconds per move.
• A correct film claims the square. A wrong answer passes the turn and burns your try on that square.
• First to fill three squares in a row, column or diagonal wins.
• If the board fills with no line, the Golden Reel decides it: one question, one chance.

CHOOSE YOUR OPPONENT
Easy, Medium and Hard opponents, chess-bot style. Each has a name, a rating, a play style and a line of trash talk: cautious, aggressive, a hunter of cult classics. They keep score against you, and a rematch is always one tap away.

THREE MODES + DAILY FRAME
• Classic Duel: director, actor, genre and decade crossings.
• Reverse Frame: type the actor two films share.
• Cinephile Concept: cult themes, movements and storytelling patterns.
• Daily Reel: the same board for everyone, new every day. No opponent: fill all nine frames yourself and earn a rank up to Perfect Reel. One attempt a day.

SIMPLE AND OFFLINE
No account, no ads, no internet needed. Set the mood with Auditorium Ambience: dimness, projection beam, 35mm grain.

If you love cinema, you're home.
```

### "Sürüm Notları" (What's New, 1.0)
- TR: `İlk sürüm. Kolay, Orta ve Zor botlarla düello, Günün Kadrası, üç mod, Salon Işığı.`
- EN: `First release. Duels against Easy, Medium and Hard bots, Daily Reel, three modes, Auditorium Ambience.`

### Telif / İletişim
- **Telif hakkı:** `2026 Efe Öztürkan`
- **İnceleme iletişim e-postası:** `efezturkan@gmail.com`
- **İnceleme notları:** `docs/release/APP_REVIEW_NOTES.md` içeriğini yapıştır. Giriş bilgisi **gerekmez** (hesap yok).

---

## D. Yanıtlanacak formlar

### Yaş derecelendirme (sonuç: **4+**)
Tüm sorulara **None / Hayır**: şiddet, cinsellik, küfür, korku, kumar, alkol-uyuşturucu, tıbbi bilgi, sınırsız web erişimi, kullanıcı üretimli içerik. (Filmler yalnızca ad olarak anılır, görsel/video yok.)

### App Privacy (gizlilik "beslenme etiketi")
- **Data Collection:** **"No, we do not collect data from this app"** (Veri Toplanmıyor)
- Tracking: Hayır.

### Export Compliance
- "Does your app use encryption?" → uygulama yalnızca işletim sisteminin standart şifrelemesini kullanır / hiçbirini kullanmaz → **Exempt**. `Info.plist` zaten `ITSAppUsesNonExemptEncryption = false` içerir, soru çıkmaz.

### İçerik hakları
- "Does your app contain, show, or access third-party content?" → **Evet**, film/oyuncu adları ve CC lisanslı portreler. Haklar: Wikimedia Commons (CC BY / CC BY-SA), uygulama içi atıf mevcut. Film afişi veya stüdyo görseli **yok**.

### Reklam Tanımlayıcı (IDFA)
- Kullanmıyoruz → **Hayır**.

---

## E. Ekran görüntüleri

Hazır: `docs/release/store/tr/` ve `docs/release/store/en/` (her biri 6 görsel, **1320×2868**, RGB, alfa yok, iPhone 6.9"). Gerçek simülatör ekranları (iPhone 17 Pro Max) + başlık; olmayan özellik gösterilmiyor (Online Oda, Mağaza, Makara bakiyesi yok). Yükleme sırası:

1. Gişe (ana ekran)
2. Klasik Düello
3. Ters Kadraj
4. Sinefil Konsept
5. Günün Kadrası
6. Sonuç ve paylaşım kartı (Kusursuz Kadraj)

Türkçe mağaza dili için `tr/`, İngilizce için `en/` klasörünü kullan. Eski `docs/release/screenshots/` klasörü tasarım öncesidir, yüklenmemeli. Yeniden üretme adımları `docs/release/store/README.md` içinde.

---

## F. Reddedilme riskleri ve cevaplarımız

| Risk (Guideline) | Durum |
|---|---|
| 4.2 Minimum işlev (web sarmalayıcı) | Yerel motor, bot AI, haptik (Capacitor Haptics, gerçek cihazda henüz doğrulanmadı), çevrimdışı oyun, özgün tasarım. Notlarda belirtildi. |
| 5.1.1(v) Hesap silme | Hesap yok → silinecek veri yok. Yerel veriler Profil'den silinir. |
| 5.1.2 Veri kullanımı | Hiç veri toplanmıyor, ağ isteği yok. Etiket ve politika tutarlı. |
| 4.1 Taklit / marka | IMDb/TMDb adı, logosu ve verisi yok. Afiş yok. Wikidata (CC0) + Wikimedia Commons. |
| 2.3.7 Ekran görüntüleri | Gerçek uygulama ekranları, yanıltıcı öğe yok. |
| 1.2 Kullanıcı içeriği | Kullanıcı üretimli içerik yok (yalnızca kendi takma adı, cihazda). |
| Çevrimiçi/sahte oyuncu | Rakipler açıkça "Sinefil Botu" olarak etiketli. Çevrimiçi mod v1.0'da kapalı. |

---

## G. Sürüm 1.1 için park edilenler
Çevrimiçi Özel Gösterim (sunucuda cevap doğrulaması gerekir), iPad desteği, daha fazla elle seçilmiş Sinefil Konsept tahtası, bot başına detaylı istatistikler.


---

## H. Marka ve hukuki kontrol (Crosscut)

- **Varlık cümlesi** (mağaza açıklamasının ilk satırı, site, sosyal profiller, şemada AYNEN): "Crosscut is a free iOS movie trivia game where each square of a 3x3 grid is the crossing of two film clues." Kod: `src/config/brand.ts`.
- **Açıklamaya eklenecek satır:** "Not affiliated with or endorsed by any studio, film database or the people named in the puzzles." (Uygulamada Ayarlar → Hakkında'da zaten var.)
- **Metadata'da yasak:** "Oscar", stüdyo/oyuncu adları, IMDb/Letterboxd, rakip uygulama adları, "best/#1", "Android" (Apple 2.3.7 ve 5.2).
- **Marka sorgusu (26 Kasım, WIPO Global Brand Database, resmî kayıtlar, A):** `CROSSCUT` sınıf 41'de dünya genelinde 4 kayıt: ABD Reg. 3368825 (Crosscut LLC, 2008, **canlı/yenilendi 2018**, kapsam yalnızca *haber analizi, haber dağıtımı, haber yayını*), DE ve WO kaydı (BHS Corrugated, **süresi dolmuş**), BR başvurusu (**sonlanmış**). Sınıf 9: Radians (ABD 4791760, canlı), Applied Signals Intelligence (ABD 6195878, canlı; kapsam *radyo yön bulma donanımı ve yazılımı*), diğerleri ölü. `CROSSCUT` + "game" hizmet metni: 0 kayıt. `CROSS CUT` sınıf 9/41: 0 kayıt. **Sonuç: oyun/trivia için doğrudan çakışma görmedim; en yakın canlı kayıt haber hizmeti (benzer hizmet değil, ama aynı sınıf 41, düşük-orta risk).** Önceki notlardaki "Cascade Public Media" sahibi WIPO kaydında geçmiyor (kayıtlı sahip Crosscut LLC); düzeltildi. Hukuki görüş değildir: ABD'de resmî USPTO sorgusu (tmsearch.uspto.gov) ve TÜRKPATENT hâlâ elle doğrulanmalı; marka başvurusu (sınıf 9 ve 41, Crosscut LLC'nin haber kapsamından ayrılan 'oyun' tanımıyla) ürün ilk indirmeler gelince değerlendirilebilir.
- **Patent:** açık web taramasında bu oyun mekaniğini kapsayan patent bulunmadı (yüzeysel tarama, serbest işletme görüşü değildir). Google Patents'ta elle: "tic-tac-toe" trivia category intersection; CPC A63F 3/06.
