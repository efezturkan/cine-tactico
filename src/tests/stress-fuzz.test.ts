import { PRESET_BOARDS, getDailyBoardForDate, createRandomizedBoard, getBoardForMode } from "../data/boards";
import { generateSolvableBoard } from "../data/generatedBoards";
import {
  validateActorIntersection,
  getSharedActorsRanked,
  calculateCellRarity,
  calculateActorRarity,
  findMatchingMovies,
  registerFailedAttempt,
  hasPlayerTriedCell,
  evaluateOutcome,
  normalizeCinemaString,
} from "../core";
import { MOVIES_DATABASE } from "../content/adapters/gameCatalog";
import { parseBotRecords, applyBotResult } from "../utils/botRecord";
import { sanitizeSalonConfig } from "../utils/salonConfig";
import { simulateMatch, checkInvariants, makeRng, Agent } from "./sim-helpers";

let passed = 0;
let failed = 0;
function assert(cond: boolean, msg: string) {
  if (cond) { passed++; } else { failed++; console.error(`  ✗ FAIL: ${msg}`); }
}
function section(t: string) { console.log(`\n▶ ${t}`); }

// ───────────────────────────────────────────────────────────────
section("1. KAOS OYUNCUSU: her tahtada, her modda rastgele saçmalayarak maç oynar");
const chaos: Agent = { kind: "CHAOS" };
const hard: Agent = { kind: "BOT", difficulty: "HARD" };
let matches = 0;
let violations: string[] = [];
const decided: Record<string, number> = {};
for (let bi = 0; bi < PRESET_BOARDS.length; bi++) {
  const base = PRESET_BOARDS[bi];
  for (let seed = 1; seed <= 40; seed++) {
    const rng = makeRng(bi * 1000 + seed);
    const board = seed % 2 ? createRandomizedBoard(base) : base;
    const pair: [Agent, Agent] = seed % 4 === 0 ? [chaos, hard] : seed % 4 === 1 ? [hard, chaos] : [chaos, chaos];
    try {
      const r = simulateMatch(board, pair[0], pair[1], rng, seed % 3 === 0 ? "O" : "X");
      matches++;
      decided[r.decidedBy] = (decided[r.decidedBy] ?? 0) + 1;
      const errs = checkInvariants(board, r);
      if (errs.length) violations.push(`${base.id}#${seed}: ${errs.join("; ")}`);
    } catch (e) {
      violations.push(`${base.id}#${seed}: ÇÖKTÜ ${(e as Error).message}`);
    }
  }
}
assert(violations.length === 0, `kaos maçları kural ihlali olmadan bitti (${matches} maç). İhlaller: ${violations.slice(0, 5).join(" | ")}`);
console.log(`  ${matches} maç, sonuç dağılımı: ${JSON.stringify(decided)}`);

// ───────────────────────────────────────────────────────────────
section("2. BOT x BOT: tüm zorluk çiftleri, her tahta, iki taraftan başlayarak");
const diffs = ["EASY", "MEDIUM", "HARD"] as const;
let botMatches = 0;
const botViol: string[] = [];
for (const dx of diffs) for (const dy of diffs) {
  for (let bi = 0; bi < PRESET_BOARDS.length; bi++) {
    const board = PRESET_BOARDS[bi];
    for (let k = 0; k < 6; k++) {
      try {
        const r = simulateMatch(board, { kind: "BOT", difficulty: dx }, { kind: "BOT", difficulty: dy }, makeRng(bi * 97 + k + dx.length * 7), k % 2 ? "O" : "X");
        botMatches++;
        const errs = checkInvariants(board, r);
        if (errs.length) botViol.push(`${dx}v${dy} ${board.id}: ${errs[0]}`);
      } catch (e) {
        botViol.push(`${dx}v${dy} ${board.id}: ÇÖKTÜ ${(e as Error).message}`);
      }
    }
  }
}
assert(botViol.length === 0, `bot maçları kural ihlali olmadan bitti (${botMatches} maç): ${botViol.slice(0, 4).join(" | ")}`);

