# Nihai ürün yönü (usta belge) — 26 Kasım 2026

Bu belge tek karar belgesidir. Derin kaynaklar: `01` rakip/lisans çözümlemesi, `02` kurul görüşleri (tarihsel), `03` yenileme ve katalog ölçütü, `04` mağaza/oyunlaştırma, `05` çok rollü denetim. Hedef pazar **globaldir** (ABD, UK, CA, AU öncelikli); Türkçe yalnızca ikinci dildir.

Güven seviyeleri: **A** doğrudan doğrulandı, **B** birden fazla kaynak, **C** sınırlı/dolaylı, **D** doğrulanamadı (karar dayanağı yapılmadı). Erişim tarihi: 26 Kasım 2026 (iTunes Lookup/Search ABD ve UK, App Store ve Play sayfaları, tarayıcı).

## 1. Yönetici özeti
1. Pazarda boşluk var ama küçük kanıtla: web'in günlük film oyunları (Cinematrix, MovieGrid, Framed, CineNerdle) mobilde yok (B); mobil yeni oyunların neredeyse hepsi 0–4 oyda (A). Büyük mobil film oyunları eski: Guess the Movie: Icon Pop Quiz 12.541 oy ama 2021'den beri güncellenmedi (A). "Pazar var" demek için kanıt: Sportrix 2.277 oy (A) ve Gridiron 950 oy (A) 3×3 grid'in mobilde talep gördüğünü gösteriyor.
2. **Ürünümüzün vaadi ile 1.0'ın sunduğu uyuşmuyor.** Biz "sosyal ve rekabetçi" ürün konumlandırıyoruz; 1.0'da çok oyunculu yok (`SHOW_ONLINE_ROOM=false`), arkadaş yok, liderlik tablosu yok, analitik yok (A, kod). 1.0 gerçekte: **bota karşı, çevrimdışı, reklamsız film düellosu + günlük 9 kare.** Rakiplerin en güçlü kozu tam burada: sosyal (Actorle grup, Callback davet=seri koruyucu).
3. Callback (4 oy) bizim "reklamsız, hesapsız" vaadimizi zaten veriyor ve web'den oynatıyor (A). Bu yüzden fark "reklamsız" değil, **12 saniyelik düello baskısı ve taktik**.
4. Tek ana karar: bot düellosunu çekirdek yap, **sunucusuz tohumlu meydan okuma linkiyle** onu arkadaşlar arası rekabete çevir (1.1). Sunucu, hesap, eşleşme kuyruğu yok.

