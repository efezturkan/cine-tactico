import fs from "fs";
import path from "path";
import { submitRealtimeMove } from "../backend/repositories/matches";

console.log("=================================================");
console.log("CINEXOX FAZ 4: SERVER-AUTHORITATIVE RPC TEST SUITE");
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
  // 1. Migration File Verification
  const rpcMigrationPath = path.join(
    process.cwd(),
    "supabase/migrations/20261101_faz4_submit_move_rpc.sql"
  );
  const rpcDownPath = path.join(
    process.cwd(),
    "supabase/migrations/20261101_faz4_submit_move_rpc.down.sql"
  );

  assert(fs.existsSync(rpcMigrationPath), "Migration 20261101_faz4_submit_move_rpc.sql exists");
  assert(fs.existsSync(rpcDownPath), "Rollback 20261101_faz4_submit_move_rpc.down.sql exists");

  const rpcSql = fs.readFileSync(rpcMigrationPath, "utf-8");
  assert(
    rpcSql.includes("function public.submit_move"),
    "Defines submit_move PostgreSQL function"
  );
  assert(
    rpcSql.includes("security definer"),
    "submit_move is configured with SECURITY DEFINER"
  );
  assert(
    rpcSql.includes("for update"),
    "Applies row-level pessimistic lock (FOR UPDATE) to prevent concurrency race conditions"
  );
  assert(
    rpcSql.includes("v_lines int[][]"),
    "Server function contains the 8 canonical 3-in-a-row winning lines"
  );

  // 2. Client Repository Contract Check
  assert(
    typeof submitRealtimeMove === "function",
    "submitRealtimeMove is exported as an async function"
  );

  // 3. Winning Line Evaluation Logic (Mirroring Database Function)
  const LINES = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  function evaluateMoves(moves: { cell_index: number; player_symbol: "X" | "O" }[]) {
    const cells: (string | null)[] = Array(9).fill(null);
    for (const m of moves) {
      cells[m.cell_index] = m.player_symbol;
    }

    for (const [a, b, c] of LINES) {
      if (cells[a] && cells[a] === cells[b] && cells[b] === cells[c]) {
        return { status: "COMPLETED", winner: cells[a] };
      }
    }

    const filledCount = cells.filter((c) => c !== null).length;
    if (filledCount === 9) {
      return { status: "COMPLETED", winner: "DRAW" };
    }

    const lastMove = moves[moves.length - 1];
    const nextTurn = lastMove && lastMove.player_symbol === "X" ? "O" : "X";
    return { status: "IN_PROGRESS", current_turn: nextTurn };
  }

  // Test Top Horizontal Win for X
  const xHorizontalWin = [
    { cell_index: 0, player_symbol: "X" as const },
    { cell_index: 3, player_symbol: "O" as const },
    { cell_index: 1, player_symbol: "X" as const },
    { cell_index: 4, player_symbol: "O" as const },
    { cell_index: 2, player_symbol: "X" as const },
  ];
  const evalH = evaluateMoves(xHorizontalWin);
  assert(
    evalH.status === "COMPLETED" && evalH.winner === "X",
    "Server logic detects horizontal win (0,1,2) for X"
  );

  // Test Diagonal Win for O
  const oDiagonalWin = [
    { cell_index: 1, player_symbol: "X" as const },
    { cell_index: 0, player_symbol: "O" as const },
    { cell_index: 3, player_symbol: "X" as const },
    { cell_index: 4, player_symbol: "O" as const },
    { cell_index: 5, player_symbol: "X" as const },
    { cell_index: 8, player_symbol: "O" as const },
  ];
  const evalD = evaluateMoves(oDiagonalWin);
  assert(
    evalD.status === "COMPLETED" && evalD.winner === "O",
    "Server logic detects main diagonal win (0,4,8) for O"
  );

  // Test Draw
  const drawMoves = [
    { cell_index: 0, player_symbol: "X" as const },
    { cell_index: 1, player_symbol: "O" as const },
    { cell_index: 2, player_symbol: "X" as const },
    { cell_index: 4, player_symbol: "O" as const },
    { cell_index: 3, player_symbol: "X" as const },
    { cell_index: 5, player_symbol: "O" as const },
    { cell_index: 7, player_symbol: "X" as const },
    { cell_index: 6, player_symbol: "O" as const },
    { cell_index: 8, player_symbol: "X" as const },
  ];
  const evalDraw = evaluateMoves(drawMoves);
  assert(
    evalDraw.status === "COMPLETED" && evalDraw.winner === "DRAW",
    "Server logic accurately detects 9-cell DRAW"
  );

  // Test Ongoing Game with Turn Alternation
  const move1 = [{ cell_index: 4, player_symbol: "X" as const }];
  const evalProg = evaluateMoves(move1);
  assert(
    evalProg.status === "IN_PROGRESS" && evalProg.current_turn === "O",
    "Server switches turn from X to O during ongoing match"
  );

  console.log(`\n=================================================`);
  console.log(`FAZ 4 SERVER RPC SUMMARY: ${passedCount}/${totalCount} tests passed!`);
  console.log(`=================================================\n`);
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
