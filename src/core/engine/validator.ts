import {
  Criterion,
  Movie,
  ContentPoolType,
  GameBoard,
  RarityTier,
  RARITY_TIERS,
  BASE_CELL_POINTS,
  CultThemeKey,
} from "../types";
import { MOVIES_DATABASE } from "@/data/movies";

export function matchesContentPool(movie: Movie, pool: ContentPoolType = "HYBRID"): boolean {
  if (pool === "HYBRID") return true;
  const isSeries = movie.mediaType === "SERIES";
  if (pool === "SERIES") return isSeries;
  return !isSeries;
}

export function isMovieMatchingCriterion(movie: Movie, criterion: Criterion): boolean {
  switch (criterion.type) {
    case "DIRECTOR":
      return movie.director.trim().toLowerCase() === criterion.value.trim().toLowerCase();

    case "ACTOR":
      return movie.cast.some(
        actor => actor.trim().toLowerCase() === criterion.value.trim().toLowerCase()
      );

    case "GENRE":
      return movie.genres.some(
        genre => genre.trim().toLowerCase() === criterion.value.trim().toLowerCase()
      );

    case "THEME":
      return Boolean(
        movie.themes &&
          movie.themes.some(
            t => t.trim().toUpperCase() === criterion.value.trim().toUpperCase()
          )
      );

    case "DECADE":
      if (criterion.value === "2010s+") return movie.year >= 2010;
      if (criterion.value === "2000s") return movie.year >= 2000 && movie.year < 2010;
      if (criterion.value === "1990s") return movie.year >= 1990 && movie.year < 2000;
      if (criterion.value === "1980s-") return movie.year < 1990;
      return false;

    case "AWARD":
      if (criterion.value === "OSCAR") return movie.hasOscar;
      if (criterion.value === "NO_OSCAR") return !movie.hasOscar;
      return false;

    case "FRANCHISE":
      if (!movie.franchise) return false;
      return movie.franchise.trim().toUpperCase() === criterion.value.trim().toUpperCase();

    default:
      return false;
  }
}

export function validateMove(
  movie: Movie,
  rowCriterion: Criterion,
  colCriterion: Criterion
): boolean {
  return (
    isMovieMatchingCriterion(movie, rowCriterion) &&
    isMovieMatchingCriterion(movie, colCriterion)
  );
}

/**
 * MASTER SPECIFICATION v3.0 Rarity Hesaplama Algoritması:
 * Temel Puan: 10 Puan
 * Nadirlik Bonusu:
 * - Common (+0) -> 10 Puan
 * - Uncommon (+2) -> 12 Puan
 * - Rare (+5) -> 15 Puan
 * - Epic (+8) -> 18 Puan
 * - Legendary (+12) -> 22 Puan
 */
export function calculateMovieRarity(movie: Movie): {
  tier: RarityTier;
  bonus: number;
  totalPoints: number;
  rarityPercentile: number;
} {
  let obscurityScore = 50;

  if (movie.boxOfficeCategory === "INDIE") obscurityScore -= 25;
  if (movie.boxOfficeCategory === "BLOCKBUSTER") obscurityScore += 30;
  if (movie.year < 2000) obscurityScore -= 15;
  if (movie.year < 1990) obscurityScore -= 10;
  if (movie.hasOscar) obscurityScore += 10;

  const percentile = Math.min(95, Math.max(3, obscurityScore));

  let tier: RarityTier = "COMMON";
  if (percentile <= 8) tier = "LEGENDARY";
  else if (percentile <= 18) tier = "EPIC";
  else if (percentile <= 35) tier = "RARE";
  else if (percentile <= 55) tier = "UNCOMMON";
  else tier = "COMMON";

  const tierMeta = RARITY_TIERS[tier];
  return {
    tier,
    bonus: tierMeta.bonus,
    totalPoints: BASE_CELL_POINTS + tierMeta.bonus,
    rarityPercentile: percentile,
  };
}

/**
 * Standart Türkçe karakter, noktalama ve aksan duyarsız normalizasyon (DATA_GOVERNANCE.md standardı)
 */
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

// Geriye dönük uyumluluk için alias
export const normalizeName = normalizeCinemaString;

/**
 * Kontrollü Levenshtein Mesafe Algoritması (Fuzzy-matching için)
 */
export function calculateLevenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const d: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + cost
      );
    }
  }

  return d[m][n];
}

