import type { CanonicalCatalog, PersonRoleId, VerificationStatus } from "./types";

export interface CatalogInventory {
  movies: number;
  series: number;
  people: number;
  actors: number;
  directors: number;
  creators: number;
  showrunners: number;
  genres: number;
  credits: number;
  missingYear: number;
  missingGenre: number;
  insufficientMetadata: number;
  ambiguousCredits: number;
  duplicateTitles: number;
}

function peopleWithRole(catalog: CanonicalCatalog, role: PersonRoleId): number {
  return new Set(catalog.credits.filter((credit) => credit.role === role).map((credit) => credit.personId)).size;
}

export function buildInventory(catalog: CanonicalCatalog): CatalogInventory {
  const productions = [...catalog.movies, ...catalog.series];
  const titles = new Map<string, number>();
  for (const production of productions) {
    const key = production.title.trim().toLowerCase();
    titles.set(key, (titles.get(key) ?? 0) + 1);
  }
  const insufficient = (status: VerificationStatus) => status === "INCOMPLETE" || status === "NEEDS_REVIEW";

  return {
    movies: catalog.movies.length,
    series: catalog.series.length,
    people: catalog.people.length,
    actors: peopleWithRole(catalog, "ACTOR"),
    directors: peopleWithRole(catalog, "DIRECTOR"),
    creators: peopleWithRole(catalog, "CREATOR"),
    showrunners: peopleWithRole(catalog, "SHOWRUNNER"),
    genres: new Set(productions.flatMap((production) => production.genreIds)).size,
    credits: catalog.credits.length,
    missingYear: productions.filter((production) => !Number.isInteger(production.year) || production.year <= 0).length,
    missingGenre: productions.filter((production) => production.genreIds.length === 0).length,
    insufficientMetadata: productions.filter((production) => insufficient(production.provenance.verificationStatus)).length,
    ambiguousCredits: catalog.ambiguousCredits.length,
    duplicateTitles: Array.from(titles.values()).filter((count) => count > 1).length,
  };
}
