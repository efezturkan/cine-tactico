import { CellAnswer, GameBoard, Movie, PlayerSymbol, BotDifficulty } from "../types";
import { findMatchingMovies, getSharedActorsRanked, actorFame } from "./validator";
import { WINNING_LINES } from "./rules";
import type { AttemptsPerCell } from "./session";

export type { BotDifficulty };

export interface BotMoveDecision {
  cellIndex: number;
  movie: Movie | null;
  actorName?: string;
  /** Bot bu karede hiçbir doğru cevabı hatırlayamadı: deneme hakkını yakar, sıra rakibe geçer */
  miss?: boolean;
}

/**
 * BOT BECERİSİ (satranç botlarındaki "seviye" mantığı):
 * - recall: tanınmış bir cevabı hatırlama olasılığı (bilgi genişliği)
 * - cult: az bilinen / kült bir cevabı hatırlama olasılığı (derinlik)
 * - attack / defend: kazanma hamlesini görme / rakibin hattını kapatma olasılığı
 * - informed: hatırladığı cevaplardan oluşan kareyi seçme olasılığı (taktik disiplini)
 */
export interface BotSkill {
  recall: number;
  cult: number;
  attack: number;
  defend: number;
  informed: number;
}

export const BOT_SKILLS: Record<BotDifficulty, BotSkill> = {
  EASY: { recall: 0.5, cult: 0.05, attack: 0.4, defend: 0.3, informed: 0.2 },
  MEDIUM: { recall: 0.75, cult: 0.2, attack: 0.85, defend: 0.75, informed: 0.55 },
  HARD: { recall: 0.98, cult: 0.85, attack: 1, defend: 1, informed: 1 },
};

export function getBotSkill(difficulty: BotDifficulty, override?: Partial<BotSkill>): BotSkill {
  return { ...BOT_SKILLS[difficulty], ...(override ?? {}) };
}

/** Bir filmin ne kadar "herkesin bildiği" bir film olduğu (0-1). */
export function movieFame(movie: Movie): number {
  let f = 0.55;
  if (movie.boxOfficeCategory === "BLOCKBUSTER") f = 1;
  else if (movie.boxOfficeCategory === "INDIE") f = 0.3;
  if (movie.hasOscar) f += 0.2;
  f += movie.year >= 2000 ? 0.1 : -0.05;
  return Math.max(0.15, Math.min(1, f));
}

function knows(fame: number, skill: BotSkill, rand: () => number): boolean {
  const p = skill.recall * fame + skill.cult * (1 - fame);
  return rand() < Math.max(0, Math.min(1, p));
}

/**
 * Botun insan gibi doğal, rastgele ve değişken sürelerde hamle yapmasını sağlar.
 */
export function getBotThinkingDelay(difficulty: BotDifficulty = "MEDIUM"): number {
  const roll = Math.random();

  if (difficulty === "HARD") {
    if (roll < 0.4) return 1400 + Math.random() * 1000;
    if (roll < 0.85) return 2500 + Math.random() * 1700;
    return 4300 + Math.random() * 1700;
  }

  if (difficulty === "MEDIUM") {
    if (roll < 0.3) return 1800 + Math.random() * 1200;
    if (roll < 0.8) return 3200 + Math.random() * 2000;
    return 5300 + Math.random() * 2200;
  }

  if (roll < 0.25) return 2000 + Math.random() * 1400;
  if (roll < 0.75) return 3500 + Math.random() * 2700;
  return 6300 + Math.random() * 2500;
}

export function getAvailableMoviesForCell(
  board: GameBoard,
  cellIndex: number,
  usedMovieIds: string[]
): Movie[] {
  const rowIndex = Math.floor(cellIndex / 3);
  const colIndex = cellIndex % 3;
  return findMatchingMovies(board.rows[rowIndex], board.cols[colIndex]).filter(
    m => !usedMovieIds.includes(m.id)
  );
}

