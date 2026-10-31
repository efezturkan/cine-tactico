import {
  Criterion,
  Movie,
  ContentPoolType,
  GameBoard,
  RarityTier,
  RARITY_TIERS,
  BASE_CELL_POINTS,
  CultThemeKey,
} from "@/types/game";
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

    case "RATING":
      if (criterion.value === "IMDB_8_PLUS") return movie.imdbRating >= 8.0;
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
  // Nadirlik: Kült, düşük gişe/bağımsız ve eski filmler daha yüksek rarity taşır
  let obscurityScore = 50;

  if (movie.boxOfficeCategory === "INDIE") obscurityScore -= 25;
  if (movie.boxOfficeCategory === "BLOCKBUSTER") obscurityScore += 30;
  if (movie.year < 2000) obscurityScore -= 15;
  if (movie.year < 1990) obscurityScore -= 10;
  if (movie.imdbRating >= 8.5) obscurityScore += 10; // Popüler başyapıt

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
 * TERS KADRAJ (ORTAK OYUNCU) DOĞRULAYICISI:
 * İki filmin kesişimindeki ortak oyuncuyu doğrular.
 */
export function normalizeName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "");
}

export function validateActorIntersection(
  actorInput: string,
  movieA: Movie,
  movieB: Movie
): { isValid: boolean; matchedActor?: string } {
  const normalizedInput = normalizeName(actorInput);
  if (!normalizedInput) return { isValid: false };

  // movieA ve movieB ortak oyuncularını bul
  const shared = getSharedActors(movieA, movieB);

  const matched = shared.find(actor => {
    const norm = normalizeName(actor);
    return (
      norm === normalizedInput ||
      norm.includes(normalizedInput) ||
      normalizedInput.includes(norm)
    );
  });

  if (matched) {
    return { isValid: true, matchedActor: matched };
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

/**
 * Eksen Güvenliği Kuralı:
 * Bir tahta yayınlanmadan önce her kesişim hücresinde en az `minThreshold` (varsayılan 3)
 * geçerli eser bulunup bulunmadığı denetlenir. Yetersiz hücre varsa tahta reddedilir.
 */
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
