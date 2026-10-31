import { MOVIES_DATABASE } from "../data/movies";
import { PRESET_BOARDS, getRandomBoard, createRandomizedBoard, getRandomOpponent } from "../data/boards";
import {
  WINNING_LINES,
  evaluateBoardState,
  resolveFotoFinish,
  isCellDeadlocked,
  createLockedNeutralCell,
} from "../engine/rules";
import {
  validateMove,
  findMatchingMovies,
  validateBoardSolvability,
  matchesContentPool,
  getSharedActors,
  normalizeCinemaString,
  calculateLevenshteinDistance,
  validateActorIntersection,
  calculateCellRarity,
} from "../engine/validator";
import { calculateBotMove, getBotThinkingDelay } from "../engine/bot-ai";

console.log("=================================================");
console.log("CINEXOX UNIVERSAL GAME ENGINE TEST SUITE");
console.log("=================================================\n");

let passedCount = 0;
let totalCount = 0;

function runTest(name: string, fn: () => boolean) {
  totalCount++;
  try {
    const passed = fn();
    if (passed) {
      passedCount++;
      console.log(`  ✓ PASS: ${name}`);
    } else {
      console.error(`  ✗ FAIL: ${name}`);
    }
  } catch (err) {
    console.error(`  ✗ ERROR: ${name} ->`, err);
  }
}

// 1. Winning Lines
runTest("8 Winning combinations are properly configured", () => {
  return WINNING_LINES.length === 8 && WINNING_LINES.every(line => line.length === 3);
});

// 2. Matrix Solvability (No Dead Cells)
PRESET_BOARDS.forEach((board, idx) => {
  runTest(`Board #${idx + 1} (${board.title}) has valid solutions in all 9 cells`, () => {
    return board.rows.every(row =>
      board.cols.every(col => {
        if (board.boardMode === "REVERSE_CAST") {
          return getSharedActors(row.value, col.value).length >= 1;
        }
        return findMatchingMovies(row, col).length >= 1;
      })
    );
  });
});

// 3. Move Validation Filter
runTest("Valid move is accepted (Inception for Nolan x DiCaprio)", () => {
  const inception = MOVIES_DATABASE.find(m => m.id === "m_inception")!;
  const nolan = { id: "r1", type: "DIRECTOR" as const, label: "Christopher Nolan", value: "Christopher Nolan" };
  const dicaprio = { id: "c1", type: "ACTOR" as const, label: "Leonardo DiCaprio", value: "Leonardo DiCaprio" };
  return validateMove(inception, nolan, dicaprio);
});

runTest("Invalid move is rejected (Fight Club for Nolan x DiCaprio)", () => {
  const fightClub = MOVIES_DATABASE.find(m => m.id === "m_fight_club")!;
  const nolan = { id: "r1", type: "DIRECTOR" as const, label: "Christopher Nolan", value: "Christopher Nolan" };
  const dicaprio = { id: "c1", type: "ACTOR" as const, label: "Leonardo DiCaprio", value: "Leonardo DiCaprio" };
  return !validateMove(fightClub, nolan, dicaprio);
});

// 4. Win Detection
runTest("Winning line is properly detected", () => {
  const inception = MOVIES_DATABASE.find(m => m.id === "m_inception")!;
  const sampleCells = Array(9).fill(null);
  sampleCells[0] = { movie: inception, answeredBy: "X", timestamp: 1 };
  sampleCells[1] = { movie: inception, answeredBy: "X", timestamp: 2 };
  sampleCells[2] = { movie: inception, answeredBy: "X", timestamp: 3 };

  const result = evaluateBoardState(sampleCells);
  return result.winner === "X" && result.line?.[0] === 0 && result.line?.[2] === 2;
});

runTest("Full board with no 3-in-a-row properly returns DRAW (not fake X win)", () => {
  const inception = MOVIES_DATABASE.find(m => m.id === "m_inception")!;
  // Classic draw board:
  // X O X
  // X O O
  // O X X
  const drawPattern: ("X" | "O")[] = ["X", "O", "X", "X", "O", "O", "O", "X", "X"];
  const drawCells = drawPattern.map((p, idx) => ({
    movie: inception,
    answeredBy: p,
    timestamp: idx,
  }));
  const result = evaluateBoardState(drawCells);
  return result.winner === "DRAW" && result.line === null;
});

