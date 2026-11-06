import { Criterion, GameBoard } from "@/core";
import { isMovieMatchingCriterion } from "@/core/engine/validator";
import { calculateBoardValidCounts } from "@/core/engine/board-generator";
import { MOVIES_DATABASE } from "@/content/adapters/gameCatalog";
import { makeSeededRng } from "@/utils/seededRng";

/**
 * KATALOGTAN OTOMATİK TAHTA ÜRETİMİ
 * Her hücresinde en az `minAnswers` geçerli cevabı olan, 9 hücreye 9 farklı filmin
 * aynı anda yerleştirilebildiği (Hall koşulu) 3×3 tahtalar üretir. Aynı tohum aynı tahtayı verir
 * (Günün Kadrası için dünya genelinde tek tahta).
 */

const GENRE_LABELS: Record<string, string> = {
  Drama: "Dram",
  Action: "Aksiyon",
  Adventure: "Macera",
  "Sci-Fi": "Bilim Kurgu",
  Comedy: "Komedi",
  Thriller: "Gerilim",
  Fantasy: "Fantastik",
  Crime: "Suç (Crime)",
  Romance: "Romantik",
  Mystery: "Gizem",
  Horror: "Korku",
};

const DECADES: Criterion[] = [
  { type: "DECADE", label: "2010 Sonrası", value: "2010s+" },
  { type: "DECADE", label: "2000'ler", value: "2000s" },
  { type: "DECADE", label: "90'lar", value: "1990s" },
  { type: "DECADE", label: "80'ler ve Öncesi", value: "1980s-" },
];

const AWARDS: Criterion[] = [
  { type: "AWARD", label: "Oscar Kazandı", value: "OSCAR" },
  { type: "AWARD", label: "Oscar Kazanmadı", value: "NO_OSCAR" },
];

interface CriteriaPools {
  rows: Criterion[];
  cols: Criterion[];
  sets: Map<string, Set<string>>;
}

let poolCache: CriteriaPools | null = null;

function keyOf(c: Criterion): string {
  return `${c.type}:${c.value}`;
}

function buildPools(): CriteriaPools {
  const count = (xs: string[]) => {
    const m = new Map<string, number>();
    for (const x of xs) if (x) m.set(x, (m.get(x) ?? 0) + 1);
    return m;
  };
  const directors = Array.from(count(MOVIES_DATABASE.map(m => m.director)).entries()).filter(([, n]) => n >= 5);
  const actors = Array.from(count(MOVIES_DATABASE.flatMap(m => m.cast)).entries()).filter(([, n]) => n >= 8);

  const rows: Criterion[] = [
    ...directors.map(([name]): Criterion => ({ type: "DIRECTOR", label: name, value: name })),
    ...actors.map(([name]): Criterion => ({ type: "ACTOR", label: name, value: name })),
  ];
  const genreCounts = count(MOVIES_DATABASE.flatMap(m => m.genres));
  const cols: Criterion[] = [
    ...Object.entries(GENRE_LABELS)
      .filter(([g]) => (genreCounts.get(g) ?? 0) >= 40)
      .map(([g, label]): Criterion => ({ type: "GENRE", label, value: g })),
    ...DECADES,
    ...AWARDS,
  ];

  const sets = new Map<string, Set<string>>();
  for (const c of [...rows, ...cols]) {
    sets.set(keyOf(c), new Set(MOVIES_DATABASE.filter(m => isMovieMatchingCriterion(m, c)).map(m => m.id)));
  }
  return { rows, cols, sets };
}

function getPools(): CriteriaPools {
  if (!poolCache) poolCache = buildPools();
  return poolCache;
}

function intersect(a: Set<string>, b: Set<string>): string[] {
  const out: string[] = [];
  a.forEach(id => b.has(id) && out.push(id));
  return out;
}

/** 9 hücreye 9 farklı film atanabiliyor mu? (en çok eşleşme / artırıcı yol) */
function canFillWithDistinctMovies(cellOptions: string[][]): boolean {
  const owner = new Map<string, number>();
  const tryAssign = (cell: number, seen: Set<string>): boolean => {
    for (const id of cellOptions[cell]) {
      if (seen.has(id)) continue;
      seen.add(id);
      const cur = owner.get(id);
      if (cur === undefined || tryAssign(cur, seen)) {
        owner.set(id, cell);
        return true;
      }
    }
    return false;
  };
  for (let c = 0; c < cellOptions.length; c++) {
    if (!tryAssign(c, new Set())) return false;
  }
  return true;
}

function pickDistinct<T>(pool: T[], n: number, rng: () => number): T[] {
  const copy = [...pool];
  const out: T[] = [];
  while (out.length < n && copy.length > 0) out.push(copy.splice(Math.floor(rng() * copy.length), 1)[0]);
  return out;
}

/** "Robert Downey Jr." -> "Downey"; "Christopher Nolan" -> "Nolan" */
function surname(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  while (parts.length > 1 && /^(jr\.?|sr\.?|ii|iii|iv)$/i.test(parts[parts.length - 1])) parts.pop();
  return parts[parts.length - 1];
}

export interface GeneratedBoardOptions {
  minAnswers?: number;
  /** Seans alt başlığı için mod etiketi */
  difficulty?: GameBoard["difficulty"];
}

/** Aynı `seed` her zaman aynı tahtayı döner. Uygun tahta bulunamazsa null (çağıran güvenli tahtaya düşer). */
export function generateSolvableBoard(seed: number, opts: GeneratedBoardOptions = {}): GameBoard | null {
  const minAnswers = opts.minAnswers ?? 3;
  const { rows: rowPool, cols: colPool, sets } = getPools();
  const rng = makeSeededRng(seed);

  const overlap = (r: Criterion, c: Criterion) => intersect(sets.get(keyOf(r))!, sets.get(keyOf(c))!);

  for (let attempt = 0; attempt < 400; attempt++) {
    // Önce 3 sütun seçilir, sonra her sütunda yeterli cevabı olan satırlar aday olur (rastgele deneme yerine eleme)
    const cols = pickDistinct(colPool, 3, rng);
    // Aynı türden üç sütun (örn. üç tür) tahtayı tekdüze yapar: en az iki farklı tür
    if (new Set(cols.map(c => c.type)).size < 2) continue;
    const eligible = rowPool.filter(r => cols.every(c => overlap(r, c).length >= minAnswers));
    if (eligible.length < 3) continue;

    let cellOptions: string[][] = [];
    let rows: Criterion[] = [];
    let solved = false;
    for (let tries = 0; tries < 8 && !solved; tries++) {
      rows = pickDistinct(eligible, 3, rng);
      cellOptions = rows.flatMap(r => cols.map(c => overlap(r, c)));
      solved = canFillWithDistinctMovies(cellOptions);
    }
    if (!solved) continue;

    const board: GameBoard = {
      id: `gen_${seed}`,
      // Soyadlar: dilden bağımsız, her dilde doğru görünür ve başlık satırına sığar
      title: rows.map(r => surname(r.label)).join(" · "),
      difficulty: opts.difficulty ?? "MEDIUM",
      boardMode: "CLASSIC",
      rows: rows.map((r, i) => ({ ...r, id: `g${seed}_r${i}` })),
      cols: cols.map((c, i) => ({ ...c, id: `g${seed}_c${i}` })),
      validCounts: {},
    };
    board.validCounts = calculateBoardValidCounts(board);
    return board;
  }
  return null;
}
