import type { CellAnswer } from "@/core";
import { tr } from "@/i18n/tr";
import { BRAND_NAME } from "@/config/brand";
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

export interface DuelShareOptions {
  cells: readonly (CellAnswer | null)[];
  winner: "X" | "O" | "DRAW" | null;
  boardTitle: string;
  opponentName?: string;
  rarityScore?: number;
  locale: "tr" | "en";
  siteUrl: string;
}

/**
 * Düello sonuç kartı ve Arşiv için spoiler içermeyen 3×3 paylaşım metni üretir.
 * Film adlarını ifşa etmez; tahta ızgarasını, rakibi ve skoru paylaşılabilir kılar.
 */
export function buildDuelSharePayload(opts: DuelShareOptions): { title: string; text: string } {
  const isEn = opts.locale === "en";
  let mine = 0;
  let theirs = 0;
  const rows: string[] = [];

  for (let r = 0; r < 3; r++) {
    const row: string[] = [];
    for (let c = 0; c < 3; c++) {
      const cell = opts.cells[r * 3 + c] ?? null;
      if (cell && !cell.isLockedNeutral && cell.answeredBy === "X") {
        mine++;
        row.push("🟨");
      } else if (cell && !cell.isLockedNeutral && cell.answeredBy === "O") {
        theirs++;
        row.push("🟦");
      } else {
        row.push("⬛");
      }
    }
    rows.push(row.join(" "));
  }

  const outcomeLabel = isEn
    ? opts.winner === "X"
      ? "Scene's yours!"
      : opts.winner === "DRAW"
      ? "Blind Frame"
      : "Not this take."
    : opts.winner === "X"
    ? "Sahne senin!"
    : opts.winner === "DRAW"
    ? "Kör kadraj"
    : "Bu çekim olmadı.";

  const header = `${BRAND_NAME} · ${opts.boardTitle}`;
  const vsPart = opts.opponentName ? ` vs ${opts.opponentName}` : "";
  const rarityPart =
    typeof opts.rarityScore === "number"
      ? isEn
        ? ` · Rarity ${opts.rarityScore}%`
        : ` · Nadirlik %${opts.rarityScore}`
      : "";
  const scoreLine = `${mine}–${theirs}${vsPart} · ${outcomeLabel}${rarityPart}`;
  const text = `${header}\n\n${rows.join("\n")}\n\n${scoreLine}\n${opts.siteUrl}`;
  return {
    title: isEn ? `${BRAND_NAME} Duel` : `${BRAND_NAME} Düellosu`,
    text,
  };
}
