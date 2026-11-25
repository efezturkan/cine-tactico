# Mağaza, oyunlaştırma ve giriş: rakip çözümlemesi ve bizim kurgumuz (26 Kasım 2026)

Kaynak: iTunes Lookup/Search ve App Store yorum akışı (ABD), tarayıcıda MovieGrid.io ve CineNerdle ana sayfası, Vulture Cinematrix sayfası. Oynamadığım şey: iOS uygulamalarını cihazda oynamadım; "nasıl oyunlaştırmışlar" kısmı mağaza metni, sürüm notu, yorum ve web arayüzünden çıkarım. Cinematrix ve CineNerdle'ı baştan sona oynamadım (CineNerdle sayfası yüklenirken kaldı, giriş/kayıt ve üç sekme görünüyor).

## 1. Rakipler: yapı, yorum, giriş

| Ürün | Mağaza yapısı | Yorumlar (ABD) | Giriş/oyunlaştırma çıkarımı |
|---|---|---|---|
| **Callback** | Ad "Callback: Daily Movie Games"; 9 ekran görüntüsü; 1 dil; 22 MB; "NYT oyunları ama film" konumlandırması; 5 mini oyun (Six Degrees, Movie Grid, Odd One Out, Screen Test...) | 4 yorum, hepsi 5★: "New York Times games ama film", "işe giderken", "yeni film önerisi veriyor" | Sürüm notu: animasyonlu "nasıl oynanır" demoları; **Admit Two** daveti: arkadaş kodu kullanılınca ikisi de **seri koruyucu (Rain Check)** kazanıyor. Yani sosyal büyüme, seri kaybı korkusuna bağlanmış |
| **Actorle 2.0** | 10 ekran görüntüsü; metin "arkadaşlarınla oyna": grup, yarış, ortak (co-op) tahta, haftalık tablo, davet linki; Actorle Plus ile 50 kişilik grup | 26 yorum, çoğu 1–2★: bozuk günlük meydan okuma, reklam ayarı düğmesini kapatıyor, "reklamı kaldıracak IAP ekleyin", terk edilmiş uygulama | Web hesabıyla seri taşınıyor. Fikir sosyal ama uygulama kalitesi ve reklam yüzünden yorumlar kötü |
| **CineQuizz** | 7 ekran görüntüsü; "70'ten fazla tema", 5 turluk düello, rastgele oyuncuyla eşleşme, avatar açma | Yorum yok; 17 FR oy, sunucular boş | Seviye ve avatar ödülü var ama rakip yoksa düello hiç başlamıyor. Terk edildi |
| **Absolute Popcorn** | 10 ekran görüntüsü; 8 dil; 91 MB; 5 mini oyun; "10.000+ soru" | Yorum yok | Çok içerik, sıfır çekim gücü: iki ayda yeniden tasarım yapıldı ama yorum yok |
| **Scenes** | 5 ekran görüntüsü; emoji/ikonlarla film bulmaca; genişleme paketleri | 1.078 oy, 4,56★ | On yıl yaşıyor; basit, tek kişilik, paketle genişliyor |
| **Filmed Up** | TCG: kart, paket, takas; 3.479 ABD oyu | Olumlu: "rahatlatıcı", "koleksiyon merakım film aşkıma bağlandı", oyun içi coin sevgisi | Koleksiyon + haftalık içerik düşüşü; film kitlesi para harcıyor |
| **Sportrix** (3×3 spor grid) | 2.277 oy; sürüm 2.28, Mart 2024'ten beri güncel değil | "EOL", "3 yıl eski veri", "doğru cevap yanlış sayılıyor" | **Aynı mekanik, ölüm nedeni: eski veri ve yanlış doğrulama** |
| **Gridiron** (NFL grid) | 948 oy, 4,8★, 4 büyük sürüm | Sevilen: günlük + özel modlar. 1★: günlük limit, **$5 ödedim, arkadaşımla oynatmadı** | Günlük limit + ücretli devam öfke yaratıyor |
| **MovieGrid.io** (web) | Giriş yok: sayfa açılır açılmaz bugünün 3×3 tablosu, **9 hak**, "Give Up?", sekmeler: Today, Yesterday, GIF Script, TV Grid, Classic, Deep Cut, Archive; kardeş oyunlar (Pyramid, Reveal, Snakes, Globe) | — | Sıfır sürtünme; zorluk katmanı (Classic/Deep Cut) ve arşiv |
| **Cinematrix** (Vulture) | "No. 974", her sabah 05:00, arşiv, haftalık bonus bulmaca, TV kardeşi Telematrix | — | **Sayılı sayı + editoryal marka + arşiv**: alışkanlık "sayı numarası" ile kurulmuş |
| **CineNerdle** (web) | Puzzles / Battle / Trivia sekmeleri, Sign In/Register üstte, TMDb atfı | — | 8 dk oturum: Battle modu (hamle-karşı hamle) ve topluluk bulmacaları |

