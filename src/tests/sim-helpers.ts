/**
 * Başsız maç simülatörü: React'siz, gerçek motor fonksiyonlarıyla (kural, rarity, kilit, bot) tam maç oynatır.
 * Oyun hook'unun kullandığı saf fonksiyonların aynısı çağrılır; testler gerçek kuralları sınar.
 */
import {
  GameBoard,
  CellAnswer,
  Movie,
  PlayerSymbol,
  BotDifficulty,
  BotSkill,
  validateMove,
  findMatchingMovies,
  calculateCellRarity,
  calculateActorRarity,
  validateActorIntersection,
  calculateBotMove,
  evaluateOutcome,
  registerFailedAttempt,
  hasPlayerTriedCell,
  AttemptsPerCell,
  resolveFotoFinish,
  getSharedActorsRanked,
} from "../core";
import { MOVIES_DATABASE } from "../content/adapters/gameCatalog";

export type Rng = () => number;

export { makeSeededRng as makeRng } from "../utils/seededRng";

export type Agent =
  | { kind: "BOT"; difficulty: BotDifficulty; skill?: Partial<BotSkill> }
  | { kind: "CHAOS" };

export interface SimResult {
  winner: PlayerSymbol;
  decidedBy: "LINE" | "MAJORITY" | "GOLDEN_REEL" | "FOTO_FINISH";
  cells: (CellAnswer | null)[];
  attempts: AttemptsPerCell;
  rarityX: number;
  rarityO: number;
  steps: number;
  rejected: number;
}

const MAX_STEPS = 400;

/** Bir oyuncu hamlesi: bot kararı veya kaos (geçersiz hücre, rastgele film, mükerrer film, bozuk yazı...). */
function chooseAction(
  agent: Agent,
  board: GameBoard,
  cells: (CellAnswer | null)[],
  used: string[],
  attempts: AttemptsPerCell,
  me: PlayerSymbol,
  rng: Rng
): { cell: number; movie?: Movie; actor?: string; miss?: boolean } | null {
  if (agent.kind === "BOT") {
    const d = calculateBotMove(board, cells, used, agent.difficulty, me, attempts, agent.skill, rng);
    if (!d) return null;
    return { cell: d.cellIndex, movie: d.movie ?? undefined, actor: d.actorName, miss: d.miss };
  }
  // KAOS: her türlü saçmalığı dener (dolu hücre, -1, 99, yanan hücre, mükerrer film, çöp yazı)
  const cell = [-1, 9, 99, Math.floor(rng() * 9), Math.floor(rng() * 9), Math.floor(rng() * 9)][Math.floor(rng() * 6)];
  if (board.boardMode === "REVERSE_CAST") {
    const junk = ["", "   ", "🎬", "a", "'; DROP TABLE--", "Ｌｅｏ", "x".repeat(5000), "ROBERT DE NIRO", "robert de niro"];
    return { cell, actor: junk[Math.floor(rng() * junk.length)] };
  }
  const roll = rng();
  if (roll < 0.35 && used.length > 0) return { cell, movie: MOVIES_DATABASE.find(m => m.id === used[0])! };
  if (roll < 0.7 && cell >= 0 && cell <= 8) {
    const valid = findMatchingMovies(board.rows[Math.floor(cell / 3)], board.cols[cell % 3]);
    if (valid.length > 0) return { cell, movie: valid[Math.floor(rng() * valid.length)] };
  }
  return { cell, movie: MOVIES_DATABASE[Math.floor(rng() * MOVIES_DATABASE.length)] };
}

