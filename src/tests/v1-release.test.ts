import { PRESET_BOARDS, getDailyBoardForDate, FEATURED_BOARD_IDS } from "../data/boards";
import { findMatchingMovies } from "../core";
import { FLAGS } from "../config/flags";
import { isSupabaseConfigured } from "../backend/supabase/client";

let passed = 0;
let failed = 0;
function assert(cond: boolean, msg: string) {
  if (cond) { passed++; console.log(`  ✓ PASS: ${msg}`); }
  else { failed++; console.error(`  ✗ FAIL: ${msg}`); }
}

console.log("V1.0 RELEASE GUARDS");

assert(FLAGS.SHOW_ONLINE_ROOM === false, "Online Özel Gösterim v1.0'da kapalı");
assert(isSupabaseConfigured === false, "Online kapalıyken Supabase asla yapılandırılmış sayılmaz (ağ yok)");

const d1 = getDailyBoardForDate("2026-11-04");
const d1b = getDailyBoardForDate("2026-11-04");
assert(d1.board.id === d1b.board.id, "Aynı UTC gününde aynı tahta gelir");

const seen = new Set<string>();
for (let i = 0; i < 16; i++) {
  const day = new Date(Date.UTC(2026, 10, 4 + i)).toISOString().slice(0, 10);
  const { board } = getDailyBoardForDate(day);
  seen.add(board.id);
  const minCount = Math.min(
    ...board.rows.flatMap(r => board.cols.map(c => findMatchingMovies(r, c).length))
  );
  assert(minCount >= 3, `Günün kadrası ${day} (${board.id}) her hücrede ≥3 cevaplı`);
  assert(board.boardMode !== "REVERSE_CAST", `Günün kadrası ${day} Ters Kadraj değil`);
}
assert(seen.size > 1, `Günün kadrası günler arasında değişir (${seen.size} farklı tahta)`);
for (const id of FEATURED_BOARD_IDS) {
  const b = PRESET_BOARDS.find(x => x.id === id);
  assert(!!b, `Öne çıkan tahta mevcut: ${id}`);
  if (b) {
    const min = Math.min(...b.rows.flatMap(r => b.cols.map(c => findMatchingMovies(r, c).length)));
    assert(min >= 3, `Öne çıkan tahta ${id} her hücrede ≥3 cevaplı`);
  }
}
assert(PRESET_BOARDS.length > 0, "Hazır tahta havuzu boş değil");

console.log(`\nV1 RELEASE RESULT: ${passed}/${passed + failed} PASSED`);
if (failed > 0) process.exit(1);
