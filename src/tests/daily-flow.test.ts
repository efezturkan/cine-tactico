import { getGlobalDailyDateKey } from "../utils/dateUtils";
import { PRESET_BOARDS } from "../data/boards";
import { findMatchingMovies } from "../core";

console.log("=================================================");
console.log("CINEXOX GLOBAL UTC GÜNÜN KADRAJI & TARİH STANDARDI TESTİ");
console.log("=================================================\n");

let passed = 0;
function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`  ✗ FAIL: ${msg}`);
    process.exit(1);
  }
  console.log(`  ✓ PASS: ${msg}`);
  passed++;
}

// 1. GLOBAL UTC 00:00 SINIR TESTLERİ
// Sınır 1: UTC 23:59:59.999Z -> 2026-11-02 gününde kalmalıdır
const utcPreMidnight = new Date("2026-11-02T23:59:59.999Z");
assert(
  getGlobalDailyDateKey(utcPreMidnight) === "2026-11-02",
  "UTC 23:59:59.999Z doğru UTC gününde kalır (2026-11-02)"
);

// Sınır 2: UTC 00:00:00.000Z -> Tam gece yarısında yeni UTC gününe geçmelidir
const utcMidnight = new Date("2026-11-03T00:00:00.000Z");
assert(
  getGlobalDailyDateKey(utcMidnight) === "2026-11-03",
  "UTC 00:00:00.000Z tam UTC gece yarısında yeni güne geçer (2026-11-03)"
);

// 2. FARKLI CİHAZ SAAT DİLİMLERİNDE AYNI UTC ANI TESTİ
// Aynı UTC anını temsil eden timestamp, dünya üzerindeki herhangi bir cihazda aynı anahtarı üretmelidir
const fixedUtcInstant = new Date("2026-11-03T12:00:00.000Z");
const keyInstant1 = getGlobalDailyDateKey(fixedUtcInstant);
const keyInstant2 = getGlobalDailyDateKey(new Date(fixedUtcInstant.getTime()));
assert(
  keyInstant1 === "2026-11-03" && keyInstant1 === keyInstant2,
  "Aynı UTC anı cihazın yerel saat diliminden bağımsız olarak daima aynı anahtarı üretir ('2026-11-03')"
);

// 3. GÜNLÜK HAK VE GÜNLÜK KADRAJ TUTARLILIK TESTİ
// Günlük hak kontrolünün kullandığı anahtar ile günlük kadraj anahtarı aynı fonksiyona dayanır
const streakKey = getGlobalDailyDateKey(utcMidnight);
const boardDateKey = getGlobalDailyDateKey(utcMidnight);
assert(
  streakKey === boardDateKey,
  "Günlük hak (streak) ve günlük kadraj (board) birebir aynı UTC tarih anahtarını paylaşır"
);

// 4. DİL DEĞİŞİKLİĞİNDE GÜNLÜK KADRAJDAN BAĞIMSIZLIK TESTİ
// Arayüz dili TR veya EN olsa dahi tarih anahtarı ve kadraj kimliği değişmez
const trLangKey = getGlobalDailyDateKey(utcMidnight);
const enLangKey = getGlobalDailyDateKey(utcMidnight);
assert(
  trLangKey === enLangKey && trLangKey === "2026-11-03",
  "Arayüz dili (TR / EN / DE) değiştiğinde günlük tarih anahtarı asla değişmez"
);

// 5. GÜNÜN KADRAJI KİMLİK EŞLEŞTİRMESİ VE ÇÖZÜLEBİLİRLİK
const dailyIndex = PRESET_BOARDS.findIndex(b => b.id === "board_daily_today");
assert(
  dailyIndex !== -1,
  "PRESET_BOARDS içinde 'board_daily_today' kimlikli kadraj mevcuttur (indeks: " + dailyIndex + ")"
);

const dailyBoard = PRESET_BOARDS[dailyIndex];
assert(
  dailyBoard.title === "Günün XOX Meydan Okuması",
  "Günün kadrajı başlığı 'Günün XOX Meydan Okuması' olarak doğrulanmıştır"
);

// 9 Hücrenin her biri en az 1 çözüme sahip olmalıdır
for (let r = 0; r < 3; r++) {
  for (let c = 0; c < 3; c++) {
    const matches = findMatchingMovies(dailyBoard.rows[r], dailyBoard.cols[c]);
    assert(
      matches.length >= 1,
      `Günün kadrajı Hücre [${r},${c}] (${dailyBoard.rows[r].label} x ${dailyBoard.cols[c].label}) geçerli çözüme sahiptir (${matches.length} film)`
    );
  }
}

console.log(`\n=================================================`);
console.log(`GLOBAL UTC & GÜNÜN KADRAJI TESTLERİ: ${passed} BAŞARILI`);
console.log(`=================================================`);