// ───────────────────────────────────────────────────────────────
section("3. BOZUK YAZI SALDIRISI: Ters Kadraj girişi");
const rev = PRESET_BOARDS.find(b => b.boardMode === "REVERSE_CAST")!;
const rowV = rev.rows[0].value;
const colV = rev.cols[0].value;
const shared = getSharedActorsRanked(rowV, colV).map(a => a.actor);
const target = shared[0];
const garbage = [
  "", " ", "\n", "\t\t", "a", "ab", "xx", "🎬🎬", "'; DROP TABLE users;--", "<script>alert(1)</script>",
  "x".repeat(20000), "ـ".repeat(50), "الممثل", "田中", "\u0000\u0001", "null", "undefined", "NaN", "{}", "[]",
  "robert", "de", "ro", "ni", "bert", "iro",           // 2-5 harflik parçalar KABUL EDİLMEMELİ
];
let accepted: string[] = [];
for (const g of garbage) {
  let r;
  try { r = validateActorIntersection(g, rowV, colV); } catch { accepted.push(`ÇÖKTÜ:${g.slice(0, 12)}`); continue; }
  const isFullOrSurname = shared.some(a => {
    const n = normalizeCinemaString(a);
    const gi = normalizeCinemaString(g);
    return gi.length >= 3 && n.split(" ").includes(gi);
  });
  if (r.isValid && !isFullOrSurname) accepted.push(g.slice(0, 20));
}
assert(accepted.length === 0, `çöp/kısa parça kabul edilmedi, çökmedi (kabul edilenler: ${JSON.stringify(accepted)})`);
// Tek ortak oyuncusu olan her hücrede, adın 2-4 harflik her parçası denenir (sızma testi)
let leaked: string[] = [];
for (const b of PRESET_BOARDS.filter(x => x.boardMode === "REVERSE_CAST")) {
  for (const r of b.rows) for (const c of b.cols) {
    const sh = getSharedActorsRanked(r.value, c.value).map(a => a.actor);
    if (sh.length !== 1) continue;
    const norm = normalizeCinemaString(sh[0]).replace(/ /g, "");
    const tokens = normalizeCinemaString(sh[0]).split(" ");
    for (let len = 2; len <= 4; len++) {
      for (let i = 0; i + len <= norm.length; i++) {
        const frag = norm.slice(i, i + len);
        if (tokens.includes(frag) && frag.length >= 3) continue; // tam parça (ör. soyad) meşru
        if (validateActorIntersection(frag, r.value, c.value).isValid) leaked.push(`${sh[0]}←"${frag}"`);
      }
    }
  }
}
assert(leaked.length === 0, `adın rastgele 2-4 harflik parçası kabul edilmiyor (sızan: ${leaked.slice(0, 6).join(", ")}, toplam ${leaked.length})`);
if (target) {
  const variants = [target, target.toUpperCase(), target.toLowerCase(), `  ${target}  `, target.normalize("NFD"), target.replace(/ /g, "   ")];
  for (const v of variants) assert(validateActorIntersection(v, rowV, colV).isValid, `geçerli ad farklı yazımla kabul edilir: "${v.slice(0, 30)}"`);
}

// ───────────────────────────────────────────────────────────────
section("4. HAK KURALI: yanan hücre, çift yanlış, kilit");
const empty = Array(9).fill(null);
let st = registerFailedAttempt({}, empty, 3, "X");
assert(hasPlayerTriedCell(st.attempts, 3, "X") && !hasPlayerTriedCell(st.attempts, 3, "O"), "yanlış cevap yalnızca o oyuncunun hakkını yakar");
assert(!st.locked && st.cells[3] === null, "tek taraf yakınca hücre kilitlenmez");
const st2 = registerFailedAttempt(st.attempts, st.cells, 3, "X");
assert(!st2.locked, "aynı oyuncu iki kez yakınca hücre kilitlenmez (iki taraf gerekir)");
const st3 = registerFailedAttempt(st.attempts, st.cells, 3, "O");
assert(st3.locked && st3.cells[3]?.isLockedNeutral === true, "iki taraf da yakınca hücre sahipsiz kilitlenir");
assert(empty.every(c => c === null) && Object.keys(st.attempts).length === 1, "saf fonksiyon: girdi nesnelerini değiştirmez");
const full = Array(9).fill(null).map((_, i) => ({ movie: MOVIES_DATABASE[0], answeredBy: (i % 2 ? "X" : "O") as "X" | "O", timestamp: 0 }));
const before = JSON.stringify(full);
registerFailedAttempt({}, full, 4, "X");
assert(JSON.stringify(full) === before, "dolu hücreyi yanlış cevap bozmaz");
assert(evaluateOutcome("CLASSIC", Array(9).fill(null), 0, 0).kind === "CONTINUE", "boş tahta devam eder");

