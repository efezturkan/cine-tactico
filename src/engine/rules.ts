import { CellAnswer, PlayerSymbol } from "@/types/game";

export const WINNING_LINES: readonly [number, number, number][] = [
  // Rows
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  // Columns
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  // Diagonals
  [0, 4, 8],
  [2, 4, 6],
];

export interface WinCheckResult {
  winner: PlayerSymbol | "DRAW" | null;
  line: [number, number, number] | null;
}

export function evaluateBoardState(cells: readonly (CellAnswer | null)[]): WinCheckResult {
  for (const combo of WINNING_LINES) {
    const [a, b, c] = combo;
    const cellA = cells[a];
    const cellB = cells[b];
    const cellC = cells[c];

    if (
      cellA &&
      cellB &&
      cellC &&
      cellA.answeredBy === cellB.answeredBy &&
      cellB.answeredBy === cellC.answeredBy
    ) {
      return { winner: cellA.answeredBy, line: combo };
    }
  }

  const isFull = cells.every(cell => cell !== null);
  if (isFull) {
    return { winner: "DRAW", line: null };
  }

  return { winner: null, line: null };
}
