# Crosscut — App Store Gönderim Paketi (v1.0)

Bu belge, uygulamayı Apple'a gönderirken **kopyalayıp yapıştıracağın her şeyi** ve **senin onaylaman gereken adımları** içerir. Kod tarafı hazırdır; kalanlar Apple hesabına bağlı işlerdir.

---

## 0. Yol (26 Kasım 2026): sırayla, kim ne yapar

Kod kapısı kapalı: `tsc` temiz, `npm test` 0 hata (26 Kasım), gizlilik/destek adresleri HTTP 200. Aşağıda "Sen" yazan adımları ben yapamam: ödeme, kimlik doğrulama, sözleşme kabulü ve parola/2FA bende olamaz.

| # | Adım | Kim | Çıkış kriteri |
|---|---|---|---|
| 1 | **Ad kararı: KARAR VERİLDİ, Crosscut ile devam (26 Kasım).** Gerekçe: WIPO kayıtlarında oyun/yazılım için çakışma yok, canlı sınıf 41 kaydı yalnızca haber hizmeti (bölüm H). Ad değişikliği gerekirse mağaza adı sonradan değişir, Bundle ID kalıcıdır ve ada uymak zorunda değil. İstersen TÜRKPATENT'i elle de tara | Tamam | Karar yazıldı |
| 1b | **Vercel güncellendi (26 Kasım, YAPILDI).** `main` = `release/round-2` birleştirildi ve push edildi; canlı site "Crosscut" başlığıyla yayında, `/privacy` ve `/support` 200 ve yeni marka, `llms.txt` var. Sonraki her push canlıyı değiştirir | Tamam | Doğrulandı |
| 2 | **Apple Developer Program** (bireysel, 99 USD/yıl): developer.apple.com/programs → Apple Kimliği + 2FA, iPhone'daki "Apple Developer" uygulamasıyla kimlik doğrulama, ödeme. Onay saatler-günler sürebilir | Sen | Hesapta "Team ID" görünüyor |
| 3 | App Store Connect: Business → sözleşmeleri kabul et (Free Apps). Apps → + → New App: iOS, ad, birincil dil İngilizce (ABD), Bundle ID, SKU `crosscut-ios-1` | Sen | Uygulama kaydı oluştu |
| 4 | Xcode → Settings → Accounts → Apple Kimliğin; `ios/App/App.xcodeproj` → App → Signing & Capabilities → Team seç | Sen | İmza hatasız |
| 5 | Bana "Team seçildi" yaz. Ben: `npm run build:ios`, sürüm/build numarası kontrolü, `xcodebuild archive` (imzalı), doğrulama | Ben | Arşiv hatasız |
| 6 | Xcode Organizer → Distribute App → App Store Connect → Upload (parola/uygulama özel parolası yazmam gerekmez, Xcode'da oturumun açık) | Sen | Derleme "İşleniyor" → "Hazır" |
| 7 | **TestFlight** iç test: gerçek iPhone'da `YAYIN_ICIN_KALANLAR.md` bölüm 2 listesi (paylaş, uçak modu, ses, arka plan, Türkçe klavye, gece yarısı) | Sen | 6 maddenin hepsi geçti |
| 8 | Metinler (bölüm C), görseller (`docs/release/store/en` ve `store/tr`, her dilde 5 adet `1320×2868` PNG), kategori Games > Trivia + Puzzle, fiyat Ücretsiz, Gizlilik "Veri toplanmıyor", Yaş sınırı anketi (şiddet/kumar yok → 4+), Export compliance "Hayır" (`ITSAppUsesNonExemptEncryption=false`), inceleme notları (`APP_REVIEW_NOTES.md`) | Sen (ben metni hazırladım) | Tüm zorunlu alanlar yeşil |
| 9 | Add for Review → Submit. Apple yanıtı genelde 24-48 saat | Sen | "Waiting for Review" |

**%100 hazır tanımı (hepsi doğru olmalı):** (a) ad kararı yazılı, (b) 7. adım 6/6, (c) TR ve EN metin ve görseller ASC'de, (d) gizlilik/destek adresleri çalışıyor, (e) katalog dondurulmuş, (f) `main`'e alma/etiket kararın.

Ek: gizlilik/destek adresi şu an `cine-tactico.vercel.app` (eski ad). Alan adı alırsan `SITE_URL` (`src/config/brand.ts`) ve ASC adreslerini birlikte güncelle; zorunlu değil, yayını engellemez. `docs/release/web/` yalnızca isteğe bağlı bir açılış sayfası taslağıdır (ekran görüntüsü yok, `Reverse Cast` gibi yanlış mod adları var, dış yazı tipi yüklüyor, ikinci bir gizlilik metni içeriyor): sürüm adresleri olarak kullanma.

---

## A. Senin yapacakların (sırayla)

| # | Adım | Nerede | Süre |
|---|---|---|---|
| 1 | **Apple Developer Program** üyeliği (99 USD/yıl). Bireysel hesap yeterli. | developer.apple.com/programs | Onay 1-2 gün sürebilir |
| 2 | App Store Connect'te **Sözleşmeler**'i (Paid/Free Apps) kabul et | appstoreconnect.apple.com → Business | 5 dk |
| 3 | Xcode → `ios/App/App.xcodeproj` → target **App** → *Signing & Capabilities* → **Team** seç ("Automatically manage signing" açık kalsın) | Xcode | 2 dk |
| 4 | App Store Connect → *Apps → +* → **New App**: iOS, ad `Crosscut: Movie Trivia Game`, dil İngilizce (ABD), ikinci dil Türkçe, Bundle ID `com.crosscutgame.app` (Xcode ilk imzada kaydeder), SKU `crosscut-ios-1` | App Store Connect | 5 dk |
| 5 | Aşağıdaki **metinleri** yapıştır (bölüm C) | App Store Connect | 15 dk |
| 6 | **Ekran görüntülerini** yükle (`docs/release/store/en` ve `store/tr`) | App Store Connect | 5 dk |
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
- **Görsel yok**: pakette afiş, portre veya fotoğraf bulunmaz (kullanılmayan 11 Wikimedia portresi çıkarıldı). Veri Wikidata (CC0), yazı tipleri SIL OFL.
- Testler: motor, anti-cheat, saldırgan oyuncu/fuzz, bot kalibrasyonu, üretilen tahtalar, yerelleştirme (hepsi `npm test`).

---

## C. App Store Connect metinleri

### URL'ler
- **Gizlilik Politikası URL'si:** `https://cine-tactico.vercel.app/privacy` (uygulamadaki bağlantıyla aynı sayfa, testle doğrulanır)
- **Destek URL'si:** `https://cine-tactico.vercel.app/support`
- **Pazarlama URL'si:** (boş bırak)

### Kategori ve fiyat
- **Birincil kategori:** Games → **Trivia** · **İkincil:** Games → **Puzzle**
- **Fiyat:** Ücretsiz · **Uygulama içi satın alma:** yok · **Reklam:** yok

### İmza slogan (yatırımcıya, X biyografisine, tek nefeste)
- **EN:** Not a quiz. A twelve-second duel over nine squares.
- **TR:** Quiz değil, düello: dokuz kare, on iki saniye.

Konumlandırma: rakip adı yok, günah var. Düşman; her hamlede reklam gösteren, dört şıklı, hesap isteyen quiz yığını. Bizim fark cümlemiz **sayaç**: on iki saniye baskı altında iki ipucuna da uyan filmi bulmak. "Reklamsız" destek kanıttır, ana vaat değil (reklamsız rakip de var; `docs/strategy/00`).

### English (Primary Locale — U.S./Global)
- **App Name (27/30):** `Crosscut: Movie Trivia Duel`
- **Subtitle (30/30):** `12 seconds. 9 squares. 1 film.`
- **Promotional Text (163/170):** `Quiz apps hand you four options and an ad. Crosscut hands you a clock. Name the film that fits both clues before twelve seconds run out. Works offline. No account.`
- **Keywords (100/100 karakter, 100/100 bayt, boşluksuz, ad ve alt başlıkla çakışmaz, marka yok):** `cinema,actor,director,daily,puzzle,offline,3x3,tic,tac,toe,cast,bot,reel,cinephile,versus,guess,grid`
- **What's New (1.0):** `First release. Duels against Easy, Medium and Hard bots, Reverse Frame, Daily Reel, Auditorium Ambience.`
- **Description (1146/4000; ilk 3 satır "more"a basmadan görünür):**

```
Not a quiz. A duel.
Every square is two clues. Name the film that fits both, in twelve seconds, before the bot blocks your line.
No ads. No account. No signal needed.

THE RULES
Nine squares. Three in a row wins. A wrong answer burns your try on that square. The clock does not wait.

THREE WAYS TO PLAY
• Classic Duel: directors, actors, decades, genres and awards cross on a 3x3 board. Easy, Medium and Hard bots, each with its own style.
• Reverse Frame: two films meet at a square. Name the actor who is in both.
• Cinephile Concept: cult themes against genres and awards.

ONE BOARD A DAY
Daily Reel: the same nine squares for everyone, one attempt, and a result card that shows your score and spoils nothing.

THE CATALOG
1,000+ films and series. Instant title search in English and Turkish, with alternate titles. Two films, one title? The year tells them apart.

THE ROOM
Dim the house lights. Aim the projector beam. Add 35mm grain, or paint the room red.

THE FINE PRINT
Free. No ads. No in-app purchases. No tracking. Plays fully offline.
Not affiliated with or endorsed by any studio, film database or the people named in the puzzles.
```

### Türkçe (İkinci Dil)
- **Ad (29/30):** `Crosscut: Film Bilgi Düellosu`
- **Alt başlık (26/30):** `12 saniye. 9 kare. 1 film.`
- **Tanıtım metni (159/170):** `Quiz uygulamaları sana dört şık ve bir reklam verir. Crosscut bir saat verir. İki ipucuna da uyan filmi 12 saniye dolmadan bul. İnternetsiz çalışır. Hesap yok.`
- **Anahtar kelimeler (87/100 karakter, 94/100 bayt, boşluksuz, ad ve alt başlıkla çakışmaz, marka yok):** `sinema,oyuncu,yönetmen,günlük,bulmaca,çevrimdışı,internetsiz,xox,3x3,bot,kadraj,sinefil`
- **Sürüm notu (1.0):** `İlk sürüm. Kolay, Orta ve Zor botlarla düello, Ters Kadraj, Günün Kadrası, Salon Işığı.`
- **Açıklama (1134/4000; ilk 3 satır "devamı"na basmadan görünür):**

```
Quiz değil, düello.
Her kare iki ipucu. İkisine de uyan filmi 12 saniyede bul, bot hattını kesmeden üçlüyü kur.
Reklam yok. Hesap yok. İnternet gerekmez.

KURALLAR
Dokuz kare. Üç kare yan yana gelen kazanır. Yanlış cevap o karedeki hakkını yakar. Sayaç beklemez.

ÜÇ OYUN BİÇİMİ
• Klasik Düello: yönetmen, oyuncu, dönem, tür ve ödül 3x3 tahtada kesişir. Kolay, Orta ve Zor botların her birinin kendi tarzı var.
• Ters Kadraj: iki film bir karede buluşur. İkisinde de oynayan oyuncuyu bul.
• Sinefil Konsept: kült temalar, türler ve ödüllerle karşı karşıya.

GÜNDE BİR TAHTA
Günün Kadrası: herkese aynı dokuz kare, tek hak, skorunu gösteren ve hiçbir şey sızdırmayan sonuç kartı.

KATALOG
1.000'den fazla film ve dizi. Türkçe ve İngilizce anında başlık araması, alternatif adlarla. Aynı adlı iki film mi var? Yıl ayırır.

SALON
Salon ışıklarını kıs. Projeksiyon huzmesini ayarla. 35mm gren ekle ya da salonu kırmızıya boya.

KÜÇÜK PUNTO
Ücretsiz. Reklam yok. Uygulama içi satın alma yok. Takip yok. Tamamen çevrimdışı çalışır.
Herhangi bir stüdyo, film veritabanı veya bulmacalarda adı geçen kişilerle bağlantılı ya da onaylı değildir.
```

### Vitrin kareleri (5 adet, sıra dönüşüm sırasıdır)
| # | EN başlık | TR başlık | Ekran |
|---|---|---|---|
| 1 | Twelve seconds. No excuses. | On iki saniye. Bahane yok. | Klasik düello, sayaç son saniyede |
| 2 | Name the shared star. | Ortak yıldızı bul. | Ters Kadraj |
| 3 | Today's board. Same for all. | Bugünün tahtası. Herkese aynı. | Günlük Kadraj ve paylaşım kartı |
| 4 | 1,000+ films. Instant search. | 1.000+ yapım. Anında arama. | Hızlı arama |
| 5 | No ads. No login. Offline. | Reklamsız. Hesapsız. Çevrimdışı. | Ana ekran |

Her başlık en fazla 5 kelime. Başlıklar özellik değil gerilim ve fark satar.

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
- "Does your app contain, show, or access third-party content?" → **No** *(0 telifli film afişi, 0 portre/fotoğraf; tüm film metaverileri Wikidata CC0 kamu malı, yazı tipleri SIL OFL açık lisanslıdır).*

### Reklam Tanımlayıcı (IDFA)
- Kullanmıyoruz → **Hayır**.

---

## E. Ekran görüntüleri

- **Yüklenecek set:** `docs/release/store/en/` ve `docs/release/store/tr/` (her dilde 5 adet, `1320×2868`, RGB, alfa yok; 6,9" iPhone). Sıra dönüşüm sırasıdır: 12 saniye gerilimi, Ters Kadraj, Günlük Kadraj + paylaşım, hızlı arama, çevrimdışı/reklamsız.
- **Kaynak:** iPhone 17 Pro Max simülatöründeki gerçek oyun, ham ekranlar `docs/release/launch-pack/raw-screens/{en,tr}/`. Üzerine yalnızca başlık ve yuvarlak köşe eklendi (`store/compose_v3.py`; çerçeve, 3D, neon yok). Çekim notu: oyunun 12 saniyelik sayacı çekim sırasında donduruldu (depoya girmeyen geçici derleme; ilk karede 3 sn, kırmızı, diğerlerinde 12 sn), arayüz birebir aynı. İstersen TestFlight sürümüyle bir kez daha çekip değiştirebilirsin.
- **Videolar (opsiyonel app preview / sosyal):** `docs/release/launch-pack/videos/` (dikey 1080×1920, sessiz). Ek metinler ve yayın planı: `launch-pack/LAUNCH_PLAYBOOK.md`.
- **Canlı sayfa önizlemesi:** `docs/release/store/store-page-preview.html` (arama sonucu + ürün sayfası, EN/TR, koyu/açık). Yatırımcıya göstermek içindir, yayında değildir.

---

## F. Reddedilme riskleri ve cevaplarımız

| Risk (Guideline) | Durum |
|---|---|
| 4.2 Minimum işlev (web sarmalayıcı) | Yerel motor, bot AI, haptik (Capacitor Haptics, gerçek cihazda doğrulanacak), çevrimdışı oyun, özgün tasarım. Notlarda belirtildi. |
| 5.1.1(v) Hesap silme | Hesap yok → silinecek veri yok. Yerel veriler Profil'den silinir. |
| 5.1.2 Veri kullanımı | Hiç veri toplanmıyor, ağ isteği yok. Etiket ve politika tutarlı. |
| 4.1 Taklit / marka | IMDb/TMDb adı, logosu ve verisi yok. Afiş veya portre yok. Yalnızca Wikidata (CC0). |
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
