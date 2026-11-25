import { MOVIES_DATABASE } from "../content/adapters/gameCatalog";
import { movieMatchesTitleQuery } from "../content/search/movieTitle";

let passed = 0, failed = 0;
function assert(cond: boolean, msg: string) {
  if (cond) { passed++; console.log(`  ✓ PASS: ${msg}`); } else { failed++; console.error(`  ✗ FAIL: ${msg}`); }
}
console.log("KATALOG GÜNCELLİĞİ (2022-2026)");

const recent = MOVIES_DATABASE.filter(m => m.year >= 2023);
assert(recent.length >= 150, `2023 ve sonrası en az 150 yapım (şimdi ${recent.length}; eskiden 10)`);

// Bir sinefilin ilk yazacağı güncel filmler bulunabilmeli (Sportrix'in ölüm nedeni: "doğru cevap yok")
const MUST = ["Past Lives", "Poor Things", "The Substance", "Challengers", "Anatomy of a Fall", "Oppenheimer", "Barbie", "Dune: Part Two"];
for (const title of MUST) {
  const found = MOVIES_DATABASE.find(m => (m.originalTitle || m.title).toLowerCase() === title.toLowerCase() || m.title.toLowerCase() === title.toLowerCase());
  assert(Boolean(found), `"${title}" katalogda`);
  if (found) assert(movieMatchesTitleQuery(found, title.toLowerCase().slice(0, Math.max(3, Math.min(8, title.length)))), `"${title}" adının başı yazılınca aramada çıkar`);
}

console.log(`\nCATALOG FRESHNESS RESULT: ${passed}/${passed + failed} PASSED`);
if (failed > 0) process.exit(1);
