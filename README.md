# Crosscut

[![CI](https://github.com/efezturkan/cine-tactico/actions/workflows/ci.yml/badge.svg)](https://github.com/efezturkan/cine-tactico/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Crosscut, 3×3 tahtada oynanan, tamamen çevrimdışı bir sinema bilgi ve strateji oyunudur. Her kare bir satır ve bir sütun ipucunun kesişimidir; 12 saniye içinde iki ipucuna da uyan filmi bul, kareyi mühürle, üç kareyi bir hatta diz. Botlara karşı oyna ya da her gün herkes için aynı olan Günlük Kadraj'ı çöz.

- Canlı site, gizlilik ve destek: <https://cine-tactico.vercel.app>
- Sürüm: 1.0 (iOS). Android bu sürümün kapsamında değil.
- Bundle kimliği: `com.crosscutgame.app`

## 1.0 neleri içerir

| Mod | Açıklama |
|---|---|
| Klasik Düello | Aktör ve yönetmen ipuçlarının kesişimi, botlara karşı |
| Ters Kadraj | İki filmin ortak oyuncusunu bul |
| Sinefil Konsept | Tür ve tema ipuçları |
| Günlük Kadraj | UTC gününe göre herkese aynı tahta, rakipsiz, 9 kare, günde tek hak |

Hesap yok, ağ bağlantısı yok, reklam ve satın alma yok. Veri (takma ad, istatistik, seri) cihazda kalır. Çevrimiçi oda kodu varsayılan derlemede pakete girmez (aşağıya bak).

## Teknoloji

Next.js 14 (statik export), React 18, TypeScript, Tailwind CSS, Capacitor 8 (iOS), Web Audio ile üretilen sesler. Oyun motoru (`src/core`) arayüzden ve ağdan bağımsız saf TypeScript'tir.

```text
src/core/        Oyun motoru: kurallar, bot, tahta üretimi, Günlük Kadraj kademeleri
src/data/        Tahtalar, botlar, kriter verisi
src/content/     Wikidata'dan türetilmiş film kataloğu (CC0) ve uyarlayıcılar
src/features/    gameplay, profile, multiplayer (çevrimiçi parça kapalı)
src/components/  Ortak arayüz
src/utils/       Ses, dokunsal geri bildirim, paylaşım, kalıcı depo
src/tests/       Test paketi (npm test)
docs/            Tasarım anayasası ve yayın belgeleri (docs/release)
ios/             Capacitor iOS projesi
supabase/        Çevrimiçi katman için şema ve RLS (1.0'da kullanılmıyor)
```

Kural belgesi `MASTER_SPECIFICATION_v3.md`, görünüm ve dil kuralları `docs/design/DESIGN.md`'dedir.

## Geliştirme

```bash
npm install
npm run dev          # http://localhost:3000
npx tsc --noEmit     # tip denetimi
npx next lint
npm test             # tüm test zinciri
npm run build        # statik çıktı: out/
```

`next dev` çalışırken `next build` çalıştırma (`.next` klasörü ortaktır).

## iOS

```bash
npm run ios:sim      # web derlemesi, cap sync, Xcode derlemesi, simülatöre kurulum
npm run build:ios    # yayın yolu: Supabase değişkenleri boş, web derlemesi + cap sync
npx cap open ios     # Xcode'da imzalı arşiv için
```

Simülatör paketlenmiş bir derlemedir, canlı değildir: arayüz değişince `npm run ios:sim` çalıştır.

## Çevrimiçi katman (1.0'da kapalı)

`NEXT_PUBLIC_ENABLE_ONLINE=1` verilmedikçe Supabase istemcisi, oda ve hamle kodu pakete hiç girmez (`src/backend/index.ts`). `src/tests/release-bundle.test.ts` bunu derlenmiş `out/` üzerinde doğrular. Açmadan önce `docs/release/APP_STORE_LAUNCH_KIT.md` içindeki "Sürüm 1.1 backend kapıları" listesi kapatılmalıdır.

## Yayın durumu

Yayın belgeleri `docs/release/` altındadır: gönderim paketi `APP_STORE_SUBMISSION.md`, kanıtlı durum ve skorkart `APP_STORE_LAUNCH_KIT.md`, yaşayan takip listesi `RELEASE_CHECKLIST.md`, inceleme notları `APP_REVIEW_NOTES.md`. Kod tarafı dondurulmuştur; kalanlar Apple hesabı, imzalı arşiv, TestFlight, gerçek iPhone testi ve insan testidir.

## Veri ve lisanslar

- Film, dizi, yönetmen ve oyuncu adları ile yıllar Wikidata'dan gelir (CC0). Pakette afiş, fotoğraf veya film karesi yoktur.
- Yazı tipleri (Inter, Newsreader, Barlow Condensed) SIL Open Font License altındadır ve derleme sırasında uygulamaya gömülür.
- Kaynak kod [MIT Lisansı](LICENSE) altındadır. © 2026 Efe Öztürkan.
