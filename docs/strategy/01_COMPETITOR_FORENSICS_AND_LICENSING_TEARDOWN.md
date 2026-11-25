# RAKİP ADLİ ANALİZİ (FORENSICS), LİSANSLAMA TAKTİKLERİ, SÜRÜM EVRİMİ VE GERÇEK KULLANICI ÖLÇEĞİ

> **Dosya Konumu:** `docs/strategy/01_COMPETITOR_FORENSICS_AND_LICENSING_TEARDOWN.md`  
> **Tamamlayıcı Strateji Dosyası:** `docs/strategy/02_WAR_COUNCIL_PERSPECTIVES_AND_DIFFERENTIATION_PLAN.md`  
> **Amaç:** Bu doküman hem kurucu ekip hem de projede çalışacak diğer yapay zekâ ajanları (ürün, oyun motoru, büyüme, veri) için **doğrulanmış pazar gerçeği referansıdır**. Tüm veriler iTunes Lookup API, Google Play mağaza kayıtları, canlı tarayıcı oyun testleri, halka açık istemci JS/HTML paketleri ve Similarweb/Semrush trafik ölçümlerinden elde edilmiştir (`Kasım 2026`).

---

## 1. BÜYÜK GERÇEK: RAKİPLERİN KULLANICI SAYISI NE KADAR VE ONLARI GERÇEKTEN YENEBİLİR MİYİZ?

Dışarıdan bakıldığında sinema trivia rakipleri "devasa ve dokunulmaz" görünür. **Gerçek veriler tam tersini kanıtlamaktadır:** Web'de tek bir görsel oyun (*Framed*) milyonluk trafiğe sahipken, 3×3 film gridi ve rekabetçi sinema oyunları **web'de 100K–210K aylık ziyaret bandında sıkışmış**, **native mobilde ise neredeyse tamamen sahipsizdir**.

### 1.1 Doğrulanmış Kullanıcı Ölçeği, Trafik ve Oturum Süresi Tablosu

