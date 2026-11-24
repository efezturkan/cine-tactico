import type { CellAnswer } from "@/core";
import { tr } from "@/i18n/tr";

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
  const lost = winner === "O";
  const headline = won ? text.headlineWon : lost ? text.headlineLost : fill(text.headlineCount, mine);
  const subline = won ? text.sublineWon : text.sublineDone;
  const resultLine = fill(text.resultLine, mine) + (won ? text.resultWon : "");
  return { mine, theirs, locked, emojiGrid: grid, headline, subline, resultLine, won };
}
