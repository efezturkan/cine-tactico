import { GameBoard, BotDifficulty } from "@/types/game";
import { findMatchingMovies, getSharedActors } from "@/engine/validator";

export interface BotOpponentProfile {
  name: string;
  rankTitle: string;
  level: number;
  avatarId: string;
  winRate: number;
  difficulty: BotDifficulty;
}

export const BOT_OPPONENTS: BotOpponentProfile[] = [
  // ACEMİ BOTLAR (EASY - Level 1-3)
  {
    name: "PatlamisMisirci",
    rankTitle: "Bilet Kontrolörü 🍿",
    level: 2,
    avatarId: "avatar_actor",
    winRate: 42,
    difficulty: "EASY",
  },
  {
    name: "SeansGezgini",
    rankTitle: "Hafta Sonu Seyircisi 🎟️",
    level: 3,
    avatarId: "avatar_noir",
    winRate: 46,
    difficulty: "EASY",
  },
  {
    name: "PopcornCanavari",
    rankTitle: "Gişe Çırağı 🥤",
    level: 1,
    avatarId: "avatar_scifi",
    winRate: 38,
    difficulty: "EASY",
  },

  // MERAKLI SİNEFİLLER (MEDIUM - Level 4-7)
  {
    name: "NolanZihni",
    rankTitle: "Zaman Büken Sinefil ⏳",
    level: 6,
    avatarId: "avatar_director",
    winRate: 65,
    difficulty: "MEDIUM",
  },
  {
    name: "OscarAvcisi",
    rankTitle: "Akademi Tahmincisi 🏆",
    level: 5,
    avatarId: "avatar_critics",
    winRate: 58,
    difficulty: "MEDIUM",
  },
  {
    name: "DuneSeyyahi",
    rankTitle: "Arrakis Bilgesi 🌌",
    level: 7,
    avatarId: "avatar_scifi",
    winRate: 69,
    difficulty: "MEDIUM",
  },
  {
    name: "FincherDedektif",
    rankTitle: "Karanlık Zihinler Dedektifi 🕵️",
    level: 6,
    avatarId: "avatar_noir",
    winRate: 63,
    difficulty: "MEDIUM",
  },

  // USTA SİNEFİLLER (HARD - Level 8-10)
  {
    name: "TarantinoKult",
    rankTitle: "Altın Palmiye Gurusu 🎬",
    level: 9,
    avatarId: "avatar_director",
    winRate: 85,
    difficulty: "HARD",
  },
  {
    name: "LetterboxdEfsanesi",
    rankTitle: "5 Yıldız Koleksiyoneri ⭐",
    level: 10,
    avatarId: "avatar_critics",
    winRate: 92,
    difficulty: "HARD",
  },
  {
    name: "ScorseseAilesi",
    rankTitle: "Sinema Tarihçisi 🍷",
    level: 8,
    avatarId: "avatar_noir",
    winRate: 78,
    difficulty: "HARD",
  },
  {
    name: "KubrickBakisli",
    rankTitle: "Auteur Başyapıt Uykusuzu 👁️",
    level: 10,
    avatarId: "avatar_director",
    winRate: 90,
    difficulty: "HARD",
  },
];