| Ürün | Platform | İlk Çıkış → Son Sürüm | Doğrulanmış Trafik / Oy / İndirme Ölçeği | Ortalama Oturum & Coğrafya | Yenilebilirlik Hükmü |
|---|---|---|---|---|---|
| **Framed (`framed.wtf`)** | Sadece Web | 2022 → Aktif | **3.1M – 4.8M ziyaret/ay** (`~100K–160K DAU`) | **2–5 dk** · %54 ABD, %16 UK, %5 AU | **Doğrudan kafa kafaya girilmez** (günlük kare tahmini alışkanlığı oturmuş, telifli film kareleri kullanıyor). |
| **Filmed Up (`Conwov Ltd`)** | iOS (`id6743640328`) + Android (`com.conwov.filmedup`) | `03.04.2025` → `v2.0.22` (`04.11.2026`, 90.1 MB) | **3.479 ABD iOS oyu (4.66★)** + 960 UK + 521 CA + 324 AU + **2.650 Play yorumu** (`Tahmini ~200K–300K indirme`) | Mobil koleksiyon + takas · TR'de sadece **25 oy (%0.7)** | **Farklı kategori (TCG / Kart Takası).** Mobilde sinema kitlesinin para harcadığını (**sıfır reklam**, `$0.99–$99.99` IAP) kanıtlayan en önemli emsaldir. |
| **CineNerdle / Cine2Nerdle (`cinenerdle.app`)** | Sadece Web (`cinenerdle2.app` emekli edildi) | 2022–2023 → *Battle 2.0* (Aktif, Günlük `#1484`) | **~197K – 210K ziyaret/ay** (`Temmuz–Ekim 2026`, `~6K–12K DAU`), 27.000+ topluluk bulmacası | **8 dk 15 sn (!)** · **%84.5 ABD**, %6.3 UK, %2.4 CA, %1.0 AU (**%94.2 Tier-1 İngilizce**) | **MOBİLDE TAMAMEN AÇIK HEDEF.** Native iOS/Android uygulaması **yoktur**, yeni başlayanlar için aşırı zordur (elitist duvar) ve web'de reklam kalabalığı vardır. |
| **Actorle / Actorle 2.0 (`Laszlo Kiss`)** | iOS (`id1620858489`) + Web (`actorle.com`) | `31.05.2022` → `v2.0.3` (`28.10.2026`, 44.6 MB) | Web: **~169K – 179K ziyaret/ay** · iOS: 4.5 yılda toplam **122 ABD oyu (4.39★)**, 28 UK, **2 TR** | **1 dk 57 sn** (%51 hemen çıkma) | **YENİLEBİLİR.** 4 yıl boyunca kötü reklam ve hatalarla kan kaybetti; Ekim 2026'da `Actorle 2.0` ile grup moduna döndü ama Android'i yok ve web'de Playwire reklamları arayüzü bozuyor. |
| **Movie Grid (`moviegrid.io`)** | Sadece Web (Sam Shulman & Alex Nunan) | 2023 → Aktif (+ Vulture *Cinematrix* motoru) | **~106K – 110K ziyaret/ay** (`moviegrid.io` doğrudan) + Vulture editoryal trafiği | **~2 dk 30 sn** · **>%63 ABD**, 25–34 yaş ağırlıklı | **MOBİLDE VE PVP'DE YENİLEBİLİR.** Sıfır mobil uygulama, sıfır karşılıklı taktik/bloklama, sadece tek kişilik 9 tahminlik tablo. |
| **MovieGrid Klonu (`moviegrid.org`)** | Sadece Web (`lyricle.app` ağı) | 2023–2024 → Aktif | Düşük SEO klon trafiği | Tek kişilik Daily + Unlimited | **Zayıf klon.** Otomatik tamamlamada film yılları yazmadığı için aynı isimli filmler birbirine karışıyor, mobil uygulaması yok. |
| **Sportrix (`Gavel-It LLC`)** *(Spor Grid Referansı)* | iOS (`id6451090273`) | `12.07.2023` → `v2.28` (**Son güncelleme: `13.03.2024`**) | **2.277 ABD oyu (4.6★)**, 202 CA (`Tahmini ~80K–120K indirme`) | Terk edilmiş (2.5 yıldır veri güncellenmedi) | **Kritik Kanıt:** İnsanlar native mobilde 3×3 grid oynamak **istiyor** (8 ayda 2.277 oy aldı), ama statik veri güncellenmeyince öfke yorumlarıyla çöktü. |
| **Gridiron Trivia (`Cliq Invite LLC`)** *(NFL Grid Referansı)* | iOS (`id6744003555`) | `01.04.2025` → `v4.0.4` (`16.11.2026`, 77.1 MB) | **948 ABD oyu (4.8★)** (19 ayda 4 ana sürüm) | ABD odaklı günlük NFL bulmacaları | Düzenli veri güncelleyen native mobil grid uygulamasının 4.8★ ile büyüdüğünü kanıtlar. |
| **Codenames (`CGE Digital`)** *(Taktik Masa Referansı)* | iOS (`id1055650930`) + Android | `11.09.2024` → `v2.6.4704` (`11.11.2026`, 220 MB) | **1.157 ABD iOS oyu (4.74★)** (`$4.99` peşin ücretli!), **3.570 Play yorumu (`50.000+` indirme)** | Asenkron sıra tabanlı | Sıra tabanlı akıl oyunlarında reklamsız deneyimin çok sevildiğini, ama **bot yedeği olmadan rakip beklemenin** en büyük acı olduğunu kanıtlar. |
| **Callback (`Ono Kai Investments / Jacob`)** | iOS (`id6790211885`) + Web (`playcallback.com`) | `17.09.2026` → `v1.1.7` (`16.11.2026`, 20.6 MB) | **4 ABD iOS oyu (5.0★)**, UK/CA/AU/FR/TR **0 oy**, **Android YOK** | Günde birkaç dakika (tek kişilik 4–7 mini bulmaca) | **Tasarımı çok iyi ama ölçeği henüz mikroskopik (4 oy!).** Çok oyunculu rekabeti ve Android sürümü yok; solo geliştirici yan projesi. |
| **CineQuizz (`Timepilot`)** | iOS (`id6739583664`) + Android (`app.cinequizz`) | `19.03.2025` → `v1.0.1` (**Son: `29.03.2025`**) | **17 FR oyu**, **0 ABD oyu**, Play `1.000+` indirme | Terk edilmiş, sunucular boş (`"Serveurs vide"`) | **Ölü rakip.** Çıktıktan 10 gün sonra terk edildi. |
| **Absolute Popcorn (`Timing Corp`)** | iOS (`id6759967919`) + Android | `13.09.2026` → `v2.0.4` (`15.11.2026`, 86.7 MB) | **7 FR oyu**, **0 ABD oyu**, Play `>50` indirme (**3.4★**) | Fransa odaklı quiz + sahne tahmini | **Başarısız lansman.** 2 ayda panikle arayüzü `v2.0`'a yeniledi ama hâlâ `>50` indirmede. |
| **Film Alchemy (`app.filmalchemy`)** | Android + Web (`film-alchemy.web.app`) | 2026 → `24.11.2026` güncel | Play `>100` indirme (4.5★), **iOS YOK** | 851 filmlik solo birleştirme | Niş hobi projesi; rekabetçi tehdit değil. |
| **Türkiye Çıkışlı 3 Yeni Rakip Vakası:**<br>• *Careo Movie Quiz* (`id6798573490`)<br>• *MovieGuessr* (`id6764073165`, A. T. Figanioglu)<br>• *Cine Trivia* (`id6807158041`, Mert Baykal) | iOS + Android | Haziran – Eylül 2026 çıkışlı, Ekim–Kasım 2026 güncel | **ABD Oyları: `0`, `0` ve `0`!**<br>TR Oyları: `4`, `1` ve `1`<br>Google Play: `>50` – `>100` indirme | Klasik çoktan seçmeli soru / solo 5 ipucu | **Çok Kritik Ders:** 2026 yazında Türkiye'den çıkıp global mağazaya klasik film quiz / solo ipucu koyan 3 uygulamanın üçü de **sıfır organik çekim** üretti. |

