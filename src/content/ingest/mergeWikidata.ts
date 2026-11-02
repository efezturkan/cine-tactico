import { releasePeriodFromYear } from "../taxonomy";
import { normalizeForSearch } from "../search/normalize";
import type {
  Alias,
  AwardGrant,
  AwardId,
  CanonicalCatalog,
  Credit,
  MovieEntity,
  Person,
  TvSeriesEntity,
} from "../types";
import type { AliasKind, GenreId, PersonRoleId, ProductionType } from "../types";

interface BulkCredit {
  wikidataId: string;
  name: string;
  role: PersonRoleId;
  birthYear?: number;
}

interface BulkAward {
  organizationId: AwardId;
  category: string;
  year?: number;
  result: "WINNER" | "NOMINEE";
  recipient: "PRODUCTION";
  externalId: string;
}

interface BulkProduction {
  wikidataId: string;
  contentType: ProductionType;
  title: string;
  originalTitle?: string;
  year: number;
  countryIds: string[];
  originalLanguageIds: string[];
  genreIds: GenreId[];
  aliases: { text: string; kind: AliasKind; languageId?: string }[];
  credits: BulkCredit[];
  awards: BulkAward[];
}

import bulkFile from "./wikidataBulk.json";

const bulk = bulkFile as unknown as { productions: BulkProduction[] };
const VERIFIED_ON = "2026-11-01";

function provenance(externalId: string) {
  return {
    sourceName: "Wikidata",
    externalId,
    sourceUrl: `https://www.wikidata.org/wiki/${externalId}`,
    lastVerifiedAt: VERIFIED_ON,
    verificationStatus: "VERIFIED" as const,
  };
}

function awardKey(award: { organizationId: string; category?: string; result: string; recipientId: string }) {
  return [award.organizationId, award.category ?? "", award.result, award.recipientId].join("|");
}