runTest("Board 4 (Süper Kahramanlar) has no single-solution deadlocks", () => {
  const dcMarvel = PRESET_BOARDS.find(b => b.title.includes("Süper Kahramanlar"))!;
  // James Gunn x Marvel
  const gunnMarvel = findMatchingMovies(dcMarvel.rows[1], dcMarvel.cols[1]);
  // Ryan Reynolds x Marvel
  const reynoldsMarvel = findMatchingMovies(dcMarvel.rows[2], dcMarvel.cols[1]);
  // Ryan Reynolds x Action
  const reynoldsAction = findMatchingMovies(dcMarvel.rows[2], dcMarvel.cols[2]);

  return gunnMarvel.length >= 3 && reynoldsMarvel.length >= 3 && reynoldsAction.length >= 4;
});

// 5. Bot AI Tests
runTest("Bot finds valid move on empty board without stalling", () => {
  const board = PRESET_BOARDS[0];
  const cells = Array(9).fill(null);
  const decision = calculateBotMove(board, cells, [], "MEDIUM", "O");
  return decision !== null && decision.movie !== null && decision.cellIndex >= 0 && decision.cellIndex < 9;
});

runTest("Bot seizes winning move when available (HARD)", () => {
  const board = PRESET_BOARDS[0];
  const movie = MOVIES_DATABASE.find(m => m.id === "m_inception")!;
  const cells = Array(9).fill(null);
  cells[0] = { movie, answeredBy: "O", timestamp: 1 };
  cells[1] = { movie, answeredBy: "O", timestamp: 2 };
  // Cell 2 completes winning row [0, 1, 2]
  const decision = calculateBotMove(board, cells, [], "HARD", "O");
  return decision !== null && decision.cellIndex === 2 && decision.movie !== null;
});

runTest("Bot blocks opponent's winning line (HARD)", () => {
  const board = PRESET_BOARDS[0];
  const movie = MOVIES_DATABASE.find(m => m.id === "m_inception")!;
  const cells = Array(9).fill(null);
  cells[3] = { movie, answeredBy: "X", timestamp: 1 };
  cells[4] = { movie, answeredBy: "X", timestamp: 2 };
  // Cell 5 blocks winning row [3, 4, 5]
  const decision = calculateBotMove(board, cells, [], "HARD", "O");
  return decision !== null && decision.cellIndex === 5 && decision.movie !== null;
});

// 6. Random Board & Layout Tests
runTest("createRandomizedBoard preserves 9 valid intersections", () => {
  const base = PRESET_BOARDS[0];
  const randomized = createRandomizedBoard(base);
  return randomized.rows.every(row =>
    randomized.cols.every(col => findMatchingMovies(row, col).length >= 1)
  );
});

runTest("getRandomBoard returns valid board and respects exclusion", () => {
  const { board, index } = getRandomBoard(0);
  return index !== 0 && board.rows.length === 3 && board.cols.length === 3;
});

runTest("getRandomOpponent returns a valid opponent with name and avatar", () => {
  const opp = getRandomOpponent();
  return Boolean(opp && opp.name && opp.avatarId);
});

// 7. Bot Tier & Delay Tests
runTest("Bot thinking delays are properly calibrated per difficulty", () => {
  const hardDelay = getBotThinkingDelay("HARD");
  const easyDelay = getBotThinkingDelay("EASY");
  return hardDelay >= 1400 && hardDelay <= 6500 && easyDelay >= 2000 && easyDelay <= 9000;
});

runTest("getRandomOpponent filters properly by bot difficulty tier", () => {
  const easyBot = getRandomOpponent("EASY");
  const hardBot = getRandomOpponent("HARD");
  return easyBot.difficulty === "EASY" && hardBot.difficulty === "HARD" && hardBot.level > easyBot.level;
});

// 8. Eksen Güvenliği (Solvability) & İçerik Havuzu (Film vs Dizi)
runTest("Content pool correctly classifies Films and Series", () => {
  const film = MOVIES_DATABASE.find(m => m.id === "m_inception")!;
  const series = MOVIES_DATABASE.find(m => m.id === "s_breaking_bad")!;
  return (
    matchesContentPool(film, "FILM") &&
    !matchesContentPool(series, "FILM") &&
    matchesContentPool(series, "SERIES") &&
    !matchesContentPool(film, "SERIES") &&
    matchesContentPool(film, "HYBRID") &&
    matchesContentPool(series, "HYBRID")
  );
});

runTest("Sinefil prestij tahtası en az 3 geçerli eser kuralını (Eksen Güvenliği) sağlar", () => {
  // Fincher x Nolan x Villeneuve / Oscar, IMDb 8.0+, Dram & Suç
  const fincherBoard = PRESET_BOARDS.find(b => b.title.includes("Fincher"))!;
  const result = validateBoardSolvability(fincherBoard, 3);
  return result.isValid && result.failedCells.length === 0;
});

