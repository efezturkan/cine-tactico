# [ARŞİV] CineXOX Tasarım Sistemi Spesifikasyonu

> **DİKKAT — TEK GEÇERLİ KAYNAK:**  
> Bu belge tarihsel referans için arşivlenmiştir. Tüm tasarım sistemi, semantik renkler, tipografi ve yüzey kurallarında bağlayıcı tek anayasa:  
> - **Tasarım Anayasası:** [DESIGN.md](file:///Users/efe/Desktop/untitled%20folder/FI%CC%87LMSEL/docs/product/DESIGN.md)  
> - **MVP Kapsamı:** [MVP_SCOPE.md](file:///Users/efe/Desktop/untitled%20folder/FI%CC%87LMSEL/docs/product/MVP_SCOPE.md)

---

## Arşivlenen İçerik (Tarihsel Referans)

### Renk Tokenları (DESIGN.md ile Güncellenen Karşılıklar):
- Zemin: `#0B0D12` (Eski `--cine-void`: `#07080B`)
- Yüzey: `#14171D`, Yüzey-2: `#181B22` (Eski `--cine-slate`: `#0E1018`, `--cine-surface-raised`: `#151822`)
- Çizgi: Beyaz %8
- Metin: `#E8E6E1`, Soluk Metin: `#8A8F9A`
- Vurgu Altın: `#D9A441` (Eski `--cinema-gold`: `#F59E0B`, `--cinema-amber`: `#D97706`)
- İkincil Mavi (çok az): `#4FA3C7` (Eski `--player-one`: `#06B6D4`)
- REC Kırmızısı: `#E5484D` (Sadece aktif maçtaki REC ve kayıp durumu)

### Yüzey Kuralı (Kritik Çakışma Düzeltmesi):
- **Eski kural:** Kartlarda `border-bottom: 4px solid #090A0D` (tactile-card bevel) bulunuyordu.
- **Yeni Anayasa Kuralı:** Kart yüzeyleri düz kalır (1px border, 0 alt bevel, 0 gölge). Bevel (fiziksel basış derinliği) SADECE basılabilir butonlarda (`tactile-btn-*`) uygulanır.
