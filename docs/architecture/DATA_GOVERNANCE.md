# CINE-XOX — Veri Yönetişimi, Lisanslama ve Veri Modelleri Standardı
**Doküman:** `docs/architecture/DATA_GOVERNANCE.md`  
**Durum:** ONAYLANDI (FAZ 0)  
**Tarih:** 31 Ekim 2026  
**İlgili Belgeler:** `MASTER_SPECIFICATION_v3.md`, `ARCHITECTURE_DECISIONS.md`

---

## 1. Veri ve Lisans İlkeleri

### 1.1 IMDb Puanlarının ve Bağımlılıklarının Tasfiyesi
* **Mevcut Durum:** 97 eserin tamamında `imdbRating` alanı bulunmaktadır. Bu alan koddaki kare çalma mantığına, bot film seçimine ve maç sonu yapay nadirlik çarpanına bağlanmıştır.
* **Hukuki Gerçek:** IMDb'nin puanları, kullanıcı oyları ve sıralamaları telif hakkı ve ticari marka koruması altındadır.
* **Kaldırılacak Bağımlılıklar Listesi:**
  1. `Movie.imdbRating` arayüz alanı.
  2. `useXoxGame.ts` içindeki `movie.imdbRating <= currentOccupant.movie.imdbRating` kare çalma koşulu.
  3. `validator.ts` içindeki `criterion.value === "IMDB_8_PLUS"` kuralı (yerine editoryal tescilsiz `ACCLAIMED_CLASSIC` kriteri getirilecektir).
  4. `bot-ai.ts` içindeki `sort((x, y) => y.imdbRating - x.imdbRating)` bot seçim sıralaması.
  5. `PostGameAnalysisModal.tsx` içindeki yapay formül (`38 - (rating - 7) * 8`).

### 1.2 "Alan Adı Değiştirme" Yanılgısı ve Temiz Veri İlkesi
* **Kritik Kural:** Veritabanındaki bir alanın adını `imdbRating` yerine `score` veya `rating` olarak yeniden adlandırmak, verinin scraping/kaynak niteliğini hukuken değiştirmez.
* **Çözüm:** Veri setindeki derecelendirme değerleri, üçüncü taraf kapalı kaynaklardan çekilmeyecektir. İlk sürümde filmlerin başarı seviyeleri (Örn: "Oscar Ödüllü", "Festival Seçkisi", "Kült Klasik") nesnel ve kamu malı kriterlerle sınıflandırılacak; yapay nümerik puan bağımlılıkları tamamen kaldırılacaktır.

### 1.3 TMDb Poster URL'lerinin İlk Sürümden Çıkarılması
* **Durum:** 46 filmde `https://image.tmdb.org/...` poster URL'leri yer almaktadır.
* **Karar:** Bu alanlar ilk sürüm veri setinden çıkarılacak, arayüzde hiçbir harici görsel yüklenmeyecektir.
* **Tasarım Karşılığı:** Poster yerine özgün, telifsiz, tipografik 35mm film şeridi kartları gösterilecektir.

### 1.4 CC0 Veri Yanılgısı ve Alan Bazlı Doğrulama
* **Kritik Hukuki İlke:** Bir bilginin Wikidata'da CC0 lisansıyla etiketlenmiş olması, o bilginin mutlak surette doğru olduğunu veya herhangi bir üçüncü taraf kişisel/ticari hakkını ihlal etmediğini otomatik olarak garanti etmez.
* **Sistem:** Veriler tek bir "güvenilir damga" ile toptan kabul edilmeyecek; her alan bazında editoryal doğrulama (`field-level provenance`) işletilecektir.

---

## 2. Varlıkların Ayrılması (Entity Separation)

Mevcut kodda yönetmen, oyuncu ve temalar sadece `Movie` içinde düz string olarak yaşamaktadır. Bu yapı Ters Kadraj ve Konsept modlarının ölçeklenmesini engellemektedir. Varlıklar bağımsız olarak kimliklendirilecektir:

```
[Film (Movie)] ── (Yönetti) ──> [Yönetmen (Director)]
      │
      ├── (Oyuncular) ──> [Oyuncu (Actor)] (Takma adlar, QID, Doğum)
      ├── (Kült Temalar) ──> [Tema (Theme)] (14 Kült Tema Metadata)
      └── (Kazanılan Ödüller) ──> [Ödül (Award)] (Oscar, Altın Palmiye vb.)
```

---

## 3. Alan Bazlı Provenance (Köken) Modeli

Her bağımsız veri alanı ve varlık için takip edilecek meta-veri şeması:

```typescript
export type VerificationSource = "WIKIDATA" | "EDİTORYAL_KÜRATÖR" | "PUBLIC_RECORD";
export type LicenseStatus = "CC0" | "PUBLIC_DOMAIN" | "PROPRIETARY_REJECTED";

export interface FieldProvenance {
  source: VerificationSource;
  sourceId?: string; // Örn: "Q25188"
  license: LicenseStatus;
  verified: boolean;
  verifiedAt: string; // ISO: "2026-10-31"
  verifiedBy: string; // Örn: "editorial_team"
}

export interface EntityProvenance {
  entityId: string;
  sourceIds: {
    wikidata?: string;
  };
  provenance: {
    identity: FieldProvenance;
    metadata: FieldProvenance;
  };
}
```

---

## 4. Temel Veri Modelleri (TypeScript Spesifikasyonu)

