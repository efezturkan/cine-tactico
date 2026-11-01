# CINE-XOX — Veri Yönetişimi, Lisanslama ve Doğrulama Standartları
**Doküman:** `docs/architecture/DATA_GOVERNANCE.md`  
**Durum:** ONAYLANDI (FAZ 0)  
**Tarih:** 31 Ekim 2026 (Konsolide Sürüm)  
**İlgili Belgeler:** `MASTER_SPECIFICATION_v3.md`, `docs/product/DATA_MODEL.md`

---

## 1. Veri ve Lisans İlkeleri

### 1.1 IMDb Bağımlılıklarının Tasfiyesi ve "Yapay Puan" Yasağı
* **Kritik Karar:** IMDb puanları telif ve ticari marka koruması altındadır. Bir alanın adını `imdbRating` yerine `acclaimScore`, `cultScore` veya `score` olarak yeniden adlandırmak veri lisansı sorununu çözmez.
* **Uygulama Kuralı:** Bağımsız, doğrulanabilir ve lisansı uygun bir açık kaynak belirlenmeden veri modeline **hiçbir yapay nümerik puan alanı eklenmeyecektir**.
* **Kaldırılacak Bağımlılıklar Envanteri (Etkilenen Kod Yolları ve Testler):**
  1. `src/types/game.ts`: `Movie.imdbRating` arayüz alanı.
  2. `src/hooks/useXoxGame.ts` (L116): Kural dışı kare çalma koşulu (`movie.imdbRating <= currentOccupant.movie.imdbRating`).
  3. `src/engine/validator.ts` (L56): `criterion.value === "IMDB_8_PLUS"` kuralı.
  4. `src/engine/validator.ts` (L102): Yapay nadirlik çarpanı (`movie.imdbRating >= 8.5`).
  5. `src/engine/bot-ai.ts` (L126, L156, L213): Botun en yüksek puanlı filmi seçmesi (`sort((x, y) => y.imdbRating - x.imdbRating)`).
  6. `src/components/PostGameAnalysisModal.tsx` (L92): Maç sonu hesaplaması (`38 - (rating - 7) * 8`).
  7. `src/tests/game-engine.test.ts` (L174): Board #8 ve #9'un "IMDb 8.0+" kriter testi.

### 1.2 TMDb Poster URL'lerinin İlk Sürümden Çıkarılması ve Veri Güvenliği
* **Mevcut Durum:** 97 eserin 46'sında `image.tmdb.org` poster linkleri bulunmaktadır.
* **Güvenlik Kuralı:** TMDb poster URL'leri kod tabanından temizlenmeden önce mevcut veriler Git geçmişinde güvenceye alınacaktır.
* **Tasarım Karşılığı:** İlk sürümde hiçbir harici görsel yüklenmeyecek; oyun %100 özgün, telifsiz, tipografik 35mm film şeridi plakaları ile sunulacaktır.

### 1.3 CC0 Veri Yanılgısı ve Alan Bazlı Doğrulama (Provenance)
* **Temel İlke:** Bir bilginin Wikidata'da CC0 ile etiketlenmiş olması, o bilginin mutlak doğruluğunu veya üçüncü şahıs haklarını ihlal etmediğini garanti etmez.
* **Standart:** Veriler toptan güvenilir sayılmayacak; her alan bazında editoryal doğrulama geçmişi (`field-level provenance`) tutulacaktır.

---

## 2. Varlıkların Ayrılması (Entity Separation)

Film, oyuncu, yönetmen, ödül ve tema verileri bağımsız kimliklerle yönetilecektir:

```
[Film (Movie)] ── (Yönetti) ──> [Yönetmen (Director)]
      │
      ├── (Oyuncular) ──> [Oyuncu (Actor)] (Alias'lar, QID, Doğum)
      ├── (Kült Temalar) ──> [Tema (Theme)] (14 Kült Tema Metadata)
      └── (Kazanılan Ödüller) ──> [Ödül (Award)] (Oscar, Altın Palmiye vb.)
```

---

## 3. Alan Bazlı Provenance (Köken) Modeli

```typescript
export type VerificationSource = "WIKIDATA" | "EDITORIAL_CURATOR" | "PUBLIC_RECORD";
export type LicenseStatus = "CC0" | "PUBLIC_DOMAIN" | "PROPRIETARY_REJECTED";

export interface FieldProvenance {
  source: VerificationSource;
  sourceId?: string; // Örn: "Q25188"
  license: LicenseStatus;
  verified: boolean;
  verifiedAt: string; // ISO: "2026-10-31"
  verifiedBy: string; // "editorial_team"
}
```

