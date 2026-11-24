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
  removeItem?(k: string): void;
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
  if (!Array.isArray(rec.cells) || rec.cells.length !== 9 || !rec.cells.every(isValidCell)) return null;
  return { dateKey, winner: rec.winner, cells: rec.cells };
}

/**
 * Yarıda kalan günlük: oyun başlar başlamaz bugünün hakkı tüketilir. Uygulama kapansa, yenilense ya da
 * oyuncu "terk et" dese de tahta yeniden oynanamaz; kayıtlı kareler sonuç sayılır.
 */
/** Bir kare ya boştur ya da sahibi ve filmi olan bir nesnedir (elle bozulmuş kayıt kartı çökertmesin) */
function isValidCell(c: unknown): boolean {
  if (c === null) return true;
  if (typeof c !== "object") return false;
  const cell = c as { answeredBy?: unknown; movie?: unknown };
  return (cell.answeredBy === "X" || cell.answeredBy === "O" || cell.answeredBy === "NEUTRAL") && typeof cell.movie === "object" && cell.movie !== null;
}

export const DAILY_PROGRESS_KEY = "cinexox_daily_progress_v1";

export function saveDailyProgress(storage: StorageLike, dateKey: string, cells: readonly (CellAnswer | null)[]): void {
  try {
    storage.setItem(DAILY_PROGRESS_KEY, JSON.stringify({ dateKey, cells: [...cells] }));
  } catch {
    // Depolama yoksa ilerleme tutulmaz
  }
}

export function loadDailyProgress(storage: StorageLike, dateKey: string): (CellAnswer | null)[] | null {
  try {
    const raw = storage.getItem(DAILY_PROGRESS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { dateKey?: string; cells?: unknown };
    if (!parsed || parsed.dateKey !== dateKey) return null;
    if (!Array.isArray(parsed.cells) || parsed.cells.length !== 9) return null;
    const ok = parsed.cells.every(isValidCell);
    return ok ? (parsed.cells as (CellAnswer | null)[]) : null;
  } catch {
    return null;
  }
}

export function clearDailyProgress(storage: StorageLike): void {
  try {
    if (storage.removeItem) storage.removeItem(DAILY_PROGRESS_KEY);
    else storage.setItem(DAILY_PROGRESS_KEY, "");
  } catch {
    // yok say
  }
}
