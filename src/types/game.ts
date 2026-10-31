export type PlayerSymbol = "X" | "O";

export type ContentPoolType = "FILM" | "SERIES" | "HYBRID";

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

export const CULT_THEMES_META: Record<
  CultThemeKey,
  { label: string; emoji: string; desc: string }
> = {
  PLOT_TWIST: { label: "Ters Köşe (Plot Twist)", emoji: "🌀", desc: "Finalde tüm algıyı altüst eden şok sonlar" },
  WHODUNNIT: { label: "Katil Kim? (Whodunnit)", emoji: "🔍", desc: "Kapalı kapı ardı cinayet ve dedektif gizemi" },
  TIME_TRAVEL: { label: "Zaman Yolculuğu", emoji: "⏳", desc: "Geçmişe, geleceğe sıçrama veya zaman kırılması" },
  NON_LINEAR: { label: "Doğrusal Olmayan Kurgu", emoji: "🔀", desc: "Parçalı, geri dönen veya döngüsel zaman akışı" },
  SINGLE_LOCATION: { label: "Tek Mekan", emoji: "🚪", desc: "Tüm hikayenin tek bir oda/alanda geçtiği filmler" },
  HEIST: { label: "Büyük Soygun (Heist)", emoji: "💎", desc: "Kusursuz plan, kasa patlatma ve ekip dehası" },
  REVENGE: { label: "İntikam (Revenge)", emoji: "⚔️", desc: "Kan davası, geri dönüş ve hesaplaşma" },
  SURVIVAL: { label: "Hayatta Kalma (Survival)", emoji: "🏕️", desc: "Doğaya veya vahşi evrene karşı tek başına savaş" },
  DYSTOPIA: { label: "Karanlık Gelecek (Distopya)", emoji: "🌆", desc: "Yıkık uygarlıklar veya totaliter sistemler" },
  SPACE: { label: "Derin Uzay (Space Odyssey)", emoji: "🚀", desc: "Dünya dışı sonsuz karanlık ve uzay araçları" },
  AI: { label: "Yapay Zeka & Sayborg", emoji: "🤖", desc: "İnsan bilinci vs. makine ve sentetik akıl" },
  NEO_NOIR: { label: "Neo-Noir (Karanlık Şehir)", emoji: "🌧️", desc: "Yağmurlu geceler, yozlaşma ve karanlık sokaklar" },
  LITERALLY_ME: { label: "Literally Me (Anti-Kahraman)", emoji: "🚬", desc: "Yabancılaşmış, yalnız ve melankolik figürler" },
  CULT_FLOP: { label: "Kült Gişe Fiyaskosu (Flop)", emoji: "💸", desc: "Gişede batmış ama sinema efsanesi olmuş yapımlar" },
};

export type RarityTier = "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY";

export const BASE_CELL_POINTS = 10;

export const RARITY_TIERS: Record<
  RarityTier,
  { label: string; bonus: number; badgeColor: string; minScore: number }
> = {
  COMMON: { label: "Çok Yaygın", bonus: 0, badgeColor: "#94a3b8", minScore: 50 },
  UNCOMMON: { label: "Yaygın", bonus: 2, badgeColor: "#38bdf8", minScore: 30 },
  RARE: { label: "Nadir", bonus: 5, badgeColor: "#a855f7", minScore: 15 },
  EPIC: { label: "Çok Nadir", bonus: 8, badgeColor: "#ec4899", minScore: 5 },
  LEGENDARY: { label: "Efsanevi", bonus: 12, badgeColor: "#f59e0b", minScore: 0 },
};

export interface Criterion {
  id: string;
  type: "DIRECTOR" | "ACTOR" | "GENRE" | "DECADE" | "AWARD" | "RATING" | "FRANCHISE" | "THEME" | "MOVIE_INTERSECTION";
  label: string;
  subLabel?: string;
  value: string;
  avatarUrl?: string;
}

export interface Movie {
  id: string;
  title: string;
  originalTitle?: string;
  year: number;
  director: string;
  cast: string[];
  genres: string[];
  imdbRating: number;
  hasOscar: boolean;
  boxOfficeCategory?: "BLOCKBUSTER" | "INDIE" | "STANDARD";
  franchise?: "DC" | "MARVEL" | "LOTR" | "HARRY_POTTER" | "DUNE" | "STAR_WARS" | "OTHER" | string;
  themes?: (CultThemeKey | string)[];
  mediaType?: "FILM" | "SERIES";
  posterUrl?: string;
  overview?: string;
  /** Wikidata / external database identifiers */
  sourceIds?: {
    wikidata?: string;
  };
  /** Data provenance: tracks verification source and date */
  provenance?: {
    wikidata?: {
      verified: boolean;
      verifiedAt: string; // "YYYY-MM-DD"
    };
  };
}

export interface CellAnswer {
  movie: Movie;
  actorName?: string; // Ters Kadraj modu için
  answeredBy: PlayerSymbol | "NEUTRAL";
  timestamp: number;
  pointsEarned?: number;
  rarityTier?: RarityTier;
  rarityScore?: number;
  comboCount?: number;
  isLockedNeutral?: boolean; // Deadlock: İki taraf da yanlış yapınca kilitlenen sahipsiz kare
}

export interface GameBoard {
  id: string;
  title: string;
  boardMode?: "CLASSIC" | "REVERSE_CAST" | "CINE_CONCEPT";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  rows: Criterion[];
  cols: Criterion[];
  validCounts: Record<string, number>;
}

export type CoreGameMode = "CLASSIC" | "REVERSE_CAST" | "CINE_CONCEPT";

export type GameMode = "PASS_AND_PLAY" | "VS_BOT" | "ONLINE_ROOM" | "DAILY_SOLO";

export type BotDifficulty = "EASY" | "MEDIUM" | "HARD";

export type PowerupType = "FREEZE_TIME" | "DIRECTOR_HINT" | "BOMB_RETAKE" | "DOUBLE_POINTS";

// Özel Turnuva ve Düello Odası Ayarları (Clash Royale & Chess.com formatı)
export interface CustomRoomSettings {
  roomCode: string;
  roomName: string;
  roomType?: "1V1_ROOM" | "TOURNAMENT";        // 1v1 Özel Oda vs 8 Kişilik Turnuva
  isPublic?: boolean;                         // Herkese Açık Lobi vs Özel Şifreli
  matchFormat: "BO1" | "BO3" | "TOURNAMENT"; // Tek Maç, 3 Maçlık Seri, Turnuva
  shotClockSeconds: 10 | 12 | 20 | 30;             // 12s (Standart Anti-Hile), 10s (Blitz), 20s (Geniş)
  themeId: string;
  category: string;
  allowCellStealing: boolean;                 // Clash Royale tarzı daha yüksek IMDb puanıyla kare çalma
  allowPowerups?: boolean;                    // Joker kullanımı (İsteğe bağlı)
  bannedDirectors?: string[];                 // Stratejik Ban/Pick
  entryFee?: { type: "FREE" | "REELS"; amount: number };
  prizePool?: string;
}
