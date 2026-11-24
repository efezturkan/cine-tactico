import { createLockedNeutralCell } from "../core";
import { evaluateSoloOutcome, registerSoloFailedAttempt, nextTurnAfter, hasPlayerTriedCell } from "../core/engine/session";
import { dailyTierFor, countDailyFrames, DAILY_REWARD_REELS } from "../core/engine/dailyTier";
import { makeRng } from "./sim-helpers";
import type { CellAnswer } from "../core";

let passed = 0, failed = 0;
function assert(cond: boolean, msg: string) {
  if (cond) { passed++; console.log(`  ✓ PASS: ${msg}`); } else { failed++; console.error(`  ✗ FAIL: ${msg}`); }
}
const x = (i: number): CellAnswer =>
  ({ movie: { id: "m" + i, title: "T", year: 2000, director: "D", cast: [], genres: [], hasOscar: false }, answeredBy: "X", timestamp: 0 } as CellAnswer);

console.log("GÜNLÜK: BOŞLUĞA DÜŞME YOK (10.000 rastgele oturum)");

// Oyuncu her turda rastgele bir boş kareyi seçer; doğru ya da yanlış cevap verir ya da süre aşımına uğrar.
// Beklenen: oturum her zaman tam 9 kare sonuçlanınca biter, daha erken ya da daha geç değil.
const rng = makeRng(2026);
let neverEnded = 0, endedEarly = 0, badTurn = 0, gr = 0, tierMismatch = 0, rewardMissing = 0;
const tierCount: Record<string, number> = {};
const SKILL = [0.1, 0.4, 0.6, 0.8, 0.95, 1];
for (let s = 0; s < 10000; s++) {
  const skill = SKILL[s % SKILL.length];
  let cells: (CellAnswer | null)[] = Array(9).fill(null);
  let attempts = {};
  let turn: "X" | "O" = "X";
  let steps = 0, ended = false;
  while (steps++ < 60) {
    const open = cells.map((c, i) => (c === null ? i : -1)).filter(i => i >= 0);
    if (open.length === 0) break;
    const i = open[Math.floor(rng() * open.length)];
    if (hasPlayerTriedCell(attempts, i, "X")) { neverEnded++; break; } // kilitli olmayan, denenmiş kare kalmamalı
    if (rng() < skill) { cells = cells.map((c, k) => (k === i ? x(i) : c)); }
    else { const r = registerSoloFailedAttempt(attempts, cells, i); attempts = r.attempts; cells = r.cells; }
    turn = nextTurnAfter("DAILY_SOLO", turn);
    if (turn !== "X") badTurn++;
    const o = evaluateSoloOutcome(cells);
    const filled = cells.filter(c => c !== null).length;
    if (o.kind === "GOLDEN_REEL") gr++;
    if (o.kind === "WIN") { ended = true; if (filled !== 9) endedEarly++; break; }
  }
  if (!ended) neverEnded++;
  else {
    const frames = countDailyFrames(cells);
    const tier = dailyTierFor(frames);
    tierCount[tier] = (tierCount[tier] ?? 0) + 1;
    const o = evaluateSoloOutcome(cells) as { winner: string };
    if ((frames >= 5) !== (o.winner === "X")) tierMismatch++;
    if (!(DAILY_REWARD_REELS[tier] > 0)) rewardMissing++;
  }
}
console.log("  kademe dağılımı:", JSON.stringify(tierCount));
assert(neverEnded === 0, "10.000 oturumun hepsi biter (boşta kalan, takılan oturum yok)");
assert(endedEarly === 0, "hiçbir oturum 9 kare dolmadan bitmez");
assert(badTurn === 0, "sıra hiçbir zaman O'ya geçmez");
assert(gr === 0, "Altın Makara hiç tetiklenmez");
assert(tierMismatch === 0, "kazanan her zaman kademeyle tutarlı (5/9+ = Sahne senin)");
assert(rewardMissing === 0, "her sonuç bir ödül kademesine düşer");
assert(Object.keys(tierCount).length === 5, "beş kademenin hepsi erişilebilir");

// Süre aşımı yalnızca boş kareyi yakar: kilitli kareye tekrar süre aşımı kareyi bozmaz
let c0: (CellAnswer | null)[] = Array(9).fill(null);
const r1 = registerSoloFailedAttempt({}, c0, 3);
const r2 = registerSoloFailedAttempt(r1.attempts, r1.cells, 3);
assert(r2.cells.filter(c => c?.isLockedNeutral).length === 1, "aynı kareye ikinci kez hata, ikinci kilit üretmez");
const allLocked = Array.from({ length: 9 }, (_, i) => createLockedNeutralCell(i));
assert(evaluateSoloOutcome(allLocked).kind === "WIN", "tamamen boşta oturum bile sonuçlanır (0/9 → Bu çekim olmadı)");

console.log(`\nDAILY SOAK RESULT: ${passed}/${passed + failed} PASSED`);
if (failed > 0) process.exit(1);