export function simulateMatch(board: GameBoard, x: Agent, o: Agent, rng: Rng, startTurn: PlayerSymbol = "X"): SimResult {
  let cells: (CellAnswer | null)[] = Array(9).fill(null);
  let attempts: AttemptsPerCell = {};
  let used: string[] = [];
  let rarity = { X: 0, O: 0 };
  let turn: PlayerSymbol = startTurn;
  let rejected = 0;

  const finishGoldenReel = (): SimResult => {
    // Altın Makara: tek soru, iki taraf da %50 bilir; bilemezlerse foto-finiş (rarity)
    const winnerByAnswer = rng() < 0.6 ? (rng() < 0.5 ? "X" : "O") : null;
    const winner = winnerByAnswer ?? resolveFotoFinish(rarity.X, rarity.O);
    return { winner, decidedBy: winnerByAnswer ? "GOLDEN_REEL" : "FOTO_FINISH", cells, attempts, rarityX: rarity.X, rarityO: rarity.O, steps, rejected };
  };

  let steps = 0;
  while (steps++ < MAX_STEPS) {
    // Sıradaki oyuncunun oynayabileceği kare yoksa sıra geçer (hook'taki otomatik atlama)
    const open = cells.map((c, i) => (c === null ? i : -1)).filter(i => i >= 0);
    if (open.every(i => hasPlayerTriedCell(attempts, i, turn))) {
      turn = turn === "X" ? "O" : "X";
      continue;
    }

    const agent = turn === "X" ? x : o;
    const action = chooseAction(agent, board, cells, used, attempts, turn, rng);
    if (!action) {
      // Hamle üretilemedi = süre aşımı: hook'taki gibi hakkı kalan rastgele bir kare yanar
      const burnable = open.filter(i => !hasPlayerTriedCell(attempts, i, turn));
      const burn = burnable[Math.floor(rng() * burnable.length)];
      const res = registerFailedAttempt(attempts, cells, burn, turn);
      attempts = res.attempts;
      cells = res.cells;
      const out = evaluateOutcome(board.boardMode, cells, rarity.X, rarity.O);
      if (out.kind === "WIN") return { winner: out.winner, decidedBy: board.boardMode === "REVERSE_CAST" ? "MAJORITY" : "LINE", cells, attempts, rarityX: rarity.X, rarityO: rarity.O, steps, rejected };
      if (out.kind === "GOLDEN_REEL") return finishGoldenReel();
      turn = turn === "X" ? "O" : "X";
      continue;
    }

    const { cell } = action;
    const valid = Number.isInteger(cell) && cell >= 0 && cell <= 8;
    if (!valid || cells[cell] !== null || hasPlayerTriedCell(attempts, cell, turn)) {
      rejected++; // reddedilen girişim: durum değişmez, ceza yok
      if (agent.kind === "CHAOS" && rejected > 2000) throw new Error("kaos oyuncusu sonsuz döngüye soktu");
      continue;
    }

    let correct = false;
    let rarityPoints = 0;
    let answer: CellAnswer | null = null;
    const rowCrit = board.rows[Math.floor(cell / 3)];
    const colCrit = board.cols[cell % 3];

    if (board.boardMode === "REVERSE_CAST") {
      const v = validateActorIntersection(action.actor ?? "", rowCrit.value, colCrit.value);
      if (v.isValid && v.matchedActor) {
        correct = true;
        const r = calculateActorRarity(v.matchedActor, rowCrit.value, colCrit.value);
        rarityPoints = r.totalPoints;
        answer = {
          movie: { id: `actor_${v.matchedActor}_${cell}`, title: v.matchedActor, year: 0, director: "", cast: [], genres: [], hasOscar: false },
          actorName: v.matchedActor, answeredBy: turn, timestamp: 0, rarityTier: r.tier, rarityScore: r.totalPoints,
        };
      }
    } else if (action.movie && !used.includes(action.movie.id) && validateMove(action.movie, rowCrit, colCrit)) {
      correct = true;
      const r = calculateCellRarity(action.movie, findMatchingMovies(rowCrit, colCrit));
      rarityPoints = r.totalPoints;
      used = [...used, action.movie.id];
      answer = { movie: action.movie, answeredBy: turn, timestamp: 0, rarityTier: r.tier, rarityScore: r.totalPoints };
    }

    if (correct && answer) {
      cells = [...cells];
      cells[cell] = answer;
      rarity = { ...rarity, [turn]: rarity[turn] + rarityPoints };
    } else {
      const res = registerFailedAttempt(attempts, cells, cell, turn);
      attempts = res.attempts;
      cells = res.cells;
    }

    const outcome = evaluateOutcome(board.boardMode, cells, rarity.X, rarity.O);
    if (outcome.kind === "WIN") {
      return {
        winner: outcome.winner,
        decidedBy: board.boardMode === "REVERSE_CAST" ? "MAJORITY" : "LINE",
        cells, attempts, rarityX: rarity.X, rarityO: rarity.O, steps, rejected,
      };
    }
    if (outcome.kind === "GOLDEN_REEL") return finishGoldenReel();
    turn = turn === "X" ? "O" : "X";
  }
  throw new Error(`Maç ${MAX_STEPS} adımda bitmedi (sonsuz döngü)`);
}