---

## 4. Temel Veri Modelleri (TypeScript Spesifikasyonu)

### 4.1 Movie Modeli
```typescript
import { CultThemeKey } from "./theme";
import { FieldProvenance } from "./provenance";

export interface Movie {
  id: string; // "m_inception"
  title: string;
  originalTitle?: string;
  year: number;
  directorId: string;
  directorName: string;
  actorIds: string[];
  actorNames: string[]; // Geriye dönük uyumluluk için korunur
  genres: string[];
  themeKeys?: CultThemeKey[];
  hasOscar: boolean;
  boxOfficeCategory?: "BLOCKBUSTER" | "INDIE" | "STANDARD";
  franchise?: string;
  mediaType: "FILM" | "SERIES";
  
  // Provenance & Lisans (Alan Bazlı)
  sourceIds: {
    wikidata?: string;
  };
  provenance: {
    identity: FieldProvenance;
    metadata: FieldProvenance;
  };
}
```

### 4.2 Actor Modeli ve Doğrulama Hiyerarşisi
```typescript
export interface Actor {
  id: string; // "act_dicaprio"
  primaryName: string; // "Leonardo DiCaprio"
  normalizedName: string; // "leonardo dicaprio"
  aliases: string[]; // ["Leo DiCaprio", "Leonardo Wilhelm DiCaprio"]
  normalizedAliases: string[];
  birthYear?: number;
  sourceIds: {
    wikidata?: string;
  };
  provenance: FieldProvenance;
}
```

#### Actor Eşleşme Hiyerarşisi (Kesin Kural):
1. **1. Aşama:** Normalize edilmiş tam isim eşleşmesi (`normalize(input) === normalize(target)`).
2. **2. Aşama:** Tescilli takma ad (alias) listesi eşleşmesi (`input in actor.normalizedAliases`).
3. **3. Aşama (Kontrollü Fuzzy):** Yalnızca 6 karakterden uzun isimlerde azami 1 harf yazım hatası toleransı.
4. **Belirsizlik Kuralı:** Eğer yazılan metin birden fazla aktörle çakışıyorsa veya eşleşme skoru yetersizse **otomatik kabul edilmez, reddedilir**.

### 4.3 İsim Normalizasyon Fonksiyonu
```typescript
export function normalizeCinemaString(input: string): string {
  if (!input) return "";
  return input
    .trim()
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
```

### 4.4 CellState ve Deadlock Durum Modeli
```typescript
export type PlayerSymbol = "X" | "O";
export type RarityTier = "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY";
export type CellStateType = "EMPTY" | "WON" | "LOCKED_NEUTRAL";

export interface CellPlayerAttempt {
  hasAttempted: boolean;
  failedAnswer?: string;
  timestamp: number;
}

export interface CellState {
  cellIndex: number;
  state: CellStateType;
  attempts: {
    X?: CellPlayerAttempt;
    O?: CellPlayerAttempt;
  };
  winnerAnswer?: {
    movie: Movie;
    actorName?: string;
    answeredBy: PlayerSymbol;
    timestamp: number;
    basePoints: number; // Her zaman 10
    rarityBonus: number; // 0, 2, 5, 8, 12
    totalPoints: number; // 10, 12, 15, 18, 22
    rarityTier: RarityTier;
  };
}
```

### 4.5 Rarity Güvenlik İlkeleri (Anti-Inflation)
- Veri dosyasındaki sıralamaya veya yapay popülerlik değerlerine asla güvenilmez.
- Bir hücrenin toplam geçerli film sayısı $N < 3$ ise **Legendary üretmek kesinlikle yasaktır** (tavan: Rare +5).
- İlerideki dinamik topluluk rarity'si için `answerCountMap` şeması hazır tutulur; ancak örneklem büyüklüğü < 50 iken dinamik hesaplamaya geçilmez.

---

## 5. Sürümleme ve Geriye Dönük Uyumluluk

* **`datasetVersion: "1.0.0"`**: Veri setindeki her içerik güncellemesinde minor artırılır.
* **`rulesetVersion: "3.0.0"`**: MASTER SPEC v3 kurallarıdır.
* **Geriye Dönük Uyumluluk Güvencesi:** Mevcut `MOVIES_DATABASE` içindeki 97 filmin `cast: string[]` ve `director: string` alanları korunacak, yeni modeller aşamalı olarak bağlanacaktır.
