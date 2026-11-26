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

/** Satır kriteri eşikleri: en az bu kadar yapımı olan yönetmen/oyuncu satır olabilir. */
export const DIRECTOR_ROW_MIN_FILMS = 5;
export const ACTOR_ROW_MIN_FILMS = 7;

function buildPools(): CriteriaPools {
  const count = (xs: string[]) => {
    const m = new Map<string, number>();
    for (const x of xs) if (x) m.set(x, (m.get(x) ?? 0) + 1);
    return m;
  };
  const directors = Array.from(count(MOVIES_DATABASE.map(m => m.director)).entries()).filter(([, n]) => n >= DIRECTOR_ROW_MIN_FILMS);
  const actors = Array.from(count(MOVIES_DATABASE.flatMap(m => m.cast)).entries()).filter(([, n]) => n >= ACTOR_ROW_MIN_FILMS);

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

/**
 * TERS KADRAJ (ortak oyuncu) için katalogtan tahta üretimi.
 * 3 satır filmi ile 3 sütun filmi seçilir; her satır-sütun çiftinin en az `minShared` ortak oyuncusu vardır; 9 hücrenin toplam cevap sayısı en az `minTotal` olur (çoğu hücrede birden fazla doğru cevap).
 * Satır ve sütun filmleri birbirinden farklıdır, başlıklar katalogda tektir (cevap araması başlıkla yapılır).
 * Aynı `seed` aynı tahtayı verir.
 */
let reversePoolCache: { films: typeof MOVIES_DATABASE; byActor: Map<string, number[]>; hubs: number[] } | null = null;

function getReversePool() {
  if (reversePoolCache) return reversePoolCache;
  const titleCount = new Map<string, number>();
  for (const m of MOVIES_DATABASE) {
    const t = m.title.toLowerCase();
    titleCount.set(t, (titleCount.get(t) ?? 0) + 1);
  }
  const films = MOVIES_DATABASE.filter(m => (m.cast?.length ?? 0) >= 5 && titleCount.get(m.title.toLowerCase()) === 1);
  const byActor = new Map<string, number[]>();
  films.forEach((m, i) => m.cast.forEach(a => byActor.set(a, [...(byActor.get(a) ?? []), i])));
  // Sütun filmi adayları: en çok başka filmle ≥2 ortak oyuncusu olanlar (rastgele film çoğu zaman uygun satır bulamaz)
  const degree = films.map((m, i) => {
    const hits = new Map<number, number>();
    m.cast.forEach(a => (byActor.get(a) ?? []).forEach(j => j !== i && hits.set(j, (hits.get(j) ?? 0) + 1)));
    let d = 0;
    hits.forEach(n => n >= 2 && d++);
    return { i, d };
  });
  const hubs = degree.sort((a, b) => b.d - a.d).slice(0, 700).map(x => x.i);
  reversePoolCache = { films, byActor, hubs };
  return reversePoolCache;
}

export function generateReverseBoard(seed: number, minShared = 1, minTotal = 14): GameBoard | null {
  const { films, byActor, hubs } = getReversePool();
  const rng = makeSeededRng(seed);
  const shared = (a: number, b: number) => {
    const cb = new Set(films[b].cast);
    return films[a].cast.filter(x => cb.has(x)).length;
  };

  for (let attempt = 0; attempt < 3000; attempt++) {
    const cols = pickDistinct(hubs, 3, rng);
    // Sütun filmlerinin hepsiyle yeterli ortak oyuncusu olan adaylar
    const counts = new Map<number, number>();
    for (const c of cols) {
      const seen = new Set<number>();
      films[c].cast.forEach(a => (byActor.get(a) ?? []).forEach(i => seen.add(i)));
      seen.forEach(i => counts.set(i, (counts.get(i) ?? 0) + 1));
    }
    const eligible = Array.from(counts.entries())
      .filter(([i, n]) => n === 3 && !cols.includes(i) && cols.every(c => shared(i, c) >= minShared))
      .map(([i]) => i);
    if (eligible.length < 3) continue;
    const rows = pickDistinct(eligible, 3, rng);
    const board: GameBoard = {
      id: `genrev_${seed}`,
      title: `${films[rows[0]].title} · ${films[rows[1]].title} · ${films[rows[2]].title}`,
      difficulty: "MEDIUM",
      boardMode: "REVERSE_CAST",
      rows: rows.map((f, i) => ({ id: `gr${seed}_r${i}`, type: "MOVIE_INTERSECTION", label: films[f].title, value: films[f].title })),
      cols: cols.map((f, i) => ({ id: `gr${seed}_c${i}`, type: "MOVIE_INTERSECTION", label: films[f].title, value: films[f].title })),
      validCounts: {},
    };
    board.validCounts = calculateBoardValidCounts(board);
    const vc = Object.values(board.validCounts);
    if (vc.every(n => n >= minShared) && vc.reduce((a, b) => a + b, 0) >= minTotal) return board;
  }
  return null;
}