### 1.2 Net Cevap: "Biz Bu Rakipleri Gerçekten Yenebilir miyiz?"
**EVET — ama nerede savaştığımızı doğru seçersek:**
1. **Oturum Süresi Kanıtı:** Tek kişilik günlük film bulmacaları kullanıcıyı **1 dk 57 sn (*Actorle*) ile 2 dk 30 sn (*MovieGrid.io*)** tutarken, sinema bilgisini **1v1 rakip hamlesine karşı savunma/saldırı** oyununa çeviren *Cine2Nerdle* kullanıcıyı ortalama **8 dakika 15 saniye** içeride tutuyor (**4 kat fark!**).
2. **Platform Boşluğu Kanıtı:** 8 dk 15 sn oturum süresine sahip *Cine2Nerdle*'ın **native mobil uygulaması yok**; *MovieGrid.io* ve *Cinematrix*'in **native mobil uygulaması yok**; yeni çıkan en şık mobil rakip *Callback*'in **Android uygulaması yok, çok oyunculu modu yok ve toplam 4 ABD oyu var**; *Actorle 2.0*'ın **4.5 yılda sadece 122 ABD oyu var**.
3. **Nasıl Yenemeyiz?** Eğer oyunu "721 filmlik tek kişilik boş kutu doldurma veya çoktan seçmeli sinema testi" olarak çıkarırsak *Careo*, *Cine Trivia* ve *MovieGuessr* gibi **0 ABD oyunda kalırız**. Rakipleri ancak **"Native Mobilde (iOS + Android) Arkadaşla Oynanan 90 Saniyelik Taktik Sinema Satrancı"** boşluğunu sahiplenerek geçebiliriz.

