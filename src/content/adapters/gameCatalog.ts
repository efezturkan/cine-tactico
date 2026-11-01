import { LEGACY_ACTOR_RECORDS } from "@/data/actors";
import { LEGACY_MOVIE_RECORDS } from "@/data/movies";
import type { Actor, Movie } from "@/core";
import type { GenreId } from "../types";
import { canonicalCatalog } from "../index";

const GAME_GENRE_LABEL: Record<GenreId, string> = {
  ACTION: "Action",
  ADVENTURE: "Adventure",
  ANIMATION: "Animation",
  BIOGRAPHY: "Biography",
  COMEDY: "Comedy",
  CRIME: "Crime",
  DOCUMENTARY: "Documentary",
  DRAMA: "Drama",
  FAMILY: "Family",
  FANTASY: "Fantasy",
  HISTORY: "History",
  HORROR: "Horror",
  MUSIC: "Music",
  MUSICAL: "Musical",
  MYSTERY: "Mystery",
  ROMANCE: "Romance",
  SCI_FI: "Sci-Fi",
  SPORT: "Sport",
  THRILLER: "Thriller",
  WAR: "War",
  WESTERN: "Western",
};

const aliasesByProduction = new Map<string, string[]>();
for (const alias of canonicalCatalog.aliases) {
  if (alias.entityType === "PERSON") continue;
  const bucket = aliasesByProduction.get(alias.entityId) ?? [];
  bucket.push(alias.text);
  aliasesByProduction.set(alias.entityId, bucket);
}

function oscarWinner(productionId: string): boolean {
  return canonicalCatalog.awards.some(
    (award) =>
      award.recipientType === "PRODUCTION" &&
      award.recipientId === productionId &&
      award.organizationId === "OSCAR" &&
      award.result === "WINNER" &&
      award.provenance.verificationStatus === "VERIFIED"
  );
}

function withSearchFields(movie: Movie): Movie {
  const aliases = aliasesByProduction.get(movie.id) ?? [];
  const hasOscar = oscarWinner(movie.id);
  if (aliases.length === 0 && movie.hasOscar === hasOscar) return movie;
  return {
    ...movie,
    hasOscar,
    ...(aliases.length > 0 ? { aliases } : {}),
  };
}

function pilotMovies(): Movie[] {
  const legacyIds = new Set(LEGACY_MOVIE_RECORDS.map((movie) => movie.id));
  const people = new Map(canonicalCatalog.people.map((person) => [person.id, person.name]));
  return [...canonicalCatalog.movies, ...canonicalCatalog.series]
    .filter(
      (production) =>
        !legacyIds.has(production.id) && production.provenance.verificationStatus !== "INCOMPLETE"
    )
    .map((production) => {
      const credits = canonicalCatalog.credits.filter((credit) => credit.productionId === production.id);
      const director = credits.find((credit) => credit.role === "DIRECTOR");
      const names = aliasesByProduction.get(production.id) ?? [];
      return {
        id: production.id,
        title: production.title,
        ...(production.originalTitle ? { originalTitle: production.originalTitle } : {}),
        year: production.year,
        director: director ? people.get(director.personId) ?? "" : "",
        cast: credits
          .filter((credit) => credit.role === "ACTOR")
          .map((credit) => people.get(credit.personId) ?? "")
          .filter((name) => name.length > 0),
        genres: production.genreIds.map((genreId) => GAME_GENRE_LABEL[genreId]),
        hasOscar: oscarWinner(production.id),
        ...(names.length > 0 ? { aliases: names } : {}),
        mediaType: production.contentType === "TV_SERIES" ? "SERIES" : "FILM",
        ...(production.provenance.externalId
          ? { sourceIds: { wikidata: production.provenance.externalId } }
          : {}),
        provenance: {
          wikidata: {
            verified: production.provenance.verificationStatus === "VERIFIED",
            verifiedAt: production.provenance.lastVerifiedAt ?? "",
          },
        },
      } satisfies Movie;
    });
}

const playableProductionIds = new Set(
  [...canonicalCatalog.movies, ...canonicalCatalog.series]
    .filter((production) => production.provenance.verificationStatus !== "INCOMPLETE")
    .map((production) => production.id)
);

const verifiedPersonIds = new Set(
  canonicalCatalog.people
    .filter((person) => person.provenance.verificationStatus === "VERIFIED")
    .map((person) => person.id)
);

/** Oyun bileşenlerinin okuduğu tek liste. Kaynak kanonik katalogdur. */
export const MOVIES_DATABASE: Movie[] = [
  ...LEGACY_MOVIE_RECORDS.filter((movie) => playableProductionIds.has(movie.id)).map(withSearchFields),
  ...pilotMovies(),
];

export const ACTORS_DATABASE: Actor[] = LEGACY_ACTOR_RECORDS.filter((actor) =>
  verifiedPersonIds.has(actor.id)
);

export const ACTOR_ALIAS_MAP: Map<string, string> = new Map();
ACTORS_DATABASE.forEach((actor) => {
  ACTOR_ALIAS_MAP.set(actor.normalizedName, actor.primaryName);
  actor.normalizedAliases.forEach((alias) => {
    ACTOR_ALIAS_MAP.set(alias, actor.primaryName);
  });
});
