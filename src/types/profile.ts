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
  iconName: "Clapperboard" | "Star" | "Eye" | "Rocket" | "Search" | "Film" | "Camera" | "Trophy";
  cost: number;
  emoji?: string;
  iconBg?: string;
  description?: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: "avatar_director", label: "Klaket", iconName: "Clapperboard", cost: 0, emoji: "🎬", iconBg: "from-amber-600 to-amber-900", description: "Klasik yönetmen klaketi" },
  { id: "avatar_actor", label: "Yıldız", iconName: "Star", cost: 0, emoji: "⭐", iconBg: "from-yellow-500 to-yellow-800", description: "Hollywood yıldızı" },
  { id: "avatar_lens", label: "Mercek", iconName: "Eye", cost: 0, emoji: "👁️", iconBg: "from-blue-600 to-indigo-900", description: "Sinematik bakış" },
  { id: "avatar_scifi", label: "Roket", iconName: "Rocket", cost: 0, emoji: "🚀", iconBg: "from-cyan-600 to-blue-900", description: "Bilimkurgu vizyoneri" },
  { id: "avatar_noir", label: "Dedektif", iconName: "Search", cost: 0, emoji: "🔍", iconBg: "from-zinc-600 to-zinc-900", description: "Film-noir dedektifi" },
  { id: "avatar_popcorn", label: "Mısır", iconName: "Film", cost: 0, emoji: "🍿", iconBg: "from-red-600 to-amber-900", description: "Sinema salonu ruhu" },
  { id: "avatar_camera", label: "Kamera", iconName: "Camera", cost: 0, emoji: "🎥", iconBg: "from-purple-600 to-indigo-950", description: "35mm kamera" },
  { id: "avatar_oscar", label: "Kupa", iconName: "Trophy", cost: 0, emoji: "🏆", iconBg: "from-amber-500 to-yellow-900", description: "Akademi ödülü" },
];

export function calculateRank(wins: number): { title: string; level: number; nextWins: number } {
  if (wins >= 30) return { title: "Usta Yönetmen", level: 4, nextWins: 50 };
  if (wins >= 15) return { title: "Festival Jürisi", level: 3, nextWins: 30 };
  if (wins >= 5) return { title: "Bağımsız Sinemacı", level: 2, nextWins: 15 };
  return { title: "Bilet Kontrolörü", level: 1, nextWins: 5 };
}
