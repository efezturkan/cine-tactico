import { createLockedNeutralCell } from "../core";
import { evaluateSoloOutcome, registerSoloFailedAttempt, isSoloMode, nextTurnAfter } from "../core/engine/session";
import type { CellAnswer } from "../core";

let passed = 0, failed = 0;
function assert(cond: boolean, msg: string) {
  if (cond) { passed++; console.log(`  ✓ PASS: ${msg}`); } else { failed++; console.error(`  ✗ FAIL: ${msg}`); }
}
const x = (i: number): CellAnswer =>
  ({ movie: { id: "m" + i, title: "T", year: 2000, director: "D", cast: [], genres: [], hasOscar: false }, answeredBy: "X", timestamp: 0, pointsEarned: 0, rarityScore: 0 } as CellAnswer);
const empty = (): (CellAnswer | null)[] => Array(9).fill(null);

console.log("GÜNLÜK: YALNIZCA X (O TURU YOK)");

assert(isSoloMode("DAILY_SOLO") && !isSoloMode("VS_BOT") && !isSoloMode("ONLINE_ROOM"), "yalnızca DAILY_SOLO tek-X modudur");
assert(nextTurnAfter("DAILY_SOLO", "X") === "X", "Günlük'te sıra hiçbir zaman O'ya geçmez");
assert(nextTurnAfter("VS_BOT", "X") === "O" && nextTurnAfter("VS_BOT", "O") === "X" && nextTurnAfter("ONLINE_ROOM", "X") === "O", "diğer modlar sırayla oynar (değişmedi)");

// Yanlış cevap: rakip olmadığı için kare hemen kilitlenir (iki hak beklenmez)
const f = registerSoloFailedAttempt({}, empty(), 4);
assert(f.locked && f.cells[4]?.isLockedNeutral === true, "yanlış cevap kareyi hemen kilitler");
assert(f.cells.filter(c => c !== null).length === 1, "yalnızca o kare etkilenir");
const again = registerSoloFailedAttempt(f.attempts, f.cells, 4);
assert(!again.locked && again.cells[4]?.isLockedNeutral === true, "dolu kare ikinci kez kilitlenmez ya da bozulmaz");

// Kelime oyunu mantığı: 9 kare de oynanır. Hat kurmak oyunu ERKEN bitirmez.
const line = empty(); line[0] = x(0); line[1] = x(1); line[2] = x(2);
assert(evaluateSoloOutcome(line).kind === "CONTINUE", "üçlü hat kurulsa da kalan kareler oynanır (oyun erken bitmez)");
const mid = empty(); mid[0] = x(0); mid[4] = createLockedNeutralCell(4);
assert(evaluateSoloOutcome(mid).kind === "CONTINUE", "tahta dolmadan oyun sürer");

// Bitiş: 9 kare sonuçlanınca. Çoğunluk (5/9+) Sahne senin, yoksa Bu çekim olmadı. Altın Makara yok.
const fullLine = Array.from({ length: 9 }, (_, i) => ([0, 1, 2, 5, 8].includes(i) ? x(i) : createLockedNeutralCell(i)));
const won = evaluateSoloOutcome(fullLine);
assert(won.kind === "WIN" && won.winner === "X" && won.line?.join() === "0,1,2", "9 kare bitti, çoğunluk (5/9) ve hat var: Sahne senin (X), hat süs olarak döner");
const noLine = Array.from({ length: 9 }, (_, i) => ([0, 1, 5, 6].includes(i) ? x(i) : createLockedNeutralCell(i)));
const lost = evaluateSoloOutcome(noLine);
assert(lost.kind === "WIN" && lost.winner === "O" && lost.line === null, "9 kare bitti, çoğunluk yok (4/9): Bu çekim olmadı");
const idle = Array.from({ length: 9 }, (_, i) => createLockedNeutralCell(i));
const idleOut = evaluateSoloOutcome(idle);
assert(idleOut.kind === "WIN" && idleOut.winner === "O", "tamamen boşta kalan oyuncu kazanmaz");
const perfect = Array.from({ length: 9 }, (_, i) => x(i));
assert(evaluateSoloOutcome(perfect).kind === "WIN" && (evaluateSoloOutcome(perfect) as { winner: string }).winner === "X", "9/9: Sahne senin");
for (const cells of [line, mid, fullLine, noLine, idle, perfect]) {
  assert(evaluateSoloOutcome(cells).kind !== "GOLDEN_REEL", "Günlük sonucu asla Altın Makara değildir");
}

console.log(`\nDAILY SOLO RESULT: ${passed}/${passed + failed} PASSED`);
if (failed > 0) process.exit(1);
