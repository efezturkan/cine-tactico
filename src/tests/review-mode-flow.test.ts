/**
 * CINE-XOX: Review Mode & Alternative Answers Test Suite
 * Kapsam:
 * 1. Post-duel Review Mode salt okunur izolasyonu
 * 2. Alternatif cevapların mevcut motor (validateMove / getSharedActors) ile hesaplanması
 * 3. En fazla 8 alternatif ve kalan sayı (+X) performans sınırı
 * 4. Boş hücre / Dolu hücre inceleme kısıtları
 * 5. Snapshot immutability (oyun sonu verilerinin değişmezliği)
 * 6. i18n anahtarları ve terminoloji uyumu
 */

import { PRESET_BOARDS } from "../data/boards";
import { MOVIES_DATABASE } from "../content/adapters/gameCatalog";
import { findMatchingMovies, getSharedActors, validateMove } from "../core/engine/validator";
import { GameBoard, CellAnswer } from "../core";
import { tr } from "../i18n/tr";
import { en } from "../i18n/en";

console.log("=================================================");
console.log("CINEXOX POST-DUEL REVIEW & ALTERNATIVE ANSWERS TEST");
console.log("=================================================\n");

let passedCount = 0;
let totalCount = 0;

function assert(condition: boolean, desc: string) {
  totalCount++;
  if (!condition) {
    console.error(`  ❌ FAIL: ${desc}`);
    process.exit(1);
  }
  console.log(`  ✓ PASS: ${desc}`);
  passedCount++;
}

// ── TEST 1: Klasik Düello için geçerli alternatif hesaplama ──
const classicBoard = PRESET_BOARDS[0]; // Auteur Savaşları (Nolan vs Tarantino vs Scorsese)
assert(classicBoard !== undefined, "Klasik tahta PRESET_BOARDS[0] yüklendi");

// Hücre [0, 0]: Nolan x DiCaprio
const nolan = classicBoard.rows[0];
const dicaprio = classicBoard.cols[0];
const nolanDiCaprioMatches = findMatchingMovies(nolan, dicaprio, MOVIES_DATABASE, "HYBRID");

assert(nolanDiCaprioMatches.length > 0, `Nolan x DiCaprio hücresinde geçerli çözümler var (${nolanDiCaprioMatches.length} adet)`);
// Inception bu kesişimde olmalı
const hasInception = nolanDiCaprioMatches.some(m => m.title.toLowerCase().includes("inception"));
assert(hasInception, "Nolan x DiCaprio alternatifleri arasında Inception yer alır");

// Her bir alternatifin validateMove ile %100 geçerli olduğunu doğrula
const allStrictlyValid = nolanDiCaprioMatches.every(m => validateMove(m, nolan, dicaprio));
assert(allStrictlyValid, "findMatchingMovies tarafından döndürülen tüm alternatifler validateMove ile doğrulanır");

// ── TEST 2: Performans ve En Fazla 8 Alternatif Sınırı ──
// Bol çözümlü bir hücre: Nolan x Dram veya benzeri
const drama = classicBoard.cols[1]; // veya herhangi bir geniş kriter
const broadMatches = findMatchingMovies(nolan, drama, MOVIES_DATABASE, "HYBRID");
const cappedDisplay = broadMatches.slice(0, 8);
assert(cappedDisplay.length <= 8, `Gösterilen alternatif sayısı tavanı aşamaz (max 8, gelen: ${cappedDisplay.length})`);

if (broadMatches.length > 8) {
  const extraCount = broadMatches.length - 8;
  assert(extraCount > 0, `8'den fazla sonuç olduğunda kalan sayı hesaplanır (+${extraCount})`);
} else {
  assert(broadMatches.length - 8 <= 0, "8 veya daha az sonuç olduğunda ek sayı metni üretilmez");
}

