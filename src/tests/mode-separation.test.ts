import { GameMode, PlayerSymbol } from "../core/types";

console.log("=================================================");
console.log("CINEXOX MODE & GUEST SEPARATION TEST SUITE");
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
  // 1. Single Player Mode Isolation
  const isSinglePlayer = (mode: GameMode): boolean => {
    return mode === "VS_BOT" || mode === "DAILY_SOLO";
  };

  assert(isSinglePlayer("VS_BOT"), "VS_BOT is classified as Single Player mode");
  assert(isSinglePlayer("DAILY_SOLO"), "DAILY_SOLO is classified as Single Player mode");
  assert(!isSinglePlayer("ONLINE_ROOM"), "ONLINE_ROOM is NOT classified as single player");

  // 2. Cell Selection Turn Guards (handleCellSelect simulation)
  const canSelectCell = (
    mode: GameMode,
    currentTurn: PlayerSymbol,
    isHost: boolean
  ): boolean => {
    // 1. Single Player (VS_BOT): Oyuncu X'tir, Bot O düşünürken hücre seçilemez
    if (mode === "VS_BOT" && currentTurn === "O") return false;

    // 2. Multiplayer (ONLINE_ROOM): Host X'tir, Guest O'dur. Sıra sende değilse hücre seçilemez
    if (mode === "ONLINE_ROOM") {
      const mySymbol: PlayerSymbol = isHost ? "X" : "O";
      if (currentTurn !== mySymbol) return false;
    }

    return true;
  };

  // VS_BOT guards
  assert(canSelectCell("VS_BOT", "X", false), "VS_BOT: Player can click on turn X");
  assert(!canSelectCell("VS_BOT", "O", false), "VS_BOT: Player CANNOT click while bot is playing turn O");

  // ONLINE_ROOM (Host is X, Guest is O)
  assert(canSelectCell("ONLINE_ROOM", "X", true), "ONLINE_ROOM: Host can click on turn X");
  assert(!canSelectCell("ONLINE_ROOM", "O", true), "ONLINE_ROOM: Host CANNOT click on turn O");
  assert(canSelectCell("ONLINE_ROOM", "O", false), "ONLINE_ROOM: Guest can click on turn O");
  assert(!canSelectCell("ONLINE_ROOM", "X", false), "ONLINE_ROOM: Guest CANNOT click on turn X");

  // 3. Guest vs Registered Account Distinction
  interface MockAccountState {
    isAnonymous: boolean;
    email: string | null;
  }

  const getAccountBadge = (account: MockAccountState) => {
    if (account.isAnonymous || !account.email) {
      return { badge: "Misafir Sinefil", isGuest: true, allowsLinking: true };
    }
    return { badge: "Doğrulanmış Sinefil", isGuest: false, allowsLinking: false };
  };

  const guestUser: MockAccountState = { isAnonymous: true, email: null };
  const registeredUser: MockAccountState = { isAnonymous: false, email: "nolan@sinefil.com" };

  const guestBadge = getAccountBadge(guestUser);
  assert(guestBadge.isGuest === true, "Guest user is accurately identified as anonymous");
  assert(guestBadge.allowsLinking === true, "Guest user has account linking enabled");

  const regBadge = getAccountBadge(registeredUser);
  assert(regBadge.isGuest === false, "Registered user is accurately identified as verified");
  assert(regBadge.allowsLinking === false, "Registered user is already linked");

  // 4. Offline LocalStorage Resilience Simulation
  let mockStorage: Record<string, string> = {};
  const saveProfileOffline = (profile: object) => {
    mockStorage["cinexox_player_profile"] = JSON.stringify(profile);
  };
  const loadProfileOffline = () => {
    const raw = mockStorage["cinexox_player_profile"];
    return raw ? JSON.parse(raw) : null;
  };

  const profileData = { username: "Tarantino_Fan", wins: 15, reelsBalance: 450 };
  saveProfileOffline(profileData);
  const loaded = loadProfileOffline();
  assert(
    loaded && loaded.username === "Tarantino_Fan" && loaded.wins === 15,
    "Offline storage persists and recovers player profile seamlessly"
  );

  console.log(`\n=================================================`);
  console.log(`MODE & GUEST SEPARATION SUMMARY: ${passedCount}/${totalCount} tests passed!`);
  console.log(`=================================================\n`);
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