---

## 2. RAKİPLER YAYINLANDIKLARINDAN İTİBAREN NASIL GÜNCELLENDİ? NELERİ DOĞRU VE YANLIŞ YAPTILAR?

### 2.1 Actorle & Moviedle (`Laszlo Kiss`) — 4 Yıllık Hata ve "2.0 Grup Pivotu" Vaka Analizi
- **Kronoloji:** Geliştirici Laszlo Kiss Mayıs 2022'de *Actorle*'ı (`id1620858489`), Kasım 2022'de *Moviedle*'ı (`id6444155140`) ayrı uygulamalar olarak yayınladı.
- **Yaptığı Ölümcül Hatalar (2022–2025, `v1.36 → v1.45`):**
  1. Her 3 tahminde bir tam ekran reklam gösterdi ve alt banner reklamı *Settings* butonunun üstünü kapattı (1★ yorum patlaması: *"Ad is blocking the settings button"*, *"After three guesses it gives you an ad after every guess"*).
  2. *Remove Ads* satın alımını bozuk bıraktı; para ödeyen kullanıcıların bile reklam görmeye devam etmesine ve *Johnny Depp*'in 1999 öncesi 20 filminin eksik olmasına yol açtı.
  3. Ayrı uygulama olarak çıkardığı *Moviedle*'ı Eylül 2023'te (`v1.8`) tamamen terk etti (Seviye 23-2 kilitlenme hatası hâlâ duruyor).
- **Ekim 2026'da Yaptığı Doğru Hamle (`Actorle 2.0`, `v2.0.3`):**
  - Dağınık oyunları tek çatı altında birleştirdi (*Actorle, Fill the Grid, Cinections, Storyboard, StarWords, Moviedle*).
  - **En kritik ürün kararı:** Bireysel günlük oyunu **Kalıcı Arkadaş Gruplarına (`Groups`)** bağladı: bir davet linkiyle kurulan grupta arkadaşlar her gün ya *Race* (en az tahminde kim çözdü) ya da *Co-op* (aynı tahtada canlı ortak çözüm) oynuyor; ücretsiz grup sınırı 10 kişi iken `Actorle Plus` (`$24.99/yıl`) 50 kişilik sınırsız grup satıyor.
- **Hâlâ Devam Eden Zayıflığı:** Ortak tahtada rekabetçi **bloklama / sıfır-toplamlı XOX gerilimi yok**, web sürümü Playwire reklam katmanlarıyla boğulmuş durumda ve Android'de yok.

