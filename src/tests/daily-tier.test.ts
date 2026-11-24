import { dailyTierFor, isDailyWin, countDailyFrames, DAILY_REWARD_REELS, DAILY_TIER_MIN, DAILY_FEEDBACK, nextDailyStreak } from "../core";
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

// Geri bildirim orantılı (game-feel): kademe yükseldikçe konfeti artar, düşük kademede yok; hiçbiri yanıp sönmez
const order = ["NONE", "HALF", "WIN", "LEAD", "PERFECT"] as const;
const conf = order.map(t => DAILY_FEEDBACK[t].confettiParticles);
assert(conf.every((v, i) => i === 0 || v >= conf[i - 1]), "konfeti kademeyle azalmaz (0,0,60,100,140)");
assert(DAILY_FEEDBACK.NONE.confettiParticles === 0 && DAILY_FEEDBACK.HALF.confettiParticles === 0, "düşük kademelerde konfeti yok");
assert(DAILY_FEEDBACK.HALF.sound !== "error" && DAILY_FEEDBACK.HALF.haptic !== "error", "'Yarım çekim' hata sesi/titreşimi vermez (ödül aldığı kademe)");
assert(DAILY_FEEDBACK.NONE.sound === "error" && DAILY_FEEDBACK.PERFECT.sound === "victory", "kayıp hata sesi, kusursuz fanfar");
assert(DAILY_FEEDBACK.PERFECT.sideBursts === 2 && order.slice(0, 4).every(t => DAILY_FEEDBACK[t].sideBursts === 0), "yalnızca 9/9 yan patlamalar alır");
assert(Object.values(DAILY_FEEDBACK).every(f => f.confettiParticles + f.sideBursts * 70 <= 300), "toplam parçacık sınırlı (aşırı efekt yok)");

// Seri: art arda UTC günleri
assert(nextDailyStreak(0, undefined, "2026-11-24") === 1, "ilk gün: seri 1");
assert(nextDailyStreak(4, "2026-11-23", "2026-11-24") === 5, "dün oynandı: seri artar");
assert(nextDailyStreak(4, "2026-11-24", "2026-11-24") === 4, "aynı gün ikinci kez sayılmaz");
assert(nextDailyStreak(4, "2026-11-22", "2026-11-24") === 1, "bir gün atlandı: seri 1'e döner");
assert(nextDailyStreak(4, "2026-11-30", "2026-11-24") === 4, "cihaz saati geri alındı: seri bozulmaz, artmaz");
assert(nextDailyStreak(4, "2026-11-30", "2026-11-24") !== 1, "saat oynama seriyi sıfırlamaz ya da şişirmez");
assert(nextDailyStreak(NaN, "2026-11-23", "2026-11-24") === 1, "bozuk seri değeri güvenli");
assert(nextDailyStreak(3, "2026-12-31", "2027-01-01") === 4, "yıl sınırında da art arda sayılır");
assert(nextDailyStreak(2, "garbage", "2026-11-24") === 2, "bozuk tarih çökertmez");

console.log(`\nDAILY TIER RESULT: ${passed}/${passed + failed} PASSED`);
if (failed > 0) process.exit(1);
