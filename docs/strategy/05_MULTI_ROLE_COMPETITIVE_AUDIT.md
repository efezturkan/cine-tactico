# Çok rollü rekabet denetimi (26 Kasım 2026)

Roller: CPO, rekabet istihbaratı, oyun tasarımcısı, mobil büyüme, iş analisti, teknik ürün denetçisi. Yöntem: `product-management:competitive-brief` ve `seo-audit` iskeleti; veri iTunes Lookup/Search (ABD ve TR), App Store ve Google Play web sayfaları, rakip ekran görüntüleri (iletişim tabloları olarak karşılaştırıldı), playcallback.com, moviegrid.io, cinenerdle.app, Vulture/Cinematrix.

**Doğrulanamayanlar (açık):** iOS uygulamalarını cihazda oynamadım (yalnızca web sürümleri ve mağaza varlıkları). Actorle'nin Android sürümünü Play aramasında bulamadım: "yok veya doğrulanamadı". Play sayfalarında yalnızca indirme bandı, reklam/satın alma bayrağı ve Filmed Up'ın puanı okunabildi; diğerlerinin puan ve yorum sayıları okunamadı. CineNerdle sayfası yüklenmedi, oynamadım. Cinematrix'in oyununu oynamadım.

## 1. Rekabet istihbaratı: doğrulanmış tablo