/** Her maç sonunda sağlanması gereken kurallar. İhlal varsa açıklamasını döner. */
export function checkInvariants(board: GameBoard, r: SimResult): string[] {
  const errs: string[] = [];
  const filled = r.cells.filter(c => c !== null);

  if (r.cells.length !== 9) errs.push("tahta 9 hücre değil");
  const ids = filled.filter(c => !c!.isLockedNeutral && c!.answeredBy !== "NEUTRAL" && board.boardMode !== "REVERSE_CAST").map(c => c!.movie.id);
  if (new Set(ids).size !== ids.length) errs.push("aynı film iki hücrede kullanıldı");

  for (const c of filled) {
    if (c!.isLockedNeutral && c!.answeredBy !== "NEUTRAL") errs.push("kilitli hücrenin sahibi var");
    if (!c!.isLockedNeutral && c!.answeredBy === "NEUTRAL") errs.push("sahipsiz ama kilitsiz hücre");
  }

  // Doğru cevap kuralı: sahipli her hücre gerçekten geçerli bir cevap
  r.cells.forEach((c, i) => {
    if (!c || c.isLockedNeutral) return;
    const rowCrit = board.rows[Math.floor(i / 3)];
    const colCrit = board.cols[i % 3];
    if (board.boardMode === "REVERSE_CAST") {
      const shared = getSharedActorsRanked(rowCrit.value, colCrit.value).map(a => a.actor);
      if (!c.actorName || !shared.includes(c.actorName)) errs.push(`hücre ${i}: geçersiz ortak oyuncu`);
    } else if (!validateMove(c.movie, rowCrit, colCrit)) {
      errs.push(`hücre ${i}: kriterlere uymayan film kabul edildi`);
    }
  });

  // Kilit kuralı: sadece iki tarafın da hakkı bittiyse kilitlenir
  r.cells.forEach((c, i) => {
    if (c?.isLockedNeutral) {
      const a = r.attempts[i];
      if (!(a && a.X && a.O)) errs.push(`hücre ${i}: iki taraf da denemeden kilitlendi`);
    }
  });

  // Kazanan doğrulaması
  if (r.decidedBy === "LINE") {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    const ok = lines.some(l => l.every(i => r.cells[i]?.answeredBy === r.winner && !r.cells[i]?.isLockedNeutral));
    if (!ok) errs.push("3'lü hat olmadan hat galibiyeti ilan edildi");
  }
  if (r.decidedBy === "MAJORITY") {
    const cx = r.cells.filter(c => c?.answeredBy === "X").length;
    const co = r.cells.filter(c => c?.answeredBy === "O").length;
    const expect = cx !== co ? (cx > co ? "X" : "O") : r.rarityX !== r.rarityO ? (r.rarityX > r.rarityO ? "X" : "O") : "X";
    if (expect !== r.winner) errs.push(`Ters Kadraj kazananı yanlış (${cx}-${co}, rarity ${r.rarityX}-${r.rarityO})`);
  }
  if (r.decidedBy === "FOTO_FINISH") {
    if (r.cells.some(c => c === null)) errs.push("Altın Makara tahta dolmadan açıldı");
    const expect = r.rarityX >= r.rarityO ? "X" : "O";
    if (expect !== r.winner) errs.push("foto-finiş yanlış kazanan");
  }
  if (r.decidedBy === "GOLDEN_REEL" && r.cells.some(c => c === null)) errs.push("Altın Makara tahta dolmadan açıldı");

  // Skor tutarlılığı
  const sum = (s: PlayerSymbol) => r.cells.reduce((t, c) => t + (c?.answeredBy === s ? c.rarityScore ?? 0 : 0), 0);
  if (sum("X") !== r.rarityX || sum("O") !== r.rarityO) errs.push("rarity toplamı hücrelerle uyuşmuyor");

  // Hak kuralı: bir hücrede her oyuncu en fazla 1 hak yakar (attempts bayrak olduğundan 2 değerli)
  return errs;
}