## 2. Neden iyiler, neden değiller (ortak örüntüler)
1. **Alışkanlık döngüsü günlük + sayılı + seri.** Cinematrix (No. 974), Callback (seri koruyucu), Actorle (haftalık tablo). Hiçbirinin çevrimdışı canlı rakibi yok.
2. **Sosyal kanca arkadaşa.** Callback'te davet seri korur, Actorle'de grup. İkisi de hesap ve sunucu ister.
3. **Başarısızlık nedenleri tekrar ediyor:** eski veri (Sportrix), yanlış cevap yanlış sayılıyor (Sportrix), boş sunucu (CineQuizz), reklam/bozuk günlük (Actorle), günlük limit + ödeme tuzağı (Gridiron), içerik şişirme ama çekim yok (Absolute Popcorn).
4. **Mağaza yapısı:** hepsi 7–10 ekran görüntüsü; başarılılar (Callback, Gridiron) tek cümlelik bir söz veriyor ("NYT oyunları ama film", "NFL günlük").
5. **Giriş:** başarılı olanlarda hesap yok, ilk ekranda oyun (MovieGrid) ya da kısa animasyonlu demo (Callback).

## 3. Bizim kurgu: hepsinden iyi olacak yerler
| Rakip acısı | Bizim cevabımız (durum) |
|---|---|
| Reklam, bozuk günlük | Reklamsız, çevrimdışı, günlük aynı UTC günü tek tahta (YAPILDI, test kanıtlı) |
| Boş sunucu, rakip yok | Bot rakip anında, kişilikli, rövanş tek dokunuş (YAPILDI) |
| Eski veri / yanlış doğrulama | 1.040 film, alias eşleme, her hücre çözülebilir kanıtlı, tazelik testi (YAPILDI); yenileme betiği |
| Günlük limit + ödeme tuzağı | Günlük bir kez, ama bot düello sınırsız; ödeme yok (YAPILDI) |
| Tek kişilik sığlık | 12 sn tur baskısı + hat kurma taktiği + Altın Makara (YAPILDI) |
| Sayılı alışkanlık yok | Günlük "NO.21" bileti var (YAPILDI); sayılı paylaşım kartı var; **arşiv yok** (1.2) |
| Sosyal büyüme | Callback tarzı seri koruyucu davet, **tohumlu meydan okuma linki** (1.1; sunucusuz) |
| Zorluk katmanı | Bot Kolay/Orta/Zor (YAPILDI); MovieGrid'in "Deep Cut" benzeri nadir kayıt katmanı yok (1.0.1) |

Dürüst sınır: bu tablodaki "iyi"ler özellik karşılaştırması, kullanıcı kanıtı değil. Rakipler sosyal ve içerik genişliğinde bizden öndedir (Actorle grup, Callback 5 oyun, Absolute Popcorn 10.000 soru).

## 4. Mağaza sayfası kuralları (rakiplerden)
- Ad + alt başlık tek söz: "Günlük film düellosu, reklamsız" (rakip yorumlarındaki en büyük acıya doğrudan cevap).
- 8–10 ekran görüntüsü; ilk üçü: (1) bir hücre + 12 sn çubuğu, (2) bot rakip kartı, (3) günlük bilet/sonuç kartı. Mağazada gerçek ekranlar var (`docs/release/store/{tr,en}`).
- Açıklamanın ilk satırı "ne"; ikinci satır "neden farklı": çevrimdışı, reklamsız, anında rakip. Sürüm notlarında Callback gibi her sürümde tek yeni özellik.
- Yorum stratejisi: ilk 3 günde yalnızca mutlu anda (9/9 sonrası) tek `SKStoreReviewController` isteği; hata yoksa zorlama yok (1.0'a kod eklenmedi; 1.0.1 önerisi).
- Giriş: hesap yok, ilk açılışta 1 oyun/demo (MovieGrid gibi sıfır sürtünme + Callback gibi kısa animasyon). Mevcut ilk açılışı simülatörde doğruladık (ana ekran → rakip seç → oyun).

## 5. Rakipleri geçmek için sıra
1.0 (şimdi): reklamsız bot düello + günlük + 1.040 film, marka ve mağaza.
1.0.1: katalog delikleri (animasyon, belgesel, yönetmen), `DAILY_POOL_VERSION`, tek seferlik yorum isteği, "nadir kayıt" zorluk katmanı.
1.1: tohumlu meydan okuma linki + seri koruyucu davet (Callback'ten öğrenilen), rövanş, çerezsiz analitik.
1.2: günlük arşiv + paket.
Yapma: reklam, günlük limit+ödeme, 5 mini oyun, kuyrukta rastgele eşleşme.
