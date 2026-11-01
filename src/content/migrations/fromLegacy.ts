import { LEGACY_ACTOR_RECORDS } from "@/data/actors";
import { LEGACY_MOVIE_RECORDS } from "@/data/movies";
import type { Actor, Movie } from "@/core";
import { normalizeForSearch } from "../search/normalize";
import {
  franchiseIdFromLegacy,
  genreIdFromLegacyLabel,
  releasePeriodFromYear,
} from "../taxonomy";
import type {
  Alias,
  AmbiguousCredit,
  AwardGrant,
  CanonicalCatalog,
  Credit,
  GenreId,
  MovieEntity,
  Person,
  Provenance,
  TvSeriesEntity,
  VerificationStatus,
} from "../types";

export interface LegacyMigrationNotes {
  unmappedGenres: string[];
  unmappedFranchises: string[];
  yearsOutsideLabeledPeriods: string[];
}

function productionStatus(movie: Movie): VerificationStatus {
  if (!movie.title?.trim() || !movie.year || movie.genres.length === 0) return "INCOMPLETE";
  if (movie.sourceIds?.wikidata && movie.provenance?.wikidata?.verified) return "VERIFIED";
  return "NEEDS_REVIEW";
}

function provenanceFromMovie(movie: Movie): Provenance {
  const status = productionStatus(movie);
  const externalId = movie.sourceIds?.wikidata;
  if (status === "VERIFIED" && externalId) {
    return {
      sourceName: "Wikidata",
      externalId,
      lastVerifiedAt: movie.provenance?.wikidata?.verifiedAt,
      verificationStatus: "VERIFIED",
    };
  }
  return {
    sourceName: "legacy_catalog",
    externalId,
    verificationStatus: status,
  };
}

function provenanceFromActor(actor: Actor): Provenance {
  return {
    sourceName: actor.provenance.source === "WIKIDATA" ? "Wikidata" : actor.provenance.source,
    externalId: actor.provenance.sourceId ?? actor.sourceIds?.wikidata,
    lastVerifiedAt: actor.provenance.verified ? actor.provenance.verifiedAt : undefined,
    verificationStatus: actor.provenance.verified ? "VERIFIED" : "NEEDS_REVIEW",
  };
}

function personIdForName(name: string): string {
  return `per_${normalizeForSearch(name).replace(/ /g, "_")}`;
}

