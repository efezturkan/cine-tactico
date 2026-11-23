import type { CellAnswer, PlayerSymbol } from "@/core/types";

/**
 * Günün Kadrası tek şans: biten sonucun bugünkü kaydı.
 * Yeniden açılışta yeni maç başlatmak yerine bu kayıt gösterilir.
 */
export const DAILY_RESULT_KEY = "cinexox_daily_result_v2";
const MAX_DAYS = 14;

export interface StoredDailyResult {
  dateKey: string;
  winner: PlayerSymbol;
  cells: (CellAnswer | null)[];
}

interface StorageLike {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
}

type DayMap = Record<string, { winner: PlayerSymbol; cells: (CellAnswer | null)[] }>;

function readDays(storage: StorageLike): DayMap {
  try {
    const raw = storage.getItem(DAILY_RESULT_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as { days?: DayMap };
    return parsed && typeof parsed.days === "object" && parsed.days ? parsed.days : {};
  } catch {
    return {};
  }
}

/**
 * Günler ayrı ayrı tutulur: cihaz saati ileri alınıp geri dönülürse bugünün kaydı silinmez.
 * Son 14 gün saklanır.
 */
export function saveDailyResult(
  storage: StorageLike,
  dateKey: string,
  winner: PlayerSymbol,
  cells: readonly (CellAnswer | null)[]
): void {
  try {
    const days = readDays(storage);
    days[dateKey] = { winner, cells: [...cells] };
    const keep = Object.keys(days).sort().slice(-MAX_DAYS);
    const pruned: DayMap = {};
    for (const k of keep) pruned[k] = days[k];
    storage.setItem(DAILY_RESULT_KEY, JSON.stringify({ days: pruned }));
  } catch {
    // Depolama yoksa kayıt tutulmaz; oyun yine çalışır
  }
}

/** Yalnızca verilen günün kaydını döndürür; bozuk kayıt yok sayılır. */
export function loadDailyResult(storage: StorageLike, dateKey: string): StoredDailyResult | null {
  const rec = readDays(storage)[dateKey];
  if (!rec) return null;
  if (rec.winner !== "X" && rec.winner !== "O") return null;
  if (!Array.isArray(rec.cells) || rec.cells.length !== 9) return null;
  return { dateKey, winner: rec.winner, cells: rec.cells };
}
