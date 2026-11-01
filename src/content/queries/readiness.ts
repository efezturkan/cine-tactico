import type { ContentIndex } from "./index";
import type { GenreId, PersonRoleId, ReleasePeriodId } from "../types";

function verifiedProductions(index: ContentIndex) {
  return index.productions.filter((production) => production.provenance.verificationStatus === "VERIFIED");
}

function verifiedPerson(index: ContentIndex, personId: string): boolean {
  return index.peopleById.get(personId)?.provenance.verificationStatus === "VERIFIED";
}

export function answersByGenre(index: ContentIndex): { genreId: GenreId; count: number }[] {
  const counts = new Map<GenreId, number>();
  for (const production of verifiedProductions(index)) {
    for (const genreId of production.genreIds) {
      counts.set(genreId, (counts.get(genreId) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries()).map(([genreId, count]) => ({ genreId, count }));
}

export function answersByDecade(index: ContentIndex): { periodId: ReleasePeriodId; count: number }[] {
  const counts = new Map<ReleasePeriodId, number>();
  for (const production of verifiedProductions(index)) {
    if (!production.releasePeriodId) continue;
    counts.set(production.releasePeriodId, (counts.get(production.releasePeriodId) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([periodId, count]) => ({ periodId, count }));
}

function answersByRole(index: ContentIndex, role: PersonRoleId): { personId: string; count: number }[] {
  const counts = new Map<string, number>();
  const verifiedIds = new Set(verifiedProductions(index).map((production) => production.id));
  for (const credit of index.catalog.credits) {
    if (credit.role !== role || !verifiedIds.has(credit.productionId)) continue;
    if (!verifiedPerson(index, credit.personId)) continue;
    counts.set(credit.personId, (counts.get(credit.personId) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([personId, count]) => ({ personId, count }));
}

export function answersByActor(index: ContentIndex): { personId: string; count: number }[] {
  return answersByRole(index, "ACTOR");
}

export function answersByDirector(index: ContentIndex): { personId: string; count: number }[] {
  return answersByRole(index, "DIRECTOR");
}

export function sharedVerifiedActorCount(index: ContentIndex, productionIdA: string, productionIdB: string): number {
  const ids = (productionId: string) =>
    new Set(
      (index.creditsByProduction.get(productionId) ?? [])
        .filter((credit) => credit.role === "ACTOR" && verifiedPerson(index, credit.personId))
        .map((credit) => credit.personId)
    );
  const left = ids(productionIdA);
  let count = 0;
  ids(productionIdB).forEach((id) => {
    if (left.has(id)) count += 1;
  });
  return count;
}

export function answersForGenreAndDecade(
  index: ContentIndex,
  genreId: GenreId,
  periodId: ReleasePeriodId
): number {
  return verifiedProductions(index).filter(
    (production) => production.genreIds.includes(genreId) && production.releasePeriodId === periodId
  ).length;
}

export function answersForPersonAndGenre(
  index: ContentIndex,
  personId: string,
  role: Extract<PersonRoleId, "ACTOR" | "DIRECTOR">,
  genreId: GenreId
): number {
  if (!verifiedPerson(index, personId)) return 0;
  const verifiedIds = new Set(verifiedProductions(index).map((production) => production.id));
  return index.catalog.credits.filter((credit) => {
    if (credit.personId !== personId || credit.role !== role || !verifiedIds.has(credit.productionId)) return false;
    const production = index.productions.find((item) => item.id === credit.productionId);
    return Boolean(production?.genreIds.includes(genreId));
  }).length;
}
