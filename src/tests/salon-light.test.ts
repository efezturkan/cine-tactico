import * as fs from "fs";
import * as path from "path";
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

// --- Kırmızı (kardeş ayarlarla aynı mantık: neredeyse siyah zemin + ışık rengi) ---
const hex = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const lin = (c: number) => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
const lum = (rgb: number[]) => 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]);
const contrast = (a: number[], b: number[]) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const over = (base: number[], c: number[], a: number) => base.map((v, i) => v * (1 - a) + c[i] * a);
const rgba = (s: string) => { const m = s.match(/rgba\(([\d.]+),\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)\)/)!; return { rgb: [Number(m[1]), Number(m[2]), Number(m[3])], a: Number(m[4]) }; };

const kirmizi = SALON_PRESETS.kirmizi;
assert(Boolean(kirmizi) && kirmizi.label.tr === "Kırmızı" && kirmizi.label.en === "Red", "Kırmızı hazır ayarı TR ve EN adıyla var");
assert(sanitizeSalonConfig({ preset: "kirmizi" }).preset === "kirmizi", "Kayıtlı 'kirmizi' ayarı korunur");
assert(sanitizeSalonConfig({ preset: "perde" }).preset === "kadife", "Eski 'perde' kaydı güvenle Kadife'ye düşer");
assert(DEFAULT_SALON_CONFIG.preset === "kadife", "Varsayılan hazır ayar Kadife (kırmızı isteğe bağlı)");
const [kr, kg, kb] = hex(kirmizi.bg);
assert(kr > kg && kr > kb, "Kırmızı zemin kırmızıya çalan siyah");
const siblings = Object.values(SALON_PRESETS).filter(p => p.id !== "kirmizi");
assert(lum(hex(kirmizi.bg)) <= Math.max(...siblings.map(p => lum(hex(p.bg)))) * 1.5, "Kırmızı zemin kardeş ayarlar kadar koyu: tasarımın siyah sinema zemini bozulmaz");
const kt = rgba(kirmizi.tint);
assert(kt.rgb[0] > kt.rgb[1] * 4 && kt.rgb[0] > kt.rgb[2] * 2.5, "Kırmızı ışık rengi belirgin kırmızı");
assert(kt.a >= 0.10 && kt.a <= Math.max(...siblings.map(p => rgba(p.tint).a)), "Kırmızı ışık opaklığı Kadife'den güçlü, en güçlü kardeşi (Gece mavisi) geçmez");
assert(kt.a > rgba(SALON_PRESETS.kadife.tint).a, "Kırmızı, Kadife'den daha kırmızı");
assert(Object.values(SALON_PRESETS).every(p => !("folds" in p)), "Hiçbir hazır ayarda doku/katman yok (düz renk)");
assert(Object.keys(computeSalonVars(DEFAULT_SALON_CONFIG)).every(k => k !== "folds"), "Doku değişkeni kaldırıldı");

const surface = over(hex(kirmizi.bg), kt.rgb, kt.a);
assert(contrast(hex("#E8E6E1"), surface) >= 12, "Kırmızı üzerinde ana metin kontrastı ≥ 12:1");
assert(contrast(hex("#8A8F9A"), surface) >= 4.5, "Kırmızı üzerinde soluk metin kontrastı ≥ 4.5:1");
assert(contrast(hex("#D9A441"), surface) >= 7, "Kırmızı üzerinde altın vurgu kontrastı ≥ 7:1");
assert(contrast(hex("#E5484D"), surface) >= 4.0, "Kırmızı üzerinde hata/REC kırmızısı seçilebilir (≥ 4:1)");

// --- Huzma yalnızca ana sayfada ---
const css = fs.readFileSync(path.join(__dirname, "..", "app", "globals.css"), "utf8");
const atmos = fs.readFileSync(path.join(__dirname, "..", "components", "SalonAtmosphere.tsx"), "utf8");
assert(/className="salon-beam /.test(atmos), "Huzma katmanı salon-beam sınıfını taşır");
assert(["GAME_SELECT", "CUSTOM_ROOM", "PROFILE"].every(v => css.includes(`html[data-view="${v}"] .salon-beam`)), "Huzma mod seçimi, oda ve profil ekranlarında gizli");
assert(!css.includes('html[data-view="HOME"] .salon-beam'), "Ana sayfada huzma gizlenmez");

console.log(`\nSALON RESULT: ${passed}/${passed + failed} PASSED`);
if (failed > 0) process.exit(1);
