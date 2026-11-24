import { MOVIES_DATABASE } from "../content/adapters/gameCatalog";
import { normalizeForSearch } from "../content/search/normalize";

let passed = 0, failed = 0;
function assert(cond: boolean, msg: string) {
  if (cond) { passed++; console.log(`  ✓ PASS: ${msg}`); } else { failed++; console.error(`  ✗ FAIL: ${msg}`); }
}

console.log("KATALOG: AYNI FİLM İKİ KEZ ÇIKMAZ");

// Simülatörde yakalandı: "Memento" yazınca aynı başlık iki satır olarak listeleniyordu.
const seen = new Map<string, string[]>();
for (const m of MOVIES_DATABASE) {
  const title = normalizeForSearch(m.originalTitle || m.title);
  if (!title) continue; // Latin olmayan adlar normalleşince boşalır, kopya sayılmaz
  const key = `${title}|${m.year}`;
  seen.set(key, [...(seen.get(key) ?? []), m.id]);
}
const dups = Array.from(seen.entries()).filter(([, ids]) => ids.length > 1);
assert(dups.length === 0, `aynı özgün ad ve yıla sahip kopya kayıt yok${dups.length ? " → " + dups.map(([k, v]) => `${k}: ${v.join(",")}`).join("; ") : ""}`);
assert(MOVIES_DATABASE.filter(m => /^memento/i.test(m.originalTitle || m.title)).length === 1, "Memento katalogda tek kayıt");
assert(MOVIES_DATABASE.some(m => m.id === "m_memento"), "elle seçilen kayıt (m_memento) korunur");

console.log(`\nCATALOG DUPLICATES RESULT: ${passed}/${passed + failed} PASSED`);
if (failed > 0) process.exit(1);
