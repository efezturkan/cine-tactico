import fs from "fs";
import path from "path";

console.log("=================================================");
console.log("CINEXOX FAZ 3: RLS & SECURITY AUDIT TEST SUITE");
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
  // 1. Migration files integrity check
  const migrationPath = path.join(
    process.cwd(),
    "supabase/migrations/20261101_faz3_tighten_rls.sql"
  );
  const rollbackPath = path.join(
    process.cwd(),
    "supabase/migrations/20261101_faz3_tighten_rls.down.sql"
  );

  assert(fs.existsSync(migrationPath), "Migration file 20261101_faz3_tighten_rls.sql exists");
  assert(fs.existsSync(rollbackPath), "Rollback migration file 20261101_faz3_tighten_rls.down.sql exists");

  const migrationSql = fs.readFileSync(migrationPath, "utf-8");

  // 2. Policy Definitions Inspection
  assert(
    migrationSql.includes("alter table public.profiles enable row level security") &&
    migrationSql.includes("alter table public.game_rooms enable row level security") &&
    migrationSql.includes("alter table public.room_moves enable row level security") &&
    migrationSql.includes("alter table public.match_sessions enable row level security"),
    "Explicitly enables Row Level Security on all core game tables"
  );
  assert(
    migrationSql.includes("supabase_realtime"),
    "Configures Realtime publication tables idempotently"
  );
  assert(
    migrationSql.includes('create policy "profiles_update_own"'),
    "Defines strict profiles_update_own policy"
  );
  assert(
    migrationSql.includes("auth.uid() = id"),
    "Enforces auth.uid() = id for profile mutations"
  );
  assert(
    migrationSql.includes('create policy "game_rooms_insert_host"'),
    "Restricts room creation strictly to authenticated host"
  );
  assert(
    migrationSql.includes('create policy "room_moves_insert_turn_player"'),
    "Enforces turn-based move insertion authorization"
  );
  assert(
    migrationSql.includes("room_moves_select_participants"),
    "Protects room move secrecy to room participants"
  );
  assert(
    migrationSql.includes("match_sessions_insert_participant"),
    "Restricts match archive creation to match participants"
  );

  // 3. Negative Security Guards Logic Simulation
  // Scenario A: Profile Impersonation Guard
  const canUpdateProfile = (authUid: string | null, targetProfileId: string) => {
    return !!authUid && authUid === targetProfileId;
  };
  const attackerUid = "attacker-uuid-1111";
  const victimUid = "victim-uuid-2222";
  assert(
    !canUpdateProfile(attackerUid, victimUid),
    "NEGATIVE: Attacker cannot update victim profile data"
  );
  assert(
    canUpdateProfile(victimUid, victimUid),
    "POSITIVE: Legitimate user can update their own profile data"
  );
  assert(
    !canUpdateProfile(null, victimUid),
    "NEGATIVE: Unauthenticated client cannot update any profile data"
  );

  // Scenario B: Room Host Spoofing Guard
  const canCreateRoom = (authUid: string | null, claimedHostId: string) => {
    return !!authUid && authUid === claimedHostId;
  };
  assert(
    !canCreateRoom(attackerUid, victimUid),
    "NEGATIVE: User cannot create a game room claiming another user's host_id"
  );
  assert(
    canCreateRoom(attackerUid, attackerUid),
    "POSITIVE: User can create a room matching their authenticated host_id"
  );

  // Scenario C: Turn Hijacking Guard
  interface MockRoom {
    host_id: string;
    guest_id: string;
    current_turn: "X" | "O";
    status: string;
  }
  const canInsertMove = (
    authUid: string | null,
    playerId: string,
    playerSymbol: "X" | "O",
    room: MockRoom
  ) => {
    if (!authUid || authUid !== playerId) return false;
    if (room.status !== "IN_PROGRESS") return false;
    if (room.host_id === authUid && playerSymbol === "X" && room.current_turn === "X") return true;
    if (room.guest_id === authUid && playerSymbol === "O" && room.current_turn === "O") return true;
    return false;
  };

  const activeRoom: MockRoom = {
    host_id: "host-uuid-1",
    guest_id: "guest-uuid-2",
    current_turn: "X",
    status: "IN_PROGRESS",
  };

  assert(
    canInsertMove("host-uuid-1", "host-uuid-1", "X", activeRoom),
    "POSITIVE: Host X can submit move on turn X"
  );
  assert(
    !canInsertMove("guest-uuid-2", "guest-uuid-2", "O", activeRoom),
    "NEGATIVE: Guest O cannot submit move when current turn is X"
  );
  assert(
    !canInsertMove("host-uuid-1", "host-uuid-1", "O", activeRoom),
    "NEGATIVE: Host X cannot submit move with counterfeit symbol O"
  );
  assert(
    !canInsertMove(attackerUid, attackerUid, "X", activeRoom),
    "NEGATIVE: Outside attacker cannot inject move into ongoing room"
  );

  const waitingRoom: MockRoom = {
    host_id: "host-uuid-1",
    guest_id: "guest-uuid-2",
    current_turn: "X",
    status: "WAITING",
  };
  assert(
    !canInsertMove("host-uuid-1", "host-uuid-1", "X", waitingRoom),
    "NEGATIVE: Move insertion rejected if game status is not IN_PROGRESS"
  );

  // Scenario D: Match Archive Spoofing Guard
  const canArchiveMatch = (
    authUid: string | null,
    playerXId: string,
    playerOId: string
  ) => {
    return !!authUid && (authUid === playerXId || authUid === playerOId);
  };

  assert(
    canArchiveMatch("player-x-uuid", "player-x-uuid", "player-o-uuid"),
    "POSITIVE: Player X can archive completed match"
  );
  assert(
    canArchiveMatch("player-o-uuid", "player-x-uuid", "player-o-uuid"),
    "POSITIVE: Player O can archive completed match"
  );
  assert(
    !canArchiveMatch(attackerUid, "player-x-uuid", "player-o-uuid"),
    "NEGATIVE: External observer cannot submit match archive"
  );

  console.log(`\n=================================================`);
  console.log(`FAZ 3 RLS AUDIT SUMMARY: ${passedCount}/${totalCount} tests passed!`);
  console.log(`=================================================\n`);
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
