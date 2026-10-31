import { CellAnswer, GameBoard, Movie, PlayerSymbol } from "@/types/game";
import { findMatchingMovies } from "./validator";
import { WINNING_LINES } from "./rules";

export type BotDifficulty = "EASY" | "MEDIUM" | "HARD";

export interface BotMoveDecision {
  cellIndex: number;
  movie: Movie | null;
}

/**
 * İnsan benzeri organik durum mesajları havuzu.
 * Botun hamle yaparken robotik görünmesini engeller.
 */
export const BOT_THINKING_PHRASES = [
  "Filmleri hatırlıyor...",
  "Matrisi inceliyor...",
  "Film arşivini tarıyor...",
  "Kriterleri eşleştiriyor...",
  "Hafızasını yokluyor...",
  "Aday filmleri eliyor...",
  "Kült filmleri düşünüyor...",
  "Hamlesini hazırlıyor...",
];

export function getRandomThinkingPhrase(): string {
  return BOT_THINKING_PHRASES[Math.floor(Math.random() * BOT_THINKING_PHRASES.length)];
}

/**
 * Botun insan gibi doğal, rastgele ve değişken sürelerde hamle yapmasını sağlar.
 * Robotik sabit zamanlamayı kırar:
 * Bazen anında hatırlar (hızlı hamle), bazen düşünür, bazen de hafızasını zorlar (derin düşünme).
 */
export function getBotThinkingDelay(difficulty: BotDifficulty = "MEDIUM"): number {
  const roll = Math.random();

  if (difficulty === "HARD") {
    // HARD: Usta sinefil (ortalama 2.5s - 4.5s)
    // %40 Hızlı hamle (bilgisi taze): 1.4s - 2.4s
    // %45 Standart analiz: 2.5s - 4.2s
    // %15 Taktiksel tereddüt / blok tartma: 4.3s - 6.0s
    if (roll < 0.4) return 1400 + Math.random() * 1000;
    if (roll < 0.85) return 2500 + Math.random() * 1700;
    return 4300 + Math.random() * 1700;
  }

  if (difficulty === "MEDIUM") {
    // MEDIUM: Meraklı sinefil (ortalama 3.0s - 5.5s)
    // %30 Anında aklına gelir: 1.8s - 3.0s
    // %50 Normal düşünme süresi: 3.2s - 5.2s
    // %20 Kararsızlık / hafıza zorlama: 5.3s - 7.5s
    if (roll < 0.3) return 1800 + Math.random() * 1200;
    if (roll < 0.8) return 3200 + Math.random() * 2000;
    return 5300 + Math.random() * 2200;
  }

  // EASY: Acemi sinefil (ortalama 3.5s - 6.5s)
  // %25 Popüler film hemen aklına geldi: 2.0s - 3.4s
  // %50 Düşünceli / bocalama: 3.5s - 6.2s
  // %25 Ciddi tereddüt / neredeyse süre bitiyor: 6.3s - 8.8s
  if (roll < 0.25) return 2000 + Math.random() * 1400;
  if (roll < 0.75) return 3500 + Math.random() * 2700;
  return 6300 + Math.random() * 2500;
}

/**
 * Belirli bir kare için tahtadaki satır ve sütun kriterlerine uyan
 * ve henüz kullanılmamış filmleri listeler.
 */
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

/**
 * Yapay Zeka Hamle Karar Motoru
 * Her turda geçerli bir hamle bulmayı garanti eder.
 * Taktiksel kazanma, bloklama ve merkez/köşe stratejilerini zorluğa göre uygular.
 */