## 2. Ürün denetimi (kodla doğrulandı, A)
| Özellik | Durum |
|---|---|
| Klasik düello, Ters Kadraj (prosedürel + 2 hazır), Sinefil Konsept (5 hazır tahta), bot Kolay/Orta/Zor, 12 sn tur, Altın Makara | Çalışıyor, testli |
| Günün Kadrası (solo X, 9 kare, 5 kademe, seri, bir hak/gün) | Çalışıyor, testli, golden tahta testi |
| Katalog 1.040 film, 536 yönetmen, 6.402 oyuncu; alias eşleme; sıfır poster | Çalışıyor; delikler: animasyon 2, belgesel 5, yönetmen havuzu (≥5 film) 34, Anora yok |
| Paylaşım kartı (spoiler'sız) | Çalışıyor; arkadaşın aynı tahtayı oynaması yok |
| Çevrimiçi oda (Supabase) | **Kapalı**, sunucu doğrulaması eksik, 1.0'da yok |
| Ekonomi (Makara/coin), lig, görevler | Kodda var, bayrakla gizli; kullanıcıya yok |
| Analitik, çökme izleme | **Yok** (bilinçli: gizlilik etiketi "veri toplanmıyor") |
| Diller | TR, EN |
| Android | Bilerek yayın planı dışı (paket adı farklı) |
| Bildirim, widget, hatırlatma | Yok (Callback'te var) |
Eksikliklerin sonucu: oyuncuyu ikinci gün geri getiren tek şey günlük kadraj ve seri; arkadaşa yayılma kanalı yok.

## 3. Rakip doğrulama tablosu (23 + keşifler)
Seviye: A/B/C/D. "Bulunamadı" = mağazada o isimle doğrulanamadı.
| # | Ürün | Kimlik ve durum | Seviye |
|---|---|---|---|
| 1 | Cinematrix | Vulture/Vox web, No. 974 (25 Kas 2026), arşiv, uygulama yok | A |
| 2 | Movie Grid | moviegrid.io, Next.js/Vercel/TMDB, uygulama yok, kardeş oyunlar | A |
| 3–4 | CineNerdle / Cine2Nerdle | cinenerdle.app aktif (Vite/Cloudflare/Heroku, TMDb atfı), eski adres açık; Battle sekmesi görüldü, oynayamadım | A (varlık) / D (oyun içi) |
| 5 | Callback | Ono Kai Investments, id6790211885, v1.1.7 (16 Kas), 4 oy 5★; web'de oynanıyor; Android yok | A |
| 6 | Actorle | Laszlo Kiss, id1620858489, v2.0.3 (28 Eki), 122 oy 4,39★, reklam şikâyetleri; Android bulunamadı | A / D (Android) |
| 7 | Film Alchemy | app.filmalchemy, Android 100+, web (Firebase), iOS yok | A |
| 8 | Movie Quiz: Cinema Trivia Game (Careo) | id6798573490, ABD/TR 4 oy; Android com.careolimited.moviequiz 50+, reklamlı | A |
| 9 | Absolute Popcorn | Timing Corp, id6759967919, 0 oy; Android 50+, reklam+satın alma | A |
| 10 | CineQuizz | Timepilot, id6739583664, v1.0.1 (Mar 2025), 0 oy, terk | A |
| 11 | Titans of Trivia | Mağazada (iOS ABD/UK, Play) bulunamadı | D |
| 12 | Infinite Movie Quizz | Bulunamadı | D |
| 13 | MovieGuessr | A. T. Figanioglu, id6764073165, 0–1 oy; aynı adda ikinci uygulama (Vincotech) | A |
| 14 | Movie Trivia: Film Quiz Game | Oakridge Dynamics, id6827434286, 0 oy, 19 Kas 2026 | A |
| 15 | Guess the Movie — Quiz Game | "Guess the Movie - Quiz Game" (id711993911, 41 oy, 2017) ve Icon Pop Quiz (12.541 oy, 2021) ayrı; hangisinin kastedildiği belirsiz | C |
| 16 | Cine Trivia | Mert Baykal, id6807158041, 0 oy, 19 Kas 2026 | A |
| 17 | Framed | framed.wtf aktif (Next.js/Cloudflare), uygulama yok | A |
| 18 | Spotle Movies | Bulunamadı. "Spotle" müzik/sanatçı tahmini oyunu (spotle.io); film sürümü doğrulanamadı | D |
| 19 | Immaculate Grid | Web adresi bot koruması (403) verdi, oynayamadım; UK mağazada "Immaculate Grid" (Two4Tea, 0 oy) resmî olduğu doğrulanamadı | D |
| 20 | Wordle | NYT Games, 302.598 oy 4,8★ (taklit Wordle! 848.897 oy) | A |
| 21 | Codenames | CGE Digital, 4,99 dolar, 1.157 oy 4,74★ | A |
| 22 | Hollywood Squares | Aktif mobil oyun bulunamadı (benzer: Hollywood Vibes 2022) | D |
| 23 | Scene It? Movie Edition | Aktif mobil sürüm bulunamadı | D |
Keşifler (ana listeye alınmadı, doğrulanmadı): CinemaXOX (aynı mekanik, 13 Kas, 0 oy; A), Scenes – Guess the movie (1.078 oy, 2016; A), Filmed Up (3.488 oy TCG; A), Sportrix, Gridiron (A), Play'de "gridle", "moviecircle" gibi küçük adlar (D).

Derin incelemeler: `01` ve `04`, `05` (mağaza, ekran görüntüsü, yorum, gelir kalemi, web). Oynadığım: Callback web, MovieGrid (yalnızca ilk ekran). Oynamadığım: iOS uygulamalarının hiçbiri, CineNerdle, Cinematrix, Actorle web.

## 4. Mağaza ve gelir bulguları (özet; ayrıntı 05)
- Gelir kalemleri (A, App Store): Callback bahşiş 1,99/4,99; Actorle reklamı kaldır 4,99 + Plus; Gridiron Pro 39,99/yıl, ömür boyu 59,99, coin, bilet; Absolute Popcorn aylık 3,99, yıllık 44,99, paketler; Filmed Up Pro 9,99, sezon geçişi, gem paketleri.
- Şikâyetler (A, yorumlar): reklam ve bozuk günlük (Actorle), eski veri ve yanlış doğrulama (Sportrix), limit+ödeme tuzağı (Gridiron). Beğeniler: "NYT oyunları ama film", işe giderken günlük rutin, film önerisi (Callback), rahatlatıcı koleksiyon (Filmed Up).
- Android küçük film oyunlarının hepsi reklamlı (Filmed Up hariç) (A).
- Gelir rakamları ve indirme sayıları (Play bandı hariç) bilinmiyor (D); uydurulmadı.
- Segmentler: günlük bulmaca (Callback, Cinematrix), trivia quiz (Popcorn, Icon Pop), oyuncu tahmini (Actorle), sosyal/grup (Actorle 2.0), koleksiyon (Filmed Up), grid (Sportrix, Gridiron). Film için "rekabetçi 1v1 grid" boş (CinemaXOX hariç, 0 oy) — boş olması otomatik fırsat değil; talep kanıtı sporda var, filmde sınanmadı (C).

## 5. Fırsat var mı?
**Evet, koşullu (C).** Kanıt: grid türünün sporda mobilde 2.277 ve 950 oy aldığı (A), film için web oyunlarının milyonluk ziyareti olduğu (Framed 3–4,8 milyon ziyaret/ay: `01` belgesindeki üçüncü taraf ölçümü, bu oturumda yeniden doğrulanmadı; C), mobil film oyunu arzının eski ya da 0 oylu olduğu (A). Risk: film grid'in mobilde talebi kanıtlanmadı; Callback ve Actorle 2.0 aynı kitleye sosyal özellikle yöneliyor; dağıtım ve veri tazeliği kazananı belirler (Sportrix'in ölümü).

## 6. Strateji seçenekleri ve puan (1–5 × ağırlık)
| Kriter (ağırlık) | A: Film düellosu (strateji+bilgi) | B: Günlük film oyunu ekosistemi | C: Arkadaş grubu rekabeti | D: Fandom marka/topluluk |
|---|---|---|---|---|
| İhtiyaç (.20) | 3 | 4 | 4 | 2 |
| Farklılaşma (.20) | 4 | 1 | 3 | 3 |
| Geri getirme (.15) | 3 | 4 | 3 | 2 |
| Yayılma (.15) | 3 | 3 | 4 | 3 |
| Gelir (.10) | 2 | 3 | 3 | 3 |
| Teknik (.10) | 5 | 4 | 2 | 2 |
| Marka (.10) | 3 | 4 | 3 | 5 |
| **Toplam** | **3,30** | 3,15 | 3,25 | 2,75 |
Güven: C. A ile C arasındaki fark ölçüm hatası içinde. Gerekçe: B'de Callback ve Cinematrix hazır; D'nin talebi yok; C kullanıcı değeri yüksek ama sunucu ister. **Seçilen ana strateji: A, C'ye sunucusuz köprüyle (tohumlu meydan okuma).** Neden B ana strateji değil: kopyası var ve biz yalnızca tek oyunculu günlükte ikinciyiz. Neden C tek başına değil: sunucu ve doğrulama maliyeti, 1.0 gecikir.

## 7. Nihai konumlandırma
- **Kategori:** Games > Trivia (ikincil Strategy).
- **Vaat:** "Sinema bilgini 12 saniyede taktikle birleştir: botla düello, günlük kadraj, çevrimdışı, reklamsız." (1.1'den sonra: "…ve arkadaşının skorunu geç.") Önceki belgelerdeki "botla, arkadaşla" ifadesi 1.0 için yanlıştı; 1.0 metinlerinde arkadaş vaadi yok (kontrol edildi).
- **Kullanıcı:** film/dizi seven, günlük oyun alışkanlığı olan (Wordle/NYT kitlesi), kısa rekabet seven.
- **Çekirdek döngü:** düello (bot) → rövanş → günlük kadraj → seri → paylaşım kartı.
- **Ayrışma:** Callback/Cinematrix/MovieGrid'den baskı ve taktikle; Actorle'den çevrimdışı ve sunucusuz akıcılıkla.

## 8. KEEP / IMPROVE / BUILD / REMOVE-DEFER
| Karar | Özellik | Neden |
|---|---|---|
| KEEP | 12 sn tur, hat kurma, Altın Makara, bot kişilikleri, günlük 5 kademe, çevrimdışı, reklamsız, sıfır poster/temiz veri, spoiler'sız paylaşım | Ayrışmanın kendisi; testli |
| IMPROVE | Katalog delikleri (animasyon, belgesel, yönetmen), mağaza görselleri (yapıldı), arama "bulunamadı" kurtarma, Konsept tahtası sayısı (5), Ters Kadraj çeşitliliği (Marvel payı ~%33) | Veri tazeliği Sportrix dersi |
| BUILD | Tohumlu meydan okuma linki + web'de oynanabilir tahta, seri koruyucu davet, rövanş, çerezsiz analitik, tek seferlik yorum isteği, hatırlatma | Sosyal kanca ve ölçüm; sunucusuz |
| REMOVE/DEFER | Çevrimiçi oda ve eşleşme kuyruğu, Makara ekonomisi, lig, görevler, olasılık matrisi, 5 mini oyun, reklam, can/enerji, afiş | Sunucu ve hile riski, kanıtsız karmaşıklık, rakip ödeme tuzakları |
Çevrimiçi odanın kodu silinmez (bayrak kapalı), yeni yatırım yapılmaz.

## 9. Yol haritası
Efor: S ≤ 2 gün, M ≈ 3–7 gün, L ≈ 2+ hafta (tek geliştirici, mevcut mimari; tahmin, C).
**P0 — Gönderim (1.0):** (a) ad kararı + marka sorgusu, (b) Xcode/ASC, (c) gerçek iPhone testi, (d) katalog dondurma. Metrik: onay, çökmesiz oturum. Kabul: TestFlight'ta 9/9 günlük ve düello gerçek cihazda.
**P1 — Rekabetçi (1.0.1):** `DAILY_POOL_VERSION` (günlük tahtayı katalogtan ayır, M), katalog delikleri (M), arama kurtarma (S), tek seferlik yorum isteği (S), nadir kayıt zorluk katmanı (M). Metrik: arama başarısı ≥%95 (hipotez), puan ≥4,5.
**P2 — Büyüme (1.1):** tohumlu meydan okuma linki + web tahtası (L), seri koruyucu davet (M), rövanş kısa klaket (S), çerezsiz analitik + gizlilik etiketi güncellemesi (M). Metrik: davet linkinden tamamlanan maç, D1/D7. Kabul: linkle gelen kişi kurulumsuz aynı tahtayı oynar ve skor karşılaştırır.
**P3 — Genişleme (1.2+):** arşiv + Director's Cut paketi (4,99–9,99) (L), ES/FR/DE/PT-BR, creator takeover günü, sunucu doğrulamalı özel oda (ancak P2 metrikleri tutarsa).

## 10. Metrikler ve olaylar
Benchmark bulunamadı (D): D1/D7/D30 için güvenilir kategori verisi bulamadım; aşağıdakiler **test edilecek hipotezdir**, sektör verisi değil: D1 ≥ %35, D7 ≥ %12, günlük paylaşım ≥ %15, davet dönüşümü ≥ %35, çökmesiz oturum ≥ %99,5.
Analitik olayları (1.1, çerezsiz, kimliksiz): `app_open`, `match_start{mode,difficulty}`, `match_end{result,duration,frames}`, `rematch_tap`, `daily_start`, `daily_complete{tier}`, `share_tap{kind}`, `challenge_open{source}`, `challenge_complete`, `search_not_found{count}`. Metrikler: D1/D7/D30, oturum süresi, kullanıcı başına maç, tamamlanan maç, rövanş oranı, davet dönüşümü, çökmesiz oturum. Ücretli dönüşüm ve ARPDAU 1.2'den önce anlamsız (gelir yok).

## 11. Teknik ve operasyonel sürdürülebilirlik
Veri: CC0 Wikidata, kayıt başına kaynak; poster, IMDb, TMDb lisanslı alan yok; rakipler TMDb'ye bağlı (CineNerdle atıf gösteriyor) ve ticari kullanımda lisans/atıf yükü taşır (B). Yenileme: betik yılda iki kez; golden test günlük tahta değişimini yakalar. Hile: çevrimdışı tek oyunculu; sunucu yok, risk yok. Moderasyon, KVKK/GDPR: veri toplanmıyor. Maliyet: sıfır sunucu; tohumlu linkler statik web'de.

## 12. Uygulama raporu
Bu oturumda uygulananlar (hepsi commit'li, `release/round-2`, testler yeşil): solo günlük kadraj ve kademeler, profil sertleştirme, emoji/AI-slop temizliği, katalog 721→1.040, prosedürel Ters Kadraj, sahne ışığı maçta kapalı, rakip seçimi ortada pencere, mağaza görselleri ve anahtar kelimeler, tüm strateji belgeleri. Kod bu belgede yeni değişmedi. Kalan: P0 maddeleri (yalnızca sende) ve P1–P3.
Onay gerektiren ve yapılmayanlar: main'e alma/push, ücretli servis, mağaza yayını, ad ve marka kararı.

## 13. Operasyon kuralı
Günlük tahta katalogdan türetilir; yayından sonra katalog değişirse eski/yeni sürümde farklı tahta görülür. Çözüm P1'deki `DAILY_POOL_VERSION`; 1.0 öncesi katalog dondurulur.

## 14. Ad, SEO ve GEO kararı (26 Kasım)
- **Karar: Crosscut ile devam.** Hukuk (A, WIPO resmî kayıtları): oyun/yazılım için çakışma yok; en yakın canlı kayıt ABD 3368825, yalnızca haber hizmeti. Hukuki görüş değildir; ayrıntı `APP_STORE_SUBMISSION.md` H.
- **SEO/GEO zayıflığı (A):** "Crosscut" arandığında ilk sonuçlar testere, sözlük, Home Depot ve 1995 filmi (arama sonucu, bu tarih). Yani marka teriminde organik sıra almak zor; ürün adıyla değil, **kategori + ad** ile aranıp bulunur ("crosscut movie game", "crosscut trivia"). Önlemler: ad her yerde tanımlayıcıyla ("Crosscut: Movie Trivia Game"), varlık cümlesi birebir aynı (kodda var: `ENTITY_SENTENCE`, JSON-LD, llms.txt), mağaza ve site metninde "movie game" geçsin.
- **Alan adı:** `crosscutgame.com`, `crosscut.game`, `crosscutgame.app`, `crosscut.gg` DNS'te çözülmüyor (muhtemelen alınabilir, C: kayıt şirketinde doğrula). `crosscut.app`, `playcrosscut.com`, `crosscut.games` alınmış. Öneri: `crosscutgame.com` (+ `crosscutgame.app`), sonra `SITE_URL` ve `public/robots.txt`, `sitemap.xml`, `llms.txt` güncellenir. Yayını engellemez.
- **iOS konumlanma:** kategori Games > Trivia (ikincil Strategy), ad "Crosscut: Movie Trivia Game", alt başlık "Daily movie duel. No ads.", anahtar kelimeler 97 bayt, 6 görsel (TR/EN). Bunlar `APP_STORE_SUBMISSION.md` C ve `docs/release/store/`.