// ───────────────────────────────────────────────────────────────
section("5. RARITY SINIRLARI: anti-enflasyon, her hücre ve her film");
let rarityViol = 0;
const allowed = new Set([10, 12, 15, 18, 22]);
for (const board of PRESET_BOARDS) {
  if (board.boardMode === "REVERSE_CAST") {
    for (const row of board.rows) for (const col of board.cols) {
      const actors = getSharedActorsRanked(row.value, col.value);
      for (const a of actors) {
        const r = calculateActorRarity(a.actor, row.value, col.value);
        if (!allowed.has(r.totalPoints)) rarityViol++;
        if (actors.length < 3 && r.tier !== "RARE") rarityViol++;
      }
    }
    continue;
  }
  for (const row of board.rows) for (const col of board.cols) {
    const pool = findMatchingMovies(row, col);
    for (const m of pool) {
      const r = calculateCellRarity(m, pool);
      if (!allowed.has(r.totalPoints)) rarityViol++;
      if (pool.length < 3 && (r.tier === "LEGENDARY" || r.tier === "EPIC")) rarityViol++;
    }
  }
}
assert(rarityViol === 0, `puan tablosu ve N<3 tavanı hiçbir hücrede ihlal edilmedi (${rarityViol} ihlal)`);

// ───────────────────────────────────────────────────────────────
section("6. BOZUK KAYITLAR VE UÇ GİRDİLER");
const badRecords = ["", "null", "[]", "42", '"x"', "{", '{"a":null}', '{"a":{"w":"x","l":-5,"d":1e99}}', '{"__proto__":{"w":9}}', "{" + '"a":1,'.repeat(5000) + '"b":1}'];
let recOk = true;
for (const raw of badRecords) {
  try {
    const b = parseBotRecords(raw);
    for (const rec of Object.values(b)) if (rec.w < 0 || rec.l < 0 || rec.d < 0 || !Number.isFinite(rec.w + rec.l + rec.d)) recOk = false;
  } catch { recOk = false; }
}
assert(recOk, "bozuk bot kaydı çökertmez ve negatif/sonsuz değer üretmez");
assert(({} as Record<string, unknown>).w === undefined, "prototype kirlenmedi");
const book = applyBotResult(applyBotResult({}, "Bot", "W"), "Bot", "L");
assert(book["Bot"].w === 1 && book["Bot"].l === 1 && book["Bot"].d === 0, "bot kaydı doğru sayar");

for (const junk of [null, undefined, 5, "x", [], { preset: {}, dimness: "99", projection: Infinity, grain: 5 }, { dimness: -1e9 }]) {
  const c = sanitizeSalonConfig(junk);
  assert(c.dimness >= 0 && c.dimness <= 60 && c.projection >= 0 && c.projection <= 100, `salon ayarı çöpü sınırlar: ${JSON.stringify(junk)?.slice(0, 30)}`);
}

for (const day of ["garbage", "", "9999-99-99", "0000-00-00", "-1-01-01", "2026-02-30", "1970-01-01", "2099-12-31"]) {
  let ok = true;
  try { const r = getDailyBoardForDate(day); ok = !!r.board && r.board.boardMode !== "REVERSE_CAST"; } catch { ok = false; }
  assert(ok, `günün kadrası uç tarihte çökmez: "${day}"`);
}

