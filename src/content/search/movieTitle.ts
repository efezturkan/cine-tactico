import type { Movie } from "@/core";
import { normalizeCinemaString } from "@/core";

/**
 * Arama listesinde gösterilecek okunabilir yapım başlığı:
 * - Yabancı alfabeli özgün adları (Kanji/Hangul vb.) tek başına dayatmaz; uluslararası/İngilizce kanonik başlığı korur.
 * - Eski küratörlü kayıtlardaki Türkçe parantez eklerini ("Memento (Akıl Defteri)") İngilizce arayüzde temizler.
 * - "Dune: Part One" gibi alt başlıklı filmlerin "Dune" (1984) ile aynı satır adına çökmesini önler.
 * - Yıl satırda ayrıca gösterilir (aynı adlı yapımları ayırmak için); yönetmen, oyuncu, tür ve ödül gösterilmez.
 */
export function formatMovieDisplayTitle(movie: Movie, locale: "tr" | "en" = "en"): string {
  // Başlığın sonundaki yıl eki ("Korkunç Bir Film (2026)") satırda yıl ayrıca gösterildiği için çıkarılır.
  const rawTitle = (movie.title || movie.originalTitle || "").trim().replace(/\s*\(\d{4}\)$/, "").trim();
  if (!rawTitle) return "";
  if (locale === "tr") {
    return rawTitle;
  }
  // Eski küratörlü kayıtlarda title "The Godfather (Baba)" ve originalTitle "The Godfather" biçimindedir
  const orig = (movie.originalTitle || "").trim();
  if (orig && rawTitle.startsWith(`${orig} (`)) {
    return orig;
  }
  return rawTitle.replace(/\s*\([^)]*[çğıöşüÇĞİÖŞÜ][^)]*\)\s*$/, "").trim() || rawTitle;
}

/** Baştaki "The " eşleşmeyi bozmasın diye karşılaştırmadan düşer ("godfather" → "The Godfather"). */
const LEADING_THE = /^the\s+/;

/**
 * Sorgunun bir yapımla eşleşme derecesi (küçük = daha iyi). Eşleşme yoksa null.
 * Sıra: 0 başlık tam eşleşme, 1 alias tam eşleşme, 2 başlık başlangıç, 3 alias başlangıç,
 * 4 başlık alt-metin, 5 alias alt-metin. Böylece "tam > başlangıç > alt-metin" önceliği korunur;
 * aynı kademede ana başlık alias'tan önce gelir ("Dune" 1984, "Dune: Part One"ın Dune aliasından önce).
 * Başlık, özgün ad ve aliaslar (Türkçe adlar dahil) taranır; Türkçe harf ve aksan normalizasyonu uygulanır.
 * Yönetmen, oyuncu, tür ve yıl aranmaz.
 */
export function movieTitleMatchRank(movie: Movie, query: string): number | null {
  const raw = query.trim().toLowerCase();
  if (raw.length < 2) return null;
  const foldedQuery = normalizeCinemaString(query).replace(LEADING_THE, "");
  const names: { text: string; alias: boolean }[] = [
    { text: movie.title, alias: false },
    // Özgün ad, görünen başlıkla aynı kademede değildir: "Dune: Part One"ın özgün adı "Dune"dur, 1984 Dune'u önce gelmeli.
    { text: movie.originalTitle ?? "", alias: true },
    ...(movie.aliases ?? []).map((text) => ({ text, alias: true })),
  ];
  let best: number | null = null;
  for (const { text, alias } of names) {
    if (!text) continue;
    let kind: number | null = null; // 0 tam, 1 başlangıç, 2 alt-metin
    const folded = normalizeCinemaString(text).replace(LEADING_THE, "");
    if (foldedQuery.length >= 2 && folded.length > 0) {
      if (folded === foldedQuery) kind = 0;
      else if (folded.startsWith(foldedQuery)) kind = 1;
      else if (folded.includes(foldedQuery)) kind = 2;
    }
    if (kind === null && text.toLowerCase().includes(raw)) kind = 2;
    if (kind === null) continue;
    const rank = kind * 2 + (alias ? 1 : 0);
    if (best === null || rank < best) best = rank;
    if (best === 0) break;
  }
  return best;
}

/** Başlık, özgün ad ve yerelleştirilmiş ad. Yönetmen, oyuncu, tür ve yıl aranmaz. */
export function movieMatchesTitleQuery(movie: Movie, query: string): boolean {
  return movieTitleMatchRank(movie, query) !== null;
}

/**
 * Eşleşen yapımları tam eşleşme > başlangıç > alt-metin sırasına dizer.
 * Aynı derecedekiler veri sırasını korur (kararlı sıralama).
 */
export function rankMoviesForQuery(movies: Movie[], query: string): Movie[] {
  const scored: { movie: Movie; rank: number; index: number }[] = [];
  movies.forEach((movie, index) => {
    const rank = movieTitleMatchRank(movie, query);
    if (rank !== null) scored.push({ movie, rank, index });
  });
  scored.sort((a, b) => a.rank - b.rank || a.index - b.index);
  return scored.map((s) => s.movie);
}