function pick<T>(arr: readonly T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

/**
 * Botun seçimi: zor bot en az bilinen (en yüksek puanlı) cevabı, kolay bot en tanınmış olanı seçer.
 */
function chooseMovie(candidates: Movie[], difficulty: BotDifficulty, rand: () => number): Movie {
  if (difficulty === "HARD") return [...candidates].sort((a, b) => movieFame(a) - movieFame(b))[0];
  if (difficulty === "EASY") return [...candidates].sort((a, b) => movieFame(b) - movieFame(a))[0];
  return pick(candidates, rand);
}

export function calculateBotMove(
  board: GameBoard,
  cells: readonly (CellAnswer | null)[],
  usedMovieIds: string[],
  difficulty: BotDifficulty = "MEDIUM",
  botSymbol: PlayerSymbol = "O",
  attempts: AttemptsPerCell = {},
  skillOverride?: Partial<BotSkill>,
  rand: () => number = Math.random
): BotMoveDecision | null {
  const skill = getBotSkill(difficulty, skillOverride);
  const opponentSymbol: PlayerSymbol = botSymbol === "X" ? "O" : "X";

  // Bot da insan gibi tek hak kuralına tabidir: yaktığı kareye geri dönmez.
  const openCells: number[] = [];
  cells.forEach((cell, idx) => {
    if (cell === null && !attempts[idx]?.[botSymbol]) openCells.push(idx);
  });
  if (openCells.length === 0) return null;

  // ── TERS KADRAJ ───────────────────────────────────────────────
  if (board.boardMode === "REVERSE_CAST") {
    const options = openCells
      .map(idx => {
        const ranked = getSharedActorsRanked(
          board.rows[Math.floor(idx / 3)].value,
          board.cols[idx % 3].value
        );
        const recalled = ranked.filter(r => knows(actorFame(r.avgIndex), skill, rand));
        return { idx, ranked, recalled };
      })
      .filter(o => o.ranked.length > 0);
    if (options.length === 0) return null;

    const informedOptions = options.filter(o => o.recalled.length > 0);
    const useInformed = informedOptions.length > 0 && rand() < skill.informed;
    const target = useInformed ? pick(informedOptions, rand) : pick(options, rand);
    if (target.recalled.length === 0) return { cellIndex: target.idx, movie: null, miss: true };
    // Zor bot kadronun ucundaki (nadir) oyuncuyu, kolay bot baş rolü seçer.
    const sorted = [...target.recalled].sort((a, b) => a.avgIndex - b.avgIndex);
    const chosen = difficulty === "HARD" ? sorted[sorted.length - 1] : difficulty === "EASY" ? sorted[0] : pick(sorted, rand);
    return { cellIndex: target.idx, movie: null, actorName: chosen.actor };
  }

  // ── FİLM MODLARI ───────────────────────────────────────────────
  const options = openCells
    .map(idx => {
      const available = getAvailableMoviesForCell(board, idx, usedMovieIds);
      const recalled = available.filter(m => knows(movieFame(m), skill, rand));
      return { idx, available, recalled };
    });
  // Kalan filmleri tükenmiş kareler de seçenektir: bot orada ıskalar ve hakkı yanar.
  // Sessizce sıra geçmez; aksi halde iki bot (veya bot ve AFK oyuncu) maçı sonsuza uzatabilir.

  const tryLine = (mark: PlayerSymbol): BotMoveDecision | null => {
    for (const combo of WINNING_LINES) {
      const vals = combo.map(i => cells[i]);
      const marks = vals.filter(v => v?.answeredBy === mark).length;
      const empties = combo.filter(i => cells[i] === null);
      if (marks === 2 && empties.length === 1) {
        const o = options.find(x => x.idx === empties[0]);
        if (o && o.recalled.length > 0) {
          return { cellIndex: o.idx, movie: chooseMovie(o.recalled, difficulty, rand) };
        }
      }
    }
    return null;
  };

  if (rand() < skill.attack) {
    const win = tryLine(botSymbol);
    if (win) return win;
  }
  if (rand() < skill.defend) {
    const block = tryLine(opponentSymbol);
    if (block) return block;
  }

  // Taktik: merkez ve köşeler değerlidir (zor bot bunu bilir).
  const informedOptions = options.filter(o => o.recalled.length > 0);
  const useInformed = informedOptions.length > 0 && rand() < skill.informed;
  const pool = useInformed ? informedOptions : options;
  const center = pool.find(o => o.idx === 4);
  const corners = pool.filter(o => [0, 2, 6, 8].includes(o.idx));
  const positional = skill.informed >= 0.6 ? 0.7 : 0.1;
  let target: (typeof options)[number];
  if (center && rand() < positional) target = center;
  else if (corners.length > 0 && rand() < positional) target = pick(corners, rand);
  else target = pick(pool, rand);

  if (target.recalled.length === 0) return { cellIndex: target.idx, movie: null, miss: true };
  return { cellIndex: target.idx, movie: chooseMovie(target.recalled, difficulty, rand) };
}
