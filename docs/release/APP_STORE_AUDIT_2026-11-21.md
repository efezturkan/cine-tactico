# App Store Uyum Denetimi — 21 Kasım 2026

Kapsam: `main` @ bu commit. Etiketler: **[ÖLÇÜLDÜ]** bu oturumda çalıştırıldı, **[KODDAN]** kaynak okundu, **[YAPILMADI]** doğrulanamadı.

## Yapılan düzeltmeler (bu denetimde)

| # | Sorun | Neden önemli | Çözüm |
|---|---|---|---|
| 1 | Bot adı `LetterboxdEfsanesi` ve mağaza ekran görüntüsünde görünüyordu | Guideline 5.2.1: üçüncü taraf marka kullanımı | `BesYildizEfsanesi`; gizli liderlik tablosundaki `LetterboxdCritic` de değişti; ekran görüntüleri 01 ve 02 yeniden çekildi (1320×2868) |
| 2 | İki bot unvanında emoji kalmıştı | Tasarım anayasası | Temizlendi |
| 3 | TR etiketlerde "Suç (Crime)" gibi parantezli İngilizce | Tasarım anayasası 1.2 | `translateCriterionLabel` ASCII parantez ekini TR'de siliyor, Türkçe karakterli ekler korunuyor |
| 4 | Derlemeye Supabase proje adresi gömülüyordu (`.env.local` yüzünden) | "Ağ yok, veri toplama yok" beyanı ile uyum; gereksiz yüzey | `npm run build:ios` (env'siz derleme + cap sync). Arşiv öncesi bunu kullan. Çıktıda adres geçmiyor [ÖLÇÜLDÜ] |
| 5 | İnceleme notlarında olmayan "ipucu butonu", "Universal/iPad" ifadesi | Yanlış beyan inceleme notu riski | Düzeltildi |

## Doğrulananlar [ÖLÇÜLDÜ]

- Release (cihaz, imzasız) derleme: **BUILD SUCCEEDED**. Xcode 27.2, SDK 27.2, sürüm 1.0 (1), min iOS 15.0, yalnızca iPhone, dikey.
- Simülatörde (iPhone 17 Pro Max) soğuk açılış, Gişe, rakip seçimi, maç ekranı çalışıyor.
- İkon 1024×1024, alfa yok. Ekran görüntüleri 1320×2868 (6,9").
- `PrivacyInfo.xcprivacy`: izleme yok, toplanan veri yok, UserDefaults gerekçesi CA92.1.
- `ITSAppUsesNonExemptEncryption = false`. ATS istisnası yok. Çalışma anında `fetch`/WebSocket yok, Supabase bayrakla kapalı.
- Gizlilik politikası TR/EN, uygulama içinde Ayarlar'dan açılıyor, kod gerçeğiyle uyumlu. Lisans ve atıf bölümü Ayarlar'da.
- `tsc` temiz, `npm test` yeşil.

## Senin yapman gerekenler (kimlik/ödeme gerektirir)

1. Apple Developer üyeliği, sözleşmeler, **Team** seçimi (`DEVELOPMENT_TEAM` boş, imza otomatik).
2. App Store Connect'te uygulamayı oluştur, metinleri `APP_STORE_SUBMISSION.md`'den yapıştır, `docs/release/screenshots/` yükle.
3. Arşivden önce: `npm run build:ios`, sonra Xcode'da Any iOS Device → Archive → Upload.
4. **Gerçek iPhone'da** Uçak Modu denemesi ve TestFlight turu.
5. Yaş derecelendirme anketi (notlarda 4+ öneriliyor). Fiyat: ücretsiz, satın alma yok.

## Kalan riskler (karar senin)

| Risk | Düzey | Not |
|---|---|---|
| **4.2 Minimum işlevsellik** (WKWebView) | Orta | Çevrimdışı oyun ve haptik savunma. Bundan fazlasını (örn. yerel bildirim, Game Center) bu sürüme eklemedim. |
| **4.3(b) Doygun kategori (XOX)** | Orta | İnceleme notlarındaki farklılaşma anlatımı doğru. İlk dakikada Altın Makara ve kilit kuralını göstermen için notlarda rota var. |
| **Gerçek kişi adları** bot isimlerinde (NolanZihni, TarantinoKult, ScorseseAilesi, KubrickBakisli, FincherDedektif) ve `OscarAvcisi` | Düşük-orta | Onay/destek imasını Apple kişilik hakları açısından sorgulayabilir. Rename'i bilerek yapmadım, markalı olmaları senin tasarım kararın. İstersen "Auteur" tarzı genel adlara çevrilir. |
| Oyuncu/yönetmen **portreleri** (11 CC lisanslı dosya) | Düşük | Pakette var ama kodda görüntüleyen bileşen yok (`LocalFace` kullanılmıyor). Atıflar Ayarlar'da. Kullanılmayacaksa paketten çıkarmak riski sıfırlar. |
| Süre baskısı çubuğu ve oyun ekranı boş alanları | UX | Korumalı dosya, iznin olmadan dokunmadım. |
| Soğuk açılışta ilk ~5 sn koyu ekran | Düşük | Simülatörde gözlemlendi, gerçek cihazda ölçülmedi. |
| `Rating` etiketi anlamsız (oyuncunun ratingi yok) | Düşük | Yanıltıcı değil ama sorgulanabilir. |

## Yapılmadı [YAPILMADI]
Gerçek cihaz testi, TestFlight, App Store Connect doldurma, imzalı arşiv, yaş derecelendirme anketi, Android.
