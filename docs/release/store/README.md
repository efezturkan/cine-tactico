# Mağaza görselleri (1.0)

- `tr/` ve `en/`: 6'şar App Store ekran görüntüsü, 1320×2868, RGB, alfa yok.
- 26 Kasım: yeniden üretildi (rakip denetimi, `docs/strategy/05_*`): amber zemin, büyük başlık (150 px), ikinci satır koyu, telefon alttan taşıyor ve tahta büyük görünüyor. Mantık `compose.py` içinde (ham ekranlar `/private/tmp/claude-501/shots/*.png` yolunu bekler; yeniden üretirken yolu düzelt).
- Kaynak: iPhone 17 Pro Max simülatöründe `npm run ios:sim` ile alınmış gerçek ekranlar. Üzerine yalnızca başlık ve çerçeve eklendi.
- App Icon: `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png` (1024×1024, alfa yok), değiştirilmedi.

## Yeniden üretmek
1. `SIM_NAME="iPhone 17 Pro Max" npm run ios:sim`
2. Ekranları `xcrun simctl io <udid> screenshot x.png` ile yakala (Türkçe için uygulama dilini Ayarlar'dan değiştir).
3. Başlık ve çerçeve: `compose.py` (Pillow, 1180 px telefon, Georgia Bold başlık).
4. Not: oyun ekranı ham görüntüleri sahne ışığı maçta gizlenmeden önce alındı; huzme hafifçe görünüyor. Bir sonraki çekimde yeni derlemeyle yenile.

## Gemini ile alternatif görsel istersen
Gemini CLI kurulu (`gemini`), ama oturum yok. Kendi terminalinde bir kez `gemini` yazıp "Login with Google" yap (ya da `GEMINI_API_KEY` ortam değişkeni ver). Görsel üretimi için Gemini API'nin görsel modeli ve CLI eklentisi gerekir; CLI tek başına metin üretir.
Önerilen istem (arka plan sanatı, uygulama ekranı dahil değil):
> "Dark neo-noir cinema poster background for a mobile trivia game: black and deep charcoal, a single warm amber projector beam from the top, subtle 35mm film perforations at the edges, soft film grain, no text, no logos, no people, vertical 1320x2868."
Gelen görseli `compose.py` yerine arka plan olarak kullanabilirsin; ekran görüntüleri her zaman gerçek uygulamadan kalmalı (Apple 2.3.7).
