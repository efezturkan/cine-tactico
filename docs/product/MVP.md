# Cine-XOX — Ürün ve MVP

Film bilgisiyle oynanan 3x3 XOX. Tek cümle bu.

İki eksen kesişir (Nolan × Bilim Kurgu). Oyuncu o kesişime uyan bir film yazar. Üçlü hat kuran kazanır. Hücre çalınmaz.

## iOS v1 içinde

- Bot
- Aynı telefonda iki kişi
- Online oda (Supabase)
- Maç, cevap arama, sonuç, kısa nasıl oynanır
- Çevrimdışı bot ve aynı telefon
- 12 saniye shot clock (kod böyle; şartnamedeki 15 saniye iptal)

## iOS v1 dışında

Mağaza, görev, lig, sahte akış, DNA kartı, ambiyans, bildirim, günlük takvim, 14 tema vitrini, Ters Kadraj vitrini, IAP, reklam.

Bunlar kodda durabilir. Ana ekranda durmaz. Silmek ayrı iş; v1’de gizlenir.

## Sıra

1. Ana ekranı tek oyun kapısına indir.
2. Maç hissi: doğru damga, yanlış, kilit, kazanma. Makara modalı ve shot clock iskeleti aynı kalır.
3. App ikonu ve splash.
4. Xcode archive → TestFlight. Apple Team ID sende.
5. Aynı paket Android `.aab`.

## Bitti sayılmaz

İlk maç 10 saniyede açılmıyorsa, ana ekran menüyse, ikon hâlâ Capacitor varsayılanıysa, iki telefonla oda oynanmadıysa.
