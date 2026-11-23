import { saveDailyResult, loadDailyResult, DAILY_RESULT_KEY } from "../utils/dailyResult";
import { createLockedNeutralCell } from "../core";

let passed = 0, failed = 0;
function assert(c: boolean, m: string) { if (c) { passed++; console.log(`  ✓ PASS: ${m}`); } else { failed++; console.error(`  ✗ FAIL: ${m}`); } }

console.log("GÜNÜN KADRASI TEK ŞANS KAYDI");
const mem = () => { const d: Record<string, string> = {}; return { getItem: (k: string) => d[k] ?? null, setItem: (k: string, v: string) => { d[k] = v; }, d }; };
const cells = Array.from({ length: 9 }, (_, i) => createLockedNeutralCell(i));

const s = mem();
assert(loadDailyResult(s, "2026-11-23") === null, "kayıt yokken bugün oynanmamış sayılır");
saveDailyResult(s, "2026-11-23", "O", cells);
const r = loadDailyResult(s, "2026-11-23");
assert(!!r && r.winner === "O" && r.cells.length === 9, "aynı gün kayıt geri okunur (tek şans)");
assert(loadDailyResult(s, "2026-11-24") === null, "ertesi gün kayıt geçersiz, yeni kadraj oynanabilir");
s.d[DAILY_RESULT_KEY] = "{bozuk json";
assert(loadDailyResult(s, "2026-11-23") === null, "bozuk kayıt çökertmez, yok sayılır");
s.d[DAILY_RESULT_KEY] = JSON.stringify({ dateKey: "2026-11-23", winner: "DRAW", cells });
assert(loadDailyResult(s, "2026-11-23") === null, "geçersiz kazanan değeri reddedilir");
const broken = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };
saveDailyResult(broken, "2026-11-23", "X", cells);
assert(loadDailyResult(broken, "2026-11-23") === null, "depolama kapalıyken çökmez");

console.log(`\nDAILY RESULT: ${passed}/${passed + failed} PASSED`);
if (failed > 0) process.exit(1);
