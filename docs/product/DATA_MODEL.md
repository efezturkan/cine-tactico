# Veri modeli

Oyun bir grafik değildir. Bir hücre, iki filtrenin kesişimidir.

## Hedef

**Varlık:** Film, Dizi, Kişi, Karakter.

**Bağ:** yönetti, oynadı, rol, yapım, tür.

**Kriter:** Nolan, Oscar, 2010 sonrası, bilim kurgu. Kriter bir filtredir.

**Motor:** iki kriteri kesiştirir, geçerli cevap listesini döner. UI kural yazmaz.

## Şu an

Statik `Movie` kayıtları ve küratörlü tahtalar (`src/data`). Kişi portreleri ayrı manifest. Grafik veritabanı yok.

iOS v1 bu tahtalarla çıkar. Varlık grafiğine geçiş v1’den sonradır. Geçişte motorun sorduğu soru değişmez: bu film bu iki kritere uyar mı, bu maçta kullanıldı mı.

## Kurallar (değişmez)

- Hücre çalınmaz.
- Bir film bir maçta bir kez.
- Hücrede en az 3 geçerli cevap.
- Havuz 3’ten küçükse rarity en fazla Rare.
- IMDb / TMDb puanı ve poster CDN yok.
