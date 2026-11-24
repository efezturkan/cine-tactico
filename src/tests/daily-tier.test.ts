import { dailyTierFor, isDailyWin, countDailyFrames, DAILY_REWARD_REELS, DAILY_TIER_MIN } from "../core";
import { evaluateSoloOutcome } from "../core/engine/session";
import { createLockedNeutralCell } from "../core";
import type { CellAnswer } from "../core";

let passed = 0, failed = 0;
function assert(cond: boolean, msg: string) {
  if (cond) { passed++; console.log(`  ✓ PASS: ${msg}`); } else { failed++; console.error(`  ✗ FAIL: ${msg}`); }
}
const x = (i: number): CellAnswer =>
  ({ movie: { id: "m" + i, title: "T", year: 2000, director: "D", cast: [], genres: [], hasOscar: false }, answeredBy: "X", timestamp: 0 } as CellAnswer);
const board = (n: number): (CellAnswer | null)[] => Array.from({ length: 9 }, (_, i) => (i < n ? x(i) : createLockedNeutralCell(i)));

console.log("GÜNLÜK KADEMELERİ (n/9)");
const expected: Record<number, string> = { 0: "NONE", 1: "NONE", 2: "NONE", 3: "HALF", 4: "HALF", 5: "WIN", 6: "WIN", 7: "LEAD", 8: "LEAD", 9: "PERFECT" };
for (let n = 0; n <= 9; n++) assert(dailyTierFor(n) === expected[n], `${n}/9 → ${expected[n]}`);

assert(isDailyWin(5) && !isDailyWin(4), "çoğunluk (5/9) kazandırır, 4/9 kazandırmaz");
assert(DAILY_TIER_MIN.WIN === 5, "çoğunluk eşiği 5");
const r = DAILY_REWARD_REELS;
assert(r.PERFECT > r.LEAD && r.LEAD > r.WIN && r.WIN > r.HALF && r.HALF > r.NONE && r.NONE > 0, "ödül kademeyle artar, en düşük kademe de küçük ödül alır");
assert(countDailyFrames(board(6)) === 6, "yalnızca oyuncunun kareleri sayılır (kilitli kareler sayılmaz)");

// Sonuç kararı kademeyle tutarlı
for (let n = 0; n <= 9; n++) {
  const o = evaluateSoloOutcome(board(n));
  assert(o.kind === "WIN" && o.winner === (n >= 5 ? "X" : "O"), `${n}/9 bitince ${n >= 5 ? "Sahne senin (X)" : "Bu çekim olmadı (O)"}`);
}
// Hat olmadan da çoğunluk kazandırır; hat zorunlu değil
const noLine = Array.from({ length: 9 }, (_, i) => ([0, 1, 5, 6, 8].includes(i) ? x(i) : createLockedNeutralCell(i)));
assert((evaluateSoloOutcome(noLine) as { winner: string }).winner === "X", "hat olmasa da 5/9 kazandırır");

console.log(`\nDAILY TIER RESULT: ${passed}/${passed + failed} PASSED`);
if (failed > 0) process.exit(1);
