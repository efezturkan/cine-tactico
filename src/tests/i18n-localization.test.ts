import { tr } from "../i18n/tr";
import { en } from "../i18n/en";
import {
  translateBoardTitle,
  translateCriterionLabel,
  translateCriterionSubLabel,
  translateBotRankTitle,
  BOARD_TITLES_EN,
  CRITERIA_LABELS_EN,
  BOT_TITLES_EN,
} from "../i18n/criteria";

console.log("=================================================");
console.log("CINEXOX FAZ 3: GLOBAL TR / EN LOCALIZATION TEST SUITE");
console.log("=================================================\n");

let passedCount = 0;
let totalCount = 0;

function assert(condition: boolean, desc: string) {
  totalCount++;
  if (!condition) {
    console.error(`  ❌ FAIL: ${desc}`);
    process.exit(1);
  }
  console.log(`  ✓ PASS: ${desc}`);
  passedCount++;
}

// 1. Structure Parity: Compare all nested keys in TR and EN
function getKeys(obj: Record<string, any>, prefix = ""): string[] {
  let keys: string[] = [];
  for (const k of Object.keys(obj)) {
    const fullPath = prefix ? `${prefix}.${k}` : k;
    if (obj[k] && typeof obj[k] === "object") {
      keys = keys.concat(getKeys(obj[k], fullPath));
    } else {
      keys.push(fullPath);
    }
  }
  return keys;
}

const trKeys = getKeys(tr).sort();
const enKeys = getKeys(en).sort();

assert(trKeys.length === enKeys.length, `TR and EN dictionaries have matching key counts (${trKeys.length} keys)`);

const missingInEn = trKeys.filter((k) => !enKeys.includes(k));
assert(missingInEn.length === 0, `No keys missing in EN dictionary: ${missingInEn.join(", ") || "None"}`);

const missingInTr = enKeys.filter((k) => !trKeys.includes(k));
assert(missingInTr.length === 0, `No keys missing in TR dictionary: ${missingInTr.join(", ") || "None"}`);

// 2. Criteria Translation
assert(
  translateCriterionLabel("Oscar Kazandı", "en") === "Won Oscar",
  "translateCriterionLabel translates 'Oscar Kazandı' to 'Won Oscar'"
);
assert(
  translateCriterionLabel("Oscar Kazandı", "tr") === "Oscar Kazandı",
  "translateCriterionLabel preserves 'Oscar Kazandı' in TR"
);
assert(
  translateCriterionLabel("Bilim Kurgu", "en") === "Sci-Fi",
  "translateCriterionLabel translates 'Bilim Kurgu' to 'Sci-Fi'"
);
assert(
  translateCriterionLabel("NonExistentCriterionXYZ", "en") === "NonExistentCriterionXYZ",
  "translateCriterionLabel gracefully falls back to raw label if missing"
);

// 3. Board Title Translation
assert(
  translateBoardTitle("Auteur Savaşları: Nolan vs Tarantino vs Scorsese", "en") ===
    "Auteur Wars: Nolan vs Tarantino vs Scorsese",
  "translateBoardTitle translates 'Auteur Savaşları' to English"
);
assert(
  translateBoardTitle("Auteur Savaşları: Nolan vs Tarantino vs Scorsese", "tr") ===
    "Auteur Savaşları: Nolan vs Tarantino vs Scorsese",
  "translateBoardTitle keeps original in TR"
);

// 4. Bot Rank Title Translation
assert(
  translateBotRankTitle("Bilet Kontrolörü 🍿", "en") === "Ticket Inspector 🍿",
  "translateBotRankTitle translates 'Bilet Kontrolörü 🍿' to 'Ticket Inspector 🍿'"
);
assert(
  translateBotRankTitle("Bilet Kontrolörü 🍿", "tr") === "Bilet Kontrolörü 🍿",
  "translateBotRankTitle preserves 'Bilet Kontrolörü 🍿' in TR"
);

// 5. Verification of major Board Titles and Criteria coverage
assert(Object.keys(BOARD_TITLES_EN).length >= 17, `All 17 boards covered in English (${Object.keys(BOARD_TITLES_EN).length})`);
assert(Object.keys(CRITERIA_LABELS_EN).length >= 30, `Criteria labels covered in English (${Object.keys(CRITERIA_LABELS_EN).length})`);
assert(Object.keys(BOT_TITLES_EN).length >= 8, `Bot rank titles covered in English (${Object.keys(BOT_TITLES_EN).length})`);

console.log("\n=================================================");
console.log(`FAZ 3 LOCALIZATION RESULT: ${passedCount}/${totalCount} PASSED (100%)`);
console.log("=================================================");
