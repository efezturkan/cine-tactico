# Cine-XOX — App Store Gönderim Paketi (v1.0)

Bu belge, uygulamayı Apple'a gönderirken **kopyalayıp yapıştıracağın her şeyi** ve **senin onaylaman gereken adımları** içerir. Kod tarafı hazırdır; kalanlar Apple hesabına bağlı işlerdir.

---

## A. Senin yapacakların (sırayla)

| # | Adım | Nerede | Süre |
|---|---|---|---|
| 1 | **Apple Developer Program** üyeliği (99 USD/yıl). Bireysel hesap yeterli. | developer.apple.com/programs | Onay 1-2 gün sürebilir |
| 2 | App Store Connect'te **Sözleşmeler**'i (Paid/Free Apps) kabul et | appstoreconnect.apple.com → Business | 5 dk |
| 3 | Xcode → `ios/App/App.xcodeproj` → target **App** → *Signing & Capabilities* → **Team** seç ("Automatically manage signing" açık kalsın) | Xcode | 2 dk |
| 4 | App Store Connect → *Apps → +* → **New App**: iOS, ad `Cine-XOX`, dil Türkçe, Bundle ID `com.cinetactico.game` (Xcode ilk imzada kaydeder), SKU `cinexox-ios-1` | App Store Connect | 5 dk |
| 5 | Aşağıdaki **metinleri** yapıştır (bölüm C) | App Store Connect | 15 dk |
| 6 | **Ekran görüntülerini** yükle (`docs/release/screenshots/`) | App Store Connect | 5 dk |
| 7 | Xcode: cihaz olarak **Any iOS Device (arm64)** → *Product → Archive* → *Distribute App → App Store Connect → Upload* | Xcode | 10 dk |
| 8 | **TestFlight**: derleme işlendikten sonra (10-30 dk) iç test grubuna ekle, kendi telefonunda dene | App Store Connect | — |
| 9 | Her şey iyiyse **Add for Review → Submit** (Export compliance: bölüm D) | App Store Connect | 5 dk |

> Hesap, imza ve yükleme adımlarını senin adına yapamam: kimlik bilgisi, ödeme ve sözleşme onayı gerektirir.

---

## B. Kod tarafında hazır olanlar (doğrulandı)

- Bundle ID `com.cinetactico.game`, sürüm `1.0`, build `1`, **yalnızca iPhone**, **dikey**, iOS 15.0+, `arm64`.
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
- **Ad (30):** `Cine-XOX`
- **Alt başlık (30):** `Sinema bilgisiyle XOX düellosu`
- **Tanıtım metni (170):** `Her kare iki ipucunun kesişimi. Doğru filmi bul, üçlü hattı kur, botları yen. Günün Kadrası her gün yeni bir tahta getirir.`
- **Anahtar kelimeler (100):** `film,sinema,xox,bilgi yarışması,quiz,oyuncu,yönetmen,bulmaca,strateji,sinefil,trivia,dizi`
- **Açıklama:**

```
Filmleri bilmek yetmez. Rakibini de yenmelisin.

Cine-XOX, sinema bilgisini taktikle birleştiren bir XOX düellosudur. Tahtadaki her kare iki ipucunun kesişimidir: bir yönetmen ile bir tür, bir oyuncu ile bir dönem... Kesişime uyan filmi bul, kareyi mühürle, üçlü hattı kur.

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
• Günün Kadrası: dünya genelinde herkese aynı tahta, her gün yeni.

SADE VE ÇEVRİMDIŞI
Hesap yok, reklam yok, internet gerekmez. Salon Işığı ile sinema salonunun atmosferini kendin ayarla: loşluk, projeksiyon, 35mm gren.

Sinefilsen, buradasın.
```

### English (ikinci dil)
- **Name:** `Cine-XOX`
- **Subtitle:** `Tic-tac-toe for movie buffs`
- **Promotional text:** `Every square is the crossing of two clues. Find the film, build the line, beat the bots. A new Daily Frame arrives every day.`
- **Keywords:** `movie,film,cinema,trivia,quiz,tic tac toe,actor,director,puzzle,strategy,cinephile,xo`
- **Description:**

```
Knowing movies isn't enough. You have to beat your opponent too.

Cine-XOX is tic-tac-toe played with cinema knowledge. Every square is the crossing of two clues: a director and a genre, an actor and a decade... Find the film that fits, seal the square, build the line.

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
• Daily Frame: the same board for everyone in the world, new every day.

SIMPLE AND OFFLINE
No account, no ads, no internet needed. Set the mood with Auditorium Ambience: dimness, projection beam, 35mm grain.

If you love cinema, you're home.
```

### "Sürüm Notları" (What's New, 1.0)
- TR: `İlk sürüm. Kolay, Orta ve Zor botlarla düello, Günün Kadrası, üç mod, Salon Işığı.`
- EN: `First release. Duels against Easy, Medium and Hard bots, Daily Frame, three modes, Auditorium Ambience.`

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

`docs/release/screenshots/` klasöründe **iPhone 6.9"** (1320×2868, iPhone 17 Pro Max) boyutunda hazırdır. Bu ölçü zorunlu ana boyuttur; daha küçük iPhone boyutlarını App Store kendisi ölçekler. Sıra:

1. `01-rakip-sec.png`: Rakibini Seç
2. `02-oyun.png`: Oyun ekranı
3. `03-gise.png`: Gişe
4. `04-vizyondakiler.png`: Vizyondakiler
5. `05-sinefil-karti.png`: Sinefil Kartı

Yeniden üretmek için: `npm run ios:sim` → Pro Max simülatöründe aç → ekranları yakala.

---

## F. Reddedilme riskleri ve cevaplarımız

| Risk (Guideline) | Durum |
|---|---|
| 4.2 Minimum işlev (web sarmalayıcı) | Yerel motor, bot AI, haptik, çevrimdışı oyun, özgün tasarım. Notlarda belirtildi. |
| 5.1.1(v) Hesap silme | Hesap yok → silinecek veri yok. Yerel veriler Profil'den silinir. |
| 5.1.2 Veri kullanımı | Hiç veri toplanmıyor, ağ isteği yok. Etiket ve politika tutarlı. |
| 4.1 Taklit / marka | IMDb/TMDb adı, logosu ve verisi yok. Afiş yok. Wikidata (CC0) + Wikimedia Commons. |
| 2.3.7 Ekran görüntüleri | Gerçek uygulama ekranları, yanıltıcı öğe yok. |
| 1.2 Kullanıcı içeriği | Kullanıcı üretimli içerik yok (yalnızca kendi takma adı, cihazda). |
| Çevrimiçi/sahte oyuncu | Rakipler açıkça "Sinefil Botu" olarak etiketli. Çevrimiçi mod v1.0'da kapalı. |

---

## G. Sürüm 1.1 için park edilenler
Çevrimiçi Özel Gösterim (sunucuda cevap doğrulaması gerekir), iPad desteği, daha fazla elle seçilmiş Sinefil Konsept tahtası, bot başına detaylı istatistikler.