export function mergeWikidataCatalog(catalog: CanonicalCatalog): CanonicalCatalog {
  if (bulk.productions.length === 0) return catalog;
  const movies = [...catalog.movies];
  const series = [...catalog.series];
  const people = [...catalog.people];
  let credits = [...catalog.credits];
  const aliases = [...catalog.aliases];
  let awards = catalog.awards.filter((award) => award.provenance.verificationStatus === "VERIFIED");

  const byExternal = new Map<string, MovieEntity | TvSeriesEntity>();
  const byTitleYear = new Map<string, MovieEntity | TvSeriesEntity>();
  const titleYearKey = (title: string, year: number) => `${normalizeForSearch(title)}|${year}`;
  for (const production of [...movies, ...series]) {
    if (production.provenance.externalId) byExternal.set(production.provenance.externalId, production);
    const key = titleYearKey(production.title, production.year);
    if (!byTitleYear.has(key)) byTitleYear.set(key, production);
  }
  const existingSeries = new Set(series.map((item) => item.id));
  const peopleByExternal = new Map<string, Person>();
  const peopleByName = new Map<string, Person[]>();
  for (const person of people) {
    if (person.provenance.externalId) peopleByExternal.set(person.provenance.externalId, person);
    const key = normalizeForSearch(person.name);
    const bucket = peopleByName.get(key) ?? [];
    bucket.push(person);
    peopleByName.set(key, bucket);
  }
  const creditKeys = new Set(credits.map((credit) => `${credit.personId}|${credit.productionId}|${credit.role}`));
  const awardKeys = new Set(awards.map(awardKey));
  const aliasKeys = new Set(aliases.map((alias) => `${alias.entityId}|${alias.normalized}`));

  const personFor = (wikidataId: string, name: string, birthYear?: number): Person => {
    const byId = peopleByExternal.get(wikidataId);
    if (byId) return byId;
    const named = peopleByName.get(normalizeForSearch(name)) ?? [];
    const reusable =
      named.find((person) => person.provenance.externalId === wikidataId) ??
      named.find((person) => !person.provenance.externalId);
    if (reusable) {
      if (!reusable.provenance.externalId) {
        reusable.provenance = provenance(wikidataId);
        if (birthYear !== undefined && reusable.birthYear === undefined) reusable.birthYear = birthYear;
        peopleByExternal.set(wikidataId, reusable);
      }
      return reusable;
    }
    const person: Person = {
      id: `wd_${wikidataId.toLowerCase()}`,
      name,
      ...(birthYear !== undefined ? { birthYear } : {}),
      provenance: provenance(wikidataId),
    };
    people.push(person);
    peopleByExternal.set(wikidataId, person);
    const bucket = peopleByName.get(normalizeForSearch(name)) ?? [];
    bucket.push(person);
    peopleByName.set(normalizeForSearch(name), bucket);
    return person;
  };

  const addAlias = (productionId: string, entityType: ProductionType, text: string, kind: AliasKind, languageId?: string) => {
    const normalized = normalizeForSearch(text);
    if (!normalized) return;
    const key = `${productionId}|${normalized}`;
    if (aliasKeys.has(key)) return;
    const row: Alias = {
      id: `als_${productionId}_${kind.toLowerCase()}_${normalized.replace(/ /g, "_")}`,
      entityId: productionId,
      entityType,
      kind,
      text,
      normalized,
      ...(languageId ? { languageId } : {}),
    };
    aliases.push(row);
    aliasKeys.add(key);
  };

  const addCredit = (
    productionId: string,
    productionType: ProductionType,
    person: Person,
    role: PersonRoleId
  ) => {
    if (role === "DIRECTOR" && existingSeries.has(productionId)) return;
    const key = `${person.id}|${productionId}|${role}`;
    if (creditKeys.has(key)) return;
    const row: Credit = {
      id: `crd_${productionId}_${person.id}_${role}`,
      personId: person.id,
      productionId,
      productionType,
      role,
    };
    credits.push(row);
    creditKeys.add(key);
  };

  let created = 0;
  let skipped = 0;
  for (const record of bulk.productions) {
    let production = byExternal.get(record.wikidataId);
    if (!production) {
      const titled = byTitleYear.get(titleYearKey(record.title, record.year));
      if (titled?.provenance.externalId && titled.provenance.externalId !== record.wikidataId) {
        skipped += 1;
        continue;
      }
      production = titled;
    }

    if (!production) {
      const id = `${record.contentType === "MOVIE" ? "mv" : "tv"}_${record.wikidataId.toLowerCase()}`;
      const base = {
        id,
        title: record.title,
        ...(record.originalTitle ? { originalTitle: record.originalTitle } : {}),
        year: record.year,
        genreIds: record.genreIds,
        countryIds: record.countryIds,
        originalLanguageIds: record.originalLanguageIds,
        awardIds: [],
        releasePeriodId: releasePeriodFromYear(record.year) ?? undefined,
        provenance: provenance(record.wikidataId),
        legacyId: id,
      };
      production = record.contentType === "MOVIE"
        ? { ...base, contentType: "MOVIE" }
        : { ...base, contentType: "TV_SERIES" };
      if (production.contentType === "MOVIE") movies.push(production);
      else series.push(production);
      created += 1;
      byExternal.set(record.wikidataId, production);
      byTitleYear.set(titleYearKey(record.title, record.year), production);
    } else {
      if (!production.provenance.externalId) production.provenance = provenance(record.wikidataId);
      if (!production.originalTitle && record.originalTitle) production.originalTitle = record.originalTitle;
      if (production.countryIds.length === 0) production.countryIds = record.countryIds;
      if (production.originalLanguageIds.length === 0) production.originalLanguageIds = record.originalLanguageIds;
      if (production.genreIds.length === 0) production.genreIds = record.genreIds;
    }

    if (record.originalTitle) {
      addAlias(production.id, production.contentType, record.originalTitle, "ORIGINAL_TITLE");
    }
    for (const alias of record.aliases) {
      addAlias(production.id, production.contentType, alias.text, alias.kind, alias.languageId);
    }
    for (const credit of record.credits) {
      const person = personFor(credit.wikidataId, credit.name, credit.birthYear);
      addCredit(production.id, production.contentType, person, credit.role);
    }
    for (const award of record.awards) {
      const row: AwardGrant = {
        id: `aw_${production.id}_${award.externalId.toLowerCase()}_${award.result.toLowerCase()}`,
        organizationId: award.organizationId,
        category: award.category,
        ...(award.year !== undefined ? { year: award.year } : {}),
        result: award.result,
        recipientType: "PRODUCTION",
        recipientId: production.id,
        provenance: provenance(award.externalId),
      };
      const key = awardKey(row);
      if (awardKeys.has(key)) continue;
      awards.push(row);
      awardKeys.add(key);
    }
  }

  const winnerOrgs = new Map<string, AwardId[]>();
  for (const award of awards) {
    if (award.result !== "WINNER" || award.recipientType !== "PRODUCTION") continue;
    if (award.provenance.verificationStatus !== "VERIFIED") continue;
    const bucket = winnerOrgs.get(award.recipientId) ?? [];
    if (!bucket.includes(award.organizationId)) bucket.push(award.organizationId);
    winnerOrgs.set(award.recipientId, bucket);
  }
  for (const production of [...movies, ...series]) {
    production.awardIds = winnerOrgs.get(production.id) ?? [];
  }

  const seenCreditIds = new Set<string>();
  credits = credits.filter((credit) => {
    if (seenCreditIds.has(credit.id)) return false;
    seenCreditIds.add(credit.id);
    return true;
  });

  return {
    movies,
    series,
    people,
    credits,
    aliases,
    awards,
    ambiguousCredits: catalog.ambiguousCredits,
  };
}
