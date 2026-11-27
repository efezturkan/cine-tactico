# Mağaza görselleri (1.0)

## Yüklenecek set
- `en/` ve `tr/`: her dilde 5 App Store ekran görüntüsü, 1320×2868, RGB, alfa yok (6,9" iPhone). Sıra dönüşüm sırasıdır; ilk üçü arama sonucunda görünür:
  1. 12 saniye gerilimi (klasik düello, kırmızı sayaç)
  2. Ters Kadraj
  3. Günlük Kadraj + paylaşım kartı
  4. Hızlı arama (yıl ayrımı / Türkçe takma ad)
  5. Çevrimdışı, reklamsız, hesapsız (ana ekran)
- Kaynak: iPhone 17 Pro Max simülatöründeki gerçek oyun, ham ekranlar `../launch-pack/raw-screens/{en,tr}/01..05.png`. Üzerine yalnızca başlık ve yuvarlak köşe eklenir (`compose_v3.py`): çerçeve, 3D, neon yok (Apple 2.3.7).
- Çekim notu: 12 saniyelik sayaç çekim sırasında donduruldu (depoya girmeyen, `src/` kopyası üzerinde geçici derleme). İlk karede sayaç 3 sn (kırmızı), diğerlerinde 12 sn. Arayüz birebir aynı. İstersen imzalı sürümle bir kez daha çekip ham klasörünü değiştir.

## Canlı sayfa önizlemesi (yatırımcıya göstermek için)
- `store-page-preview.html`: tek dosya, internet gerektirmez. Arama sonucu + ürün sayfası, EN/TR, koyu/açık. Metinler `APP_STORE_SUBMISSION.md` ile aynı. Değerlendirme alanı bilerek boş (yorum yok). Yayında değildir.
- `preview/*.png`: hazır görüntüler. Adrese `#lang=tr&theme=light&scroll=1100` eklenebilir.
- Yeniden üretmek: `python build_store_preview.py` (Pillow). Şablon: `store_preview_template.html`.

## Yeniden üretmek
1. Ham ekranlar: `xcrun simctl io <udid> screenshot x.png`, saat için `xcrun simctl status_bar <udid> override --time 9:41`.
2. `python compose_v3.py` (Pillow, Georgia Bold).
3. `python build_store_preview.py`.

## Kurallar
- Ekran görüntüleri her zaman gerçek uygulamadan kalır; film afişi, stüdyo logosu, gerçek kişi fotoğrafı yok.
- App Icon: `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png` (1024×1024, alfa yok), değiştirilmedi.