| Ürün | iOS (ABD) | Android (Play) | Gelir yapısı (App Store'dan) | Kimlik |
|---|---|---|---|---|
| Callback | 4 oy 5,0★, 9 ekran görüntüsü, ücretsiz | Yok | Küçük/Büyük popcorn (1,99/4,99 dolar, bahşiş), "Movie night" 9,99 | Pastel, NYT benzeri; film afişli ekran görüntüleri; her ekran görüntüsünde büyük başlık |
| Actorle 2.0 | 122 oy 4,39★, 10 ekran görüntüsü | Bulunamadı | Remove Ads 4,99, Actorle Plus (grup), diğer paketler | Canlı pembe/turkuaz, cihaz çerçeveli, "Play with friends" |
| Absolute Popcorn | 0 oy, 10 ekran görüntüsü, 8 dil | 50+ indirme, reklam + satın alma | Aylık 3,99, yıllık 44,99, paketler 2,99–22,99, bilet 2,99–24,99 | Sarı çizgi film, film kareleri |
| CineQuizz | 0 oy, 7 ekran görüntüsü, yaş 12+ | 1.000+ indirme, reklam + satın alma | Satın alma var | Terk edilmiş |
| Filmed Up | 3.488 oy, TCG | 10.000+ indirme, 4,52★ / 2.664 yorum, **reklamsız** | Pro 9,99, sezon geçişi 4,99, gem paketleri 2,99–19,99 | Koleksiyon + oyun içi coin |
| Gridiron | 948 oy, 4,8★ | — | Pro yıllık 39,99, **ömür boyu 59,99**, coin 0,99–7,99, bilet (enerji) 1,99–3,49 | Günlük + limit |
| Film Alchemy | — | 100+ indirme, reklam + satın alma | — | Hobi |
| Scenes | 1.078 oy, 4,56★, 5 ekran görüntüsü | — | Genişleme paketi | 2016'dan beri |

Önemli: Android'deki küçük film oyunlarının **hepsi reklamlı** (Filmed Up hariç). "Reklamsız" Android'de fark, ama iOS'ta Callback aynı iddiayı yapıyor.

**En kritik yeni bulgu:** playcallback.com'da yazıyor: "Free. No ads. No account." ve "Free, no sign-up", bugünün bulmacası sayfada oynanıyor. Yani Callback bizim "reklamsız, hesapsız" vaadimizi zaten veriyor ve web'i uygulamaya giriş hunisi yapıyor. Ayrıca "Creators: Take over a day of Callback" (bir içerik üreticisi o günün tüm bulmacalarını kendi temasıyla kürate ediyor), seri, honors (rozetler), arşiv, hatırlatma ve widget, SSS'de "film verisi nereden geliyor". Bizim farkımız bu yüzden "reklamsız" değil **düello**: botla veya arkadaşla, 12 saniye baskısı, taktik.

## 2. Pazar boşlukları (arama verisi)
- ABD "guess the movie" aramasını eski simge/afiş testleri domine ediyor: Icon Pop Quiz 12.541 oy, Hollywood Vibes 3.799, Movie Quiz (2015) 2.555. "daily movie game" aramasında 1. sıra Callback ve 4 oyu var: **anahtar kelime sahipsiz.** "movie grid" aramasında bu türden kimse yok (sonuçlar fotoğraf kolajı uygulamaları).
- Türkiye: "film quiz" ve "film bilgi yarışması" aramalarında en iyi sonuçlar 0–4 oylu uygulamalar; Türkçe, sinefil, reklamsız bir ürün yok. Filmed Up TR'de 25 oy topluyor: talep var, arz yok.
- Aynı mekanik rakipler: CinemaXOX (0 oy). Aynı tür 3×3 spor grid: Sportrix 2.277 oy (ölü), Gridiron 948 oy (canlı).

## 3. CPO: konumlandırma ve yol haritası
Konumlandırma cümlesi (doğrulanmış boşluğa göre): **"Sinema bilgisini taktikle birleştiren 90 saniyelik düello. Botla, arkadaşla, çevrimdışı, reklamsız."** "Daily" ikincil, "düello" birincil. Callback'in alanı "günlük bulmaca paketi"; biz oraya girmiyoruz.
Sıra: 1.0 gönderim (donmuş kod, mağaza varlıkları iyileştirmesi) → 1.0.1 (yorum isteği, katalog delikleri, DAILY_POOL_VERSION) → 1.1 (tohumlu meydan okuma linki + web'de oynanabilir tahta + seri koruyucu davet) → 1.2 (arşiv + paket).

## 4. Oyun tasarımcısı: döngü karşılaştırması
- Rakiplerin döngüsü: günlük kısa bulmaca → sonuç kartı → seri. Hata cezası düşük, süre baskısı yok (CineNerdle Battle hariç).
- Bizim döngümüz: düello (12 sn, hat kurma, Altın Makara) + günlük 9 kare (kademeli sonuç). Güçlü: gerilim ve taktik. Zayıf: tek oyunculu "bitti, yarın gel" hissi bizde de var; sosyal çekim (arkadaşa meydan okuma) 1.0'da yok. Callback'in "Admit Two" mekaniği (davet = seri koruyucu) tek hamlede hem davet hem seri bağı kuruyor; sunucusuz yapılabilir (davet kodu yerine tohum linki).
- Zorluk: MovieGrid "Classic" ve "Deep Cut" sekmeleriyle iki seviye veriyor; biz bot Kolay/Orta/Zor ile var, günlükte tek seviye.
- Sayılı alışkanlık: Cinematrix "No. 974", bizde bilet "NO.21". Doğru yönde.

## 5. Mobil büyüme
1. **Web = giriş hunisi.** Callback ve MovieGrid web'de oynatıyor; biz de statik Next dışa aktarımıyla aynı kodu web'de oynatabiliriz (kod zaten Next). Reddit/Letterboxd bağlantısı "kurulum yok, 12 saniyede dene".
2. **İçerik üretici günü:** Callback'in "takeover" fikrinin bizdeki hali: bir Letterboxd/sinema kanalının seçtiği günlük tahta. Sunucusuz: tohum + başlık parametresi ile link. Maliyet sıfır, dağıtım yaratıcının kitlesi.
3. **ASO (kanıta bağlı):** Ad "Crosscut: Movie Trivia Game", alt başlık "Daily movie duel. No ads." Anahtar kelimeler (97 bayt): film,quiz,cinema,guess,grid,puzzle,versus,bot,offline,cinephile,actor,director,tic tac toe,streak. Sahipsiz kelimeler: "daily movie game", "movie grid" benzeri sorgular. TR: "film bilgi yarışması" ve "sinema oyunu" sorgularında kimse güçlü değil; TR alt başlık "Günlük film düellosu".
4. **Ekran görüntüleri:** rakiplerin hepsi **parlak renkli, her görselde tek büyük başlık, telefon çerçevesi içinde net oyun ekranı**. Bizimki: koyu zemin, küçük başlık, oyun ekranı küçük ve koyu üstüne koyu (sonuç küçük boyutta okunmuyor). Karanlık estetik marka olarak doğru, ama arama sonuçlarında 3 küçük görselde kontrast ve okunurluk zayıf. Öneri: ilk üç görselde başlığı büyüt, tahtayı yakınlaştır, altın vurguyu artır; daha açık bir 3. görsel (sonuç kartı).
5. **Yorum:** rakip yorumları reklamdan (Actorle), eski veriden (Sportrix) ve limit+ödemeden (Gridiron) şikâyetçi; bu üçü bizde yok ve mağaza açıklamasında dürüstçe anlatılabilir ("hiç reklam yok, günlük limit yok, bot düello sınırsız").

## 6. İş analisti: gelir karşılaştırması ve öneri
Piyasa: bahşiş (Callback 1,99/4,99), reklamı kaldır (Actorle 4,99), Pro yıllık/ömür boyu (Gridiron 39,99/59,99; Popcorn 44,99/yıl), enerji/bilet satışı (Gridiron, Popcorn) ve paket (2,99–22,99). Şikâyet edilen: limit+ödeme (Gridiron), reklam (Actorle).
Öneri: 1.0 gelirsiz kalsın (gizlilik etiketi ve onay riski). 1.2'de iki kalem: **tek seferlik "Director's Cut" paketi (4,99–9,99)** ve **bahşiş** (Callback ve Actorle bunu kullanıyor, yorum kızgınlığı yok). Enerji, bilet, coin yok: Gridiron yorumları bunun öfke yarattığını gösteriyor. Yıllık abonelik ancak arşiv + özel tahta paketi varsa.

## 7. Teknik ürün denetçisi: bizim ürün
- Doğru ve rakipte olmayan: çevrimdışı çalışma, 12 sn tur, bot kişilikleri, günlük kademeli sonuç, temiz veri kaynağı, paylaşım kartı.
- Eksik/risk: (a) mağaza görsellerinin okunurluğu, (b) web'de oynanabilir giriş yok (ürün kodu hazır, dağıtım yok), (c) sosyal çekim yok, (d) yorum isteği yok, (e) TR ve EN dışında dil yok (Absolute Popcorn 8 dil), (f) Android bilerek ertelendi: Android'de reklamsız bir film oyunu boşluğu var, ama yayın planına alınmadı.
- Uyarı: Callback ve Popcorn afiş/kare görselleri ekran görüntülerinde kullanıyor. Biz kullanmıyoruz (bilinçli, lisans). Bu mağaza görsellerini daha sade gösterir; telafisi tipografi ve renk.

## 8. Yapılacaklar (bu turda yapılan ve kalan)
Yapıldı: EN anahtar kelimeler güncellendi; strateji ve mağaza metni belgeleri.
1.0'dan önce (senin kararın, kod değil): mağaza görsellerinin ilk üçünü büyük başlıkla yeniden üret; TR alt başlık "Günlük film düellosu".
1.0.1/1.1: yukarıdaki sıra. Android yayın planına eklenmedi; yalnızca bu denetimde rakip olarak izlendi.
