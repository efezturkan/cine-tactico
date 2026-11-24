import type { CellAnswer } from "../types";

/**
 * GÜNLÜK KADRAJ KADEMELERİ (kelime oyunu mantığı: kaç kareyi doldurdun?).
 * Wordle benzeri oyunlar cezalandırmaz, derecelendirir; en düşük kademe de küçük bir katılım ödülü verir.
 * Ödül yalnızca kozmetik para birimidir (Makara), rekabet avantajı vermez (anayasa madde 5).
 */
export type DailyTier = "PERFECT" | "LEAD" | "WIN" | "HALF" | "NONE";

/** Kademeye girmek için gereken en az kare (9 üzerinden). "WIN" = çoğunluk. */
export const DAILY_TIER_MIN: Record<Exclude<DailyTier, "NONE">, number> = {
  PERFECT: 9,
  LEAD: 7,
  WIN: 5,
  HALF: 3,
};

export const DAILY_REWARD_REELS: Record<DailyTier, number> = {
  PERFECT: 50,
  LEAD: 30,
  WIN: 20,
  HALF: 10,
  NONE: 5,
};

/** Oyuncunun (X) gerçekten kazandığı kare sayısı; kilitli (sahipsiz) kareler sayılmaz. */
export function countDailyFrames(cells: readonly (CellAnswer | null)[]): number {
  return cells.filter(c => c && !c.isLockedNeutral && c.answeredBy === "X").length;
}

export function dailyTierFor(frames: number): DailyTier {
  if (frames >= DAILY_TIER_MIN.PERFECT) return "PERFECT";
  if (frames >= DAILY_TIER_MIN.LEAD) return "LEAD";
  if (frames >= DAILY_TIER_MIN.WIN) return "WIN";
  if (frames >= DAILY_TIER_MIN.HALF) return "HALF";
  return "NONE";
}

/** Çoğunluğu (5/9+) alan "Sahne senin" der; gerisi "Bu çekim olmadı". */
export function isDailyWin(frames: number): boolean {
  return frames >= DAILY_TIER_MIN.WIN;
}
