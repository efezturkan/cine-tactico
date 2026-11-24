import { CellAnswer, GameBoard, PlayerSymbol } from "../types";
import { countDailyFrames, isDailyWin } from "./dailyTier";
import { evaluateBoardState, evaluateReverseBoardState, createLockedNeutralCell, isCellDeadlocked, WINNING_LINES } from "./rules";

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

/**
 * Altın Makara cevabı kimin adına yazılır? Tek oyunculu modlarda cevabı yazan her zaman insandır (X);
 * `currentTurn` son hamleyi yapana bağlı olduğundan botun adına yazılmamalı. Çevrimiçide gönderen taraf.
 */
export function goldenReelAnswerer(mode: string, submitted: PlayerSymbol): PlayerSymbol {
  return mode === "ONLINE_ROOM" ? submitted : "X";
}

/**
 * GÜNLÜK KADRAJ (kelime oyunu mantığı): rakip yok, oyuncu yalnızca X'tir ve 9 kareyi de oynar.
 * Kare başına tek hak: yanlış cevap ya da süre aşımı kareyi hemen kilitler.
 */
export function isSoloMode(mode: string): boolean {
  return mode === "DAILY_SOLO";
}

/** Sırayı kim alır? Günlük'te hep X; diğer modlarda sırayla. */
export function nextTurnAfter(mode: string, current: PlayerSymbol): PlayerSymbol {
  if (isSoloMode(mode)) return "X";
  return current === "X" ? "O" : "X";
}

/** Tek oyunculu modda yanlış cevap: rakip olmadığı için kare iki hak beklenmeden kilitlenir. */
export function registerSoloFailedAttempt(
  attempts: AttemptsPerCell,
  cells: readonly (CellAnswer | null)[],
  cellIndex: number
): FailedAttemptResult {
  const nextCells = [...cells];
  const shouldLock = nextCells[cellIndex] === null;
  if (shouldLock) nextCells[cellIndex] = createLockedNeutralCell(cellIndex);
  return {
    attempts: { ...attempts, [cellIndex]: { X: true, O: true } },
    cells: nextCells,
    locked: shouldLock,
  };
}

/**
 * Günlük sonucu: 9 kare sonuçlanana kadar sürer (hat kurmak oyunu bitirmez).
 * Bitince karelerin çoğunluğu (5/9+) senindeyse "Sahne senin" (X), değilse "Bu çekim olmadı" (O).
 * Kademe (kusursuz, başrol...) ve ödül `dailyTier.ts` içinde kare sayısından hesaplanır. Altın Makara yoktur.
 * `line`, varsa süs olarak üçlü hattı verir; kararı etkilemez.
 */
export function evaluateSoloOutcome(cells: readonly (CellAnswer | null)[]): BoardOutcome {
  if (!cells.every(c => c !== null)) return { kind: "CONTINUE" };
  const winner = isDailyWin(countDailyFrames(cells)) ? "X" : "O";
  let line: [number, number, number] | null = null;
  if (winner === "X") {
    const mine = (c: CellAnswer | null) => Boolean(c && !c.isLockedNeutral && c.answeredBy === "X");
    line = WINNING_LINES.find(combo => combo.every(i => mine(cells[i]))) ?? null;
  }
  return { kind: "WIN", winner, line };
}