export function migrateLegacyCatalog(
  movies: Movie[] = LEGACY_MOVIE_RECORDS,
  actors: Actor[] = LEGACY_ACTOR_RECORDS
): { catalog: CanonicalCatalog; notes: LegacyMigrationNotes } {
  const people = new Map<string, Person>();
  const nameToPersonId = new Map<string, string>();
  const credits: Credit[] = [];
  const aliases: Alias[] = [];
  const awards: AwardGrant[] = [];
  const movieEntities: MovieEntity[] = [];
  const seriesEntities: TvSeriesEntity[] = [];
  const unmappedGenres = new Set<string>();
  const unmappedFranchises = new Set<string>();
  const yearsOutsideLabeledPeriods: string[] = [];
  const ambiguousCredits: AmbiguousCredit[] = [];

  const rememberName = (personId: string, text: string) => {
    const normalized = normalizeForSearch(text);
    if (normalized) nameToPersonId.set(normalized, personId);
  };

  for (const actor of actors) {
    people.set(actor.id, {
      id: actor.id,
      name: actor.primaryName,
      birthYear: actor.birthYear,
      provenance: provenanceFromActor(actor),
    });
    rememberName(actor.id, actor.primaryName);
    for (const alias of actor.aliases) {
      rememberName(actor.id, alias);
      const normalized = normalizeForSearch(alias);
      if (!normalized || normalized === normalizeForSearch(actor.primaryName)) continue;
      aliases.push({
        id: `als_${actor.id}_${normalized.replace(/ /g, "_")}`,
        entityId: actor.id,
        entityType: "PERSON",
        kind: "PERSON_NAME",
        text: alias,
        normalized,
      });
    }
  }

  const resolvePerson = (displayName: string, status: VerificationStatus): string => {
    const normalized = normalizeForSearch(displayName);
    const existing = nameToPersonId.get(normalized);
    if (existing) return existing;
    const id = personIdForName(displayName);
    if (!people.has(id)) {
      people.set(id, {
        id,
        name: displayName,
        provenance: {
          sourceName: "legacy_catalog",
          verificationStatus: status,
        },
      });
    }
    rememberName(id, displayName);
    return id;
  };

  const addCredit = (
    personId: string,
    productionId: string,
    productionType: "MOVIE" | "TV_SERIES",
    role: "ACTOR" | "DIRECTOR"
  ) => {
    const id = `crd_${productionId}_${personId}_${role}`;
    if (credits.some((credit) => credit.id === id)) return;
    credits.push({ id, personId, productionId, productionType, role });
  };

  for (const movie of movies) {
    const isSeries = movie.mediaType === "SERIES";
    const genreIds: GenreId[] = [];
    for (const label of movie.genres) {
      const genreId = genreIdFromLegacyLabel(label);
      if (genreId) genreIds.push(genreId);
      else unmappedGenres.add(`${movie.id}:${label}`);
    }
    const franchiseId = franchiseIdFromLegacy(movie.franchise);
    if (movie.franchise && movie.franchise !== "OTHER" && !franchiseId) {
      unmappedFranchises.add(`${movie.id}:${movie.franchise}`);
    }
    const releasePeriodId = releasePeriodFromYear(movie.year);
    if (!releasePeriodId) yearsOutsideLabeledPeriods.push(`${movie.id}:${movie.year}`);

    const base = {
      id: movie.id,
      title: movie.title,
      year: movie.year,
      genreIds,
      countryIds: [],
      originalLanguageIds: [],
      awardIds: movie.hasOscar ? (["OSCAR"] as const) : [],
      franchiseId: franchiseId ?? undefined,
      releasePeriodId: releasePeriodId ?? undefined,
      provenance: provenanceFromMovie(movie),
      legacyId: movie.id,
    };

    if (isSeries) {
      seriesEntities.push({ ...base, contentType: "TV_SERIES", awardIds: [...base.awardIds] });
    } else {
      movieEntities.push({ ...base, contentType: "MOVIE", awardIds: [...base.awardIds] });
    }

    if (movie.hasOscar) {
      awards.push({
        id: `aw_${movie.id}_oscar_legacy`,
        organizationId: "OSCAR",
        result: "WINNER",
        recipientType: "PRODUCTION",
        recipientId: movie.id,
        provenance: {
          sourceName: "legacy_catalog",
          verificationStatus: "NEEDS_REVIEW",
        },
      });
    }

    if (movie.originalTitle) {
      const normalized = normalizeForSearch(movie.originalTitle);
      if (normalized && normalized !== normalizeForSearch(movie.title)) {
        aliases.push({
          id: `als_${movie.id}_original`,
          entityId: movie.id,
          entityType: isSeries ? "TV_SERIES" : "MOVIE",
          kind: "ORIGINAL_TITLE",
          text: movie.originalTitle,
          normalized,
        });
      }
    }

    const productionType = isSeries ? "TV_SERIES" : "MOVIE";
    if (movie.director.trim()) {
      if (isSeries) {
        ambiguousCredits.push({
          id: `amb_${movie.id}_director`,
          productionId: movie.id,
          name: movie.director.trim(),
          sourceField: "director",
          status: "NEEDS_REVIEW",
          reason: "Dizi kaydındaki director alanı yönetmenlik kanıtı taşımıyor.",
        });
      } else {
        addCredit(resolvePerson(movie.director, "NEEDS_REVIEW"), movie.id, productionType, "DIRECTOR");
      }
    }
    for (const castName of movie.cast) {
      if (!castName.trim()) continue;
      addCredit(resolvePerson(castName, "INCOMPLETE"), movie.id, productionType, "ACTOR");
    }
  }

  return {
    catalog: {
      movies: movieEntities,
      series: seriesEntities,
      people: Array.from(people.values()),
      credits,
      aliases,
      awards,
      ambiguousCredits,
    },
    notes: {
      unmappedGenres: Array.from(unmappedGenres),
      unmappedFranchises: Array.from(unmappedFranchises),
      yearsOutsideLabeledPeriods,
    },
  };
}
