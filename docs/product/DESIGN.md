# CineXOX Tasarım Anayasası

Bu dosya tartışılmaz. Her görevde önce bunu oku, sonra çalış.

## Ruh
Hızlı tüketilen, hafif, elit bir sinema oyunu. Uygulama değil OYUN hissi.
His referansı: Letterboxd'un sakinliği + Block Blast'in tek dokunuşluk netliği + Wordle'ın sade günlük ritüeli.
Her ekranda TEK odak noktası olur. Geri kalan her şey ona hizmet eder veya yoktur.
Göz yormaz, tatlıdır, şişirilmemiştir.

## Altın kural
Dekor statik ve soluk kalır. Sadece oyun durumunu anlatan şey canlı olur.
Bir şeyi silmeden önce "İmza öğeleri" listesine bak. Listede olana dokunma.
Emin olmadığın şeyi silme, gizle ve özetinde belirt.

## İmza öğeleri (KORUNUR, ben istemeden silinmez veya değiştirilmez)
1. Kenarlardaki film şeridi perforasyonu (çok düşük opaklık, tüm ekranlarda)
2. Viewfinder köşe işaretleri (sadece hero kart ve oyun tahtasında)
3. Serif başlık tipografisi (logo ve ekran başlıkları)
4. Tek vurgu rengi: altın. Mavi sadece çok küçük detaylarda
5. Lobinin en altında TEK satırlık mikro etiket (KODAK 5219 · 35MM), %30 opaklık
Ekran başına en fazla 1 mikro etiket. Daha fazlası gürültüdür.

## Canlı ruh öğeleri (hareket etmesine İZİN VERİLEN tek şeyler)
- REC noktası: SADECE maç aktifken, 2 sn döngüyle yumuşak yanıp söner. Lobide ve diğer ekranlarda yok
- Timecode süre sayacı: 00:00:12:08 formatı, sadece oyun ekranında
- Maç başı klaket geri sayımı: 3-2-1-AKSİYON, toplam en fazla 1,5 sn, dokunarak geçilebilir
- Hücre doldurma: kısa deklanşör sesi + hafif haptic + çerçevenin 200 ms parlaması
- Kazanma: altın çizgi çizilir + büyük serif "Kesin!" yazısı. Konfeti, ışık huzmesi, sallanma yok
- Buton basışı: scale 0.97, 100 ms
Bunun dışında hiçbir şey kendi kendine hareket etmez. prefers-reduced-motion'a uy.
Ses ve haptic ayarlardan kapatılabilir. Ses dosyası yoksa kısa WebAudio ile üret, harici asset arama.

## Gürültü (gider)
- Glow, neon gölge, iç gölge. Gölge en fazla tek seviye ve çok hafif
- Bilgi taşımayan hap/rozet. Kartta en fazla 1 rozet, o da gerçek bir durum (YENİ gibi)
- Lobide canlı sayaçlar, ticker, feed, görev şeridi, zevk DNA'sı, lig çubuğu
- Aynı bilgiyi iki kez söyleyen metin
- Kart başına emoji yığını. İkon gerekiyorsa tek renk çizgi ikon

## Tipografi
Başlık: serif (Fraunces veya Playfair Display). Arayüz: Inter. Mono sadece mikro etiketlerde.
Ekranda en fazla 3 yazı boyutu: büyük başlık, normal, küçük.

## Renk ve yüzey (tokenlar tek yerde tanımlanır, kodda sabit hex yasak)
Mevcut koddaki değerler bunlara yakınsa mevcudu koru.
- zemin: #0B0D12
- yüzey: #14171D, yüzey-2: #181B22
- çizgi: beyaz %8
- metin: #E8E6E1, soluk metin: #8A8F9A
- altın (tek vurgu): #D9A441
- ikincil mavi (çok az): #4FA3C7
- REC kırmızısı: #E5484D (sadece REC noktası ve kayıp durumu)
**Yüzey Kuralı:** Kart yüzeyleri düz kalır (1px ince çerçeve, 0 alt bevel, 0 gölge). Bevel (3.5px fiziksel 3D basış derinliği) SADECE basılabilir butonlarda kullanılır. Gradyan sadece mod afişlerinde ve çok yumuşak.
Altın sadece "bastığın şey" içindir: ana buton, aktif sekme, kazanma çizgisi.

## Dil (dashboard kelimeleri yasak)
- Lobi → Gişe
- Arenalar, Aktif Masalar → Vizyondakiler
- Profil & İstatistikler → Sinefil Kartı
- Özel Oda → Özel Gösterim
- Olasılık Matrisi, Yeni Formatlar → MVP'de gizli
Metinler kısa, insan gibi, Türkçe. Örnek: "Düelloya gir", "Sıra sende", "Kesin!", "Tekrar çek".
Kaybedene yumuşak cümle: "Kurgu masasına dönüyoruz."

## Ekran kuralları
**Gişe (lobi):** 1 hero (Düelloya Gir). Altında yatay kaydırmalı mod afişleri. Altında Günün Kadrası (bilet kupürü görünümü, kenarları tırtıklı). Üst barda sadece avatar, seri, ses ve ayarlar. En altta tek mikro etiket.
**Vizyondakiler:** Modal değil tam ekran. 2 sütunlu AFİŞ grid'i, kartlar 3:4. Her afiş: yumuşak tek ton arka plan, serif başlık, tek satır açıklama, en fazla 1 rozet. Raflar: Popüler, Yeni, Zor.
**Oyun ekranı:** Tahta merkezde ve büyük. Hücreler film karesi gibi (ince çerçeve, köşe işaretleri). Üstte sol REC + timecode, orta tahta adı (serif), sağ çıkış. Altta tek satır sıra göstergesi. Başka hiçbir şey yok.
**Sonuç ekranı:** Sonuç ("Kesin!" veya yumuşak kayıp cümlesi), ana buton "Tekrar çek", ikincil buton "Gişe'ye dön". Bitti.
**Sinefil Kartı:** Letterboxd tarzı kimlik kartı. Avatar, seviye, en sevdiği tür, 3 temel istatistik (galibiyet, mağlubiyet, oran). İstatistikler burada yaşar, lobide değil.

## Teknik kurallar
- Oyun mantığına (eşleşme, sıra, kazanma kontrolü, film arama, veri) DOKUNMA. Sadece görünüm ve geri bildirim.
- Gizlenecek özellikleri silme. Tek bir FLAGS config dosyası arkasına al, UI'da render etme.
- Renk, font, radius tek yerde (tailwind config veya CSS değişkenleri). Bileşenlerde sabit hex yok.
- Hedef ekranlar: 360, 390, 430 px genişlik. Yatay taşma olmayacak. Dokunma hedefi en az 44 px.
- Yeni bağımlılık ekleme. Çok gerekiyorsa önce sor.
