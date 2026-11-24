import type { CellAnswer } from "@/core";
import { tr } from "@/i18n/tr";
import { countDailyFrames, dailyTierFor, DAILY_REWARD_REELS, type DailyTier } from "@/core/engine/dailyTier";

export type DailyCardText = typeof tr.dailyCard;
const fill = (s: string, n: number) => s.replace("{n}", String(n));

export interface DailyShareSummary {
  /** Oyuncunun (X) kazandığı kare sayısı. Botun ve kilitli kareler sayılmaz. */
  mine: number;
  theirs: number;
  locked: number;
  /** 3 satırlık emoji ızgarası: 🟨 senin, 🟦 rakibin, ⬛ boş ya da sahipsiz */
  emojiGrid: string;
  headline: string;
  subline: string;
  /** Paylaşım metnindeki sonuç satırı */
  resultLine: string;
  won: boolean;
  /** Kare sayısına göre kademe; kazanan bilinmiyorsa null */
  tier: DailyTier | null;
  /** Kademenin Makara ödülü; kademe yoksa 0 */
  rewardReels: number;
}

/**
 * Günün Kadrası sonucunu KİMİN kazandığına göre özetler.
 * Eskiden "9 kare dolu = Tam kadraj" sayılıyordu; botun kareleri de oyuncunun sayılıyor ve
 * Altın Makara'ya düşen herhangi bir maç "kusursuz" ilan ediliyordu.
 */
export function summarizeDailyShare(
  cells: readonly (CellAnswer | null)[],
  winner?: "X" | "O" | "DRAW" | null,
  text: DailyCardText = tr.dailyCard
): DailyShareSummary {
  let mine = 0, theirs = 0, locked = 0;
  let grid = "";
  for (let r = 0; r < 3; r++) {
    const row: string[] = [];
    for (let c = 0; c < 3; c++) {
      const cell = cells[r * 3 + c] ?? null;
      if (cell && !cell.isLockedNeutral && cell.answeredBy === "X") { mine++; row.push("🟨"); }
      else if (cell && !cell.isLockedNeutral && cell.answeredBy === "O") { theirs++; row.push("🟦"); }
      else { if (cell) locked++; row.push("⬛"); }
    }
    grid += row.join(" ") + "\n";
  }
  const won = winner === "X";
  const decided = winner === "X" || winner === "O";
  const tier = decided ? dailyTierFor(countDailyFrames(cells)) : null;
  const TIER_TEXT: Record<DailyTier, string> = {
    PERFECT: text.tierPerfect,
    LEAD: text.tierLead,
    WIN: text.tierWin,
    HALF: text.tierHalf,
    NONE: text.tierNone,
  };
  const headline = tier ? TIER_TEXT[tier] : fill(text.headlineCount, mine);
  const subline = fill(text.sub, mine);
  const resultLine = fill(text.resultLine, mine) + (tier ? ` · ${headline}` : "");
  const rewardReels = tier ? DAILY_REWARD_REELS[tier] : 0;
  return { mine, theirs, locked, emojiGrid: grid, headline, subline, resultLine, won, tier, rewardReels };
}
