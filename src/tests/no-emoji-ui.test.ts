import * as fs from "fs";
import * as path from "path";

let passed = 0, failed = 0;
function assert(cond: boolean, msg: string) {
  if (cond) { passed++; console.log(`  ✓ PASS: ${msg}`); } else { failed++; console.error(`  ✗ FAIL: ${msg}`); }
}

console.log("MVP ARAYÜZÜNDE EMOJI YOK (yapısal simge = vektör)");

// Bayrakla kapalı (MVP'de render edilmeyen) yüzeyler ve bilinçli veri dosyaları kapsam dışı:
// açılmadan önce emojileri vektör simgeye çevrilmeli (YAYIN_ICIN_KALANLAR.md).
const FLAGGED_OFF = ["LeaderboardModal.tsx", "QuestsModal.tsx", "ShopModal.tsx", "NotificationPanel.tsx"];
const INTENTIONAL = ["dailyShare.ts" /* paylaşım ızgarası kare emojileri bilerek */, "profile.ts" /* avatar verisi, yalnızca kapalı mağazada */];

const PICTOGRAPH = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{2B1B}\u{2B1C}\u{2705}\u{274C}]/u;
const ALLOWED_GLYPHS = /[✓✕✖]/g; // ✓ ✕ ✖: metin işareti (şekille anlam taşır), emoji değil

function walk(dir: string, out: string[] = []): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== "tests") walk(p, out); }
    else if (/\.(tsx|ts)$/.test(e.name)) out.push(p);
  }
  return out;
}

const offenders: string[] = [];
for (const file of walk(path.join(__dirname, ".."))) {
  const base = path.basename(file);
  if (FLAGGED_OFF.includes(base) || INTENTIONAL.includes(base)) continue;
  fs.readFileSync(file, "utf8").split("\n").forEach((line, i) => {
    const t = line.trim();
    if (t.startsWith("//") || t.startsWith("*") || t.startsWith("/*")) return;
    if (PICTOGRAPH.test(line.replace(ALLOWED_GLYPHS, ""))) offenders.push(`${base}:${i + 1} ${t.slice(0, 70)}`);
  });
}
assert(offenders.length === 0, `MVP'de görünen kodda emoji yok${offenders.length ? " → " + offenders.slice(0, 6).join(" | ") : ""}`);

console.log(`\nNO EMOJI RESULT: ${passed}/${passed + failed} PASSED`);
if (failed > 0) process.exit(1);
