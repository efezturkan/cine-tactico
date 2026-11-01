# Tasarım üretim sırası

Sıra bozulmaz. Bir adım bitmeden sonrakinin kodu yazılmaz. v1 sadece maç hissini ister; 03–08’in tamamı mağaza öncesi şart değildir.

| # | Ad | Durum | v1 için yeter |
|---|---|---|---|
| 01 | Art direction | Kilitli. `docs/product/GAME_FEEL.md` | Evet |
| 02 | Token | Kısmen kodda (`globals.css`, Tailwind). Tek kaynak bu palet | Maç renkleri yeterli |
| 03 | Asset | 10 portre yerel. İkon, splash, ses dosyası yok. Ses şu an osilatör | İkon + 4 kısa ses |
| 04 | Bileşen | Tahta, saat, arama, makara var. Menü bileşenleri fazla | Sadece maç bileşenleri |
| 05 | Ekran | Ayrı mockup yok. Kod kalabalık | 6 ekran, `GAME_FEEL.md` |
| 06 | Hareket | `slam-stamp` ve `winning-beam` var. Oyun gibi hissettirmiyor | Doğru / yanlış / kilit / galibiyet |
| 07 | Cihaz | Hedef dik telefon. Tablet ve web ikinci | 390 genişlik, küçük telefon |
| 08 | Handoff | Yok | Maç bileşeninin ölçüsü ve durumları |

Dokunulmaz iskelet: `MatchmakingQueueModal.tsx` makara zamanları, `ShotClock.tsx` çekirdek + radar, `XoxBoard.tsx` 4x4 yerleşimi. Hissiyat bu iskeletin üstüne gelir, iskelet silinmez.
