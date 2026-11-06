import {
  sanitizeSalonConfig,
  computeSalonVars,
  DEFAULT_SALON_CONFIG,
  SALON_PRESETS,
  GRAIN_OPACITY,
} from "../utils/salonConfig";
import { tr } from "../i18n/tr";
import { en } from "../i18n/en";

let passed = 0;
let failed = 0;
function assert(cond: boolean, msg: string) {
  if (cond) { passed++; console.log(`  ✓ PASS: ${msg}`); }
  else { failed++; console.error(`  ✗ FAIL: ${msg}`); }
}

console.log("SALON IŞIĞI");

assert(JSON.stringify(sanitizeSalonConfig(null)) === JSON.stringify(DEFAULT_SALON_CONFIG), "Bozuk kayıt varsayılana döner");
assert(sanitizeSalonConfig({ preset: "x", dimness: 999, projection: -5, grain: "zzz" }).dimness === 60, "Loşluk üst sınırı 60");
assert(sanitizeSalonConfig({ projection: -5 }).projection === 0, "Projeksiyon alt sınırı 0");
assert(sanitizeSalonConfig({ preset: "x" }).preset === "kadife", "Bilinmeyen hazır ayar kadife olur");
assert(sanitizeSalonConfig({ grain: "film" }).grain === "film", "Film gren seçeneği korunur");
assert(sanitizeSalonConfig({ dimness: NaN }).dimness === DEFAULT_SALON_CONFIG.dimness, "NaN loşluk varsayılana döner");

const none = computeSalonVars({ ...DEFAULT_SALON_CONFIG, dimness: 0 });
const max = computeSalonVars({ ...DEFAULT_SALON_CONFIG, dimness: 60 });
assert(Number(none.dimFlat) === 0 && Number(none.dimVignette) === 0, "Loşluk 0 iken ekran karartılmaz");
assert(Number(max.dimFlat) > Number(none.dimFlat), "Loşluk arttıkça düz karartma artar (kaydırıcı artık işe yarar)");
assert(Number(max.dimFlat) <= 0.3 && Number(max.dimVignette) <= 0.75, "Karartma okunabilirlik sınırlarını aşmaz");
assert(Number(computeSalonVars({ ...DEFAULT_SALON_CONFIG, projection: 100 }).beamOpacity) === 0.14, "Projeksiyon %100 = 0.14 opaklık");
assert(GRAIN_OPACITY.off === 0 && GRAIN_OPACITY.film > GRAIN_OPACITY.light, "Gren kademeleri sıralı");

const presets = Object.values(SALON_PRESETS);
assert(new Set(presets.map(p => p.tint)).size === presets.length, "Her hazır ayarın ışık rengi farklı");
assert(presets.every(p => p.label.tr && p.label.en), "Hazır ayar adları TR ve EN dolu");

const keys = Object.keys(tr.salon) as (keyof typeof tr.salon)[];
assert(keys.every(k => tr.salon[k] && en.salon[k]), `Salon sözlüğü TR/EN eksiksiz (${keys.length} anahtar)`);

assert(DEFAULT_SALON_CONFIG.dimness <= 20, "Varsayılan loşluk tasarımın orijinal parlaklığını korur (≤%20)");
assert(Number(computeSalonVars(DEFAULT_SALON_CONFIG).dimFlat) <= 0.1, "Varsayılan düz karartma ≤0.10");

console.log(`\nSALON RESULT: ${passed}/${passed + failed} PASSED`);
if (failed > 0) process.exit(1);
