export type PlayerSymbol = "X" | "O";

export type ContentPoolType = "FILM" | "SERIES" | "HYBRID";

export interface Criterion {
  id: string;
  type: "DIRECTOR" | "ACTOR" | "GENRE" | "DECADE" | "AWARD" | "RATING" | "FRANCHISE";
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
  answeredBy: PlayerSymbol;
  timestamp: number;
  pointsEarned?: number;
  comboCount?: number;
}

export interface GameBoard {
  id: string;
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  rows: Criterion[];
  cols: Criterion[];
  validCounts: Record<string, number>;
}

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
  shotClockSeconds: 10 | 20 | 30;             // 10s (Blitz), 20s (Standart), 30s (Taktiksel)
  themeId: string;
  category: string;
  allowCellStealing: boolean;                 // Clash Royale tarzı daha yüksek IMDb puanıyla kare çalma
  allowPowerups: boolean;                     // Kafa Topu 2 tarzı joker kullanımı
  bannedDirectors?: string[];                 // Stratejik Ban/Pick
  entryFee?: { type: "FREE" | "REELS" | "DIAMONDS"; amount: number };
  prizePool?: string;
}
