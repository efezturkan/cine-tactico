import { saveDailyProgress, loadDailyProgress, clearDailyProgress, DAILY_PROGRESS_KEY } from "../utils/dailyResult";
import { finishDailyEarly } from "../core/engine/dailyTier";
import { createLockedNeutralCell } from "../core";
import type { CellAnswer } from "../core";

let passed = 0, failed = 0;
function assert(cond: boolean, msg: string) {
  if (cond) { passed++; console.log(`  ✓ PASS: ${msg}`); } else { failed++; console.error(`  ✗ FAIL: ${msg}`); }
}
const x = (i: number): CellAnswer =>
  ({ movie: { id: "m" + i, title: "T", year: 2000, director: "D", cost: 0, cast: [], genres: [], hasOscar: false }, answeredBy: "X", timestamp: 0 } as unknown as CellAnswer);
class Mem { m: Record<string, string> = {}; getItem(k: string) { return this.m[k] ?? null; } setItem(k: string, v: string) { this.m[k] = v; } removeItem(k: string) { delete this.m[k]; } }

console.log("GÜNLÜK: YARIDA BIRAKMAK İKİNCİ ŞANS VERMEZ");

// Başlamak hakkı tüketir: boş tahta bile "başladı" kaydıdır
const s = new Mem();
saveDailyProgress(s, "2026-11-24", Array(9).fill(null));
assert(loadDailyProgress(s, "2026-11-24") !== null, "oyun başlar başlamaz ilerleme kaydı var (uygulama kapansa bile)");
assert(loadDailyProgress(s, "2026-11-25") === null, "başka günün ilerlemesi bugünü etkilemez");

// Hamleler kaydedilir
const cells: (CellAnswer | null)[] = Array(9).fill(null); cells[0] = x(0); cells[4] = createLockedNeutralCell(4);
saveDailyProgress(s, "2026-11-24", cells);
const back = loadDailyProgress(s, "2026-11-24")!;
assert(back.length === 9 && back[0]?.answeredBy === "X" && back[4]?.isLockedNeutral === true, "ilerleme hamleleriyle birlikte geri okunur");

// Yarıda bırakma kararı: mevcut kareler sayılır, açık kareler senin değildir
const e = finishDailyEarly(cells);
assert(e.frames === 1 && e.winner === "O" && e.tier === "NONE", "1 kareyle bırakan: Bu çekim olmadı");
const six = Array.from({ length: 9 }, (_, i) => (i < 6 ? x(i) : null));
const e6 = finishDailyEarly(six);
assert(e6.frames === 6 && e6.winner === "X" && e6.tier === "WIN", "6 kareyle bırakan: aldığı kareler korunur (açıklar sayılmaz)");
assert(finishDailyEarly(Array(9).fill(null)).tier === "NONE", "hiç oynamadan bırakan: 0/9");

// Temizleme ve bozuk veri
clearDailyProgress(s);
assert(loadDailyProgress(s, "2026-11-24") === null, "sonuç yazılınca ilerleme temizlenir");
s.setItem(DAILY_PROGRESS_KEY, "{bozuk");
assert(loadDailyProgress(s, "2026-11-24") === null, "bozuk kayıt çökertmez");
s.setItem(DAILY_PROGRESS_KEY, JSON.stringify({ dateKey: "2026-11-24", cells: [1, 2] }));
assert(loadDailyProgress(s, "2026-11-24") === null, "9 kare olmayan kayıt yok sayılır");
const bad = { getItem() { throw new Error("x"); }, setItem() { throw new Error("x"); }, removeItem() { throw new Error("x"); } };
let threw = false;
try { saveDailyProgress(bad, "2026-11-24", cells); loadDailyProgress(bad, "2026-11-24"); clearDailyProgress(bad); } catch { threw = true; }
assert(!threw, "depolama hata verirse oyun yine çalışır");

console.log(`\nDAILY ABANDON RESULT: ${passed}/${passed + failed} PASSED`);
if (failed > 0) process.exit(1);
