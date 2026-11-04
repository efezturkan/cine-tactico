# CineXOX MVP Kapsam & Kilit Dokümanı (v2)

Bu doküman, CineXOX projesinin MVP kapsamını, kilitlenen sınırlarını ve nihai bitti tanımını belirler.

---

## 1. MVP'de VAR (Odak)
- **3 Çekirdek Mod**: Klasik Düello, Ters Kadraj, Sinefil Konsept.
- **Günün Kadrası**: Takvim gününe göre bilet formatında tekil günlük seans (NO.03).
- **Tek ve Ortak Oyun Motoru**: Bot (`VS_BOT`) ve Özel Gösterim (`ONLINE_ROOM`) aynı `src/core/` motorunu çalıştırır.
- **4 Tam Ekran Sayfa**: Gişe, Vizyondakiler, Özel Gösterim, Sinefil Kartı (`BottomNav` ile).
- **Sinematik Geri Bildirim**: Klaket geri sayımı, 12 saniye süre çubuğu, deklanşör tıkı, "Sahne senin!" zafer anı, "Bu çekim olmadı." kayıp anı, "Kör kadraj" berabere anı.
- **Salon Işığı**: 4 hazır ayar (Kadife, Analog, Gümüş, Gece mavisi), Loşluk, Projeksiyon (Işık huzmesi), Gren.
- **Moda Göre Otomatik Atmosfer**: Klasik (`#D9A441`), Ters Kadraj (`#5FB3A8`), Sinefil Konsept (`#9A8FD8`), Günün Kadrası (`#C9A27A`).
- **İlk Açılış Rehberi**: "Nasıl Oynanır?" (3 adımlı sinematik kart).
- **Ayarlar**: Ses, titreşim, Salon ışığı, Nasıl oynanır, Gizlilik politikası, Kullanım koşulları.

---

## 2. MVP'de GİZLİ (Kod Silinmez, FLAGS Arkasına Alınır)
- `SHOW_ONLINE_COUNT = false` (Canlı çevrimiçi sayısı)
- `SHOW_LIVE_TICKER = false` (Maç feed'i)
- `SHOW_DAILY_QUESTS = false` (Görevler)
- `SHOW_TASTE_DNA = false` (Zevk DNA'sı)
- `SHOW_LETTERBOXD_CONNECT = false` (Letterboxd bağlama)
- `SHOW_LEAGUE_BAR = false` (Lig çubuğu)
- `SHOW_COIN_ECONOMY = false` (Makara / coin ekonomisi)
- `SHOW_NOTIFICATIONS = false` (Bildirim zili)
- `SHOW_PROBABILITY_MATRIX = false` (Olasılık matrisi)
- `SHOW_NEW_FORMATS = false` (Yeni formatlar)
- `SHOW_BOARD_ARCHIVE = false` (Tahta arşivi)
- `SHOW_TOURNAMENTS = false` (8 kişilik turnuva)
- `SHOW_BO3 = false` (BO3 modu)
- `SHOW_ROOM_PRIVACY = false` (Gizli oda anahtarı)
- `SHOW_BLITZ = false` (Blitz modu)
- `SHOW_TIMER_PICKER = false` (Süre seçici)
- `SHOW_POINTS_SYSTEM = false` (+ Puan sistemi)
- `PLAYER_PHOTOS = false` (Dış ağdan oyuncu fotoğrafı / afiş yükleme)

---

## 3. BİTTİ TANIMI (Definition of Done)
- [X] Hiçbir ekranda kesik metin ("…"), emoji, İngilizce metin, resmî "-sınız" dili yok
- [X] Renkler tokenlardan geliyor, ikinci altın/cyan/açık mavi/lacivert/parlak sarı kalmadı
- [X] Tek buton sistemi, tek modal mantığı (sayfa / alt sheet / orta kart), iç içe kaydırma yok
- [X] Özel Gösterim ve Sinefil Kartı sayfa, alt sekme çubuğu hep görünüyor
- [X] Oyuncu/yönetmen/tür hücreleri her yerde aynı baş harf karesi, fotoğraf ve afiş yok
- [X] Marka adı (KODAK, Criterion, Letterboxd…) kullanıcıya görünmüyor
- [X] Oyun ekranı dikey olarak dengeli, süre çubuğu ve rakip bilgisi var, X için onay var
- [X] Vizyondakiler afişleri büyük serif başlıklı, boş üst alan, kesik başlık, "3×3 KADRAJ" tekrarı yok
- [X] Arşiv ve Sonuç ekranı aynı mini kadraj bileşenini kullanıyor, Paylaş çalışıyor
- [X] Rehber ilk açılışta çıkıyor, Ayarlar'dan tekrar açılıyor, ayarlar tek yerde
- [X] Salon ışığı çalışıyor (4 hazır ayar, Loşluk, Projeksiyon, Gren), moda göre köşe rengi çalışıyor
- [X] Günün Kadrası açılıyor, bitiyor, oynanmış durumu var, paylaşılıyor
- [X] 360/390/430 px'te taşma yok, 4x CPU throttle'da takılma yok, sürekli animasyon yok
- [X] `tsc` 0 hata, `npm test` yeşil, `npm run build` hatasız


## v1.0 (TestFlight) Kararları — 4 Kasım 2026
- **Çevrimiçi Özel Gösterim v1.0'da KAPALI** (`FLAGS.SHOW_ONLINE_ROOM = false`). Bayrak kapalıyken Supabase hiç bağlanmaz, hesap/ağ/veri toplama yoktur; uygulama tamamen çevrimdışıdır ve gizlilik politikası buna göre yazılmıştır.
- Alt bar 3 sekme: Gişe, Vizyondakiler, Sinefil Kartı. Online geri açılırken 4. sekme (Özel Gösterim) otomatik gelir.
- Moda göre kural: 12 sn shot-clock, 3×3 klasik XOX.
- Günün Kadrası UTC gününe göre döner; havuz yalnızca her hücresi ≥3 cevaplı tahtalardan oluşur.
- Online'ı açmanın önkoşulu: `submit_move` içinde sunucu tarafı cevap doğrulaması, yanlış cevap/süre aşımı olaylarının sunucuya yazılması, Ters Kadraj ve Altın Makara senkronu.
