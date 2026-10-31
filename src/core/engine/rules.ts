import { CellAnswer, PlayerSymbol } from "../types";

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
      cellA.answeredBy !== "NEUTRAL" &&
      cellA.answeredBy === cellB.answeredBy &&
      cellB.answeredBy === cellC.answeredBy
    ) {
      return { winner: cellA.answeredBy as PlayerSymbol, line: combo };
    }
  }

  const isFull = cells.every(cell => cell !== null);
  if (isFull) {
    return { winner: "DRAW", line: null };
  }

  return { winner: null, line: null };
}

/**
 * TERS KADRAJ (ORTAK OYUNCU) KAZANMA KOŞULU:
 * 3'lü hat aranmaz. 9 hücre sonuçlandığında en çok hücreyi kazanan kazanır.
 * Eşitlikte toplam Rarity puanı karşılaştırılır.
 */
export function evaluateReverseBoardState(
  cells: readonly (CellAnswer | null)[],
  totalRarityX: number = 0,
  totalRarityO: number = 0
): WinCheckResult {
  const isFull = cells.every(cell => cell !== null);
  if (!isFull) {
    return { winner: null, line: null };
  }

  let countX = 0;
  let countO = 0;

  for (const c of cells) {
    if (c?.answeredBy === "X") countX++;
    if (c?.answeredBy === "O") countO++;
  }

  if (countX > countO) return { winner: "X", line: null };
  if (countO > countX) return { winner: "O", line: null };

  if (totalRarityX > totalRarityO) return { winner: "X", line: null };
  if (totalRarityO > totalRarityX) return { winner: "O", line: null };

  // Foto-finiş mutlak kuralı: 0% beraberlik (ilk hamle sahibi / X kazanır)
  return { winner: "X", line: null };
}
