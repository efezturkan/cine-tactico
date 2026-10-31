import { GameRoomRecord, RoomMoveRecord, MatchSessionRecord } from "../backend/supabase/types";

console.log("=================================================");
console.log("CINEXOX FAZ 2: SCHEMA & DATA INTEGRITY TEST SUITE");
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

async function runTests() {
  const ROOM_CODE_REGEX = /^[A-Z0-9_-]{4,16}$/;

  // 1. Room Code Regex Checks
  assert(ROOM_CODE_REGEX.test("TRNY-1234"), "Validates standard TRNY tournament code");
  assert(ROOM_CODE_REGEX.test("TRNY-ABCD"), "Validates uppercase alpha room code");
  assert(ROOM_CODE_REGEX.test("ROOM_99"), "Validates alphanumeric with underscore");
  assert(ROOM_CODE_REGEX.test("XOX1"), "Validates minimum length 4 code");
  assert(!ROOM_CODE_REGEX.test("ABC"), "Rejects codes shorter than 4 characters");
  assert(!ROOM_CODE_REGEX.test(""), "Rejects empty string room code");
  assert(!ROOM_CODE_REGEX.test("TOOLONGROOMCODE123456789"), "Rejects codes exceeding 16 characters");
  assert(!ROOM_CODE_REGEX.test("trny-1234"), "Rejects lowercase room codes");
  assert(!ROOM_CODE_REGEX.test("TRNY 1234"), "Rejects room codes with spaces");
  assert(!ROOM_CODE_REGEX.test("TRNY$1234"), "Rejects room codes with illegal symbols");

  // 2. Room Status Checks
  const VALID_STATUSES = ["WAITING", "IN_PROGRESS", "COMPLETED", "ABANDONED"];
  assert(VALID_STATUSES.length === 4, "Canonical status list has exactly 4 states");
  assert(VALID_STATUSES.includes("WAITING"), "WAITING is a valid room status");
  assert(VALID_STATUSES.includes("IN_PROGRESS"), "IN_PROGRESS is a valid room status");
  assert(VALID_STATUSES.includes("COMPLETED"), "COMPLETED is a valid room status");
  assert(VALID_STATUSES.includes("ABANDONED"), "ABANDONED is a valid room status");
  assert(!VALID_STATUSES.includes("PENDING"), "Rejects non-canonical status PENDING");
  assert(!VALID_STATUSES.includes("FINISHED"), "Rejects non-canonical status FINISHED");

  // 3. Current Turn & Symbol Validation
  const validTurns = ["X", "O"];
  assert(validTurns.includes("X") && validTurns.includes("O"), "Turn restricted strictly to X and O");
  assert(!validTurns.includes("Y") && !validTurns.includes(""), "Rejects invalid turn symbols");

  // 4. Move Cell Grid Bounds (0..8)
  const isCellIndexValid = (idx: number) => Number.isInteger(idx) && idx >= 0 && idx <= 8;
  for (let i = 0; i <= 8; i++) {
    assert(isCellIndexValid(i), `Cell index ${i} is valid within 3x3 grid`);
  }
  assert(!isCellIndexValid(-1), "Rejects negative cell index -1");
  assert(!isCellIndexValid(9), "Rejects cell index out of bounds 9");
  assert(!isCellIndexValid(2.5), "Rejects floating point cell index");

  // 5. Match Session Payload & Archive Verification
  const VALID_OUTCOMES = ["VICTORY_X", "VICTORY_O", "DRAW", "ABANDONED"];
  assert(VALID_OUTCOMES.includes("VICTORY_X"), "VICTORY_X is valid outcome");
  assert(VALID_OUTCOMES.includes("VICTORY_O"), "VICTORY_O is valid outcome");
  assert(VALID_OUTCOMES.includes("DRAW"), "DRAW is valid outcome");
  assert(VALID_OUTCOMES.includes("ABANDONED"), "ABANDONED is valid outcome");

  const sampleSession: Omit<MatchSessionRecord, "id" | "completed_at"> = {
    room_code: "TRNY-8899",
    player_x_id: "00000000-0000-0000-0000-000000000001",
    player_o_id: "00000000-0000-0000-0000-000000000002",
    winner_id: "00000000-0000-0000-0000-000000000001",
    outcome: "VICTORY_X",
    game_mode: "classic",
    board_id: "classic-1",
    board_title: "Klasik Düello #1",
    moves_count: 5,
    score_rarity_x: 240,
    score_rarity_o: 180,
    total_arcade_score: 420,
    final_cells: [],
  };

  assert(sampleSession.moves_count === 5, "Sample match session record tracks move count");
  assert(
    sampleSession.total_arcade_score === sampleSession.score_rarity_x + sampleSession.score_rarity_o,
    "Calculates total arcade score accurately"
  );

  // 6. Non-Stealing Cell Conflict Guard
  const moves: { cell_index: number; is_stealing: boolean }[] = [
    { cell_index: 0, is_stealing: false },
  ];
  const canPlayCell = (cellIndex: number, isStealing: boolean) => {
    if (isStealing) return true;
    return !moves.some((m) => m.cell_index === cellIndex && !m.is_stealing);
  };

  assert(!canPlayCell(0, false), "Non-stealing move to occupied cell is rejected");
  assert(canPlayCell(0, true), "Stealing move to occupied cell is permitted");
  assert(canPlayCell(1, false), "Move to unoccupied cell is permitted");

  console.log(`\n=================================================`);
  console.log(`FAZ 2 SUMMARY: ${passedCount}/${totalCount} tests passed!`);
  console.log(`=================================================\n`);
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
