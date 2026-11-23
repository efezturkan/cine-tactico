import { saveDailyResult, loadDailyResult, DAILY_RESULT_KEY } from "../utils/dailyResult";
import { createLockedNeutralCell } from "../core";
import { getGlobalDailyDateKey } from "../utils/dateUtils";

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
s.d[DAILY_RESULT_KEY] = JSON.stringify({ days: { "2026-11-23": { winner: "DRAW", cells } } });
assert(loadDailyResult(s, "2026-11-23") === null, "geçersiz kazanan değeri reddedilir");
const broken = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };
saveDailyResult(broken, "2026-11-23", "X", cells);
assert(loadDailyResult(broken, "2026-11-23") === null, "depolama kapalıyken çökmez");

// Tarih senaryoları (UTC sınırı, saat dilimi, cihaz saati oynama)
const k = (iso: string) => getGlobalDailyDateKey(new Date(iso));
const t = mem();
saveDailyResult(t, k("2026-11-23T10:00:00Z"), "X", cells);
assert(!!loadDailyResult(t, k("2026-11-23T23:59:59Z")), "UTC 23:59:59: aynı gün, hâlâ oynanmış");
assert(loadDailyResult(t, k("2026-11-24T00:00:00Z")) === null, "UTC 00:00:00: yeni gün, yeni kadraj açılır");
// İstanbul (UTC+3) yerel 02:59 = UTC 23:59 önceki gün: yerel gece yarısı yeni kadraj getirmez
assert(!!loadDailyResult(t, k("2026-11-24T02:59:00+03:00")), "İstanbul 24'ü 02:59: UTC hâlâ 23'ü, tek şans geçerli");
assert(loadDailyResult(t, k("2026-11-24T03:00:00+03:00")) === null, "İstanbul 03:00 = UTC gece yarısı: yeni kadraj");
// Cihaz saati: bir gün ileri alıp oyna, sonra gerçek güne dön -> bugünün kaydı kaybolmamalı
saveDailyResult(t, k("2026-11-24T12:00:00Z"), "O", cells);
const back = loadDailyResult(t, k("2026-11-23T12:00:00Z"));
assert(!!back && back.winner === "X", "saat ileri alınıp geri dönülünce bugünün kaydı korunur (ikinci şans yok)");
assert(loadDailyResult(t, k("2026-11-24T12:00:00Z"))?.winner === "O", "ileri alınan günün kaydı da ayrı tutulur");
// Saat geriye alınırsa eski bir gün: o günün kaydı yoksa eski kadraj açılır, bugününki bozulmaz
assert(loadDailyResult(t, k("2026-11-20T12:00:00Z")) === null, "saat geri alınırsa o günün kadrajı açılır, mevcut kayıtlar bozulmaz");
// Kayıt sayısı sınırlı kalır
const big = mem();
for (let d = 1; d <= 40; d++) saveDailyResult(big, `2026-10-${String(d).padStart(2, "0")}`, "X", cells);
assert(JSON.parse(big.d[DAILY_RESULT_KEY]) !== null && Object.keys(JSON.parse(big.d[DAILY_RESULT_KEY]).days ?? {}).length <= 14, "saklanan gün sayısı en çok 14");

console.log(`\nDAILY RESULT: ${passed}/${passed + failed} PASSED`);
if (failed > 0) process.exit(1);