runTest("Mod 2 Sinefil (Yönetmen × Oscar Durumu) tahtası Eksen Güvenliğini (%100) sağlar", () => {
  const sinefilBoard = PRESET_BOARDS.find(b => b.id === "board_sinefil_oscar")!;
  const result = validateBoardSolvability(sinefilBoard, 3);
  return result.isValid && result.failedCells.length === 0;
});

runTest("Tüm 14 Kült Tema konsept tahtalarında yer alır ve her hücrede en az 3 çözüm (Eksen Güvenliği) bulunur", () => {
  const conceptBoards = PRESET_BOARDS.filter(b => b.boardMode === "CINE_CONCEPT");
  if (conceptBoards.length < 5) return false;

  const foundThemes = new Set<string>();
  for (const b of conceptBoards) {
    const solvability = validateBoardSolvability(b, 3);
    if (!solvability.isValid) return false;
    b.rows.forEach(r => {
      if (r.type === "THEME") foundThemes.add(r.value);
    });
  }

  const REQUIRED_14_THEMES = [
    "PLOT_TWIST", "WHODUNNIT", "TIME_TRAVEL", "NON_LINEAR", 
    "SINGLE_LOCATION", "HEIST", "REVENGE", "SURVIVAL", 
    "DYSTOPIA", "SPACE", "AI", "NEO_NOIR", "LITERALLY_ME", "CULT_FLOP"
  ];

  return REQUIRED_14_THEMES.every(t => foundThemes.has(t));
});

runTest("Kesişimsiz 3 Yönetmen x 3 Aktör tahtası Eksen Güvenliği tarafından reddedilir (Ölü Hücre Koruması)", () => {
  const unfeasibleBoard: any = {
    id: "unfeasible_test",
    title: "Test",
    difficulty: "HARD",
    rows: [
      { id: "r1", type: "DIRECTOR", label: "Christopher Nolan", value: "Christopher Nolan" },
      { id: "r2", type: "DIRECTOR", label: "Greta Gerwig", value: "Greta Gerwig" },
      { id: "r3", type: "DIRECTOR", label: "Quentin Tarantino", value: "Quentin Tarantino" },
    ],
    cols: [
      { id: "c1", type: "ACTOR", label: "Leonardo DiCaprio", value: "Leonardo DiCaprio" },
      { id: "c2", type: "ACTOR", label: "Margot Robbie", value: "Margot Robbie" },
      { id: "c3", type: "ACTOR", label: "Tom Hanks", value: "Tom Hanks" },
    ],
    validCounts: {},
  };
  const result = validateBoardSolvability(unfeasibleBoard, 3);
  // 9 hücrenin 9'u da 3 filmin altındadır (hatta 6'sı 0 filmlidir)
  return !result.isValid && result.failedCells.length >= 6;
});

// 9. Kare Mühürleme & Hücre Çalma Yasağı (Anti-Steal Güvencesi)
runTest("Dolu hücreler mühürlüdür; bot asla dolu hücreyi çalamaz veya hedefleyemez", () => {
  const board = PRESET_BOARDS[0];
  const inception = MOVIES_DATABASE.find(m => m.id === "m_inception")!;
  
  const cells = Array(9).fill(null);
  cells[0] = { movie: inception, answeredBy: "O", timestamp: 1 };
  cells[1] = { movie: inception, answeredBy: "O", timestamp: 2 };
  // Cell 2 has opponent mark; hücre mühürlüdür
  cells[2] = { movie: inception, answeredBy: "X", timestamp: 3 };

  // Bot boş olan diğer hücrelerden birini seçmelidir (Cell 2'yi çalamaz)
  const decision = calculateBotMove(board, cells, [inception.id], "HARD", "O");
  return (
    decision !== null &&
    decision.cellIndex !== 2 &&
    decision.cellIndex !== 0 &&
    decision.cellIndex !== 1 &&
    decision.movie !== null
  );
});

runTest("Bot sahipsiz/kilitli (LOCKED_NEUTRAL) hücreleri hedeflemez", () => {
  const board = PRESET_BOARDS[0];
  const inception = MOVIES_DATABASE.find(m => m.id === "m_inception")!;

  const cells = Array(9).fill(null);
  // 8 hücre dolu veya sahipsiz kilitli olsun, sadece hücre 4 boş kalsın
  for (let i = 0; i < 9; i++) {
    if (i !== 4) {
      cells[i] = { movie: inception, answeredBy: "NEUTRAL", timestamp: i, isLockedNeutral: true };
    }
  }

  const decision = calculateBotMove(board, cells, [], "HARD", "O");
  return decision !== null && decision.cellIndex === 4;
});

