import { getDailyBoardForDate } from "../data/boards";

let passed = 0, failed = 0;
function assert(cond: boolean, msg: string) {
  if (cond) { passed++; console.log(`  ✓ PASS: ${msg}`); } else { failed++; console.error(`  ✗ FAIL: ${msg}`); }
}
console.log("GÜNLÜK TAHTA: HERKESE AYNI, SABİT, RASTGELELİKTEN BAĞIMSIZ");

const sig = (k: string) => {
  const b = getDailyBoardForDate(k).board;
  return b.rows.map(r => r.label).join("|") + "#" + b.cols.map(c => c.label).join("|");
};

// Altın değerler: katalog ya da üretici KASITLI değiştirilirse güncellenir. Habersiz değişirse gün içinde
// oyuncuların tahtası farklılaşır ve paylaşılan sonuçlar karşılaştırılamaz.
const GOLDEN: Record<string, string> = {
  "2026-11-05": "Robert Zemeckis|Steven Spielberg|Tom Cruise#90'lar|Bilim Kurgu|Dram",
  "2026-11-24": "Steven Spielberg|Brad Pitt|Natalie Portman#Macera|Aksiyon|90'lar",
  "2026-12-31": "Steven Spielberg|Harrison Ford|Robert Zemeckis#Bilim Kurgu|80'ler ve Öncesi|Oscar Kazanmadı",
};
for (const [day, expected] of Object.entries(GOLDEN)) {
  assert(sig(day) === expected, `${day} tahtası sabit (değiştiyse katalog/üretici değişti: bilerek ise altın değeri güncelle)`);
}

const real = Math.random;
Math.random = () => 0.123456; const a = sig("2026-11-24");
Math.random = () => 0.987654; const b = sig("2026-11-24");
Math.random = real;
assert(a === b, "tahta Math.random'dan bağımsız (herkes aynı günü aynı tahtada oynar)");
assert(sig("2026-11-24") !== sig("2026-11-25"), "ardışık günlerin tahtası farklı");
assert(getDailyBoardForDate("bozuk-tarih").board.rows.length === 3, "bozuk tarih anahtarı çökertmez");

console.log(`\nDAILY BOARD GOLDEN RESULT: ${passed}/${passed + failed} PASSED`);
if (failed > 0) process.exit(1);