/**
 * TERS KADRAJ (ORTAK OYUNCU) DOĞRULAYICISI:
 * Eşleşme Hiyerarşisi:
 * 1. Normalize tam eşleşme
 * 2. Tescilli alias kontrolü
 * 3. 6+ karakterde kontrollü 1 harf toleransı (Fuzzy)
 * Belirsiz / çakışan eşleşmeler otomatik reddedilir.
 */
export function validateActorIntersection(
  actorInput: string,
  movieA: Movie | string,
  movieB: Movie | string,
  database: Movie[] = MOVIES_DATABASE
): { isValid: boolean; matchedActor?: string } {
  const normalizedInput = normalizeCinemaString(actorInput);
  if (!normalizedInput || normalizedInput.length < 2) return { isValid: false };

  const shared = getSharedActors(movieA, movieB, database);
  if (shared.length === 0) return { isValid: false };

  // 1. AŞAMA: Normalize edilmiş tam eşleşme
  const exactMatch = shared.find(actor => normalizeCinemaString(actor) === normalizedInput);
  if (exactMatch) {
    return { isValid: true, matchedActor: exactMatch };
  }

  // 2. AŞAMA: Parça / İsim içeren eşleşme (örn: "DiCaprio" veya "Leonardo")
  const containsMatches = shared.filter(actor => {
    const norm = normalizeCinemaString(actor);
    const tokens = norm.split(" ");
    return tokens.includes(normalizedInput) || norm.includes(normalizedInput);
  });

  if (containsMatches.length === 1) {
    return { isValid: true, matchedActor: containsMatches[0] };
  }

  // 3. AŞAMA: Kontrollü Fuzzy Eşleşme (Yalnızca 6+ karakterde 1 harf hatası toleransı)
  if (normalizedInput.length >= 6) {
    const fuzzyCandidates: string[] = [];
    for (const actor of shared) {
      const norm = normalizeCinemaString(actor);
      if (calculateLevenshteinDistance(norm, normalizedInput) <= 1) {
        fuzzyCandidates.push(actor);
      }
    }

    // Belirsizlik kuralı: Tek ve kesin bir aday varsa kabul et
    if (fuzzyCandidates.length === 1) {
      return { isValid: true, matchedActor: fuzzyCandidates[0] };
    }
  }

  return { isValid: false };
}

export function getSharedActors(
  movieA: Movie | string,
  movieB: Movie | string,
  database: Movie[] = MOVIES_DATABASE
): string[] {
  const mA = typeof movieA === "string" 
    ? database.find(m => m.title.toLowerCase() === movieA.toLowerCase() || m.id === movieA) 
    : movieA;
  const mB = typeof movieB === "string" 
    ? database.find(m => m.title.toLowerCase() === movieB.toLowerCase() || m.id === movieB) 
    : movieB;
  if (!mA || !mB || !mA.cast || !mB.cast) return [];
  const castBSet = new Set(mB.cast.map(a => normalizeName(a)));
  return mA.cast.filter(actor => castBSet.has(normalizeName(actor)));
}

export function getAllUniqueActors(database: Movie[] = MOVIES_DATABASE): string[] {
  const actorMap = new Map<string, string>();
  for (const m of database) {
    for (const actor of m.cast) {
      const norm = normalizeName(actor);
      if (!actorMap.has(norm)) {
        actorMap.set(norm, actor.trim());
      }
    }
  }
  return Array.from(actorMap.values()).sort((a, b) => a.localeCompare(b));
}

export function findMatchingMovies(
  rowCriterion: Criterion,
  colCriterion: Criterion,
  database: Movie[] = MOVIES_DATABASE,
  contentPool: ContentPoolType = "HYBRID"
): Movie[] {
  return database.filter(
    movie => matchesContentPool(movie, contentPool) && validateMove(movie, rowCriterion, colCriterion)
  );
}

export function validateBoardSolvability(
  board: GameBoard,
  minThreshold: number = 3,
  database: Movie[] = MOVIES_DATABASE,
  contentPool: ContentPoolType = "HYBRID"
): { isValid: boolean; failedCells: { row: string; col: string; count: number }[] } {
  const failedCells: { row: string; col: string; count: number }[] = [];

  for (const row of board.rows) {
    for (const col of board.cols) {
      const count = findMatchingMovies(row, col, database, contentPool).length;
      if (count < minThreshold) {
        failedCells.push({
          row: row.label,
          col: col.label,
          count,
        });
      }
    }
  }

  return {
    isValid: failedCells.length === 0,
    failedCells,
  };
}