### 2.2 Callback (`Jacob / Ono Kai Investments LLC`) — "Yüksek Zanaat, Düşük Viralite" Vaka Analizi
- **Kronoloji:** Solo geliştirici Jacob ("gündüz teknoloji şirketinde çalışıp akşamları tek başına geliştiren bir sinemasever") uygulamayı **17 Eylül 2026**'da çıkardı ve 2 ayda 7 ara sürüm çıkararak **16 Kasım 2026'da `v1.1.7`**'ye getirdi.
- **Yaptığı Çok Doğru 3 Hamle:**
  1. **Görsel `Film Bank` / `Actor Bank` UX'i:** *Movie Grid* ve *Six Degrees* modlarında kullanıcıyı boş klavyeyle baş başa bırakmak yerine ekrana **12 kartlık seçilmiş bir film/oyuncu havuzu** koydu. Böylece hem yazım hatasını hem de *"bildiğim film veritabanında yok"* öfkesini sıfırladı.
  2. **Web → iOS Dönüşüm Hunisi:** Bugünün 4 bulmacasını web'de (`playcallback.com`) ücretsiz ve üyeliksiz oynatıyor; ancak **geçmiş günlerin etkileşimli arşivini, serileri (streaks), widget'ları ve 3 ek oyunu (*Spotlight, Ranked, Plotlines*) yalnızca iPhone uygulamasına** saklıyor (web'de `Past answers` sadece düz metin spoiler listesi!).
  3. **`v1.1.7` "Admit Two" Davet Kancası & İçerik Üretici Günü:** Son güncellemede *"Arkadaşına davet kodu gönder, ikiniz de serinizi koruyan bir `Rain Check` (seri dondurma bileti) kazanın"* mekaniğini ve YouTuber/sinema içerik üreticileri için *"Take over a day of Callback"* (bir günün bulmacalarını kendi temanla devral) özelliğini ekledi.
- **Yaptığı Yanlış / Eksik:** Hiçbir **karşılıklı (PvP) hamle gerilimi yok** (tamamen huzurlu tek kişilik sabah bulmacası), Android uygulaması yok ve TMDB ücretsiz API kısıtı yüzünden gerçek bir gelir modeli kuramamış durumda (2 ayda 4 ABD oyu).

### 2.3 CineNerdle (`cinenerdle.app`) — "Yayıncı (Streamer) Roketi ve Elitist Duvar" Vaka Analizi
- **Kronoloji:** Önce günlük bulmaca olarak çıktı (`Original` serisi şu an `#1484`'te), ardından ayrı alan adında (`cinenerdle2.app`) gerçek zamanlı 1v1 *Cine2Nerdle Battle* modunu açtı; 2026'da `cinenerdle2.app`'i kapatıp (`"We've moved"`) tüm modları tek SPA çatısında (`cinenerdle.app`) *Battle 2.0*, *Battle Royale*, *Custom Arenas* ve 6 günlük bulmaca türüyle birleştirdi.
- **Yaptığı Çok Doğru Hamle:** Temmuz–Aralık 2023'te Twitch/YouTube yayıncısı **Northernlion**'ın her gün yayında oynamasıyla patladı. Neden yayıncılar sevdi? Çünkü **yasaklama (ban), can simidi (lifeline) ve "kill-shot" (rakibi çıkmaz aktöre sürükleme)** mekanikleri izlemesi aşırı heyecanlı bir **zihin sporuna** dönüştü; ayrıca kullanıcıların kendi bulmacalarını üretmesini (`Create` — 27.000+ topluluk bulmacası) açarak içerik yükünü topluluğa yıktı.
- **Yaptığı Yanlış / Bize Bıraktığı Boşluk:** Sıradan bir sinemasever *Cine2Nerdle Battle*'a girdiğinde 15 saniye içinde ezbere yardımcı oyuncu bilen kurtlar tarafından yok ediliyor (**aşırı yüksek yetenek tabanı**). Üstelik yıllardır **native iOS/Android uygulaması çıkarmadı**.

### 2.4 Filmed Up (`Conwov Ltd`) — Mobilde Sıfır Reklamla 3.479 ABD Oyu Alan Tek Kazanan
- **Kronoloji:** **3 Nisan 2025**'te çıktı, 19 ay boyunca aralıksız güncellenerek **4 Kasım 2026'da `v2.0.22`** sürümüne ulaştı (`Pro` yıllık abonelik, haftalık sınırlı kutu açılışları, canlı takas pazarı, Versus modu).
- **Yaptığı Doğru:** Sinema bilgisini "soru çöz → çık" döngüsünden çıkarıp **kimlik ve koleksiyon** nesnesine çevirdi; araya tek bir geçiş reklamı bile koymadı.

### 2.5 Sportrix & CineQuizz — İki Klasik Mobil Çöküş Otopsisi
- **Sportrix (`v2.28`, Mart 2024'te durdu):** *Immaculate Grid* dalgasını mobilde ilk yakalayanlardan oldu ve hızla **2.277 ABD oyu** topladı. Ancak kadro/transfer veritabanını otomatikleştirmeyip Mart 2024'te güncellemeyi kesince, 2024–2026 arasındaki tüm doğru cevapları "Yanlış" saymaya başladı ve mağaza puanı 1★ *"Doğru cevabı yanlış saydı, sildim"* yorumlarıyla çakıldı.
- **CineQuizz (`v1.0.1`, Mart 2025'te durdu):** 70 sinema teması ve 5 turlu canlı düello ile çıktı; ama asenkron/bot yedeği olmadan sadece **canlı eşleşme kuyruğu** kurduğu için eşzamanlı oyuncu bulamayan herkes boş sunucu (`"Serveurs vide"`) görüp uygulamayı terk etti.

---

## 3. HUKUKİ VE LİSANSLAMA TERSİNE MÜHENDİSLİĞİ: RAKİPLER İZİN Mİ ALMIŞ, ETRAFINDAN MI DOLAŞMIŞ?

Halka açık paketler, `Terms of Service` metinleri ve mağaza kayıtları incelendiğinde rakiplerin kullandığı **6 farklı lisanslama / taktik modeli** net olarak ortaya çıkmıştır:

| Taktik Arketipi | Kim Kullanıyor? | Teknik & Hukuki Mekanizma (`[Grade A]`) | Gerçek Yasallık & Ölçeklenme Sonucu |
|---|---|---|---|
| **1. Medya Devi Kurumsal Şemsiyesi** | **Cinematrix (Vulture / Vox Media)** | *MovieGrid.io* yapımcıları (Sam Shulman & Alex Nunan) oyun motorunu `app-bay-delta.vercel.app/vulture` üzerinden **Vox Media**'ya lisansladı/entegre etti; ticari abonelik ve reklam satışını doğrudan Vox Media yürütüyor. | **Yasal & Güvenli** — ama yalnızca arkada New York Magazine / Vox Media gibi kurumsal bir yayıncı olduğu için mümkün. |
| **2. "Bahşiş Kutusu (Tip Jar)" Kaçış Boşluğu** | **Callback (`playcallback.com`)** | İstemcide `https://image.tmdb.org/t/p/` posterlerini ve TMDB API'sini zorunlu TMDB atfıyla (`"uses the TMDB API but is not endorsed..."`) kullanıyor. TMDB ücretsiz lisansı reklam ve zorunlu satışı yasakladığı için geliştirici **sıfır reklam, sıfır abonelik koyup sadece gönüllü iOS Tip Jar (`$1.99–$9.99`)** bırakmış. | **Düşük Gelir Tuzağı.** Yasal çatışmadan kaçmak için para kazanma kabiliyetinden feragat etmiş. |
| **3. Gri Alan "Ücretsiz API + Abonelik/Reklam" Riski** | **CineNerdle, Actorle 2.0, MovieGrid.org** | - *CineNerdle:* `te.TMDB_KEY` + DoubleClick reklamları + Stripe `Cine-Nerd Membership`.<br>- *Actorle:* TMDB API atfı + tabloda doğrudan **`IMDb` puanları** + Playwire reklamları + `$24.99/yıl` Stripe Plus.<br>- *MovieGrid.org:* `image.tmdb.org` posterlerini TMDB logosu bile koymadan çekiyor. | **Saatli Bomba.** IMDb'nin ücretsiz veri setleri her türlü halka açık/ticari uygulamayı yasaklar (tek yasal yol AWS Data Exchange kurumsal lisansıdır). TMDB ise reklam/abonelik olan projelerde ticari sözleşme şart koşar. Web'de radar altında kalsalar da App Store'da büyüdüklerinde ihtar riski taşırlar. |
| **4. Açık Stüdyo Karesi (Still) İhlali** | **Absolute Popcorn, CineQuizz, Framed** | Doğrudan filmlerden alınmış kareleri (*Top Gun: Maverick* vb.) oyun içinde gösteriyorlar. | **Yüksek DMCA Riski.** *Framed* web'de "günlük editoryal/eleştirel bulmaca" gri alanında yaşasa da, *Absolute Popcorn* gibi `$59.99` IAP ve reklam satan mobil uygulamalarda stüdyo telifi (App Store Guideline 5.2.2) doğrudan kaldırma sebebidir. |
| **5. Özel Çizim / İllüstrasyon Taktiği** | **Movie Trivia (`Oakridge Dynamics`, `id6827434286`)** | Kasım 2026'da çıkan bu uygulama mağaza açıklamasında taktiğini açıkça ele veriyor: **`"Name the scene from our own painted movie moments"`** ve **`"shadow of a famous prop"`** — yani stüdyo fotoğrafı telifine takılmamak için sahneleri kendi fırça/illüstrasyon stiliyle yeniden çizdiriyor ve ünlü objelerin silüetini kullanıyor! | **Yaratıcı ve Yasal Kaçış**, ancak her sahne için üretim maliyeti gerektirir ve türev eser (derivative work) sınırına dikkat edilmelidir. |
| **6. %100 Clean-Room Olgusal Veri + CC0 Provenance (BİZİM MODELİMİZ)** | **Cine-XOX / Crosscut (`DATA_GOVERNANCE.md`)** | Film adları, yıllar, yönetmen ve oyuncu eşleşmeleri **teliflenemez olgulardır (uncopyrightable facts)**. Sıfır TMDB posteri, sıfır IMDb puanı, sıfır film karesi; görsel kimlik tamamen **35mm tipografik film şeridi ve projeksiyon estetiği** (`DESIGN.md`) üzerinden kuruludur. | **En Güçlü Ticari Zırh.** Sıfır API/lisans maliyeti ($0 COGS), tam çevrimdışı hız ve App Store / Google Play'de korkusuzca IAP/Pass satabilme özgürlüğü sağlar. |

---

## 4. `REPLICA-SKILL` KULLANICI NEFRETİ MADENCİLİĞİ: RAKİP YORUMLARINDAN ÇIKAN 7 ALTIN FIRSAT

`Jakeschincariol/replica-skill` metodolojisindeki `/replica-entrepreneur` prensibiyle 15+ rakibin gerçek 1★–3★ mağaza yorumları tarandığında, kullanıcıların **nefret ettiği 7 somut problem** ve bizim uygulayacağımız doğrudan çözüm şunlardır:

| # | Rakip Yorumlarında Kanıtlanan Kullanıcı Nefreti | Hangi Rakiplerde Görüldü? | Bizim Üründeki Kesin Karşılığı (Farklılaşma Silahı) |
|---|---|---|---|
| **1** | **"Doğru cevabım veritabanında yok diye yanlış sayıldı ve hakkım yandı!"** | *Sportrix* (2.277 oy), *Actorle* (*Johnny Depp* yorumu), *Moviedle* (*Star Wars* isim hatası) | **Sıfır-Cezalı Giriş Sözleşmesi:** 1v1 düelloda tahtaya özel doğrulanmış **20–24 kartlık `35mm Contact Sheet`** havuzu; açık aramada ise veritabanı dışı film girildiğinde sıra/seri yakmayan `"Arşivde henüz yok — hamleniz yanmadı"` koruması. |
| **2** | **"30 saniyelik oyun oynuyorum, her el sonu 1–2 dakika geçilmeyen reklam çıkıyor!"** | *Guess the Movie* (12.541 oy), *Actorle 1.x* | **Sıfır Geçiş Reklamı Anayasası:** Maç aralarında asla zorunlu video/banner reklam yok; gelir yalnızca *Vault/Archive Pass* ve 35mm kozmetiklerden. |
| **3** | **"Düello moduna giriyorum, sunucular bomboş, kimse yok!"** | *CineQuizz* (`"Serveurs vide"`), *Careo* | **Sıfır Genel Kuyruk + Kurulumsuz Ghost-Duel:** Rastgele canlı kuyruk yerine **tıklanır tıklanmaz mobil tarayıcıda 5 saniyede oynanan davet linki** + 24 saatlik asenkron düello + şeffaf etiketli 11 çevrimdışı bot. |
| **4** | **"Asenkron oyunda rakibim yemek yapmaya gitti, saatlerce hamle bekliyorum!"** | *Codenames Mobile* (1.157 oy) | **Paralel Asenkron + Anında Bot Sparring:** Arkadaşının hamlesini beklerken tek dokunuşla 11 farklı karakterdeki çevrimdışı bota karşı kariyer maçına girebilme; hiçbir zaman kilitli ekranda beklememe. |
| **5** | **"Aynı isimli filmlerin hangi yıl olduğu yazmıyor, yanlış olanı seçtim!"** | *MovieGrid.org* canlı testi (*Iron Man* / *Man of Iron* tekrarı), kendi eski *Dune* çakışmamız | **Zenginleştirilmiş Clean-Room Başlık Çözümleyici (`formatMovieDisplayTitle`):** Orijinal + uluslararası başlık ve belirsizlik giderici yıl/yönetmen bağlamı (P0 olarak kod tabanında düzeltildi). |
| **6** | **"Karşıma gelen oyuncu 1974 Fransız filminin ışıkçısını biliyor, ben hiçbir şey yapamadan ezildim!"** | *Cine2Nerdle Battle* (`r/CINE2nerdle` yeni oyuncu şikâyetleri) | **Ansiklopediyi Yenen Geometri:** Sadece kenar/köşe ve `LOCKED_NEUTRAL` / `GOLDEN_REEL` kurallarını akıllı kullanan orta seviye bir sinemasever, ortak 20–24 kartlık destede yürüyen IMDb ansiklopedisi arkadaşını çatal (fork) kurarak yenebilir. |
| **7** | **"Yaptığım zekice hamleyi spoiler vermeden arkadaşlarıma hava atarak paylaşamıyorum!"** | *Codenames Mobile* yorumları | **Spoiler'sız 3×3 Taktik Düello Kartı + Rövanş Linki:** Hangi hücrelerin kilitlendiğini ve kaç hamlede kazanıldığını gösteren görsel/metin 3×3 şema (P0 temeli [dailyShare.ts](../../src/utils/dailyShare.ts) içine eklendi). |


---

## Denetçi Notu (devralan oturum, 25 Kasım 2026)

- **Doğrulandı (iTunes Lookup API):** FilmedUp ABD 3.479 oy / 4,66★; Callback ABD 4 oy; Actorle ABD 122 oy; CineQuizz ABD/TR 0 oy (Fransa'da var). Rapor rakamları tutarlı.
- **Eksik rakip:** **CinemaXOX: Movie Tic-Tac-Toe** (iOS id6828127619, yayın 13 Kasım 2026, TR'de 3 oy 5★, ABD 0) bu analizde yok. Aynı 3×3 XOX + film konseptinde, EN/TR, canlı düello ve günlük grid sunuyor. En yakın doğrudan rakip budur; ad olarak "Cine-XOX" ile karışırdı (rebrand gerekçelerinden biri).
- **Marka bulgusu (düzeltildi, 26 Kasım):** önceki not CROSSCUT sahibini "Cascade Public Media" diye yazıyordu; WIPO resmî kaydında sahip Crosscut LLC ve kapsam yalnızca haber hizmeti. Oyun için çakışma yok (bkz. `APP_STORE_SUBMISSION.md` H).
- **Kapsam çatışması:** Bu planın Faz 2-3 maddeleri (sunucu RPC yeniden yazımı, Contact Sheet modu, Screening Room, Wikidata betiği) yeni özelliktir; 1.0 kod dondurma kararıyla çelişir. Onay olmadan başlanmadı.
- **Android:** `android/app/build.gradle` hâlâ `com.cinetactico.game`; iOS `com.crosscutgame.app`. 1.0 yalnızca iOS olduğu için dokunulmadı; Android çıkmadan birleştirilmeli.
