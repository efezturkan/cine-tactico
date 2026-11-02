# CineXOX — Oyun Hissi & Deneyim Kılavuzu

His Referansı: **Letterboxd'un sakinliği + Block Blast'in tek dokunuşluk netliği + Wordle'ın sade günlük ritüeli.**

Bu doküman `docs/design/DESIGN.md` (CineXOX Tasarım Anayasası) ve `docs/product/MVP.md` ile tam uyumludur.

---

## 1. El ve Odak
- Telefon dik (`max-w-[430px]`). Başparmak erişimi.
- Her ekranda **tek bir odak noktası**. Geri kalan her şey ona hizmet eder veya yoktur.
- Uygulama değil, elit ve akıcı bir **OYUN** hissi.

## 2. Hamle Ritmi
1. Sıra oyuncuda: 12 saniyelik sinematik timecode (`00:00:12:00`) sayacı başlar.
2. Boş film karesine dokunulur.
3. Film veya ortak aktör yazılır (en az 2 harf).
4. Doğru cevap: Kısa deklanşör sesi + hafif haptic + 200 ms çerçeve parlaması ile kare kilitlenir.
5. Yanlış veya süre aşımı: O karedeki hak biter. İki oyuncu da bilemezse kare kilitlenir (`LOCKED_NEUTRAL`).
6. Üçlü hat: Tahta durur, altın çizgi çekilir, sonuç ekranı ("Kesin!") açılır.

## 3. Renk & Yüzey
- Zemin: `#0B0D12`
- Yüzey: `#14171D`, Yüzey-2: `#181B22`
- Çizgi: Beyaz %8
- Metin: `#E8E6E1`, Soluk Metin: `#8A8F9A`
- Tek Vurgu Altın: `#D9A441` (Sadece basılan ve aktif şeyler için)
- İkincil Mavi (çok az): `#4FA3C7`
- REC Kırmızısı: `#E5484D` (Sadece aktif maçtaki REC noktası ve kayıp durumu)

## 4. Ekranlar (MVP Sınırları)
1. **Gişe:** 1 hero ("Düelloya gir"), yatay kaydırmalı mod afişleri, bilet kupürü görünümünde Günün Kadrası, en altta tek satır KODAK 5219 · 35MM etiketi (%30 opaklık).
2. **Vizyondakiler:** Tam ekran 2 sütunlu 3:4 afiş grid'i (Popüler, Yeni, Zor rafları).
3. **Oyun Ekranı:** Merkezde 3×3 film karesi tahta, üstte REC + timecode, ortada tahta başlığı (serif), altta sıra göstergesi.
4. **Sonuç Ekranı:** "Kesin!" veya "Kurgu masasına dönüyoruz.", ana buton "Tekrar çek", ikincil "Gişe'ye dön".
5. **Sinefil Kartı:** Letterboxd estetiğinde avatar, seviye, en sevdiği tür, 3 temel istatistik (G / M / Oran).
6. **Ayarlar:** Ses, haptic, hesap kontrolleri.
