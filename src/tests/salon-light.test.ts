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

// --- Perde (bordo-siyah salon perdesi) ---
const hex = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const lin = (c: number) => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
const lum = (rgb: number[]) => 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]);
const contrast = (a: number[], b: number[]) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const over = (base: number[], c: number[], a: number) => base.map((v, i) => v * (1 - a) + c[i] * a);
const rgba = (s: string) => { const m = s.match(/rgba\(([\d.]+),\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)\)/)!; return { rgb: [Number(m[1]), Number(m[2]), Number(m[3])], a: Number(m[4]) }; };

const perde = SALON_PRESETS.perde;
assert(Boolean(perde) && perde.label.tr === "Perde" && perde.label.en === "Curtain", "Perde hazır ayarı TR ve EN adıyla var");
assert(sanitizeSalonConfig({ preset: "perde" }).preset === "perde", "Kayıtlı 'perde' ayarı korunur");
const [pr, pg, pb] = hex(perde.bg);
assert(pr > pg && pr > pb && pr <= 24, "Perde zemini kırmızıya çalan siyah (koyu, R baskın)");
const pt = rgba(perde.tint);
assert(pt.rgb[0] > pt.rgb[1] * 4 && pt.rgb[0] > pt.rgb[2] * 3 && pt.a >= 0.12 && pt.a <= 0.2, "Perde ışık rengi bordo ve Kadife'den belirgin (0.12-0.20), metni boğmaz");
assert(pt.a > rgba(SALON_PRESETS.kadife.tint).a, "Perde, Kadife'den daha kırmızı");
assert(Boolean(perde.folds) && perde.folds!.includes("repeating-linear-gradient"), "Perde pilileri statik gradyan (animasyonsuz)");
assert(computeSalonVars({ ...DEFAULT_SALON_CONFIG, preset: "perde" }).folds === perde.folds, "Perde pilileri ekrana değişken olarak geçer");
assert(computeSalonVars(DEFAULT_SALON_CONFIG).folds === "none", "Pilisiz hazır ayarlarda doku kapalı ('none'): ayar değişince eski doku kalmaz");
assert(Object.values(SALON_PRESETS).filter(p => p.folds).length === 1, "Yalnızca Perde dokulu (ek maliyet tek ayarda)");

// En parlak olası perde yüzeyi: zemin + ışık rengi + pili vurgusu. Okunabilirlik burada da korunmalı.
const surface = over(over(hex(perde.bg), pt.rgb, pt.a), [150, 22, 40], 0.10);
assert(contrast(hex("#E8E6E1"), surface) >= 12, "Perde üzerinde ana metin kontrastı ≥ 12:1");
assert(contrast(hex("#8A8F9A"), surface) >= 4.5, "Perde üzerinde soluk metin kontrastı ≥ 4.5:1");
assert(contrast(hex("#D9A441"), surface) >= 7, "Perde üzerinde altın vurgu kontrastı ≥ 7:1");
assert(contrast(hex("#E5484D"), surface) >= 4.0, "Perde üzerinde hata/REC kırmızısı seçilebilir (≥ 4:1)");

console.log(`\nSALON RESULT: ${passed}/${passed + failed} PASSED`);
if (failed > 0) process.exit(1);
