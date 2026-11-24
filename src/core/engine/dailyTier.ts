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

/**
 * Kademeye göre geri bildirim paketi (game-feel: küçük/orta/büyük kademe, orantılı).
 * Tek yerde durur; kanıt testi ve hook aynı tabloyu kullanır. Yanıp sönme yok (WCAG 2.3.1).
 * `sound`: "victory" fanfar, "select" nötr tık, "error" yumuşak olmayan düşüş sesi.
 */
export interface DailyFeedback {
  sound: "victory" | "select" | "error";
  haptic: "success" | "medium" | "error";
  confettiParticles: number;
  sideBursts: number;
}

export const DAILY_FEEDBACK: Record<DailyTier, DailyFeedback> = {
  PERFECT: { sound: "victory", haptic: "success", confettiParticles: 140, sideBursts: 2 },
  LEAD: { sound: "victory", haptic: "success", confettiParticles: 100, sideBursts: 0 },
  WIN: { sound: "victory", haptic: "success", confettiParticles: 60, sideBursts: 0 },
  HALF: { sound: "select", haptic: "medium", confettiParticles: 0, sideBursts: 0 },
  NONE: { sound: "error", haptic: "error", confettiParticles: 0, sideBursts: 0 },
};

function utcDayNumber(dateKey: string): number {
  return Math.floor(Date.parse(`${dateKey}T00:00:00Z`) / 86_400_000);
}

/**
 * Günlük seri: art arda kaç UTC günü Günlük'ü bitirdin (kademe fark etmez, ceza yok).
 * Aynı gün ikinci kez sayılmaz; cihaz saati geri alınırsa seri değişmez; bir gün atlanırsa 1'e döner.
 */
export function nextDailyStreak(prevStreak: number, lastDateKey: string | undefined, todayKey: string): number {
  const prev = Number.isFinite(prevStreak) && prevStreak > 0 ? Math.floor(prevStreak) : 0;
  if (!lastDateKey) return 1;
  const last = utcDayNumber(lastDateKey);
  const today = utcDayNumber(todayKey);
  if (!Number.isFinite(last) || !Number.isFinite(today)) return Math.max(prev, 1);
  if (today <= last) return Math.max(prev, 1);
  return today - last === 1 ? prev + 1 : 1;
}
