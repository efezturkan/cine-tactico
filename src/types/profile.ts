import { GameBoard, CellAnswer } from "@/core";

export type AmbienceTheme = "velvet_red" | "darkroom_red" | "kodak_amber" | "noir_silver" | "scifi_cyan";
export type GrainLevel = "OFF" | "SUBTLE" | "VINTAGE";
export type CornerAccentOption = "AUTO" | "GOLD" | "SILVER" | "CYAN" | "RUBY";

export interface CinemaAmbience {
  theme: AmbienceTheme;
  dimness: number;         // 50 - 96 (% arka plan karartması)
  glowIntensity: number;   // 15 - 90 (% projeksiyon parıltısı)
  grain: GrainLevel;       // 35mm film greni
  showWatermark: boolean;  // Vizör / lens filigranı
  cornerAccent?: CornerAccentOption; // Kamera vizör köşeleri & vurgu rengi
}

export const CORNER_ACCENT_COLORS: Record<
  CornerAccentOption,
  { label: string; color: string; border: string; emoji: string }
> = {
  AUTO: { label: "Temaya Uygun", color: "auto", border: "auto", emoji: "✨" },
  GOLD: { label: "Kraliyet Altını", color: "#f59e0b", border: "rgba(245, 158, 11, 0.6)", emoji: "🟡" },
  SILVER: { label: "Gümüş Platin", color: "#f8fafc", border: "rgba(248, 250, 252, 0.6)", emoji: "⚪" },
  CYAN: { label: "Holo Neon", color: "#38bdf8", border: "rgba(56, 189, 248, 0.6)", emoji: "🔵" },
  RUBY: { label: "Koyu Yakut", color: "#ef4444", border: "rgba(239, 68, 68, 0.6)", emoji: "🔴" },
};

export const AMBIENCE_THEMES: Record<
  AmbienceTheme,
  {
    id: AmbienceTheme;
    label: string;
    sub: string;
    accentColor: string;
    secondaryAccent: string;
    hudBorder: string;
    glowRgba: string;
    bgColor: string;
    emoji: string;
  }
> = {
  velvet_red: {
    id: "velvet_red",
    label: "Kadife Gece Yarısı",
    sub: "Klasik sinema perdesi bordosu",
    accentColor: "#8b151b",
    secondaryAccent: "#f59e0b",
    hudBorder: "rgba(139, 21, 27, 0.45)",
    glowRgba: "rgba(139, 21, 27, 0.45)",
    bgColor: "#07080b",
    emoji: "🍷",
  },
  darkroom_red: {
    id: "darkroom_red",
    label: "Analog Karanlık Oda",
    sub: "35mm banyo emniyet lambası",
    accentColor: "#dc2626",
    secondaryAccent: "#ef4444",
    hudBorder: "rgba(220, 38, 38, 0.45)",
    glowRgba: "rgba(220, 38, 38, 0.5)",
    bgColor: "#050505",
    emoji: "🔴",
  },
  kodak_amber: {
    id: "kodak_amber",
    label: "Kodak 1970 Kehribar",
    sub: "Sıcak altın saat projeksiyonu",
    accentColor: "#d97706",
    secondaryAccent: "#fbbf24",
    hudBorder: "rgba(217, 119, 6, 0.45)",
    glowRgba: "rgba(217, 119, 6, 0.45)",
    bgColor: "#090704",
    emoji: "🎞️",
  },
  noir_silver: {
    id: "noir_silver",
    label: "Criterion Noir",
    sub: "Siyah-beyaz bağımsız sinema",
    accentColor: "#94a3b8",
    secondaryAccent: "#f8fafc",
    hudBorder: "rgba(148, 163, 184, 0.35)",
    glowRgba: "rgba(203, 213, 225, 0.35)",
    bgColor: "#060709",
    emoji: "🎬",
  },
  scifi_cyan: {
    id: "scifi_cyan",
    label: "Sci-Fi Cyberpunk",
    sub: "Blade Runner & Dune neonu",
    accentColor: "#06b6d4",
    secondaryAccent: "#38bdf8",
    hudBorder: "rgba(6, 182, 212, 0.45)",
    glowRgba: "rgba(6, 182, 212, 0.45)",
    bgColor: "#040810",
    emoji: "🌌",
  },
};

export const DEFAULT_AMBIENCE: CinemaAmbience = {
  theme: "velvet_red",
  dimness: 85,
  glowIntensity: 65,
  grain: "SUBTLE",
  showWatermark: true,
  cornerAccent: "AUTO",
};

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
  ambience?: CinemaAmbience;  // Sinema Salonu Işık ve Loşluk Ayarları
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