// Veri bütünlüğü: motorun beklediği alanlar her filmde var
const badMovies = MOVIES_DATABASE.filter(m => !Array.isArray(m.cast) || !Array.isArray(m.genres) || typeof m.year !== "number" || !m.id || !m.title);
assert(badMovies.length === 0, `tüm filmlerde zorunlu alanlar var (${badMovies.length} bozuk kayıt)`);
const dupIds = MOVIES_DATABASE.length - new Set(MOVIES_DATABASE.map(m => m.id)).size;
assert(dupIds === 0, `film kimlikleri benzersiz (${dupIds} tekrar)`);

// ───────────────────────────────────────────────────────────────
section("7. ÜRETİLEN TAHTALAR: sınırsız içerik, her hücre ≥3 cevap, deterministik");
const t0 = Date.now();
let genNull = 0, genWeak = 0, genDup = 0;
const ids = new Set<string>();
for (let seed = 1; seed <= 300; seed++) {
  const g = generateSolvableBoard(seed);
  if (!g) { genNull++; continue; }
  const min = Math.min(...g.rows.flatMap(r => g.cols.map(c => findMatchingMovies(r, c).length)));
  if (min < 3) genWeak++;
  const again = generateSolvableBoard(seed)!;
  if (JSON.stringify(again.rows) !== JSON.stringify(g.rows) || JSON.stringify(again.cols) !== JSON.stringify(g.cols)) genDup++;
  ids.add(g.rows.map(r => r.value).join("|") + "#" + g.cols.map(c => c.value).join("|"));
}
const perBoard = (Date.now() - t0) / 600;
assert(genNull === 0, `300 tohumun hepsi tahta üretti (${genNull} başarısız)`);
assert(genWeak === 0, "üretilen hiçbir tahtada 3'ten az cevaplı hücre yok");
assert(genDup === 0, "aynı tohum her zaman aynı tahtayı verir (deterministik)");
assert(ids.size >= 280, `üretilen tahtalar birbirinden farklı (${ids.size}/300 benzersiz)`);
assert(perBoard < 60, `tahta üretimi hızlı (ortalama ${perBoard.toFixed(1)} ms)`);

const dayKeys: string[] = [];
for (let d = 0; d < 365; d++) dayKeys.push(new Date(Date.UTC(2026, 10, 5 + d)).toISOString().slice(0, 10));
const dailyIds = new Set(dayKeys.map(k => {
  const b = getDailyBoardForDate(k).board;
  const min = Math.min(...b.rows.flatMap(r => b.cols.map(c => findMatchingMovies(r, c).length)));
  if (min < 3) throw new Error("günlük tahta zayıf: " + k);
  return b.rows.map(r => r.value).join("|") + "#" + b.cols.map(c => c.value).join("|");
}));
assert(dailyIds.size >= 330, `bir yıl boyunca günün kadrası tekrar etmiyor (${dailyIds.size}/365 benzersiz)`);

let classicWeak = 0;
for (let i = 0; i < 150; i++) {
  const { board } = getBoardForMode("CLASSIC");
  const min = Math.min(...board.rows.flatMap(r => board.cols.map(c => findMatchingMovies(r, c).length)));
  if (min < 3) classicWeak++;
}
assert(classicWeak === 0, `Klasik mod rastgele havuzu hiçbir zaman zayıf tahta vermiyor (${classicWeak}/150)`);

let genMatchViol = 0;
for (let seed = 1; seed <= 60; seed++) {
  const g = generateSolvableBoard(seed * 7)!;
  const r = simulateMatch(g, seed % 2 ? chaos : hard, seed % 3 ? hard : chaos, makeRng(seed));
  if (checkInvariants(g, r).length) genMatchViol++;
}
assert(genMatchViol === 0, "üretilen tahtalarda oynanan maçlarda kural ihlali yok");

console.log(`\nSTRESS/FUZZ RESULT: ${passed}/${passed + failed} PASSED`);
if (failed > 0) process.exit(1);
