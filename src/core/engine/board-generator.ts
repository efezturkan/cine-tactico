import { GameBoard } from "../types";
import { findMatchingMovies, getSharedActors } from "./validator";
import { MOVIES_DATABASE } from "@/content/adapters/gameCatalog";

/**
 * Bir tahtanın 9 hücresindeki geçerli film/aktör sayılarını hesaplar
 */
export function calculateBoardValidCounts(
  board: GameBoard,
  moviesPool = MOVIES_DATABASE
): Record<string, number> {
  const counts: Record<string, number> = {};
  board.rows.forEach((row, rIdx) => {
    board.cols.forEach((col, cIdx) => {
      if (row.type === "MOVIE_INTERSECTION" && col.type === "MOVIE_INTERSECTION") {
        const shared = getSharedActors(row.value, col.value, moviesPool);
        counts[`${rIdx}_${cIdx}`] = shared.length;
      } else {
        const validMovies = findMatchingMovies(row, col, moviesPool);
        counts[`${rIdx}_${cIdx}`] = validMovies.length;
      }
    });
  });
  return counts;
}

/**
 * Bir tahtanın validCounts verisini tembelce (lazy memoized) garanti eder.
 * Daha önce hesaplanmışsa mevcut olanı döner, yoksa bir kez hesaplayıp önbelleğe yazar.
 */
export function ensureBoardValidCounts(
  board: GameBoard,
  moviesPool = MOVIES_DATABASE
): Record<string, number> {
  if (board.validCounts && Object.keys(board.validCounts).length === 9) {
    return board.validCounts;
  }
  board.validCounts = calculateBoardValidCounts(board, moviesPool);
  return board.validCounts;
}

/**
 * Verilen tahtanın satır ve sütun sırasını rastgele karıştırarak
 * her yeni maç bulmada dinamik bir 3x3 grid düzeni üretir.
 */
export function createRandomizedBoard(
  baseBoard: GameBoard,
  moviesPool = MOVIES_DATABASE
): GameBoard {
  const shuffledRows = [...baseBoard.rows].sort(() => Math.random() - 0.5);
  const shuffledCols = [...baseBoard.cols].sort(() => Math.random() - 0.5);

  const newBoard: GameBoard = {
    ...baseBoard,
    id: `${baseBoard.id}_rnd_${Math.random().toString(36).substring(2, 7)}`,
    rows: shuffledRows,
    cols: shuffledCols,
    validCounts: {},
  };

  newBoard.validCounts = calculateBoardValidCounts(newBoard, moviesPool);
  return newBoard;
}
