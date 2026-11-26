import * as fs from "fs";
import * as path from "path";
import { MOVIES_DATABASE } from "@/content/adapters/gameCatalog";
import { rankMoviesForQuery, movieMatchesTitleQuery, movieTitleMatchRank } from "@/content/search/movieTitle";
import { generateSolvableBoard, generateReverseBoard, ACTOR_ROW_MIN_FILMS } from "@/data/generatedBoards";
import { getBoardForMode } from "@/data/boards";
import { findMatchingMovies } from "@/core/engine/validator";
import type { Movie } from "@/core";

let passed = 0, failed = 0;
function assert(cond: boolean, msg: string) {
  if (cond) { passed++; console.log(`  ✓ PASS: ${msg}`); } else { failed++; console.error(`  ✗ FAIL: ${msg}`); }
}

console.log("ARAMA SIRALAMASI, TÜRKÇE ALIAS VE BAŞLIK TEMİZLİĞİ");
const find = (title: string) => MOVIES_DATABASE.find(m => m.title === title) as Movie;

// Sıralama: tam eşleşme > başlangıç > alt-metin
const dune = rankMoviesForQuery(MOVIES_DATABASE, "Dune");
assert(dune[0]?.title === "Dune" && dune[0]?.year === 1984, "'Dune' sorgusunda tam eşleşme (Dune 1984) en üstte");
assert(dune.some(m => m.title.startsWith("Dune: Part One")), "'Dune' sorgusu 'Dune: Part One'ı başlangıç eşleşmesi olarak da bulur");
const gf = rankMoviesForQuery(MOVIES_DATABASE, "godfather").map(m => m.title);
assert(gf[0] === "The Godfather", "'godfather' → 'The Godfather' baştaki The atılarak tam eşleşir ve en üstte");
const rankGf = movieTitleMatchRank(find("The Godfather"), "godfather");
const rankP2 = movieTitleMatchRank(find("The Godfather Part II"), "godfather");
assert(rankGf === 0 && rankP2 === 2, "başlık tam eşleşme (0) > alias tam (1) > başlık başlangıç (2)");
const sub = movieTitleMatchRank(find("Saving Private Ryan"), "private");
assert(sub === 4, "ortadaki kelime başlık alt-metin eşleşmesi (4) olarak bulunur");

// Türkçe alias ve karakter normalizasyonu
assert(movieMatchesTitleQuery(find("The Dark Knight"), "Kara Şövalye"), "Türkçe alias 'Kara Şövalye' → The Dark Knight");
assert(movieMatchesTitleQuery(find("The Dark Knight"), "Sovalye"), "aksansız 'Sovalye' Türkçe alias ile eşleşir");
assert(movieMatchesTitleQuery(find("Memento"), "Akıl Defteri"), "Türkçe ad 'Akıl Defteri' → Memento");
assert(movieMatchesTitleQuery(find("Saving Private Ryan"), "Er Ryan"), "Türkçe ad 'Er Ryan' → Saving Private Ryan");
assert(movieMatchesTitleQuery(find("Saving Private Ryan"), "Saving Private Ryan"), "İngilizce başlık aramada bulunur");
assert(!movieMatchesTitleQuery(find("Inception"), "x"), "iki karakterden kısa sorgu sonuç vermez");

// Başlık temizliği: Türkçe parantez başlığa girmemeli
const withTrParen = MOVIES_DATABASE.filter(m => /\([^)]*[çğıöşüÇĞİÖŞÜ][^)]*\)\s*$/.test(m.title)).map(m => m.title);
assert(withTrParen.length === 0, `hiçbir başlıkta Türkçe parantez yok${withTrParen.length ? " → " + withTrParen.join(", ") : ""}`);
assert(find("Saving Private Ryan").title === "Saving Private Ryan", "'Saving Private Ryan' başlığı temiz");
assert(MOVIES_DATABASE.filter(m => m.title === "Dune").length === 1 && MOVIES_DATABASE.some(m => m.title === "King Kong" && m.year === 1933) && MOVIES_DATABASE.some(m => m.title === "King Kong" && m.year === 2005), "aynı adlı yapımlar (King Kong 1933/2005) ayrı kayıtlar olarak kalır");

console.log("\nKLASİK VE TERS KADRAJ ÜRETİMİ (ELLE SEÇİLMİŞ TAHTA ÇOK NADİR)");
assert(ACTOR_ROW_MIN_FILMS === 7, "oyuncu satır eşiği 7 (Al Pacino'nun 7 yapımı satır olabilir)");
assert(MOVIES_DATABASE.filter(m => m.cast.includes("Al Pacino")).length >= 7, "Al Pacino en az 7 yapımda kayıtlı");

let classicPreset = 0, classicGenerated = 0;
for (let i = 0; i < 200; i++) {
  const { board } = getBoardForMode("CLASSIC");
  if (board.id.startsWith("gen_")) classicGenerated++; else classicPreset++;
  const counts = Object.values(board.validCounts ?? {});
  if (counts.length === 9 && counts.some(n => n < 3) && board.id.startsWith("gen_")) {
    assert(false, "üretilen klasik tahtada <3 cevaplı hücre olmamalı");
  }
}
assert(classicPreset === 0, `200 klasik seçimde elle seçilmiş tahta yok (üretilen ${classicGenerated}, preset ${classicPreset})`);

let revPreset = 0;
for (let i = 0; i < 100; i++) {
  const { board } = getBoardForMode("REVERSE_CAST");
  if (!board.id.startsWith("genrev_")) revPreset++;
}
assert(revPreset === 0, "100 ters kadraj seçiminde elle seçilmiş tahta yok");

let genFail = 0, minCell = 99;
for (let s = 1; s <= 150; s++) {
  const b = generateSolvableBoard(s);
  if (!b) { genFail++; continue; }
  const counts = Object.values(b.validCounts);
  minCell = Math.min(minCell, ...counts);
  // Bağımsız doğrulama: her hücre için gerçek eşleşme sayısı
  b.rows.forEach((r, ri) => b.cols.forEach((c, ci) => {
    const n = findMatchingMovies(r, c, MOVIES_DATABASE).length;
    if (n < 3) genFail++;
  }));
}
assert(genFail === 0 && minCell >= 3, `klasik üretici 150 tohumda hatasız, her hücre ≥3 (min ${minCell})`);

let revNull = 0;
for (let s = 1; s <= 60; s++) if (!generateReverseBoard(s)) revNull++;
assert(revNull < 60 * 0.4, `ters kadraj üretici 60 tohumun çoğunda tahta verir (boş ${revNull})`);

console.log("\nAYARLAR: LİSANS BÖLÜMÜ");
const settings = fs.readFileSync(path.join(__dirname, "..", "components", "SettingsModal.tsx"), "utf8");
assert(settings.includes("SIL Open Font License 1.1") && settings.includes("Wikidata (CC0 1.0)"), "Ayarlar'da yazı tipi ve Wikidata CC0 lisansı var");
assert(!/Wikimedia|Görsel Atıfları|Portre/.test(settings), "Ayarlar'da portre/Wikimedia atfı yok");

console.log(`\nSEARCH AND FALLBACK RESULT: ${passed}/${passed + failed} PASSED`);
if (failed > 0) process.exit(1);
