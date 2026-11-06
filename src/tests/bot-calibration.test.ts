import { PRESET_BOARDS, createRandomizedBoard, BOT_OPPONENTS, getBotSkillForProfile } from "../data/boards";
import { calculateBotMove, BOT_SKILLS } from "../core";
import { simulateMatch, makeRng, Agent } from "./sim-helpers";

let passed = 0;
let failed = 0;
function assert(cond: boolean, msg: string) {
  if (cond) { passed++; console.log(`  ✓ PASS: ${msg}`); } else { failed++; console.error(`  ✗ FAIL: ${msg}`); }
}

console.log("BOT KALİBRASYONU: seviyeler gerçekten birbirinden güçlü mü?");

const film = PRESET_BOARDS.filter(b => b.boardMode !== "REVERSE_CAST");
const reverse = PRESET_BOARDS.filter(b => b.boardMode === "REVERSE_CAST");
const bot = (difficulty: "EASY" | "MEDIUM" | "HARD"): Agent => ({ kind: "BOT", difficulty });

/** a ajanının b'ye karşı galibiyet oranı; başlama avantajı iki tarafa eşit dağıtılır. */
function winRate(a: Agent, b: Agent, pool: typeof film, n: number): number {
  let wins = 0;
  for (let i = 0; i < n; i++) {
    const board = createRandomizedBoard(pool[i % pool.length]);
    const aFirst = i % 2 === 0;
    const r = simulateMatch(board, aFirst ? a : b, aFirst ? b : a, makeRng(i * 13 + 5), "X");
    if (r.winner === (aFirst ? "X" : "O")) wins++;
  }
  return wins / n;
}

const N = 400;
for (const [label, pool] of [["film", film], ["ters kadraj", reverse]] as const) {
  const me = winRate(bot("MEDIUM"), bot("EASY"), pool, N);
  const hm = winRate(bot("HARD"), bot("MEDIUM"), pool, N);
  const he = winRate(bot("HARD"), bot("EASY"), pool, N);
  const ee = winRate(bot("EASY"), bot("EASY"), pool, N);
  console.log(`  [${label}] Orta>Kolay ${(me * 100).toFixed(0)}% · Zor>Orta ${(hm * 100).toFixed(0)}% · Zor>Kolay ${(he * 100).toFixed(0)}% · Kolay=Kolay ${(ee * 100).toFixed(0)}%`);
  assert(me >= 0.65, `${label}: Orta bot Kolay botu belirgin yeniyor (≥%65)`);
  assert(hm >= 0.65, `${label}: Zor bot Orta botu belirgin yeniyor (≥%65)`);
  assert(he >= 0.85, `${label}: Zor bot Kolay botu ezer (≥%85)`);
  assert(ee > 0.38 && ee < 0.62, `${label}: eşit botlar arasında taraf/başlangıç ayrımı yok (%${(ee * 100).toFixed(0)})`);
}

// Rating basamakları: kolay < orta < zor ve ölçülen güç farkını yansıtır
const byTier = (t: string) => BOT_OPPONENTS.filter(b => b.difficulty === t).map(b => b.rating);
assert(Math.max(...byTier("EASY")) < Math.min(...byTier("MEDIUM")), "her Orta botun ratingi her Kolay botunkinden yüksek");
assert(Math.max(...byTier("MEDIUM")) < Math.min(...byTier("HARD")), "her Zor botun ratingi her Orta botunkinden yüksek");
const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
const gapEM = mean(byTier("MEDIUM")) - mean(byTier("EASY"));
const gapMH = mean(byTier("HARD")) - mean(byTier("MEDIUM"));
// Elo farkı: 400·log10(p/(1-p)); %75 galibiyet ≈ +190, %82 ≈ +260
assert(gapEM >= 150 && gapEM <= 400, `Kolay→Orta rating farkı ölçülen güçle uyumlu (+${gapEM.toFixed(0)})`);
assert(gapMH >= 150 && gapMH <= 400, `Orta→Zor rating farkı ölçülen güçle uyumlu (+${gapMH.toFixed(0)})`);

// Bilgi modeli: kolay bot sık ıskalar, zor bot nadiren
function missRate(d: "EASY" | "MEDIUM" | "HARD"): number {
  let miss = 0, total = 0;
  const rng = makeRng(7);
  for (const board of film) {
    for (let k = 0; k < 20; k++) {
      const dec = calculateBotMove(board, Array(9).fill(null), [], d, "O", {}, undefined, rng);
      if (dec) { total++; if (dec.miss) miss++; }
    }
  }
  return miss / total;
}
const mr = { EASY: missRate("EASY"), MEDIUM: missRate("MEDIUM"), HARD: missRate("HARD") };
console.log(`  ıskalama oranı: Kolay %${(mr.EASY * 100).toFixed(0)} · Orta %${(mr.MEDIUM * 100).toFixed(0)} · Zor %${(mr.HARD * 100).toFixed(0)}`);
assert(mr.EASY > mr.MEDIUM && mr.MEDIUM > mr.HARD, "bilgi derinliği: Kolay > Orta > Zor ıskalama");
assert(mr.EASY >= 0.08, "Kolay bot gerçekten ıskalar (boş tahtada en az %8; film azaldıkça artar)");
assert(mr.HARD <= 0.2, "Zor bot nadiren ıskalar (en çok %20)");

// Oyun stilleri beceri parametrelerini hissedilir kaydırır ama seviyeyi bozmaz
for (const b of BOT_OPPONENTS) {
  const s = getBotSkillForProfile(b);
  const base = BOT_SKILLS[b.difficulty];
  assert(Object.values(s).every(v => v >= 0 && v <= 1), `${b.name}: beceri değerleri 0-1 aralığında`);
  assert(Math.abs(s.attack - base.attack) <= 0.15 && Math.abs(s.defend - base.defend) <= 0.15, `${b.name}: stil seviyeyi %15'ten fazla kaydırmaz`);
  assert(!!b.quote.tr && !!b.quote.en && b.rating > 0, `${b.name}: replik (TR/EN) ve rating dolu`);
}
assert(new Set(BOT_OPPONENTS.map(b => b.name)).size === BOT_OPPONENTS.length, "bot isimleri benzersiz (kayıt defteri isimle tutulur)");

console.log(`\nBOT CALIBRATION RESULT: ${passed}/${passed + failed} PASSED`);
if (failed > 0) process.exit(1);
