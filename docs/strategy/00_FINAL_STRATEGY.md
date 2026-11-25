# Nihai strateji (25 Kasım 2026)

Kaynaklar: iki paralel oturum raporu, bu oturumun marka/App Store taraması, kod tabanı. Rakamlar iTunes Lookup API ile elle doğrulandı (FilmedUp ABD 3.479, Sportrix 2.277, Gridiron 948, Codenames 1.157, Callback 4, CinemaXOX yeni).

## 1. Karar
**Konumlandırma:** "Sinema bilgisini taktikle birleştiren 90 saniyelik düello ve günlük kadraj." Çevrimdışı, reklamsız, bota karşı anında oynanır.

**Neden kazanır (kanıtlı):**
- Web'in dört günlük film oyunu (Cinematrix, Movie Grid, Framed, CineNerdle) mobilde yok. Mobildeki yeni film quizleri ABD'de 0-4 oyda duruyor.
- Hepsi tek kişilik ya da boş sunucuya bağlı (CineQuizz: "sunucular boş"). Bizde rakip bot, bekleme yok.
- CineNerdle'ın hilesi uzun süre; bizde 12 sn.
- Aynı mekanikte yakın rakip CinemaXOX (13 Kas 2026, 0 ABD oyu): farkımız çevrimdışı, reklamsız, 12 sn tur, Altın Makara, bot kişilikleri, günlük 5 kademe.

**Yapmayacağımız:** 5 mini oyunlu paket (Callback/Actorle v2 ile aynı yarışa girmek), rastgele canlı eşleşme kuyruğu, geçiş reklamı, can/enerji, arkadaşla oynamayı paralı yapmak, jokerler, çift para birimi.

## 2. Sıra
**1.0 (gönderim):** donmuş kod + marka kararı + mağaza paketi. Gizlilik etiketi "veri toplanmıyor" doğru kalsın diye 1.0'a analitik koyma.

**1.0'dan hemen önce (YAPILDI, 25 Kasım):**
1. Katalog 2022-2026: 721 → 1.040 yapım, 2023 ve sonrası 10 → 258 (Past Lives, Poor Things, The Substance, Challengers, Anatomy of a Fall artık var; Anora Wikidata'da eksik veriyle elendi). Betik: `scripts/fetch_wikidata_recent.py` (yalnızca ekler, yeni kayıt başına yönetmen, tür ve ≥3 oyuncu şartı). Eski not: 721 yapımın yalnızca 10'u 2023 ve sonrasıydı. Bulunmayanlar: Anora, Past Lives, Poor Things, Challengers, The Substance, Anatomy of a Fall. Bir sinefil bunları yazıp "bulunamadı" görürse siler (Sportrix'in ölüm nedeni). Doğrulama kapılı CC0 Wikidata hattıyla ~150-250 popüler yapım.
2. Prosedürel Ters Kadraj: HÂLÂ YAPILMADI (2 hazır tahta, Konsept 5). 1.0.1 için ilk iş.

**1.1 (yayın sonrası 2-3 hafta):** (a) Aynı tahtayı arkadaşa gönderme linki (`?c=seed`, sunucusuz; web'de anında oynanır), (b) yanlış cevapta hangi eksenin tutmadığını göster (✓/✕), (c) hızlı rövanş (kısa klaket), (d) çerezsiz analitik + çökme izleme (gizlilik etiketiyle birlikte güncellenir).

**1.2:** Günlük arşiv + "Director's Cut" paketi (tek seferlik ~$4.99 ya da ~$19.99/yıl), çekirdek oyun ve arkadaş daveti ücretsiz kalır.

**Sonra, metrik doğrulanınca:** sunucu doğrulamalı özel oda, haftalık arkadaş tablosu, ES/FR/DE/PT-BR.

## 3. Pazarlama (sıfır bütçe)
Gerçek oyun ekranından 15 sn dikey video ("12 saniye kaldı, tek film yaz"), Letterboxd/Reddit'te kurulumsuz web tahtası, "daily movie / movie trivia / film quiz" ASO. Mağaza adında XOX yok (aramada talep sıfır).

## 4. Hedef metrikler (hipotez, ölçülecek)
D1 ≥ %35, D7 ≥ %12, oturum başına ≥ 2,5 maç, çökmesiz oturum ≥ %99,5, günlük paylaşım ≥ %15, davet linkinden tamamlanan maç ≥ %35. Ölçüm 1.1'de başlar.

## 5. Riskler ve kapılar
- **Marka (kapı):** ABD'de CROSSCUT (Reg. 3368825, Sınıf 41, Cascade Public Media) canlı görünüyor; iki bağımsız tarama aynı. USPTO/TMview/TÜRKPATENT sorgusu temiz çıkmadan App Store Connect'te ad rezerve edilmez. Yedek: Nitrate. Ad ne olursa Android `applicationId` (şu an `com.cinetactico.game`) iOS ile eşitlenir.
- **İçerik (yüksek):** yukarıdaki yama olmadan ilk yorumlar "film bulunamadı" olur.
- **Rekabet:** CinemaXOX'u izle; 1.1 paylaşım döngüsü onun canlı düello avantajına karşı cevabımız.
- **Telif:** 0 poster, olgusal veri; metadata'da Oscar/IMDb/oyuncu adı yok.
- **Eksik gelir:** 1.0 gelirsiz; kabul edilmiş bilinçli seçim.

## 6. Operasyon kuralı: katalog değişince günlük tahta değişir
Günlük tahta katalogdan türetilir (`daily-board-golden.test.ts` bunu kanıtlar). Yayından sonra katalog güncellenirse eski ve yeni sürümdeki oyuncular aynı gün farklı tahta görür ("herkese aynı" vaadi bozulur). Çözüm planı (1.0.1): günlük tahtayı sabit bir katalog anlık görüntüsüne (`DAILY_POOL_VERSION`) bağla, anlık görüntü yalnızca ileri tarihlerde değişsin. 1.0 gönderilmeden önce katalog dondurulmalı.
