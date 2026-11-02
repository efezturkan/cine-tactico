# CineXOX MVP Kapsamı

## Ürün Tek Cümle
İki oyuncu, 3×3 tahta, her hücrede iki sinema kategorisinin kesişimine uyan bir film bul, üçünü hizala, kazan.

---

## 1. MVP'de VAR OLANLAR

### Ekranlar (Yalnızca Bu 6 Ekran):
1. **Gişe** (Lobi ana ekranı)
2. **Vizyondakiler** (Mod ve masa seçimi tam ekran afiş grid'i)
3. **Oyun Ekranı** (3×3 film karesi tahta + film/aktör arama modalı)
4. **Sonuç Ekranı** ("Kesin!" veya "Kurgu masasına dönüyoruz.", Tekrar çek / Gişe'ye dön)
5. **Sinefil Kartı** (Letterboxd tarzı profil: avatar, seviye, en sevilen tür, 3 temel istatistik)
6. **Ayarlar** (Ses, haptic, hesap/çıkış)

### Alt Bar (4 Sekme):
- `Gişe`
- `Vizyondakiler`
- `Özel Gösterim`
- `Sinefil Kartı`

### Modlar:
- **Klasik Düello** (Yönetmen/Tür × Oyuncu)
- **Ters Kadraj** (İki film kesişiminde ortak oyuncu)
- **Sinefil Konsept** (Kült temalar, dönemler, anlatı kuralları)
- **Günün Kadrası** (Günde bir kez sabit 3×3 tahta, bilet kupürü, paylaşılabilir sonuç)
- **Özel Gösterim** (Oda koduyla arkadaşını çağır, 1v1 canlı düello)

*Vizyondakiler ekranındaki mevcut masalar (11 adet) olduğu gibi korunur, afiş grid'i olarak sunulur.*

### Üst Bar:
- Avatar + İsim
- Seri Sayısı (Galibiyet serisi / streak)
- Ses aç / kapa
- Ayarlar

---

## 2. MVP'de GİZLİ (Kod Silinmez, FLAGS Arkasına Alınır)
- Canlı çevrimiçi sayısı, maç ticker'ı / feed
- Günlük görev şeridi
- Zevk DNA'sı / Letterboxd bağlama
- Lig yerleşimi çubuğu
- Makara / coin ekonomisi ve ödüller
- Bildirim zili
- "Olasılık Matrisi" ve "Yeni Formatlar" sekmeleri
- Tahta Arşivi

---

## 3. MVP SONRASI (Şimdi Konuşulmaz)
- Wordle tarzı günün filmi
- Arkadaş listesi & sosyal takip
- Lig ve dereceli sezonlar
- Sanal ekonomi & makara mağazası
- Zevk DNA'sı derin analizi
- Yeni mod formatları

---

## 4. Bitti Tanımı (Definition of Done)
- [ ] Hiçbir ekranda "panel/dashboard" kelimesi veya sayaç yığını yok (Aktif Masalar, Matris, İstatistik vb.)
- [ ] Her ekranda tek odak noktası var, bir bakışta ne yapacağım belli
- [ ] İmza öğeleri (film şeridi kenarı, köşe işaretleri, serif başlık, altın vurgu, tek mikro etiket) tüm ekranlarda tutarlı
- [ ] REC + timecode sadece oyun ekranında, maç aktifken çalışıyor
- [ ] Klaket geri sayımı (3-2-1-AKSİYON), deklanşör geri bildirimi, "Kesin!" kazanma anı çalışıyor
- [ ] Başlık, boşluk, buton boyutu tüm ekranlarda aynı sistemden geliyor (tokenlar)
- [ ] 360, 390, 430 px genişlikte taşma ve kesilme yok
- [ ] Boş durum, yükleme ve hata durumlarının hepsi sinema diliyle yazılmış ve tasarlanmış
- [ ] Ses ve haptic ayarlardan kapanıyor
- [ ] Bir maç baştan sona oynanıyor: gir, eşleş, hücre doldur, kazan/kaybet, sonuç, tekrar çek
- [ ] Günün Kadrası açılıyor, bitiriyor, sonucu paylaşılabiliyor

---

## 5. MVP İçin Eksik Kalanlar & Uygulama Planı

| Madde | Mevcut Durum | Yapılacak İşlem | İlgili Dosya |
|---|---|---|---|
| **Alt Bar İsimlendirmesi** | Lobi, Arenalar, Özel Oda, Profil | `Gişe`, `Vizyondakiler`, `Özel Gösterim`, `Sinefil Kartı` olarak güncellenecek | `src/components/HomeScreen.tsx` |
| **Üst Bar Düzeni** | Avatar + Mute + Ambiyans + Yardım | Ambiyans/Yardım kaldırılacak; `Avatar + İsim`, `Seri Sayısı`, `Ses`, `Ayarlar` formatına getirilecek | `src/components/HomeScreen.tsx` |
| **Feature Flags Mimarisi** | Kısmi gizleme yapılmış | `src/config/flags.ts` tanımlanacak; Ticker, Görevler, Lig, Makara/Coin, Zevk DNA'sı, Bildirimler tek kaynaktan UI'dan gizlenecek | `src/config/flags.ts` |
| **Klaket Geri Sayımı** | Yok (doğrudan maça giriyor) | Maç başı 1.5s süren `3-2-1-AKSİYON` klaket animasyonu eklenecek (tıklamayla geçilebilir) | `src/features/gameplay/` |
| **Oyun HUD Timecode & REC** | Sadece düz `12s` ve dot | `00:00:12:08` timecode sayacı ve 2s döngülü yumuşak REC noktası eklenecek | `src/features/gameplay/components/ShotClock.tsx`, `XoxBoard.tsx` |
| **Sonuç Ekranı Dili** | Zafer / Mağlubiyet, Tekrar Oyna | Kazanan: `Kesin!`, Kaybeden: `Kurgu masasına dönüyoruz.`, Butonlar: `Tekrar çek` / `Gişe'ye dön` | `src/features/gameplay/components/PostGameAnalysisModal.tsx` |
| **Günün Kadrası Bilet Kupürü** | Düz tactile buton | Kenarları tırtıklı sinema bilet kupürü görünümüne kavuşturulacak | `src/components/HomeScreen.tsx` |
| **Vizyondakiler Ekranı** | Modal popup | 2 sütunlu 3:4 afiş grid'i, Popüler/Yeni/Zor rafları içeren tam ekran deneyime kavuşturulacak | `src/components/GameSelectScreen.tsx` |
