import { Criterion, Movie, ContentPoolType, GameBoard } from "@/types/game";
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
