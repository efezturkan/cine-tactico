import type { CellAnswer, PlayerSymbol } from "@/core/types";

/**
 * Günün Kadrası tek şans: biten sonucun bugünkü kaydı.
 * Yeniden açılışta yeni maç başlatmak yerine bu kayıt gösterilir.
 */
export const DAILY_RESULT_KEY = "cinexox_daily_result_v1";

export interface StoredDailyResult {
  dateKey: string;
  winner: PlayerSymbol;
  cells: (CellAnswer | null)[];
}

interface StorageLike {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
}

export function saveDailyResult(
  storage: StorageLike,
  dateKey: string,
  winner: PlayerSymbol,
  cells: readonly (CellAnswer | null)[]
): void {
  try {
    const rec: StoredDailyResult = { dateKey, winner, cells: [...cells] };
    storage.setItem(DAILY_RESULT_KEY, JSON.stringify(rec));
  } catch {
    // Depolama yoksa kayıt tutulmaz; oyun yine çalışır
  }
}

/** Yalnızca bugünün kaydını döndürür; bozuk veya eski tarihli kayıt yok sayılır. */
export function loadDailyResult(storage: StorageLike, dateKey: string): StoredDailyResult | null {
  try {
    const raw = storage.getItem(DAILY_RESULT_KEY);
    if (!raw) return null;
    const rec = JSON.parse(raw) as StoredDailyResult;
    if (rec.dateKey !== dateKey) return null;
    if (rec.winner !== "X" && rec.winner !== "O") return null;
    if (!Array.isArray(rec.cells) || rec.cells.length !== 9) return null;
    return rec;
  } catch {
    return null;
  }
}
