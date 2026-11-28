import { GameBoard, CellAnswer } from "@/core";

export interface CinephilePersona {
  topDirector: string;
  topGenre: string;
  topDecade: string;
  genreBreakdown: { genre: string; percentage: number }[];
  cinemaAesthetic: string; // e.g. "Karanlık Zihinler & Bilim Kurgu Tutkunu"
  letterboxdRatingAvg?: number;
  nicheScorePercent?: number; // Nadirlik / Kült skoru
}

// Geriye dönük uyumluluk için alias
export type TasteDna = CinephilePersona;

export interface PowerupInventory {
  freezeTime: number;     // +15s Çekim Molası (Kafa Topu Buzlanma)
  directorHint: number;   // Yönetmen İpucu (Kafa Topu Ayna/Büyük Kafa)
  bombRetake: number;     // Çekim Tekrarı / Bomba (Kafa Topu Bomba)
  doublePoints: number;   // Gişe Rekoru x2 (Kafa Topu Çift Sayı)
}

export interface MatchRecord {
  id: string;
  timestamp: number;
  outcome: "VICTORY" | "DEFEAT" | "DRAW";
  mode: "CLASSIC" | "REVERSE_CAST" | "CINE_CONCEPT" | "ONLINE_ROOM" | "DAILY_SOLO";
  modeLabel: string;
  opponent: {
    name: string;
    avatarId: string;
    rankTitle?: string;
  };
  trophyDelta: number;
  scoreRarity: number;
  totalArcadeScore: number;
  board: GameBoard;
  cells: (CellAnswer | null)[];
}

export interface UserProfile {
  username: string;
  avatarId: string;
  rankTitle: string;
  rankLevel: number;
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  highestCombo: number;
  dailyStreak: number;
  lastStreakDateUtc?: string; // ISO 8601 YYYY-MM-DD (UTC Server Time Authority)
  streakProtected?: boolean; // Duolingo Seri Koruması
  favoriteGenre: string;
  favoriteDirector?: string;
  favoriteMode?: string;
  lastFiveMatches?: ("W" | "L" | "D")[];
  matchHistory?: MatchRecord[]; // Clash Royale tarzı son oynanan maçların tahta dökümü
  reelsBalance: number;       // Altın / Makaralar
  diamondsBalance: number;    // Elmaslar (Reklam & Turnuva ödülü)
  powerups: PowerupInventory; // Kafa Topu 2 tarzı jokerler
  unlockedAvatars: string[];
  isPro?: boolean;            // Sinefil Pro VIP
  letterboxdUsername?: string;// Letterboxd kullanıcı adı (Simbiyotik Profil)
  tasteDna: CinephilePersona; // Sinefil Kimliği (Letterboxd / Persona)
}

export interface AvatarOption {
  id: string;
  label: string;
  labelEn: string;
  iconName:
    | "Clapperboard"
    | "Star"
    | "Eye"
    | "Rocket"
    | "Search"
    | "Film"
    | "Camera"
    | "Trophy"
    | "Popcorn"
    | "Ticket"
    | "Glasses"
    | "Compass";
  cost: number;
  emoji?: string;
  iconBg?: string; // mat yüzey rengi (hex), gradyan değil: style={{ backgroundColor }} ile kullanılır
  description?: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: "avatar_director", label: "Klaketçi", labelEn: "Archivist", iconName: "Clapperboard", cost: 0, emoji: "🎬", iconBg: "#4A2B21", description: "Klasik sinema tarihçisi" },
  { id: "avatar_actor", label: "Jüri", labelEn: "Juror", iconName: "Star", cost: 0, emoji: "⭐", iconBg: "#5B2C3C", description: "Festival jürisi" },
  { id: "avatar_lens", label: "Auteur", labelEn: "Auteur", iconName: "Eye", cost: 0, emoji: "👁️", iconBg: "#282038", description: "Uykusuz yönetmen" },
  { id: "avatar_scifi", label: "Seyyah", labelEn: "Wanderer", iconName: "Rocket", cost: 0, emoji: "🚀", iconBg: "#7E3D24", description: "Çöl ve bilimkurgu bilgesi" },
  { id: "avatar_noir", label: "Dedektif", labelEn: "Detective", iconName: "Search", cost: 0, emoji: "🔍", iconBg: "#1C3B43", description: "Film-noir dedektifi" },
  { id: "avatar_popcorn", label: "Biletçi", labelEn: "Usher", iconName: "Popcorn", cost: 0, emoji: "🍿", iconBg: "#8F6328", description: "Sinema salonu ruhu" },
  { id: "avatar_camera", label: "Makinist", labelEn: "Projectionist", iconName: "Camera", cost: 0, emoji: "🎥", iconBg: "#203245", description: "35mm projeksiyon ustası" },
  { id: "avatar_oscar", label: "Tahminci", labelEn: "Pundit", iconName: "Trophy", cost: 0, emoji: "🏆", iconBg: "#6A5129", description: "Ödül gecesi uzmanı" },
  { id: "avatar_ticket", label: "Gezgin", labelEn: "Regular", iconName: "Ticket", cost: 0, emoji: "🎟️", iconBg: "#284637", description: "Hafta sonu seans müdavimi" },
  { id: "avatar_3dglasses", label: "Matineci", labelEn: "Matinee", iconName: "Glasses", cost: 0, emoji: "🕶️", iconBg: "#5E1D28", description: "3D matine tutkunu" },
  { id: "avatar_totem", label: "Stratejist", labelEn: "Strategist", iconName: "Compass", cost: 0, emoji: "🧭", iconBg: "#243244", description: "Zaman büken sinefil" },
  { id: "avatar_vhs", label: "Kasetçi", labelEn: "Clerk", iconName: "Film", cost: 0, emoji: "📼", iconBg: "#524B22", description: "90'lar video kulübü gurusu" },
];

export function calculateRank(wins: number): { title: string; level: number; nextWins: number } {
  if (wins >= 30) return { title: "Usta Yönetmen", level: 4, nextWins: 50 };
  if (wins >= 15) return { title: "Festival Jürisi", level: 3, nextWins: 30 };
  if (wins >= 5) return { title: "Bağımsız Sinemacı", level: 2, nextWins: 15 };
  return { title: "Bilet Kontrolörü", level: 1, nextWins: 5 };
}
