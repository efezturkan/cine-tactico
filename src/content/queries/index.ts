import { normalizeForSearch } from "../search/normalize";
import type {
  AwardId,
  CanonicalCatalog,
  Credit,
  FranchiseId,
  GenreId,
  MovieEntity,
  Person,
  ReleasePeriodId,
  TvSeriesEntity,
} from "../types";

export type Production = MovieEntity | TvSeriesEntity;

export type ContentCriterion =
  | { kind: "GENRE"; genreId: GenreId }
  | { kind: "YEAR_RANGE"; from: number; to: number }
  | { kind: "DIRECTOR_NAME"; name: string }
  | { kind: "ACTOR_NAME"; name: string }
  | { kind: "FRANCHISE"; franchiseId: FranchiseId }
  | { kind: "AWARD"; awardId: AwardId }
  | { kind: "RELEASE_PERIOD"; periodId: ReleasePeriodId }
  | { kind: "CONTENT_TYPE"; contentType: "MOVIE" | "TV_SERIES" }
  | { kind: "COUNTRY"; countryId: string };

export interface ContentIndex {
  catalog: CanonicalCatalog;
  productions: Production[];
  peopleById: Map<string, Person>;
  creditsByProduction: Map<string, Credit[]>;
  personIdByName: Map<string, string>;
  productionIdsByTitle: Map<string, string[]>;
}

export function indexCatalog(catalog: CanonicalCatalog): ContentIndex {
  const productions = [...catalog.movies, ...catalog.series];
  const peopleById = new Map(catalog.people.map((person) => [person.id, person]));
  const creditsByProduction = new Map<string, Credit[]>();
  const personIdByName = new Map<string, string>();
  const productionIdsByTitle = new Map<string, string[]>();

  for (const person of catalog.people) {
    personIdByName.set(normalizeForSearch(person.name), person.id);
  }
  for (const alias of catalog.aliases) {
    if (alias.entityType === "PERSON") personIdByName.set(alias.normalized, alias.entityId);
  }
  for (const production of productions) {
    const key = normalizeForSearch(production.title);
    const bucket = productionIdsByTitle.get(key) ?? [];
    bucket.push(production.id);
    productionIdsByTitle.set(key, bucket);
  }
  for (const alias of catalog.aliases) {
    if (alias.entityType === "PERSON") continue;
    const bucket = productionIdsByTitle.get(alias.normalized) ?? [];
    if (!bucket.includes(alias.entityId)) bucket.push(alias.entityId);
    productionIdsByTitle.set(alias.normalized, bucket);
  }
  for (const credit of catalog.credits) {
    const bucket = creditsByProduction.get(credit.productionId) ?? [];
    bucket.push(credit);
    creditsByProduction.set(credit.productionId, bucket);
  }

  return { catalog, productions, peopleById, creditsByProduction, personIdByName, productionIdsByTitle };
}

function personIdFor(index: ContentIndex, name: string): string | undefined {
  return index.personIdByName.get(normalizeForSearch(name));
}

function matches(index: ContentIndex, production: Production, criterion: ContentCriterion): boolean {
  switch (criterion.kind) {
    case "GENRE":
      return production.genreIds.includes(criterion.genreId);
    case "YEAR_RANGE":
      return production.year >= criterion.from && production.year <= criterion.to;
    case "FRANCHISE":
      return production.franchiseId === criterion.franchiseId;
    case "AWARD":
      return production.awardIds.includes(criterion.awardId);
    case "RELEASE_PERIOD":
      return production.releasePeriodId === criterion.periodId;
    case "CONTENT_TYPE":
      return production.contentType === criterion.contentType;
    case "COUNTRY":
      return production.countryIds.includes(criterion.countryId);
    case "DIRECTOR_NAME":
    case "ACTOR_NAME": {
      const personId = personIdFor(index, criterion.name);
      if (!personId) return false;
      const role = criterion.kind === "DIRECTOR_NAME" ? "DIRECTOR" : "ACTOR";
      return (index.creditsByProduction.get(production.id) ?? []).some(
        (credit) => credit.personId === personId && credit.role === role
      );
    }
    default:
      return false;
  }
}

export function findProductions(index: ContentIndex, criteria: ContentCriterion[]): Production[] {
  return index.productions.filter((production) =>
    criteria.every((criterion) => matches(index, production, criterion))
  );
}

export function countIntersection(index: ContentIndex, criteria: ContentCriterion[]): number {
  return findProductions(index, criteria).length;
}

export function findSharedActors(
  index: ContentIndex,
  productionIdA: string,
  productionIdB: string
): Person[] {
  const actorsOf = (productionId: string) =>
    new Set(
      (index.creditsByProduction.get(productionId) ?? [])
        .filter((credit) => credit.role === "ACTOR")
        .map((credit) => credit.personId)
    );
  const shared = Array.from(actorsOf(productionIdA)).filter((id) => actorsOf(productionIdB).has(id));
  return shared
    .map((id) => index.peopleById.get(id))
    .filter((person): person is Person => Boolean(person));
}

export function findSharedActorsByTitle(index: ContentIndex, titleA: string, titleB: string): Person[] {
  const [idA] = index.productionIdsByTitle.get(normalizeForSearch(titleA)) ?? [];
  const [idB] = index.productionIdsByTitle.get(normalizeForSearch(titleB)) ?? [];
  if (!idA || !idB) return [];
  return findSharedActors(index, idA, idB);
}

export function findByActor(index: ContentIndex, name: string): Production[] {
  return findProductions(index, [{ kind: "ACTOR_NAME", name }]);
}

export function findByDirector(index: ContentIndex, name: string): Production[] {
  return findProductions(index, [{ kind: "DIRECTOR_NAME", name }]);
}

export function findByGenreAndYear(
  index: ContentIndex,
  genreId: GenreId,
  from: number,
  to: number
): Production[] {
  return findProductions(index, [
    { kind: "GENRE", genreId },
    { kind: "YEAR_RANGE", from, to },
  ]);
}

export function findByCountryAndGenre(
  index: ContentIndex,
  countryId: string,
  genreId: GenreId
): Production[] {
  return findProductions(index, [
    { kind: "COUNTRY", countryId },
    { kind: "GENRE", genreId },
  ]);
}

export function findByFranchise(index: ContentIndex, franchiseId: FranchiseId): Production[] {
  return findProductions(index, [{ kind: "FRANCHISE", franchiseId }]);
}
