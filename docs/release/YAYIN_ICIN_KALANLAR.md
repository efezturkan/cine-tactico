# Yayın için kalanlar (23 Kasım 2026)

Kod tarafında App Store'a engel bilinen bir şey kalmadı. Aşağıdakiler **senin hesabına ve gerçek cihaza bağlı** işler, ben yapamam.

## 1. Sen yapacaksın (sırayla)
1. Apple Developer üyeliği (99 USD/yıl) ve sözleşmeler.
2. Xcode: `ios/App/App.xcodeproj` → target **App** → Signing & Capabilities → **Team** seç (`DEVELOPMENT_TEAM` şu an boş).
3. Terminalde `npm run build:ios` (Supabase adresi paketlenmeden derler), sonra Xcode'da Any iOS Device → Archive → Upload.
4. App Store Connect: yeni uygulama, metinler `APP_STORE_SUBMISSION.md`'den, ekran görüntüleri `docs/release/screenshots/` (RGB, 1320×2868).
5. **Gerçek iPhone'da** dene: Uçak Modu, klavye (Türkçe karakterler), ses düzeyi, Altın Makara, Günün Kadrası paylaşımı.
6. TestFlight iç testi, sonra Add for Review.

## 2. Gerçek cihazda bakılacaklar (simülatörde doğrulanamadı)
- Yeni ses ana kanalı/limiter kulağa nasıl geliyor (ayarlar → Ses düzeyi).
- Klavye kapanınca ekranın yerinde kalması (simülatörde düzeldi, `AppDelegate.swift`).
- Günün Kadrası sonuç kartı ve paylaşım metni (birim testi var, ekranda görülmedi).

## 3. Karar bekleyenler
- Bot adlarındaki gerçek kişi isimleri (NolanZihni, TarantinoKult…) ve `OscarAvcisi` düşük-orta kişilik hakkı riski.
- Süre çubuğu (`ShotClock.tsx`, korumalı) tahtadan uzakta ince bir çubuk, görünürlüğü artırılabilir.
- Ses: earshot'tan gerçek örnek mi, mevcut sentez + ana kanal mı.
- Rarity hâlâ yalnızca beraberlik bozucu (hat kazanımını etkilemiyor).
- Online Oda açılmadan önce sunucu `submit_move` yeniden yazılmalı (çalma yolu var, cevap doğrulaması yok).

## 4. Bilinen sınırlar
- Yazı boyutu: korumasız dosyalarda 70 yerde `text-[10px]`, 34 yerde `text-[9px]` var. Küçük ekranda okunabilirlik gerçek cihazda gözden geçirilmeli.
- Hücre sahipliği yalnızca renkle (altın/mavi çerçeve) ayrışıyor. Renk körleri için ek bir işaret önerilir (`XoxBoard.tsx` korumalı).
