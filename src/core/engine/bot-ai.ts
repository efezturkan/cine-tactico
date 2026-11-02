import { CellAnswer, GameBoard, Movie, PlayerSymbol, BotDifficulty } from "../types";
import { findMatchingMovies, getSharedActors } from "./validator";
import { WINNING_LINES } from "./rules";

export type { BotDifficulty };

export interface BotMoveDecision {
  cellIndex: number;
  movie: Movie | null;
  actorName?: string;
}

/**
 * İnsan benzeri organik durum mesajları havuzu.
 * Botun hamle yaparken robotik görünmesini engeller.
 */
export const BOT_THINKING_PHRASES = [
  "Filmleri hatırlıyor...",
  "Kadrajı inceliyor...",
  "Film arşivini tarıyor...",
  "Kriterleri eşleştiriyor...",
  "Hafızasını yokluyor...",
  "Aday filmleri eliyor...",
  "Kült filmleri düşünüyor...",
  "Hamlesini hazırlıyor...",
];

export function getRandomThinkingPhrase(): string {
  return BOT_THINKING_PHRASES[Math.floor(Math.random() * BOT_THINKING_PHRASES.length)];
}

/**
 * Botun insan gibi doğal, rastgele ve değişken sürelerde hamle yapmasını sağlar.
 */
export function getBotThinkingDelay(difficulty: BotDifficulty = "MEDIUM"): number {
  const roll = Math.random();

  if (difficulty === "HARD") {
    if (roll < 0.4) return 1400 + Math.random() * 1000;
    if (roll < 0.85) return 2500 + Math.random() * 1700;
    return 4300 + Math.random() * 1700;
  }

  if (difficulty === "MEDIUM") {
    if (roll < 0.3) return 1800 + Math.random() * 1200;
    if (roll < 0.8) return 3200 + Math.random() * 2000;
    return 5300 + Math.random() * 2200;
  }

  if (roll < 0.25) return 2000 + Math.random() * 1400;
  if (roll < 0.75) return 3500 + Math.random() * 2700;
  return 6300 + Math.random() * 2500;
}

export function getAvailableMoviesForCell(
  board: GameBoard,
  cellIndex: number,
  usedMovieIds: string[]
): Movie[] {
  const rowIndex = Math.floor(cellIndex / 3);
  const colIndex = cellIndex % 3;
  return findMatchingMovies(board.rows[rowIndex], board.cols[colIndex]).filter(
    m => !usedMovieIds.includes(m.id)
  );
}

export function calculateBotMove(
  board: GameBoard,
  cells: readonly (CellAnswer | null)[],
  usedMovieIds: string[],
  difficulty: BotDifficulty = "MEDIUM",
  botSymbol: PlayerSymbol = "O",
  allowCellStealing: boolean = false
): BotMoveDecision | null {
  const opponentSymbol: PlayerSymbol = botSymbol === "X" ? "O" : "X";

  const emptyCellIndices: number[] = [];
  cells.forEach((cell, idx) => {
    if (cell === null) emptyCellIndices.push(idx);
  });

  if (board.boardMode === "REVERSE_CAST") {
    const playable = emptyCellIndices.map(idx => {
      const r = Math.floor(idx / 3);
      const c = idx % 3;
      const actors = getSharedActors(board.rows[r].value, board.cols[c].value);
      return { idx, actors };
    }).filter(p => p.actors.length > 0);

    if (playable.length === 0) return null;

    const target = playable[Math.floor(Math.random() * playable.length)];
    const chosenActor = target.actors[Math.floor(Math.random() * target.actors.length)];
    return { cellIndex: target.idx, movie: null, actorName: chosenActor };
  }

  const shouldWin =
    difficulty === "HARD" ||
    (difficulty === "MEDIUM" && Math.random() < 0.9) ||
    (difficulty === "EASY" && Math.random() < 0.4);

  if (shouldWin) {
    for (const combo of WINNING_LINES) {
      const [a, b, c] = combo;
      const vals = [cells[a], cells[b], cells[c]];
      const botMarks = vals.filter(v => v?.answeredBy === botSymbol).length;
      const nulls = vals.filter(v => v === null).length;

      if (botMarks === 2 && nulls === 1) {
        const candidate = [a, b, c].find(idx => cells[idx] === null);
        if (candidate !== undefined) {
          const movies = getAvailableMoviesForCell(board, candidate, usedMovieIds);
          if (movies.length > 0) {
            const chosenMovie =
              difficulty === "HARD"
                ? [...movies].sort((x, y) => (y.hasOscar ? 1 : 0) - (x.hasOscar ? 1 : 0))[0]
                : movies[Math.floor(Math.random() * movies.length)];
            return { cellIndex: candidate, movie: chosenMovie };
          }
        }
      }
    }
  }

  const shouldBlock =
    difficulty === "HARD" ||
    (difficulty === "MEDIUM" && Math.random() < 0.85) ||
    (difficulty === "EASY" && Math.random() < 0.35);

  if (shouldBlock) {
    for (const combo of WINNING_LINES) {
      const [a, b, c] = combo;
      const vals = [cells[a], cells[b], cells[c]];
      const opponentMarks = vals.filter(v => v?.answeredBy === opponentSymbol).length;
      const nulls = vals.filter(v => v === null).length;

      if (opponentMarks === 2 && nulls === 1) {
        const candidate = [a, b, c].find(idx => cells[idx] === null);
        if (candidate !== undefined) {
          const movies = getAvailableMoviesForCell(board, candidate, usedMovieIds);
          if (movies.length > 0) {
            const chosenMovie =
              difficulty === "HARD"
                ? [...movies].sort((x, y) => (y.hasOscar ? 1 : 0) - (x.hasOscar ? 1 : 0))[0]
                : movies[Math.floor(Math.random() * movies.length)];
            return { cellIndex: candidate, movie: chosenMovie };
          }
        }
      }
    }
  }

  const playableCells = emptyCellIndices
    .map(idx => {
      const movies = getAvailableMoviesForCell(board, idx, usedMovieIds);
      return { idx, movies };
    })
    .filter(item => item.movies.length > 0);

  if (playableCells.length === 0) {
    return null;
  }

  let chosenTarget: { idx: number; movies: Movie[] };

  if (difficulty === "HARD") {
    const center = playableCells.find(p => p.idx === 4);
    const corners = playableCells.filter(p => [0, 2, 6, 8].includes(p.idx));

    if (center) {
      chosenTarget = center;
    } else if (corners.length > 0) {
      chosenTarget = corners[Math.floor(Math.random() * corners.length)];
    } else {
      chosenTarget = playableCells[Math.floor(Math.random() * playableCells.length)];
    }
  } else if (difficulty === "MEDIUM") {
    const center = playableCells.find(p => p.idx === 4);
    const corners = playableCells.filter(p => [0, 2, 6, 8].includes(p.idx));

    if (center && Math.random() < 0.65) {
      chosenTarget = center;
    } else if (corners.length > 0 && Math.random() < 0.65) {
      chosenTarget = corners[Math.floor(Math.random() * corners.length)];
    } else {
      chosenTarget = playableCells[Math.floor(Math.random() * playableCells.length)];
    }
  } else {
    chosenTarget = playableCells[Math.floor(Math.random() * playableCells.length)];
  }

  const chosenMovie =
    difficulty === "HARD"
      ? [...chosenTarget.movies].sort((x, y) => (y.hasOscar ? 1 : 0) - (x.hasOscar ? 1 : 0))[0]
      : chosenTarget.movies[Math.floor(Math.random() * chosenTarget.movies.length)];

  return { cellIndex: chosenTarget.idx, movie: chosenMovie };
}