export function getRandomOpponent(
  difficultyOrExclude?: BotDifficulty | string,
  excludeName?: string
): BotOpponentProfile {
  let pool = BOT_OPPONENTS;
  let difficulty: BotDifficulty | undefined;
  let exclude = excludeName;

  if (typeof difficultyOrExclude === "string") {
    if (["EASY", "MEDIUM", "HARD"].includes(difficultyOrExclude)) {
      difficulty = difficultyOrExclude as BotDifficulty;
    } else {
      exclude = difficultyOrExclude;
    }
  }

  if (difficulty) {
    const matched = pool.filter(o => o.difficulty === difficulty);
    if (matched.length > 0) pool = matched;
  }
  if (exclude && pool.length > 1) {
    const filtered = pool.filter(o => o.name !== exclude);
    if (filtered.length > 0) pool = filtered;
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

export const PRESET_BOARDS: GameBoard[] = [
  {
    id: "board_master_1",
    title: "Auteur Savaşları: Nolan vs Tarantino vs Scorsese",
    difficulty: "MEDIUM",
    rows: [
      {
        id: "r1",
        type: "DIRECTOR",
        label: "Christopher Nolan",
        subLabel: "Zihin, Zaman & Bilim Kurgu",
        value: "Christopher Nolan",
      },
      {
        id: "r2",
        type: "DIRECTOR",
        label: "Quentin Tarantino",
        subLabel: "Diyalog, Şiddet & Kült",
        value: "Quentin Tarantino",
      },
      {
        id: "r3",
        type: "DIRECTOR",
        label: "Martin Scorsese",
        subLabel: "Mafya, Suç & Karakter",
        value: "Martin Scorsese",
      },
    ],
    cols: [
      {
        id: "c1",
        type: "ACTOR",
        label: "Leonardo DiCaprio",
        subLabel: "Ortak Başrol",
        value: "Leonardo DiCaprio",
      },
      {
        id: "c2",
        type: "AWARD",
        label: "Oscar Kazandı",
        subLabel: "Akademi Ödüllü",
        value: "OSCAR",
      },
      {
        id: "c3",
        type: "DECADE",
        label: "2010 Sonrası",
        subLabel: "Modern Çağ",
        value: "2010s+",
      },
    ],
    validCounts: {},
  },
  {
    id: "board_master_2",
    title: "Aktörler Arenası: De Niro vs Brad Pitt vs Cillian Murphy",
    difficulty: "HARD",
    rows: [
      {
        id: "r1_2",
        type: "ACTOR",
        label: "Brad Pitt",
        subLabel: "Fight Club & Inglourious",
        value: "Brad Pitt",
      },
      {
        id: "r2_2",
        type: "ACTOR",
        label: "Cillian Murphy",
        subLabel: "Oppenheimer & Shelby",
        value: "Cillian Murphy",
      },
      {
        id: "r3_2",
        type: "ACTOR",
        label: "Robert De Niro",
        subLabel: "Godfather & Taxi Driver",
        value: "Robert De Niro",
      },
    ],
    cols: [
      {
        id: "c1_2",
        type: "GENRE",
        label: "Suç & Gerilim",
        subLabel: "Mafya & Adrenalin",
        value: "Crime",
      },
      {
        id: "c2_2",
        type: "AWARD",
        label: "Oscar Kazandı",
        subLabel: "Akademi Ödüllü",
        value: "OSCAR",
      },
      {
        id: "c3_2",
        type: "DECADE",
        label: "2010 Sonrası",
        subLabel: "Modern Çıkışlı",
        value: "2010s+",
      },
    ],
    validCounts: {},
  },
  // --- SİNEFİL KONSEPT (CULT THEMES) MODU ---
  {
    id: "board_concept_mindbending",
    title: "Sinefil Konsept: Zihin Bükücüler & Kurgu Dehaları",
    boardMode: "CINE_CONCEPT",
    difficulty: "HARD",
    rows: [
      {
        id: "rc_1",
        type: "THEME",
        label: "Ters Köşe (Plot Twist)",
        subLabel: "Şok Edici Finaller",
        value: "PLOT_TWIST",
      },
      {
        id: "rc_2",
        type: "THEME",
        label: "Neo-Noir (Karanlık Şehir)",
        subLabel: "Yağmurlu Geceler & Yozlaşma",
        value: "NEO_NOIR",
      },
      {
        id: "rc_3",
        type: "THEME",
        label: "İntikam (Revenge)",
        subLabel: "Kan Davası & Hesaplaşma",
        value: "REVENGE",
      },
    ],
    cols: [
      {
        id: "cc_1",
        type: "DIRECTOR",
        label: "Christopher Nolan",
        subLabel: "Zaman & Zihin Ustası",
        value: "Christopher Nolan",
      },
      {
        id: "cc_2",
        type: "AWARD",
        label: "Oscar Kazandı",
        subLabel: "Akademi Ödüllü",
        value: "OSCAR",
      },
      {
        id: "cc_3",
        type: "GENRE",
        label: "Dram & Suç",
        subLabel: "Dramatik Eserler",
        value: "Drama",
      },
    ],
    validCounts: {},
  },
  {
    id: "board_concept_survival_heist",
    title: "Sinefil Konsept: Adrenalin & Kaçış",
    boardMode: "CINE_CONCEPT",
    difficulty: "MEDIUM",
    rows: [
      {
        id: "rc_4",
        type: "THEME",
        label: "Büyük Soygun (Heist)",
        subLabel: "Kusursuz Plan & Deha",
        value: "HEIST",
      },
      {
        id: "rc_5",
        type: "THEME",
        label: "Karanlık Gelecek (Distopya)",
        subLabel: "Yıkık Uygarlıklar",
        value: "DYSTOPIA",
      },
      {
        id: "rc_6",
        type: "THEME",
        label: "Derin Uzay (Space)",
        subLabel: "Sonsuz Karanlık",
        value: "SPACE",
      },
    ],
    cols: [
      {
        id: "cc_4",
        type: "DECADE",
        label: "2010 Sonrası",
        subLabel: "Modern Sinema",
        value: "2010s+",
      },
      {
        id: "cc_5",
        type: "AWARD",
        label: "Oscar Kazandı",
        subLabel: "Akademi Ödüllü",
        value: "OSCAR",
      },
      {
        id: "cc_6",
        type: "DECADE",
        label: "2010 Sonrası",
        subLabel: "Modern Eserler",
        value: "2010s+",
      },
    ],
    validCounts: {},
  },

  // --- TERS KADRAJ (ORTAK OYUNCU) MODU ---
  {
    id: "board_reverse_nolan_titans",
    title: "Ters Kadraj: Nolan & Yıldızlar Kadrosu",
    boardMode: "REVERSE_CAST",
    difficulty: "HARD",
    rows: [
      {
        id: "rr_1",
        type: "MOVIE_INTERSECTION",
        label: "Inception",
        subLabel: "2010 • Christopher Nolan",
        value: "Inception",
      },
      {
        id: "rr_2",
        type: "MOVIE_INTERSECTION",
        label: "The Dark Knight",
        subLabel: "2008 • Christopher Nolan",
        value: "The Dark Knight",
      },
      {
        id: "rr_3",
        type: "MOVIE_INTERSECTION",
        label: "Interstellar",
        subLabel: "2014 • Christopher Nolan",
        value: "Interstellar",
      },
    ],
    cols: [
      {
        id: "cr_1",
        type: "MOVIE_INTERSECTION",
        label: "Oppenheimer",
        subLabel: "2023 • Christopher Nolan",
        value: "Oppenheimer",
      },
      {
        id: "cr_2",
        type: "MOVIE_INTERSECTION",
        label: "The Dark Knight Rises",
        subLabel: "2012 • Christopher Nolan",
        value: "The Dark Knight Rises",
      },
      {
        id: "cr_3",
        type: "MOVIE_INTERSECTION",
        label: "Batman Begins (Batman Başlıyor)",
        subLabel: "2005 • Christopher Nolan",
        value: "Batman Begins (Batman Başlıyor)",
      },
    ],
    validCounts: {},
  },
  {
    id: "board_reverse_mafia_cult",
    title: "Ters Kadraj: Suç Dehaları & Mafya Hanedanı",
    boardMode: "REVERSE_CAST",
    difficulty: "HARD",
    rows: [
      {
        id: "rr_4",
        type: "MOVIE_INTERSECTION",
        label: "Once Upon a Time in Hollywood",
        subLabel: "2019 • Tarantino",
        value: "Once Upon a Time in Hollywood",
      },
      {
        id: "rr_5",
        type: "MOVIE_INTERSECTION",
        label: "Goodfellas",
        subLabel: "1990 • Scorsese",
        value: "Goodfellas",
      },
      {
        id: "rr_6",
        type: "MOVIE_INTERSECTION",
        label: "Taxi Driver",
        subLabel: "1976 • Scorsese",
        value: "Taxi Driver",
      },
    ],
    cols: [
      {
        id: "cr_4",
        type: "MOVIE_INTERSECTION",
        label: "The Irishman",
        subLabel: "2019 • Scorsese",
        value: "The Irishman",
      },
      {
        id: "cr_5",
        type: "MOVIE_INTERSECTION",
        label: "Killers of the Flower Moon",
        subLabel: "2023 • Scorsese",
        value: "Killers of the Flower Moon",
      },
      {
        id: "cr_6",
        type: "MOVIE_INTERSECTION",
        label: "The Godfather Part II (Baba 2)",
        subLabel: "1974 • Coppola",
        value: "The Godfather Part II (Baba 2)",
      },
    ],
    validCounts: {},
  },
  {
    id: "board_daily_today",
    title: "Günün XOX Meydan Okuması",
    difficulty: "EASY",
    rows: [
      {
        id: "r1_3",
        type: "DIRECTOR",
        label: "Denis Villeneuve",
        subLabel: "Dune & Arrival",
        value: "Denis Villeneuve",
      },
      {
        id: "r2_3",
        type: "DIRECTOR",
        label: "David Fincher",
        subLabel: "Fight Club & Se7en",
        value: "David Fincher",
      },
      {
        id: "r3_3",
        type: "DIRECTOR",
        label: "Christopher Nolan",
        subLabel: "Interstellar & Inception",
        value: "Christopher Nolan",
      },
    ],
    cols: [
      {
        id: "c1_3",
        type: "GENRE",
        label: "Bilim Kurgu",
        value: "Sci-Fi",
      },
      {
        id: "c2_3",
        type: "GENRE",
        label: "Dram (Drama)",
        value: "Drama",
      },
      {
        id: "c3_3",
        type: "RATING",
        label: "8.0+ Puan",
        value: "IMDB_8_PLUS",
      },
    ],
    validCounts: {},
  },
  {
    id: "board_dc_marvel",
    title: "Süper Kahramanlar: DC vs MARVEL Düellosu",
    difficulty: "MEDIUM",
    rows: [
      {
        id: "r1_dc",
        type: "ACTOR",
        label: "Christian Bale",
        subLabel: "Batman & Gorr",
        value: "Christian Bale",
      },
      {
        id: "r2_dc",
        type: "DIRECTOR",
        label: "James Gunn",
        subLabel: "Guardians & Suicide Squad",
        value: "James Gunn",
      },
      {
        id: "r3_dc",
        type: "ACTOR",
        label: "Ryan Reynolds",
        subLabel: "Deadpool & Green Lantern",
        value: "Ryan Reynolds",
      },
    ],
    cols: [
      {
        id: "c1_dc",
        type: "FRANCHISE",
        label: "DC Evreni",
        value: "DC",
      },
      {
        id: "c2_dc",
        type: "FRANCHISE",
        label: "Marvel (MCU)",
        value: "MARVEL",
      },
      {
        id: "c3_dc",
        type: "GENRE",
        label: "Aksiyon (Action)",
        subLabel: "Süper Güç & Macera",
        value: "Action",
      },
    ],
    validCounts: {},
  },
  {
    id: "board_dune_scifi",
    title: "Epik Bilim Kurgu: Dune & Nolan Evreni",
    difficulty: "MEDIUM",
    rows: [
      {
        id: "r1_dune",
        type: "DIRECTOR",
        label: "Denis Villeneuve",
        subLabel: "Dune & Blade Runner 2049",
        value: "Denis Villeneuve",
      },
      {
        id: "r2_dune",
        type: "DIRECTOR",
        label: "Christopher Nolan",
        subLabel: "Interstellar & Inception",
        value: "Christopher Nolan",
      },
      {
        id: "r3_dune",
        type: "ACTOR",
        label: "Timothée Chalamet",
        subLabel: "Paul Atreides & Tom",
        value: "Timothée Chalamet",
      },
    ],
    cols: [
      {
        id: "c1_dune",
        type: "GENRE",
        label: "Bilim Kurgu (Sci-Fi)",
        value: "Sci-Fi",
      },
      {
        id: "c2_dune",
        type: "AWARD",
        label: "Oscar Kazandı",
        value: "OSCAR",
      },
      {
        id: "c3_dune",
        type: "RATING",
        label: "8.0+ Puan (Efsane)",
        value: "IMDB_8_PLUS",
      },
    ],
    validCounts: {},
  },
  {
    id: "board_90s_cult",
    title: "90'lar Kült Arenası: Pulp Fiction & Fight Club",
    difficulty: "HARD",
    rows: [
      {
        id: "r1_90s",
        type: "ACTOR",
        label: "Brad Pitt",
        subLabel: "Tyler Durden & Cliff Booth",
        value: "Brad Pitt",
      },
      {
        id: "r2_90s",
        type: "DIRECTOR",
        label: "Quentin Tarantino",
        subLabel: "Pulp Fiction & Django",
        value: "Quentin Tarantino",
      },
      {
        id: "r3_90s",
        type: "DIRECTOR",
        label: "David Fincher",
        subLabel: "Fight Club & Se7en",
        value: "David Fincher",
      },
    ],
    cols: [
      {
        id: "c1_90s",
        type: "GENRE",
        label: "Suç (Crime)",
        value: "Crime",
      },
      {
        id: "c2_90s",
        type: "RATING",
        label: "8.0+ Puan (Efsane)",
        value: "IMDB_8_PLUS",
      },
      {
        id: "c3_90s",
        type: "DECADE",
        label: "90'lar Başyapıtı",
        value: "1990s",
      },
    ],
    validCounts: {},
  },
  {
    id: "board_master_titans",
    title: "Sinema Devleri: DiCaprio vs Christian Bale vs Brad Pitt",
    difficulty: "MEDIUM",
    rows: [
      {
        id: "r1_titans",
        type: "ACTOR",
        label: "Leonardo DiCaprio",
        subLabel: "Inception & Wolf of Wall Street",
        value: "Leonardo DiCaprio",
      },
      {
        id: "r2_titans",
        type: "ACTOR",
        label: "Christian Bale",
        subLabel: "The Dark Knight & Prestige",
        value: "Christian Bale",
      },
      {
        id: "r3_titans",
        type: "ACTOR",
        label: "Brad Pitt",
        subLabel: "Fight Club & Inglourious",
        value: "Brad Pitt",
      },
    ],
    cols: [
      {
        id: "c1_titans",
        type: "AWARD",
        label: "Oscar Kazandı",
        value: "OSCAR",
      },
      {
        id: "c2_titans",
        type: "DECADE",
        label: "2010 Sonrası",
        value: "2010s+",
      },
      {
        id: "c3_titans",
        type: "GENRE",
        label: "Dram (Drama)",
        value: "Drama",
      },
    ],
    validCounts: {},
  },
  {
    id: "board_thriller_masters",
    title: "Gerilim & Gizem: Fincher vs Nolan vs Villeneuve",
    difficulty: "HARD",
    rows: [
      {
        id: "r1_thrill",
        type: "DIRECTOR",
        label: "David Fincher",
        subLabel: "Fight Club & Se7en",
        value: "David Fincher",
      },
      {
        id: "r2_thrill",
        type: "DIRECTOR",
        label: "Christopher Nolan",
        subLabel: "Inception & Dark Knight",
        value: "Christopher Nolan",
      },
      {
        id: "r3_thrill",
        type: "DIRECTOR",
        label: "Denis Villeneuve",
        subLabel: "Dune & Sicario & Arrival",
        value: "Denis Villeneuve",
      },
    ],
    cols: [
      {
        id: "c1_thrill",
        type: "RATING",
        label: "8.0+ Puan (Efsane)",
        value: "IMDB_8_PLUS",
      },
      {
        id: "c2_thrill",
        type: "GENRE",
        label: "Dram & Suç",
        value: "Drama",
      },
      {
        id: "c3_thrill",
        type: "AWARD",
        label: "Oscar Kazandı",
        value: "OSCAR",
      },
    ],
    validCounts: {},
  },
  {
    id: "board_sinefil_oscar",
    title: "Sinefil Arenası: Yönetmenler × Oscar Durumu",
    difficulty: "HARD",
    rows: [
      {
        id: "r1_s_oscar",
        type: "DIRECTOR",
        label: "Christopher Nolan",
        subLabel: "Oppenheimer & Interstellar",
        value: "Christopher Nolan",
      },
      {
        id: "r2_s_oscar",
        type: "DIRECTOR",
        label: "Denis Villeneuve",
        subLabel: "Dune & Arrival & Blade Runner",
        value: "Denis Villeneuve",
      },
      {
        id: "r3_s_oscar",
        type: "DIRECTOR",
        label: "David Fincher",
        subLabel: "Fight Club & Social Network",
        value: "David Fincher",
      },
    ],
    cols: [
      {
        id: "c1_s_oscar",
        type: "AWARD",
        label: "Oscar Kazandı",
        subLabel: "En Az 1 Akademi Ödülü",
        value: "OSCAR",
      },
      {
        id: "c2_s_oscar",
        type: "AWARD",
        label: "Oscar Yok",
        subLabel: "Akademi Alamayan Eserler",
        value: "NO_OSCAR",
      },
      {
        id: "c3_s_oscar",
        type: "RATING",
        label: "8.0+ Puan (Efsane)",
        subLabel: "Kült Başyapıtlar",
        value: "IMDB_8_PLUS",
      },
    ],
    validCounts: {},
  },
];

// Başlangıçta tüm tahtaların geçerli film sayılarını hesapla
PRESET_BOARDS.forEach(board => {
  board.rows.forEach((row, rIdx) => {
    board.cols.forEach((col, cIdx) => {
      const validMovies = findMatchingMovies(row, col);
      board.validCounts[`${rIdx}_${cIdx}`] = validMovies.length;
    });
  });
});

/**
 * Verilen tahtanın satır ve sütun sırasını rastgele karıştırarak
 * her yeni maç bulmada yepyeni ve dinamik bir 3x3 grid düzeni üretir.
 */
export function createRandomizedBoard(baseBoard: GameBoard): GameBoard {
  const shuffledRows = [...baseBoard.rows].sort(() => Math.random() - 0.5);
  const shuffledCols = [...baseBoard.cols].sort(() => Math.random() - 0.5);

  const newValidCounts: Record<string, number> = {};
  shuffledRows.forEach((row, rIdx) => {
    shuffledCols.forEach((col, cIdx) => {
      if (row.type === "MOVIE_INTERSECTION" && col.type === "MOVIE_INTERSECTION") {
        const shared = getSharedActors(row.value, col.value);
        newValidCounts[`${rIdx}_${cIdx}`] = shared.length;
      } else {
        const validMovies = findMatchingMovies(row, col);
        newValidCounts[`${rIdx}_${cIdx}`] = validMovies.length;
      }
    });
  });

  return {
    ...baseBoard,
    id: `${baseBoard.id}_rnd_${Math.random().toString(36).substring(2, 7)}`,
    rows: shuffledRows,
    cols: shuffledCols,
    validCounts: newValidCounts,
  };
}

/**
 * Mod türüne göre ("CLASSIC", "REVERSE_CAST", "CINE_CONCEPT" veya "SINEFIL") uygun tahtayı getirir.
 */
export function getBoardForMode(
  mode: "CLASSIC" | "REVERSE_CAST" | "CINE_CONCEPT" | "SINEFIL",
  excludeIndex?: number
): { board: GameBoard; index: number } {
  let matchingIndices: number[] = [];

  if (mode === "REVERSE_CAST") {
    matchingIndices = PRESET_BOARDS.map((b, idx) => ({ b, idx }))
      .filter(item => item.b.boardMode === "REVERSE_CAST")
      .map(item => item.idx);
  } else if (mode === "CINE_CONCEPT") {
    matchingIndices = PRESET_BOARDS.map((b, idx) => ({ b, idx }))
      .filter(item => item.b.boardMode === "CINE_CONCEPT")
      .map(item => item.idx);
  } else if (mode === "SINEFIL") {
    const sinefilIds = ["board_sinefil_oscar", "board_thriller_masters", "board_dune_scifi"];
    matchingIndices = PRESET_BOARDS.map((b, idx) => ({ b, idx }))
      .filter(item => sinefilIds.includes(item.b.id) || item.b.boardMode === "CINE_CONCEPT")
      .map(item => item.idx);
  } else {
    // CLASSIC
    matchingIndices = PRESET_BOARDS.map((b, idx) => ({ b, idx }))
      .filter(item => item.b.boardMode === "CLASSIC" || !item.b.boardMode)
      .map(item => item.idx);
  }

  if (matchingIndices.length === 0) {
    matchingIndices = PRESET_BOARDS.map((_, i) => i);
  }

  if (excludeIndex !== undefined && matchingIndices.length > 1) {
    const withoutExclude = matchingIndices.filter(i => i !== excludeIndex);
    if (withoutExclude.length > 0) matchingIndices = withoutExclude;
  }

  const chosenIndex = matchingIndices[Math.floor(Math.random() * matchingIndices.length)];
  const randomizedBoard = createRandomizedBoard(PRESET_BOARDS[chosenIndex]);
  return { board: randomizedBoard, index: chosenIndex };
}

/**
 * Mevcut tahta haricinde rastgele bir tahta seçer ve satır/sütun düzenini karıştırır.
 */
export function getRandomBoard(excludeIndex?: number): { board: GameBoard; index: number } {
  let indices = PRESET_BOARDS.map((_, i) => i);
  if (excludeIndex !== undefined && indices.length > 1) {
    indices = indices.filter(i => i !== excludeIndex);
  }
  const chosenIndex = indices[Math.floor(Math.random() * indices.length)];
  const randomizedBoard = createRandomizedBoard(PRESET_BOARDS[chosenIndex]);
  return { board: randomizedBoard, index: chosenIndex };
}
