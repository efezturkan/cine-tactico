import type { UserProfile } from "@/types/profile";
import { dailyTierFor, countDailyFrames, DAILY_REWARD_REELS, nextDailyStreak } from "@/core/engine/dailyTier";
import type { CellAnswer } from "@/core/types";

/**
 * Biten (ya da yarıda bırakılan) günlük sonucunun profile etkisi: tek yerde.
 * Maç sayısı, galibiyet/mağlubiyet, kademe ödülü (Makara) ve art arda gün serisi.
 */
export function applyDailyResultToProfile(
  prev: UserProfile,
  winner: "X" | "O",
  cells: readonly (CellAnswer | null)[],
  dateKey: string
): UserProfile {
  return {
    ...prev,
    totalMatches: prev.totalMatches + 1,
    wins: winner === "X" ? prev.wins + 1 : prev.wins,
    losses: winner === "O" ? prev.losses + 1 : prev.losses,
    // Makara bakiyesi MVP'de gizli (SHOW_COIN_ECONOMY); ödül sessizce biriktirilir
    reelsBalance: prev.reelsBalance + DAILY_REWARD_REELS[dailyTierFor(countDailyFrames(cells))],
    dailyStreak: nextDailyStreak(prev.dailyStreak, prev.lastStreakDateUtc, dateKey),
    lastStreakDateUtc: dateKey,
  };
}
