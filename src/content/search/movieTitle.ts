import type { Movie } from "@/core";
import { normalizeCinemaString } from "@/core";

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
