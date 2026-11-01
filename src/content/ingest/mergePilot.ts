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
import { PILOT_PRODUCTIONS } from "./pilotRecords";

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

export function mergePilotCatalog(catalog: CanonicalCatalog): CanonicalCatalog {
  const movies = [...catalog.movies];
  const series = [...catalog.series];
  const people = [...catalog.people];
  const credits = [...catalog.credits];
  const aliases = [...catalog.aliases];
  const awards = [...catalog.awards];

  const productionIds = new Set([...movies, ...series].map((item) => item.id));
  const externalIds = new Set(
    [...movies, ...series, ...people]
      .map((item) => item.provenance.externalId)
      .filter((id): id is string => Boolean(id))
  );
  const titles = new Set(
    [...movies, ...series].flatMap((item) => [normalizeForSearch(item.title)])
  );
  for (const alias of aliases) {
    if (alias.entityType !== "PERSON") titles.add(alias.normalized);
  }
  const peopleByExternal = new Map<string, Person>();
  const peopleByName = new Map<string, Person>();
  for (const person of people) {
    if (person.provenance.externalId) peopleByExternal.set(person.provenance.externalId, person);
    peopleByName.set(normalizeForSearch(person.name), person);
  }

  const personFor = (wikidataId: string, name: string, birthYear?: number): Person => {
    const byExternal = peopleByExternal.get(wikidataId);
    if (byExternal) return byExternal;
    const byName = peopleByName.get(normalizeForSearch(name));
    if (byName && (!byName.provenance.externalId || byName.provenance.externalId === wikidataId)) {
      return byName;
    }
    const person: Person = {
      id: `wd_${wikidataId.toLowerCase()}`,
      name,
      ...(birthYear !== undefined ? { birthYear } : {}),
      provenance: provenance(wikidataId),
    };
    people.push(person);
    peopleByExternal.set(wikidataId, person);
    peopleByName.set(normalizeForSearch(name), person);
    externalIds.add(wikidataId);
    return person;
  };

  for (const record of PILOT_PRODUCTIONS) {
    if (productionIds.has(record.id) || externalIds.has(record.wikidataId)) continue;
    if (titles.has(normalizeForSearch(record.title))) continue;

    const peopleOnRecord = new Map<string, Person>();
    for (const credit of record.credits) {
      peopleOnRecord.set(
        credit.wikidataId,
        personFor(credit.wikidataId, credit.name, credit.birthYear)
      );
    }

    const winnerOrgs: AwardId[] = [];
    for (const award of record.awards) {
      if (award.result === "WINNER" && award.recipient === "PRODUCTION" && !winnerOrgs.includes(award.organizationId)) {
        winnerOrgs.push(award.organizationId);
      }
    }

    const originalTitle = record.aliases.find((alias) => alias.kind === "ORIGINAL_TITLE")?.text;
    const base = {
      id: record.id,
      title: record.title,
      ...(originalTitle ? { originalTitle } : {}),
      year: record.year,
      genreIds: record.genreIds,
      countryIds: record.countryIds,
      originalLanguageIds: record.originalLanguageIds,
      awardIds: winnerOrgs,
      releasePeriodId: releasePeriodFromYear(record.year) ?? undefined,
      provenance: provenance(record.wikidataId),
      legacyId: record.id,
    };
    const entity: MovieEntity | TvSeriesEntity =
      record.contentType === "MOVIE"
        ? { ...base, contentType: "MOVIE" }
        : { ...base, contentType: "TV_SERIES" };
    if (entity.contentType === "MOVIE") movies.push(entity);
    else series.push(entity);
    productionIds.add(record.id);
    externalIds.add(record.wikidataId);
    titles.add(normalizeForSearch(record.title));

    record.credits.forEach((credit, index) => {
      const person = peopleOnRecord.get(credit.wikidataId);
      if (!person) return;
      const row: Credit = {
        id: `crd_${record.id}_${person.id}_${credit.role}_${index}`,
        personId: person.id,
        productionId: record.id,
        productionType: record.contentType,
        role: credit.role,
      };
      credits.push(row);
    });

    for (const alias of record.aliases) {
      const normalized = normalizeForSearch(alias.text);
      if (!normalized || normalized === normalizeForSearch(record.title)) continue;
      const row: Alias = {
        id: `als_${record.id}_${normalized.replace(/ /g, "_")}`,
        entityId: record.id,
        entityType: record.contentType,
        kind: alias.kind,
        text: alias.text,
        normalized,
        languageId: alias.languageId,
      };
      aliases.push(row);
      titles.add(normalized);
    }

    record.awards.forEach((award, index) => {
      const recipient =
        award.recipient === "PRODUCTION" ? record.id : peopleOnRecord.get(award.recipient)?.id;
      if (!recipient) return;
      const row: AwardGrant = {
        id: `aw_${record.id}_${award.externalId.toLowerCase()}_${award.result.toLowerCase()}_${index}`,
        organizationId: award.organizationId,
        category: award.category,
        year: award.year,
        result: award.result,
        recipientType: award.recipient === "PRODUCTION" ? "PRODUCTION" : "PERSON",
        recipientId: recipient,
        provenance: provenance(award.externalId),
      };
      awards.push(row);
    });
  }

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