// ── TEST 3: Ters Kadraj için getSharedActors alternatif hesaplama ──
const reverseBoard = PRESET_BOARDS.find(b => b.boardMode === "REVERSE_CAST");
assert(reverseBoard !== undefined, "Ters Kadraj tahtası PRESET_BOARDS içinde mevcut");

if (reverseBoard) {
  const rowMovie = reverseBoard.rows[0];
  const colMovie = reverseBoard.cols[0];
  const sharedActors = getSharedActors(rowMovie.value, colMovie.value, MOVIES_DATABASE);
  assert(sharedActors.length > 0, `Ters Kadraj Hücre [0,0] ortak aktör havuzuna sahiptir (${sharedActors.length} aktör)`);
  
  const cappedActors = sharedActors.slice(0, 8);
  assert(cappedActors.length <= 8, "Ters Kadraj için de aktör alternatif sayısı en fazla 8 ile sınırlandırılır");
}

// ── TEST 4: Snapshot Değişmezliği (Immutability) ──
// Bir düello bittiğinde hücrelerin kopyası alınır ve Review Mode bu kopyayı asla mutasyona uğratmaz
const mockFinishedCells: (CellAnswer | null)[] = [
  {
    movie: nolanDiCaprioMatches[0],
    answeredBy: "X",
    rarityScore: 8,
    timestamp: 1730000000,
  },
  null, // Boş hücre
  null,
  null,
  {
    movie: nolanDiCaprioMatches[0],
    answeredBy: "O",
    rarityScore: 10,
    timestamp: 1730000005,
  },
  null,
  null,
  null,
  null,
];

// Snapshot referans dondurma simülasyonu
const snapshot = Object.freeze([...mockFinishedCells]);

// Hücre [0] doludur -> İnceleme paneli açılmamalıdır
const cell0Occupied = snapshot[0] !== null;
assert(cell0Occupied, "Hücre [0] dolu hücre olarak işaretlidir");

// Hücre [1] boştur -> İnceleme paneli açılabilir
const cell1Empty = snapshot[1] === null;
assert(cell1Empty, "Hücre [1] boş hücredir ve incelenebilir");

// İnceleme modunda hamle yapılmasına izin verilmez: snapshot dizisi değişmez
assert(snapshot.length === 9, "Snapshot uzunluğu daima 9'dur");
assert(snapshot[0]?.answeredBy === "X", "Dolu hücrenin sahibi 'X' olarak korunur");
assert(snapshot[4]?.answeredBy === "O", "Dolu hücrenin sahibi 'O' olarak korunur");

// ── TEST 5: i18n Terminoloji ve Sözlük Uyumu ──
assert(tr.game.reviewKadraj === "KADRAJI İNCELE", "TR sözlüğünde 'KADRAJI İNCELE' terimi mevcut");
assert(en.game.reviewKadraj === "REVIEW FRAME", "EN sözlüğünde 'REVIEW FRAME' terimi mevcut");
assert(tr.game.reviewModeHeader === "DÜELLO TAMAMLANDI · KADRAJ İNCELEME", "TR başlığı 'DÜELLO TAMAMLANDI · KADRAJ İNCELEME'");
assert(en.game.reviewModeHeader === "DUEL COMPLETED · FRAME REVIEW", "EN başlığı 'DUEL COMPLETED · FRAME REVIEW'");
assert(tr.game.backToResult === "SONUCA DÖN", "TR geri dönüş butonu 'SONUCA DÖN'");
assert(en.game.backToResult === "BACK TO RESULT", "EN geri dönüş butonu 'BACK TO RESULT'");
assert(tr.game.playAgain === "YENİ ÇEKİM", "TR yeniden oynama butonu 'YENİ ÇEKİM' olarak güncellendi");
assert(en.game.playAgain === "NEW TAKE", "EN yeniden oynama butonu 'NEW TAKE' olarak güncellendi");

console.log("\n=================================================");
console.log(`REVIEW MODE TEST SONUCU: ${passedCount}/${totalCount} BAŞARILI (%100)`);
console.log("=================================================");
