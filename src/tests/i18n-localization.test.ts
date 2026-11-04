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

// 6. Language Auto-Detection & Priority Hierarchy
import { resolveInitialLocale, resolveDeviceLocale, LOCALE_STORAGE_KEY } from "../i18n/LanguageContext";

// 6.1. İlk açılışta cihaz dili Türkçe ise (tr-TR veya tr) -> Türkçe
assert(resolveInitialLocale(null, "tr-TR") === "tr", "İlk açılışta tr-TR -> Türkçe");
assert(resolveInitialLocale(null, "tr") === "tr", "İlk açılışta tr -> Türkçe");
assert(resolveInitialLocale(null, ["tr-TR", "en-US"]) === "tr", "İlk açılışta navigator.languages['tr-TR', ...] -> Türkçe");

// 6.2. İlk açılışta cihaz dili İngilizce ise (en-US, en-GB, en) -> English
assert(resolveInitialLocale(null, "en-US") === "en", "İlk açılışta en-US -> English");
assert(resolveInitialLocale(null, "en-GB") === "en", "İlk açılışta en-GB -> English");
assert(resolveInitialLocale(null, ["en-US", "tr-TR"]) === "en", "İlk açılışta navigator.languages['en-US', ...] -> English");

// 6.3. Desteklenmeyen dillerde (de-DE, fr-FR, ja-JP) -> English fallback
assert(resolveInitialLocale(null, "de-DE") === "en", "Desteklenmeyen de-DE -> English fallback");
assert(resolveInitialLocale(null, "fr-FR") === "en", "Desteklenmeyen fr-FR -> English fallback");
assert(resolveInitialLocale(null, ["de-DE", "tr-TR"]) === "en", "Desteklenmeyen birincil dil (de-DE) -> English fallback");

// 6.4. Kalıcı Tercih Önceliği: Kayıtlı Türkçe tercihi cihaz İngilizce olsa da korunur
assert(
  resolveInitialLocale("tr", "en-US") === "tr",
  "Kayıtlı Türkçe tercihi cihaz İngilizce olsa da korunuyor"
);
assert(
  resolveInitialLocale("tr", ["en-US", "en-GB"]) === "tr",
  "Kayıtlı Türkçe tercihi cihaz dilleri listesi İngilizce olsa da korunuyor"
);

// 6.5. Kalıcı Tercih Önceliği: Kayıtlı İngilizce tercihi cihaz Türkçe olsa da korunuyor
assert(
  resolveInitialLocale("en", "tr-TR") === "en",
  "Kayıtlı İngilizce tercihi cihaz Türkçe olsa da korunuyor"
);
assert(
  resolveInitialLocale("en", ["tr-TR", "tr"]) === "en",
  "Kayıtlı İngilizce tercihi cihaz dilleri listesi Türkçe olsa da korunuyor"
);

// 6.6. Geçersiz / Bozuk kayıtlı tercih durumunda cihaz diline düşüş
assert(
  resolveInitialLocale("invalid_locale", "tr-TR") === "tr",
  "Geçersiz kayıtlı tercihte cihaz dili Türkçe ise Türkçe'ye dönülür"
);
assert(
  resolveInitialLocale("invalid_locale", "de-DE") === "en",
  "Geçersiz kayıtlı tercihte cihaz dili Almanca ise English fallback uygulanır"
);

// 6.7. SSR ve Ortam Güvenliği: window / localStorage / navigator tanımsızken güvenli çalışma
assert(
  resolveInitialLocale(undefined, undefined) === "en",
  "SSR sırasında hiçbir tercih veya navigator olmadan 'en' fallback ile çökmeden çalışır"
);
assert(
  resolveDeviceLocale(null) === "en",
  "resolveDeviceLocale(null) güvenli bir şekilde 'en' döner"
);

// 6.8. Dil Değişikliği ve Kalıcı Depolama Simülasyonu
const storageMock: Record<string, string> = {};
function mockSetLocale(newLocale: "tr" | "en") {
  storageMock[LOCALE_STORAGE_KEY] = newLocale;
}
function mockGetLocale(deviceLang: string) {
  const saved = storageMock[LOCALE_STORAGE_KEY];
  return resolveInitialLocale(saved, deviceLang);
}

// Başlangıçta cihaz de-DE -> English
assert(mockGetLocale("de-DE") === "en", "Başlangıçta tercih yokken cihaz diliyle English başlar");
// Kullanıcı Ayarlar'dan Türkçe'yi seçer -> Anında uygulanır
mockSetLocale("tr");
assert(storageMock[LOCALE_STORAGE_KEY] === "tr", "Dil seçimi localStorage'a 'tr' olarak kaydedilir");
assert(mockGetLocale("de-DE") === "tr", "Dil değişikliği anında uygulanır ve cihaz dili önüne geçer");
// Yeniden açılışta tercih korunur
assert(mockGetLocale("en-US") === "tr", "Uygulama yeniden açıldığında kaydedilen 'tr' tercihi korunur");

// Kullanıcı Ayarlar'dan English'i seçer
mockSetLocale("en");
assert(storageMock[LOCALE_STORAGE_KEY] === "en", "Dil seçimi localStorage'a 'en' olarak güncellenir");
assert(mockGetLocale("tr-TR") === "en", "Kullanıcı İngilizce seçtiğinde cihaz Türkçe olsa da İngilizce korunur");

console.log("\n=================================================");
console.log(`FAZ 3 LOCALIZATION RESULT: ${passedCount}/${totalCount} PASSED (100%)`);
console.log("=================================================");
