import { resolveFotoFinish, getBotGoldenReelPlan, GOLDEN_REEL_BOT, goldenReelAnswerer } from "../core";
import { generateSolvableBoard } from "../data/generatedBoards";
import { shuffled } from "../utils/shuffle";
import { simulateMatch, makeRng, checkInvariants, Agent } from "./sim-helpers";

let passed = 0;
let failed = 0;
function assert(cond: boolean, msg: string) {
  if (cond) { passed++; console.log(`  ✓ PASS: ${msg}`); } else { failed++; console.error(`  ✗ FAIL: ${msg}`); }
}

console.log("ALTIN MAKARA VE FOTO-FİNİŞ");

// Foto-finiş: hücre başına ortalama (X 5, O 4 hücre doldurur; toplam X'i yapısal öne geçirir)
assert(resolveFotoFinish(50, 40, 5, 4) === "O", "toplamda önde (50>40) olan X, ortalama eşitse (10=10) kazanmaz; ikinci oyuncu kazanır");
assert(resolveFotoFinish(64, 53, 5, 4) === "O", "X 64/5=12.8, O 53/4=13.25: ortalaması yüksek O kazanır");
assert(resolveFotoFinish(70, 40, 5, 4) === "X", "ortalaması açıkça yüksek X kazanır");
assert(resolveFotoFinish(40, 40, 4, 4) === "O", "tam eşitlikte ikinci oyuncu (O) kazanır");
// Eski çağrı biçimi (hücre sayısı yok) bozulmadı
assert(resolveFotoFinish(45, 30) === "X" && resolveFotoFinish(22, 40) === "O" && resolveFotoFinish(35, 35) === "X", "sayı verilmeyen eski çağrı aynı sonucu verir");

// Cevabı kim yazar
assert(goldenReelAnswerer("VS_BOT", "O") === "X", "VS_BOT: sıra botta olsa bile cevabı yazan insan (X)");
assert(goldenReelAnswerer("DAILY_SOLO", "O") === "X", "DAILY_SOLO: cevabı yazan X");
assert(goldenReelAnswerer("ONLINE_ROOM", "O") === "O", "ONLINE_ROOM: gönderen taraf");

// Bot planı
const rng = makeRng(42);
for (const d of ["EASY", "MEDIUM", "HARD"] as const) {
  let answers = 0, inRange = true;
  const N = 4000;
  for (let i = 0; i < N; i++) {
    const p = getBotGoldenReelPlan(d, rng);
    if (p.answers) answers++;
    if (p.delayMs < GOLDEN_REEL_BOT[d].minMs || p.delayMs > GOLDEN_REEL_BOT[d].maxMs || p.delayMs >= 12000) inRange = false;
  }
  assert(inRange, `${d}: bot gecikmesi tanımlı aralıkta ve 12 sn'den kısa`);
  assert(Math.abs(answers / N - GOLDEN_REEL_BOT[d].chance) < 0.03, `${d}: cevap verme oranı tanımlı olasılığa yakın`);
}
assert(
  GOLDEN_REEL_BOT.EASY.chance < GOLDEN_REEL_BOT.MEDIUM.chance && GOLDEN_REEL_BOT.MEDIUM.chance < GOLDEN_REEL_BOT.HARD.chance,
  "seviye arttıkça bot Altın Makara'yı daha sık cevaplar"
);

// Simülasyon: foto-finişte artık yapısal X avantajı yok (ölçüm referansı: öncesi ~%89-93)
const boards = Array.from({ length: 150 }, (_, i) => generateSolvableBoard(i * 7919 + 1)).filter(Boolean) as NonNullable<ReturnType<typeof generateSolvableBoard>>[];
const bot = (d: "MEDIUM" | "HARD"): Agent => ({ kind: "BOT", difficulty: d });
let ff = 0, ffX = 0, bad = 0;
for (let i = 0; i < 1500; i++) {
  const b = boards[i % boards.length];
  const r = simulateMatch(b, bot("MEDIUM"), bot("MEDIUM"), makeRng(i * 31 + 7), "X");
  if (checkInvariants(b, r).length > 0) bad++;
  if (r.decidedBy === "FOTO_FINISH") { ff++; if (r.winner === "X") ffX++; }
}
console.log(`  foto-finiş: ${ff} maç, X ${(ffX / Math.max(1, ff) * 100).toFixed(0)}%`);
assert(ff >= 30, "örneklem yeterli (en az 30 foto-finiş)");
assert(ffX / ff > 0.35 && ffX / ff < 0.65, "foto-finişte X oranı %35-65 bandında");
assert(bad === 0, "1500 simüle maçta kural ihlali yok");

// Karıştırma: elemanları korur, girdiyi bozmaz, ilk eleman yaklaşık eşit dağılır
const src = [1, 2, 3, 4];
const first: Record<number, number> = {};
for (let i = 0; i < 8000; i++) { const f = shuffled(src, rng)[0]; first[f] = (first[f] || 0) + 1; }
assert(shuffled(src).sort().join() === "1,2,3,4" && src.join() === "1,2,3,4", "shuffled elemanları korur, girdiyi değiştirmez");
assert(Object.values(first).every(c => c > 1700 && c < 2300), "shuffled ilk eleman dağılımı düzgün (~%25)");

console.log(`\nGOLDEN REEL RESULT: ${passed}/${passed + failed} PASSED`);
if (failed > 0) process.exit(1);