export function calculateBotMove(
  board: GameBoard,
  cells: readonly (CellAnswer | null)[],
  usedMovieIds: string[],
  difficulty: BotDifficulty = "MEDIUM",
  botSymbol: PlayerSymbol = "O"
): BotMoveDecision | null {
  const emptyCellIndices: number[] = [];
  cells.forEach((cell, idx) => {
    if (cell === null) emptyCellIndices.push(idx);
  });

  if (emptyCellIndices.length === 0) return null;

  const opponentSymbol: PlayerSymbol = botSymbol === "X" ? "O" : "X";

  // 1. BOT TEK HAMLEDE KAZANABİLİYOR MU? (HARD %100, MEDIUM %90, EASY %40)
  const shouldWin =
    difficulty === "HARD" ||
    (difficulty === "MEDIUM" && Math.random() < 0.9) ||
    (difficulty === "EASY" && Math.random() < 0.4);

  if (shouldWin) {
    for (const combo of WINNING_LINES) {
      const [a, b, c] = combo;
      const vals = [cells[a], cells[b], cells[c]];
      const botMarks = vals.filter(v => v?.answeredBy === botSymbol).length;
      const nulls = vals.filter(v => v === null).length;

      if (botMarks === 2 && nulls === 1) {
        const candidate = [a, b, c].find(idx => cells[idx] === null);
        if (candidate !== undefined) {
          const movies = getAvailableMoviesForCell(board, candidate, usedMovieIds);
          if (movies.length > 0) {
            // HARD modda en yüksek IMDb puanlı filmi seçer
            const chosenMovie =
              difficulty === "HARD"
                ? [...movies].sort((x, y) => y.imdbRating - x.imdbRating)[0]
                : movies[Math.floor(Math.random() * movies.length)];
            return { cellIndex: candidate, movie: chosenMovie };
          }
        }
      }
    }
  }

  // 2. RAKİP KAZANACAKSA BLOKLA!
  // HARD her zaman bloklar (%100), MEDIUM %85 ihtimalle, EASY %35 ihtimalle
  const shouldBlock =
    difficulty === "HARD" ||
    (difficulty === "MEDIUM" && Math.random() < 0.85) ||
    (difficulty === "EASY" && Math.random() < 0.35);

  if (shouldBlock) {
    for (const combo of WINNING_LINES) {
      const [a, b, c] = combo;
      const vals = [cells[a], cells[b], cells[c]];
      const opponentMarks = vals.filter(v => v?.answeredBy === opponentSymbol).length;
      const nulls = vals.filter(v => v === null).length;

      if (opponentMarks === 2 && nulls === 1) {
        const candidate = [a, b, c].find(idx => cells[idx] === null);
        if (candidate !== undefined) {
          const movies = getAvailableMoviesForCell(board, candidate, usedMovieIds);
          if (movies.length > 0) {
            const chosenMovie =
              difficulty === "HARD"
                ? [...movies].sort((x, y) => y.imdbRating - x.imdbRating)[0]
                : movies[Math.floor(Math.random() * movies.length)];
            return { cellIndex: candidate, movie: chosenMovie };
          }
        }
      }
    }
  }

  // 3. OYNANABİLİR TÜM BOŞ KARELERİ VE FİLMLERİNİ DERLE
  const playableCells = emptyCellIndices
    .map(idx => ({
      idx,
      movies: getAvailableMoviesForCell(board, idx, usedMovieIds),
    }))
    .filter(item => item.movies.length > 0);

  // Tahtada geçerli filmi olan hiçbir boş kare kalmadıysa
  if (playableCells.length === 0) {
    return null;
  }

  // 4. STRATEJİK HÜCRE SEÇİMİ (ZORLUĞA GÖRE)
  let chosenTarget: { idx: number; movies: Movie[] };

  if (difficulty === "HARD") {
    // HARD: Merkez (4) > Köşeler (0, 2, 6, 8) > Kenarlar (1, 3, 5, 7)
    const center = playableCells.find(p => p.idx === 4);
    const corners = playableCells.filter(p => [0, 2, 6, 8].includes(p.idx));

    if (center) {
      chosenTarget = center;
    } else if (corners.length > 0) {
      chosenTarget = corners[Math.floor(Math.random() * corners.length)];
    } else {
      chosenTarget = playableCells[Math.floor(Math.random() * playableCells.length)];
    }
  } else if (difficulty === "MEDIUM") {
    // MEDIUM: %65 oranla merkez veya köşe seçer, yoksa rastgele oynar
    const center = playableCells.find(p => p.idx === 4);
    const corners = playableCells.filter(p => [0, 2, 6, 8].includes(p.idx));

    if (center && Math.random() < 0.65) {
      chosenTarget = center;
    } else if (corners.length > 0 && Math.random() < 0.65) {
      chosenTarget = corners[Math.floor(Math.random() * corners.length)];
    } else {
      chosenTarget = playableCells[Math.floor(Math.random() * playableCells.length)];
    }
  } else {
    // EASY: Rastgele oynanabilir bir kare seçer
    chosenTarget = playableCells[Math.floor(Math.random() * playableCells.length)];
  }

  // HARD seviye prestijli filmleri öne çıkarır
  const chosenMovie =
    difficulty === "HARD"
      ? [...chosenTarget.movies].sort((x, y) => y.imdbRating - x.imdbRating)[0]
      : chosenTarget.movies[Math.floor(Math.random() * chosenTarget.movies.length)];

  return { cellIndex: chosenTarget.idx, movie: chosenMovie };
}
