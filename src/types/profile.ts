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
  reelsBalance: number;       // Altın / Makaralar
  diamondsBalance: number;    // Elmaslar (Reklam & Turnuva ödülü)
  powerups: PowerupInventory; // Kafa Topu 2 tarzı jokerler
  unlockedAvatars: string[];
  isPro?: boolean;            // Sinefil Pro VIP
  tasteDna: CinephilePersona; // Sinefil Kimliği (Letterboxd / Persona)
  ambience?: CinemaAmbience;  // Sinema Salonu Işık ve Loşluk Ayarları
}

export interface AvatarOption {
  id: string;
  label: string;
  emoji: string;
  iconBg: string;
  cost: number;
  description: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: "avatar_director", label: "Yönetmen", emoji: "🎬", iconBg: "from-amber-500 to-rose-500", cost: 0, description: "Kadrajın efendisi" },
  { id: "avatar_actor", label: "Yıldız Oyuncu", emoji: "🌟", iconBg: "from-indigo-500 to-cyan-500", cost: 0, description: "Işıklar altında bir yıldız" },
  { id: "avatar_noir", label: "Dedektif", emoji: "🕵️", iconBg: "from-zinc-700 to-zinc-900", cost: 150, description: "Karanlık sokaklar & neo-noir" },
  { id: "avatar_scifi", label: "Uzay Gezgini", emoji: "🚀", iconBg: "from-cyan-500 to-blue-600", cost: 250, description: "Yıldızlararası vizyon" },
  { id: "avatar_critics", label: "Festival Jürisi", emoji: "🧐", iconBg: "from-yellow-400 to-amber-600", cost: 350, description: "Cannes & Venedik seçkisi" },
  { id: "avatar_popcorn", label: "Mısır Sever", emoji: "🍿", iconBg: "from-rose-500 to-pink-500", cost: 150, description: "Keyifli gişe izleyicisi" },
  { id: "avatar_camera", label: "35mm Kameraman", emoji: "🎥", iconBg: "from-amber-600 to-yellow-700", cost: 450, description: "Analog film tutkunu" },
  { id: "avatar_oscar", label: "Altın Heykelcik", emoji: "🏆", iconBg: "from-amber-400 to-yellow-500", cost: 600, description: "Akademi prestiji" },
];

export function calculateRank(wins: number): { title: string; level: number; nextWins: number } {
  if (wins >= 30) return { title: "Oscar Kazanan Yönetmen 🏆", level: 4, nextWins: 50 };
  if (wins >= 15) return { title: "Cannes Festival Jürisi 🎖️", level: 3, nextWins: 30 };
  if (wins >= 5) return { title: "Bağımsız Sinemacı 🎬", level: 2, nextWins: 15 };
  return { title: "Bilet Kontrolörü 🍿", level: 1, nextWins: 5 };
}