// 10. Normalizasyon & Ters Kadraj Kontrollü Aktör Doğrulama
runTest("normalizeCinemaString Türkçe karakterleri ve aksanları doğru temizler", () => {
  const input = "  Şahika Çoşkun & Timothée Öztürk  ";
  const normalized = normalizeCinemaString(input);
  return normalized === "sahika coskun timothee ozturk";
});

runTest("calculateLevenshteinDistance mesafeleri doğru hesaplar", () => {
  return (
    calculateLevenshteinDistance("dicaprio", "dicaprio") === 0 &&
    calculateLevenshteinDistance("dicaprio", "dicapri") === 1 &&
    calculateLevenshteinDistance("nolan", "tarantino") > 4
  );
});

runTest("validateActorIntersection ortak aktörü tam eşleşmeyle doğrular", () => {
  const inception = MOVIES_DATABASE.find(m => m.id === "m_inception")!;
  const darkKnight = MOVIES_DATABASE.find(m => m.id === "m_dark_knight")!;
  // Ortak aktörler: Cillian Murphy
  const result = validateActorIntersection("Cillian Murphy", inception, darkKnight);
  return result.isValid && result.matchedActor === "Cillian Murphy";
});

runTest("validateActorIntersection 1 harf yazım hatasını kontrollü tolere eder", () => {
  const inception = MOVIES_DATABASE.find(m => m.id === "m_inception")!;
  const darkKnight = MOVIES_DATABASE.find(m => m.id === "m_dark_knight")!;
  // "Cillian Murphyy" (1 harf fazla) -> tolere edilmeli
  const result = validateActorIntersection("Cillian Murphyy", inception, darkKnight);
  return result.isValid && result.matchedActor === "Cillian Murphy";
});

runTest("validateActorIntersection alakasız aktörü kesin olarak reddeder", () => {
  const inception = MOVIES_DATABASE.find(m => m.id === "m_inception")!;
  const darkKnight = MOVIES_DATABASE.find(m => m.id === "m_dark_knight")!;
  const result = validateActorIntersection("Brad Pitt", inception, darkKnight);
  return !result.isValid;
});

// 11. FAZ 2 Kural Motoru, Deadlock, Altın Makara & Göreli Rarity Testleri
runTest("evaluateBoardState 9 hücre dolup 3'lü hat yoksa GOLDEN_REEL durumunu tetikler", () => {
  const inception = MOVIES_DATABASE.find(m => m.id === "m_inception")!;
  // Klasik beraberlik tahtası (3'lü hat yok)
  const drawPattern: ("X" | "O")[] = ["X", "O", "X", "X", "O", "O", "O", "X", "X"];
  const drawCells = drawPattern.map((p, idx) => ({
    movie: inception,
    answeredBy: p,
    timestamp: idx,
  }));
  const result = evaluateBoardState(drawCells, true);
  return result.winner === "GOLDEN_REEL" && result.line === null;
});

runTest("resolveFotoFinish Foto-Finiş'te toplam Rarity puanı yüksek olanı galip ilan eder", () => {
  // X: 45 puan, O: 30 puan -> Kazanan X
  const winX = resolveFotoFinish(45, 30);
  // X: 22 puan, O: 40 puan -> Kazanan O
  const winO = resolveFotoFinish(22, 40);
  // Eşitlik durumunda (0% beraberlik kuralı) -> X
  const drawTie = resolveFotoFinish(35, 35);
  return winX === "X" && winO === "O" && drawTie === "X";
});

runTest("isCellDeadlocked iki taraf da yanlış yaptığında true döner ve createLockedNeutralCell kilitler", () => {
  const oneWrong = isCellDeadlocked({ X: true, O: false });
  const bothWrong = isCellDeadlocked({ X: true, O: true });
  const lockedCell = createLockedNeutralCell(3);

  return (
    !oneWrong &&
    bothWrong &&
    lockedCell.isLockedNeutral === true &&
    lockedCell.answeredBy === "NEUTRAL" &&
    lockedCell.pointsEarned === 0
  );
});

runTest("calculateCellRarity dar havuzda (N < 3) Anti-Inflation kuralıyla asla Legendary üretmez", () => {
  const inception = MOVIES_DATABASE.find(m => m.id === "m_inception")!;
  const prestige = MOVIES_DATABASE.find(m => m.id === "m_prestige")!;
  const narrowPool = [inception, prestige]; // Toplam 2 film

  const rarityInception = calculateCellRarity(inception, narrowPool);
  const rarityPrestige = calculateCellRarity(prestige, narrowPool);

  // N < 3 durumunda tavan seviye RARE olmalı, Legendary üretilmemeli
  return (
    rarityInception.tier !== "LEGENDARY" &&
    rarityPrestige.tier !== "LEGENDARY" &&
    rarityInception.bonus <= 5 &&
    rarityPrestige.bonus <= 5
  );
});