### 4.1 Movie Modeli
```typescript
import { CultThemeKey } from "./theme";

export interface Movie {
  id: string; // "m_inception"
  title: string;
  originalTitle?: string;
  year: number;
  directorId: string; // "dir_nolan"
  directorName: string;
  actorIds: string[]; // ["act_dicaprio", "act_murphy"]
  actorNames: string[]; // Geriye dönük uyumluluk için string listesi korunur
  genres: string[];
  themeKeys?: CultThemeKey[];
  hasOscar: boolean;
  boxOfficeCategory?: "BLOCKBUSTER" | "INDIE" | "STANDARD";
  franchise?: string;
  mediaType: "FILM" | "SERIES";
  
  // Provenance & Lisans
  sourceIds: {
    wikidata?: string;
  };
  provenance: {
    wikidata: FieldProvenance;
  };
}
```

### 4.2 Actor Modeli & Alias Sistemi
```typescript
export interface Actor {
  id: string; // "act_dicaprio"
  primaryName: string; // "Leonardo DiCaprio"
  normalizedName: string; // "leonardo dicaprio"
  aliases: string[]; // ["Leo DiCaprio", "Leonardo Wilhelm DiCaprio"]
  normalizedAliases: string[];
  birthYear?: number;
  sourceIds: {
    wikidata?: string; // Örn: "Q38111"
  };
  provenance: FieldProvenance;
}
```

### 4.3 Theme Modeli
```typescript
export type CultThemeKey =
  | "PLOT_TWIST"
  | "WHODUNNIT"
  | "TIME_TRAVEL"
  | "NON_LINEAR"
  | "SINGLE_LOCATION"
  | "HEIST"
  | "REVENGE"
  | "SURVIVAL"
  | "DYSTOPIA"
  | "SPACE"
  | "AI"
  | "NEO_NOIR"
  | "LITERALLY_ME"
  | "CULT_FLOP";

export interface Theme {
  key: CultThemeKey;
  label: string; // "Ters Köşe (Plot Twist)"
  shortLabel: string;
  description: string;
  curationCriteria: string; // Bu temanın geçerlilik kuralı
  iconName: string; // Lucide icon adı (Örn: "RotateCcw")
}
```

### 4.4 Criterion Modeli
```typescript
export type CriterionType =
  | "DIRECTOR"
  | "ACTOR"
  | "GENRE"
  | "DECADE"
  | "AWARD"
  | "ACCLAIM" // "RATING" yerine tescilsiz başarı kriteri
  | "FRANCHISE"
  | "THEME"
  | "MOVIE_INTERSECTION";

export interface Criterion {
  id: string;
  type: CriterionType;
  label: string;
  subLabel?: string;
  value: string;
  iconName?: string; // Emojiler yerine Lucide iconu
}
```

### 4.5 CellState ve Deadlock Durum Modeli
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

### 4.6 Match Modeli (Oyun Durumu ve Kaydı)
```typescript
export type CoreGameMode = "CLASSIC" | "REVERSE_CAST" | "CINE_CONCEPT";
export type MatchStatus = "IN_PROGRESS" | "COMPLETED" | "GOLDEN_REEL_PENDING";

export interface MatchState {
  matchId: string;
  datasetVersion: string; // "1.0.0"
  rulesetVersion: string; // "3.0.0"
  mode: CoreGameMode;
  boardId: string;
  cells: CellState[];
  currentTurn: PlayerSymbol;
  shotClockRemaining: number;
  usedMovieIds: string[];
  winner: PlayerSymbol | "DRAW" | null;
  winningLine: [number, number, number] | null;
  endedWithGoldenReel: boolean;
  createdAt: number;
  completedAt?: number;
}
```

---

## 5. İsim Normalizasyonu ve Alternatif İsim (Alias) Sistemi

Ters Kadraj modunda ve film arama ekranında klavye ile yazılan cevapların adil ve hatasız doğrulanması için **Standart Normalizasyon Algoritması**:

```typescript
/**
 * Türkçe karakter, noktalama, aksan ve büyük/küçük harf duyarsız normalizasyon
 */
export function normalizeCinemaString(input: string): string {
  if (!input) return "";
  return input
    .trim()
    .toLowerCase()
    // Türkçe karakter eşleştirmeleri
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    // Latin aksan işaretlerini temizleme (NFD Decomposition)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    // Noktalama ve özel karakterleri boşluğa çevirme
    .replace(/[^a-z0-9\s]/g, " ")
    // Fazla boşlukları teke indirme
    .replace(/\s+/g, " ")
    .trim();
}
```

### Doğrulama Kuralları:
1. **Tam Eşleşme (Exact Match):** `normalize(input) === normalize(target)`
2. **Alias Eşleşmesi:** Oyuncunun bilinen takma adı varsa (`"Leo DiCaprio"` $\rightarrow$ `"Leonardo DiCaprio"`).
3. **Levenshtein Toleransı:** 6 karakterden uzun isimlerde azami 1 harf yazım hatası tolere edilir (örn: `"Chalamet"` yerine `"Chalamett"` yazılması geçerli sayılır).

---

## 6. Sürümleme (Versioning) ve Geriye Dönük Uyumluluk

* **`datasetVersion: "1.0.0"`**: Veri setindeki her yeni film/aktör eklemesinde minor sürüm artırılır.
* **`rulesetVersion: "3.0.0"`**: MASTER SPEC v3 kurallarıdır.
* **Geriye Dönük Uyumluluk:** Mevcut `src/data/movies.ts` dosyasındaki 97 film doğrudan bozulmayacaktır. `cast: string[]` alanı korunacak, opsiyonel `actorIds` alanı tedricen eklenecektir. Eski kodların `movie.cast` okuyan kısımları çalışmaya devam edecektir.
