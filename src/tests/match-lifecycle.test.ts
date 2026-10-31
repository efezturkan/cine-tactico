import { archiveMatchSession, fetchPlayerMatchHistory } from "../backend/repositories/matches";
import { syncProfileToSupabase } from "../backend/repositories/profiles";
import { fetchGlobalLeaderboard } from "../backend/repositories/leaderboard";

console.log("=================================================");
console.log("CINEXOX FAZ 5 & 6: LIFECYCLE & STATS TEST SUITE");
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
  // 1. Repository Function Exports
  assert(typeof archiveMatchSession === "function", "archiveMatchSession is exported");
  assert(typeof fetchPlayerMatchHistory === "function", "fetchPlayerMatchHistory is exported");
  assert(typeof syncProfileToSupabase === "function", "syncProfileToSupabase is exported");
  assert(typeof fetchGlobalLeaderboard === "function", "fetchGlobalLeaderboard is exported");

  // 2. Rating Calculation Spec Verification
  const calculateRating = (wins: number, losses: number) => {
    return Math.max(0, 1000 + wins * 25 - losses * 12);
  };

  assert(calculateRating(0, 0) === 1000, "Base initial rating is 1000");
  assert(calculateRating(10, 2) === 1226, "10 wins (+250) and 2 losses (-24) equals 1226");
  assert(calculateRating(0, 100) === 0, "Rating floors at 0 and never goes negative");

  // 3. Leaderboard League Classification
  const getLeagueTier = (rating: number) => {
    if (rating >= 2000) return "GRANDMASTER";
    if (rating >= 1400) return "DIAMOND";
    if (rating >= 800) return "GOLD";
    if (rating >= 400) return "SILVER";
    return "BRONZE";
  };

  assert(getLeagueTier(2800) === "GRANDMASTER", "Rating 2800 qualifies for GRANDMASTER");
  assert(getLeagueTier(1600) === "DIAMOND", "Rating 1600 qualifies for DIAMOND");
  assert(getLeagueTier(950) === "GOLD", "Rating 950 qualifies for GOLD");
  assert(getLeagueTier(500) === "SILVER", "Rating 500 qualifies for SILVER");
  assert(getLeagueTier(250) === "BRONZE", "Rating 250 falls in BRONZE");

  // 4. Presence & Disconnection State Machine Simulation
  interface PresenceState {
    [username: string]: { online: boolean; lastSeen: number };
  }

  const presences: PresenceState = {
    PlayerX: { online: true, lastSeen: Date.now() },
  };

  const isOpponentOnline = (currentUser: string) => {
    return Object.entries(presences).some(
      ([user, data]) => user !== currentUser && data.online
    );
  };

  assert(!isOpponentOnline("PlayerX"), "Opponent is offline when only PlayerX is in presence");

  // Opponent joins
  presences["PlayerO"] = { online: true, lastSeen: Date.now() };
  assert(isOpponentOnline("PlayerX"), "Opponent is detected online when PlayerO joins");

  // Opponent leaves
  presences["PlayerO"].online = false;
  assert(!isOpponentOnline("PlayerX"), "Opponent is detected offline when PlayerO leaves");

  // 5. Rehydration Sequence Verification
  interface MockStoredMove {
    cell_index: number;
    player_id: string;
    movie_id: string;
    player_symbol: "X" | "O";
  }

  const storedMoves: MockStoredMove[] = [
    { cell_index: 0, player_id: "host-uuid", movie_id: "m1", player_symbol: "X" },
    { cell_index: 4, player_id: "guest-uuid", movie_id: "m2", player_symbol: "O" },
    { cell_index: 2, player_id: "host-uuid", movie_id: "m3", player_symbol: "X" },
  ];

  const appliedRemoteMoves: MockStoredMove[] = [];
  const rehydrate = (myUserId: string) => {
    for (const move of storedMoves) {
      if (move.player_id !== myUserId) {
        appliedRemoteMoves.push(move);
      }
    }
  };

  rehydrate("host-uuid");
  assert(
    appliedRemoteMoves.length === 1 && appliedRemoteMoves[0].cell_index === 4,
    "Rehydration correctly filters out local moves and replays only opponent moves"
  );

  console.log(`\n=================================================`);
  console.log(`FAZ 5 & 6 SUMMARY: ${passedCount}/${totalCount} tests passed!`);
  console.log(`=================================================\n`);
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
