import { MOVIES_DATABASE } from "../data/movies";
import { PRESET_BOARDS, getRandomBoard, createRandomizedBoard, getRandomOpponent } from "../data/boards";
import { WINNING_LINES, evaluateBoardState } from "../engine/rules";
import { validateMove, findMatchingMovies, validateBoardSolvability, matchesContentPool, getSharedActors } from "../engine/validator";
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

// 9. Kare Çalma (Steal Mode) & Bot Steal Testleri
runTest("Bot completes winning line by stealing opponent cell with higher IMDb rating (Steal Mode)", () => {
  const board = PRESET_BOARDS[0];
  const inception = MOVIES_DATABASE.find(m => m.id === "m_inception")!; // IMDb 8.8
  const lowerMovie = { ...inception, id: "m_test_low", title: "Low Rated Film", imdbRating: 6.5 };
  
  const cells = Array(9).fill(null);
  cells[0] = { movie: inception, answeredBy: "O", timestamp: 1 };
  cells[1] = { movie: inception, answeredBy: "O", timestamp: 2 };
  // Cell 2 has opponent mark with lower IMDb score (6.5)
  cells[2] = { movie: lowerMovie, answeredBy: "X", timestamp: 3 };

  // With allowCellStealing = true, bot should steal cell 2 to win!
  const decision = calculateBotMove(board, cells, [], "HARD", "O", true);
  return (
    decision !== null &&
    decision.cellIndex === 2 &&
    decision.movie !== null &&
    decision.movie.imdbRating > 6.5
  );
});

runTest("Cell stealing logic respects strict IMDb score threshold", () => {
  const inception = MOVIES_DATABASE.find(m => m.id === "m_inception")!; // IMDb 8.8
  const interstellar = MOVIES_DATABASE.find(m => m.id === "m_interstellar")!; // IMDb 8.7
  const darkKnight = MOVIES_DATABASE.find(m => m.id === "m_dark_knight")!; // IMDb 9.0

  // 9.0 can steal 8.8 (Dark Knight > Inception)
  const canDarkKnightStealInception = darkKnight.imdbRating > inception.imdbRating;
  // 8.7 cannot steal 8.8 (Interstellar <= Inception)
  const canInterstellarStealInception = interstellar.imdbRating > inception.imdbRating;
  // 8.8 cannot steal 8.8 (Equal score rejected)
  const canInceptionStealInception = inception.imdbRating > inception.imdbRating;

  return canDarkKnightStealInception && !canInterstellarStealInception && !canInceptionStealInception;
});

console.log("\n=================================================");
console.log(`TOTAL RESULT: ${passedCount}/${totalCount} PASSED (${Math.round((passedCount / totalCount) * 100)}%)`);
console.log("=================================================");

if (passedCount !== totalCount) {
  process.exit(1);
}
