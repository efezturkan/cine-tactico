import * as fs from "fs";
import * as path from "path";

let passed = 0, failed = 0;
function assert(cond: boolean, msg: string) {
  if (cond) { passed++; console.log(`  ✓ PASS: ${msg}`); } else { failed++; console.error(`  ✗ FAIL: ${msg}`); }
}
console.log("TÜRKÇE NOKTALI HARFLER KIRPILMAZ");

// Simülatörde yakalandı: `truncate` (overflow:hidden) + `leading-none` birleşimi büyük harflerin noktalarını
// kırpıyordu ("YÖNETMEN" → "YONETMEN", "ÖDÜL" → "ODUL", "DÖNEM" → "DONEM").
function walk(dir: string, out: string[] = []): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== "tests") walk(p, out); }
    else if (/\.tsx$/.test(e.name)) out.push(p);
  }
  return out;
}
const bad: string[] = [];
for (const f of walk(path.join(__dirname, ".."))) {
  fs.readFileSync(f, "utf8").split("\n").forEach((line, i) => {
    if (/className=/.test(line) && /\bleading-none\b/.test(line) && /\b(truncate|overflow-hidden|line-clamp-\d)\b/.test(line)) bad.push(`${path.basename(f)}:${i + 1}`);
  });
}
assert(bad.length === 0, `metin kutularında 'leading-none' ile kırpma birlikte kullanılmıyor${bad.length ? " → " + bad.join(", ") : ""}`);

console.log(`\nDIACRITICS CLIP RESULT: ${passed}/${passed + failed} PASSED`);
if (failed > 0) process.exit(1);
