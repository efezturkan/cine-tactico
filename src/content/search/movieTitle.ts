import type { Movie } from "@/core";
import { normalizeCinemaString } from "@/core";

/**
 * Arama listesinde gösterilecek okunabilir yapım başlığı:
 * - Yabancı alfabeli özgün adları (Kanji/Hangul vb.) tek başına dayatmaz; uluslararası/İngilizce kanonik başlığı korur.
 * - Eski küratörlü kayıtlardaki Türkçe parantez eklerini ("Memento (Akıl Defteri)") İngilizce arayüzde temizler.
 * - "Dune: Part One" gibi alt başlıklı filmlerin "Dune" (1984) ile aynı satır adına çökmesini önler.
 * - Adil oyun kuralı gereği yıl, tür, yönetmen veya ödül bilgisi sızdırmaz.
 */
export function formatMovieDisplayTitle(movie: Movie, locale: "tr" | "en" = "en"): string {
  const rawTitle = (movie.title || movie.originalTitle || "").trim();
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

/** Başlık, özgün ad ve yerelleştirilmiş ad. Yönetmen, oyuncu, tür ve yıl aranmaz. */
export function movieMatchesTitleQuery(movie: Movie, query: string): boolean {
  const raw = query.trim().toLowerCase();
  if (raw.length < 2) return false;
  const foldedQuery = normalizeCinemaString(query);
  const names = [movie.title, movie.originalTitle, ...(movie.aliases ?? [])];
  return names.some((name) => {
    if (!name) return false;
    if (name.toLowerCase().includes(raw)) return true;
    const folded = normalizeCinemaString(name);
    return folded.length > 0 && foldedQuery.length >= 2 && folded.includes(foldedQuery);
  });
}
