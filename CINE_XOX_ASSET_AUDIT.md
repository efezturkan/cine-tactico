# CINE-XOX — CINEMATIC ASSET SYSTEM AUDIT REPORT (PHASE 0)

**Tarih:** 1 Kasım 2026  
**Denetim Kapsamı:** Mevcut Görsel Altyapısı, Veri Yapıları, Dosyalar, Lisans Durumu ve UI Entegrasyon Noktaları  
**Durum:** Phase 0 Tamamlandı — Kod ve Veri Değişikliği Yapılmadı (Zero-Diff)

---

## 1. TEMEL BULGULAR & 10 SORUNUN KESİN YANITLARI

| # | Denetim Sorusu | Kesin Durum | Kanıt & Referans |
|---|---|---|---|
| **1** | **Projede bugün kullanılabilir bir görsel sistemi var mı?** | **HAYIR.** | `src/` dizininde hiçbir aktif görsel yükleyici, CDN bağlantısı veya asset yönetim modülü yoktur. |
| **2** | **Film posterleri mevcut mu?** | **HAYIR.** | `public/` altında sadece PWA uygulama ikonları (`icon-192`, `icon-512` vb.) vardır. 101 filmin hiçbirinin afiş dosyası yoktur. |
| **3** | **Oyuncu portreleri mevcut mu?** | **HAYIR.** | 13 kayıtlı aktörün ve yönetmenlerin hiçbir görsel portresi yoktur; UI baş harf rozetleri (`getInitials`) veya emoji kullanır. |
| **4** | **Karakter görselleri mevcut mu?** | **HAYIR.** | Projede `Character` varlığı dahi henüz tanımlanmamıştır. |
| **5** | **Görseller hangi veri yapıları üzerinden yönetiliyor?** | **HİÇBİRİ.** | `Movie` ([src/core/types/index.ts#L90-L119](file:///Users/efe/Desktop/untitled%20folder/FI%CC%87LMSEL/src/core/types/index.ts#L90-L119)) ve `Actor` ([src/core/types/index.ts#L77-L88](file:///Users/efe/Desktop/untitled%20folder/FI%CC%87LMSEL/src/core/types/index.ts#L77-L88)) içinde görsel ID veya URL alanı bulunmamaktadır. Yalnızca `Criterion` ([src/core/types/index.ts#L62](file:///Users/efe/Desktop/untitled%20folder/FI%CC%87LMSEL/src/core/types/index.ts#L62)) içinde boş duran `avatarUrl?: string` mevcuttur. |
| **6** | **Film ve oyuncu ilişkileri nasıl tutuluyor?** | **Dizi & ID Kesişimi.** | `Movie.cast: string[]` ([src/data/movies.ts](file:///Users/efe/Desktop/untitled%20folder/FI%CC%87LMSEL/src/data/movies.ts)), `Movie.actorIds?: string[]` ve `ACTORS_DATABASE` ([src/data/actors.ts](file:///Users/efe/Desktop/untitled%20folder/FI%CC%87LMSEL/src/data/actors.ts)) üzerinden. |
| **7** | **Offline kullanım şu anda mümkün mü?** | **EVET (Metin Tabanlı).** | 101 film ve 13 aktör doğrudan JS paketine gömülüdür (`output: "export"`). Ağ çağrısı sıfırdır, ancak görsel içerik bulunmamaktadır. |
| **8** | **Görsel yükleme ve cache altyapısı mevcut mu?** | **HAYIR.** | Service Worker, IndexedDB veya yerel bellek görsel önbellekleme mekanizması bulunmamaktadır. |
| **9** | **Hangi bileşenler değişmeli?** | **5 UI Bileşeni.** | `MovieSearchModal.tsx`, `XoxBoard.tsx`, `PostGameAnalysisModal.tsx`, `ActorSearchModal.tsx`, `GameSelectScreen.tsx`. |
| **10** | **En az müdahaleyle nasıl ilerlenebilir?** | **Merkezi Manifest + Resolver.** | Mevcut `Movie` ve `Actor` şemalarına opsiyonel `posterAssetId` / `portraitAssetId` eklenmeli; `AssetResolver` görsel varsa yüklemeli, yoksa mevcut CSS ikon placeholder'ına dönmelidir (fail-silent). |

---

## 2. MEVCUT VERİ ŞEMASI VE GÖRSEL ALANLARI

### A. Film Veri Yapısı (`src/core/types/index.ts`)
```ts
// Satır 90-119: Movie arayüzü
export interface Movie {
  id: string;               // örn: "m_inception"
  title: string;            // örn: "Inception"
  originalTitle?: string;
  year: number;
  director: string;
  cast: string[];
  genres: string[];
  hasOscar: boolean;
  sourceIds?: { wikidata?: string }; // örn: "Q25188"
  // EKSİK: posterAssetId, backdropAssetId, posterUrl
}
```

### B. Aktör Veri Yapısı (`src/core/types/index.ts`)
```ts
// Satır 77-88: Actor arayüzü
export interface Actor {
  id: string;               // örn: "act_dicaprio"
  primaryName: string;
  normalizedName: string;
  aliases: string[];
  sourceIds?: { wikidata?: string }; // örn: "Q38111"
  provenance: FieldProvenance;
  // EKSİK: portraitAssetId, portraitUrl
}
```

---

## 3. MEVCUT GÖRSEL KULLANIMI VE PLACEHOLDER ENVENTARİ

Projede şu an görsel gösterilmeye çalışılan yerlerin tamamı sahte placeholder bileşenleridir:

1. **Arama Listesi Küçük Resmi (`MovieSearchModal.tsx` Satır 23-29):**
   ```tsx
   const SearchMovieThumbnail: React.FC<{ movie: Movie }> = () => (
     <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex flex-col items-center justify-center p-1 text-center">
       <Film className="w-4 h-4 text-amber-400" />
     </div>
   );
   ```
2. **Oyun Tahtası Hücre Plakası (`XoxBoard.tsx` Satır 59-86):**
   Afiş yerine türe göre CSS gradyanı (`from-cyan-950 via-slate-900 to-black`) ve `Film` / `User` ikonu basılmaktadır.
3. **Kriter Başlıkları (`XoxBoard.tsx` Satır 145-214):**
   Yönetmen ve oyuncu portresi yerine harf avatarları (örn. "Christopher Nolan" -> "CN") basılmaktadır.

---

## 4. RİSK ANALİZİ

1. **Paket Boyutu Riski (Offline Bloat):** 100 filmin yüksek çözünürlüklü afişleri doğrudan mobile gömülürse uygulama boyutu 80–150 MB artar. WebP/AVIF mikro formatlar (örn. 150x225px afiş ~15-25 KB) kullanılmalıdır.
2. **Lisans / Telif Riski:** TMDB veya IMDb'den otomatik scraping/hotlinking yapmak ticari kullanımda Apple/Google incelemesinde ret sebebidir. Wikimedia Commons / Wikidata CC-BY / Public Domain kaynakları tercih edilmelidir.
3. **Oyun Hızı Riski:** Oyun tahtasında görsel yüklenmesini bekleyen hiçbir eşzamanlı bloklayıcı işlem olmamalı; görsel gelene kadar mevcut tipografik hücre anında render edilmelidir.

---

## 5. EN AZ MÜDAHALE İLE HEDEF MİMARİ

```
[Movie / Actor] 
       │ (posterAssetId / portraitAssetId)
       ▼
[Asset Manifest] (src/data/assets.ts — id, entityType, localPath, remoteUrl, license)
       │
       ▼
[Asset Resolver] ──> 1. Yerel / Cache Kontrolü
                     2. Uzak Kaynak (Online)
                     3. Fallback (Mevcut CSS İkonu — Kesintisiz Oyun)
```

**Sonuç:** Projenin oyun mantığı, RLS güvenliği ve 199/199 testlik çekirdek motoru sağlamdır. Görsel içerik katmanı sıfırdan ve temiz bir mimariyle entegre edilmeye tamamen uygundur.
