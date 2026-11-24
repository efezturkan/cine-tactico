import { applyDailyResultToProfile } from "../utils/dailyProfile";
import type { CellAnswer } from "../core";
import type { UserProfile } from "../types/profile";

let passed = 0, failed = 0;
function assert(cond: boolean, msg: string) {
  if (cond) { passed++; console.log(`  ✓ PASS: ${msg}`); } else { failed++; console.error(`  ✗ FAIL: ${msg}`); }
}
const x = (i: number): CellAnswer => ({ movie: { id: "m" + i }, answeredBy: "X", timestamp: 0 } as unknown as CellAnswer);
const base = { totalMatches: 2, wins: 1, losses: 1, reelsBalance: 100, dailyStreak: 3, lastStreakDateUtc: "2026-11-23" } as UserProfile;
console.log("GÜNLÜK SONUCUNUN PROFİLE ETKİSİ");
const win = applyDailyResultToProfile(base, "X", Array.from({ length: 9 }, (_, i) => x(i)), "2026-11-24");
assert(win.totalMatches === 3 && win.wins === 2 && win.losses === 1 && win.reelsBalance === 150, "9/9: galibiyet, +50 Makara");
assert(win.dailyStreak === 4 && win.lastStreakDateUtc === "2026-11-24", "dün oynandıysa seri artar");
const loss = applyDailyResultToProfile(base, "O", Array(9).fill(null), "2026-11-24");
assert(loss.losses === 2 && loss.wins === 1 && loss.reelsBalance === 105, "0/9: mağlubiyet, +5 Makara");
assert(applyDailyResultToProfile(base, "O", Array(9).fill(null), "2026-11-26").dailyStreak === 1, "gün atlanınca seri 1");
assert(base.totalMatches === 2 && base.reelsBalance === 100, "girdi profil değiştirilmez");
console.log(`\nDAILY PROFILE RESULT: ${passed}/${passed + failed} PASSED`);
if (failed > 0) process.exit(1);