runTest("calculateCellRarity geniş havuzda Spec v3 puan tablosunu uygular", () => {
  const inception = MOVIES_DATABASE.find(m => m.id === "m_inception")!;
  const darkKnight = MOVIES_DATABASE.find(m => m.id === "m_dark_knight")!;
  const prestige = MOVIES_DATABASE.find(m => m.id === "m_prestige")!;
  const memento = MOVIES_DATABASE.find(m => m.id === "m_memento") || { ...prestige, id: "m_indie_test", boxOfficeCategory: "INDIE" as const };
  const broadPool = [inception, darkKnight, prestige, memento];

  const commonRes = calculateCellRarity(inception, broadPool);
  return (
    [0, 2, 5, 8, 12].includes(commonRes.bonus) &&
    commonRes.totalPoints === 10 + commonRes.bonus
  );
});

// 12. Ters Kadraj ve Tahta Geçerlilik Sayımı Testleri (Lazy Memoization & Reverse Cast Audit)
runTest("1. Klasik Düello tahtalarının geçerli hücre sayıları doğru", () => {
  const board1 = PRESET_BOARDS[0];
  const counts = board1.validCounts;
  // 9 hücre de hesaplanmış ve her biri en az 1 filme sahip olmalı
  const has9Cells = Object.keys(counts).length === 9;
  const allPositive = Object.values(counts).every(c => c > 0);
  // İlk hücre Nolan x Tarantino vs DiCaprio olmalı
  const cell0Expected = findMatchingMovies(board1.rows[0], board1.cols[0]).length;
  return has9Cells && allPositive && counts["0_0"] === cell0Expected;
});

runTest("2. Ters Kadraj tahtalarında yalnızca film kesişimleri (ortak aktörler) sayılıyor", () => {
  const revBoard = PRESET_BOARDS.find(b => b.boardMode === "REVERSE_CAST")!;
  const counts = revBoard.validCounts;
  // 0_0 hücresi: row[0] vs col[0] ortak aktör sayısı
  const row0 = revBoard.rows[0].value;
  const col0 = revBoard.cols[0].value;
  const expectedShared = getSharedActors(row0, col0).length;
  return counts["0_0"] === expectedShared && expectedShared > 0;
});

runTest("3. Ters Kadraj hücreleri yanlışlıkla sıfır hesaplanmıyor (0-Cell Hatası Önleme)", () => {
  const revBoards = PRESET_BOARDS.filter(b => b.boardMode === "REVERSE_CAST");
  return revBoards.every(b => {
    const counts = b.validCounts;
    return Object.keys(counts).length === 9 && Object.values(counts).every(count => count >= 1);
  });
});

runTest("4. Tahta değiştirildiğinde veya karıştırıldığında hesaplama yeni tahtaya göre güncelleniyor", () => {
  const boardA = PRESET_BOARDS[0]; // Klasik
  const boardB = PRESET_BOARDS.find(b => b.boardMode === "REVERSE_CAST")!; // Ters Kadraj
  const countsA = boardA.validCounts;
  const countsB = boardB.validCounts;
  // İki tahtanın hücre sayıları birbirinden bağımsız ve farklı olmalı
  const areDifferent = JSON.stringify(countsA) !== JSON.stringify(countsB);
  // Rastgele karıştırma da yeni tahtaya göre validCounts üretmeli
  const randomizedA = createRandomizedBoard(boardA);
  const randomizedHas9 = Object.keys(randomizedA.validCounts).length === 9;
  return areDifferent && randomizedHas9;
});

runTest("5. Aynı tahta tekrar kullanıldığında (lazy memoization) önceki hesaplama bozulmuyor", () => {
  const revBoard = PRESET_BOARDS.find(b => b.boardMode === "REVERSE_CAST")!;
  const firstAccess = JSON.stringify(revBoard.validCounts);
  const secondAccess = JSON.stringify(revBoard.validCounts);
  const thirdAccess = JSON.stringify(revBoard.validCounts);
  return firstAccess === secondAccess && secondAccess === thirdAccess && !firstAccess.includes('"0_0":0');
});

console.log("\n=================================================");
console.log(`TOTAL RESULT: ${passedCount}/${totalCount} PASSED (${Math.round((passedCount / totalCount) * 100)}%)`);
console.log("=================================================");

if (passedCount !== totalCount) {
  process.exit(1);
}
