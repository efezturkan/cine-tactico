import { CellAnswer, GameBoard, PlayerSymbol } from "../types";
import { evaluateBoardState, evaluateReverseBoardState, createLockedNeutralCell, isCellDeadlocked } from "./rules";

/** Bir hamleden sonra maçın ne durumda olduğu. Hook, bot ve testler aynı kararı kullanır. */
export type BoardOutcome =
  | { kind: "CONTINUE" }
  | { kind: "WIN"; winner: PlayerSymbol; line: [number, number, number] | null }
  | { kind: "GOLDEN_REEL" };

export type AttemptsPerCell = Record<number, { X: boolean; O: boolean }>;

/**
 * Tahtanın mevcut durumunu tek yerden karara bağlar (Spec v3):
 * - Ters Kadraj: 9 hücre dolunca en çok hücre, eşitlikte rarity. Altın Makara yok.
 * - Klasik / Konsept: 3'lü hat anında kazandırır; 9 hücre sonuçlanıp hat yoksa Altın Makara.
 */
export function evaluateOutcome(
  boardMode: GameBoard["boardMode"],
  cells: readonly (CellAnswer | null)[],
  rarityX: number,
  rarityO: number
): BoardOutcome {
  if (boardMode === "REVERSE_CAST") {
    const r = evaluateReverseBoardState(cells, rarityX, rarityO);
    if (r.winner === "X" || r.winner === "O") return { kind: "WIN", winner: r.winner, line: null };
    return { kind: "CONTINUE" };
  }
  const r = evaluateBoardState(cells, true);
  if (r.winner === "X" || r.winner === "O") return { kind: "WIN", winner: r.winner, line: r.line };
  if (r.winner === "GOLDEN_REEL" || r.winner === "DRAW") return { kind: "GOLDEN_REEL" };
  return { kind: "CONTINUE" };
}

export interface FailedAttemptResult {
  attempts: AttemptsPerCell;
  cells: (CellAnswer | null)[];
  /** İki taraf da bu hücrede başarısız olduysa hücre kilitlendi */
  locked: boolean;
}

/**
 * Yanlış cevap veya süre aşımı: oyuncunun o hücredeki deneme hakkı biter.
 * İki taraf da tükettiyse hücre sahipsiz kilitlenir (deadlock emniyeti).
 * Saf fonksiyon: girdileri değiştirmez.
 */
export function registerFailedAttempt(
  attempts: AttemptsPerCell,
  cells: readonly (CellAnswer | null)[],
  cellIndex: number,
  player: PlayerSymbol
): FailedAttemptResult {
  const current = attempts[cellIndex] ?? { X: false, O: false };
  const updated = { ...current, [player]: true };
  const nextAttempts: AttemptsPerCell = { ...attempts, [cellIndex]: updated };
  const nextCells = [...cells];

  const shouldLock = isCellDeadlocked(updated) && nextCells[cellIndex] === null;
  if (shouldLock) nextCells[cellIndex] = createLockedNeutralCell(cellIndex);

  return { attempts: nextAttempts, cells: nextCells, locked: shouldLock };
}

/** Oyuncu bu hücrede zaten denedi mi? (Her oyuncu hücre başına tek hak) */
export function hasPlayerTriedCell(attempts: AttemptsPerCell, cellIndex: number, player: PlayerSymbol): boolean {
  return Boolean(attempts[cellIndex]?.[player]);
}
