import * as fs from "fs";
import * as path from "path";

let passed = 0, failed = 0;
function assert(cond: boolean, msg: string) {
  if (cond) { passed++; console.log(`  ✓ PASS: ${msg}`); } else { failed++; console.error(`  ✗ FAIL: ${msg}`); }
}

console.log("RELEASE PAKETİ: ağsız 1.0 derlemesinde çevrimiçi kod ve anahtar yok (önce `npm run build:ios` ya da `npm run build`)");

const out = path.join(__dirname, "..", "..", "out");
if (!fs.existsSync(path.join(out, "index.html"))) {
  console.log("  ⚠ ATLANDI: out/ yok. Bu test derlenmiş pakete bakar; sayıma dahil değildir.");
  console.log("\nRELEASE BUNDLE RESULT: SKIPPED (out/ yok)");
  process.exit(0);
}

function walk(dir: string, acc: string[] = []): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (/\.(js|html|json|txt)$/.test(e.name)) acc.push(p);
  }
  return acc;
}
const text = walk(out).map((f) => fs.readFileSync(f, "utf8")).join("\n");

const FORBIDDEN: [string, RegExp][] = [
  ["Supabase istemcisi (createClient)", /createClient\(/],
  ["Realtime kanalı", /realtime-js|RealtimeChannel/],
  ["Supabase proje adresi", /[a-z0-9]{20}\.supabase\.co/],
  ["JWT biçimli anahtar", /eyJ[A-Za-z0-9_-]{30,}\.[A-Za-z0-9_-]{30,}\.[A-Za-z0-9_-]{10,}/],
  ["sunucu hamle RPC adı", /submit_move/],
  ["mağaza / görev / liderlik ekranları", /ShopModal|QuestsModal|LeaderboardModal/],
];
for (const [name, re] of FORBIDDEN) assert(!re.test(text), `pakette yok: ${name}`);
assert(/SHOW_ONLINE_ROOM:!1/.test(text), "çevrimiçi oda bayrağı kapalı derlenmiş");

console.log(`\nRELEASE BUNDLE RESULT: ${passed}/${passed + failed} PASSED`);
if (failed > 0) process.exit(1);
