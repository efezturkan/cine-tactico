import assert from "node:assert/strict";
import { MOVIES_DATABASE } from "../content/adapters/gameCatalog";
import { movieMatchesTitleQuery } from "../content/search/movieTitle";
import { isMovieMatchingCriterion } from "../core/engine/validator";
import {
  acceptGameplayImport,
  answersByDirector,
  answersByGenre,
  answersForGenreAndDecade,
  answersForPersonAndGenre,
  buildInventory,
  canonicalCatalog,
  catalogValidation,
  contentIndex,
  findByActor,
  findByCountryAndGenre,
  findByDirector,
  findSharedActorsByTitle,
  normalizeForSearch,
  productionsForPack,
  sharedVerifiedActorCount,
  validateCatalog,
} from "../content";
import type { CanonicalCatalog } from "../content/types";

const original = "İnception!";
const normalized = normalizeForSearch(original);
assert.equal(normalized, "inception");
assert.equal(original, "İnception!");
assert.equal(normalizeForSearch("  Pulp   Fiction "), "pulp fiction");
assert.equal(normalizeForSearch("Şahane"), "sahane");

assert.equal(catalogValidation.ok, true, catalogValidation.errors.join("\n"));
assert.ok(canonicalCatalog.movies.length >= 500);
assert.ok(canonicalCatalog.series.length >= 150);
assert.ok(canonicalCatalog.series.some((series) => series.id === "s_breaking_bad"));
assert.ok(canonicalCatalog.movies.some((movie) => movie.id === "m_inception"));
assert.equal(canonicalCatalog.movies.some((movie) => movie.id === "s_breaking_bad"), false);

const leo = canonicalCatalog.people.find((person) => person.id === "act_dicaprio");
assert.ok(leo);
assert.equal(leo?.provenance.externalId, "Q38111");
assert.equal(leo?.provenance.sourceUrl, undefined);

const inception = canonicalCatalog.movies.find((movie) => movie.id === "m_inception");
assert.ok(inception?.genreIds.includes("SCI_FI"));
assert.ok(inception?.awardIds.includes("OSCAR"));
assert.ok(inception?.countryIds.includes("US") || inception?.countryIds.includes("GB"));

const nolanCredits = canonicalCatalog.credits.filter(
  (credit) => credit.role === "DIRECTOR" && credit.productionId === "m_inception"
);
assert.equal(nolanCredits.length, 1);
const nolanAgain = canonicalCatalog.credits.filter(
  (credit) =>
    credit.personId === nolanCredits[0].personId &&
    credit.role === "DIRECTOR" &&
    credit.productionId === "m_dark_knight"
);
assert.equal(nolanAgain.length, 1);

const shared = findSharedActorsByTitle(contentIndex, "Inception", "The Dark Knight").map(
  (person) => person.name
);
assert.ok(shared.includes("Cillian Murphy"));
assert.ok(findByDirector(contentIndex, "Christopher Nolan").length >= 2);
assert.ok(findByActor(contentIndex, "Leo DiCaprio").some((movie) => movie.id === "m_inception"));
assert.ok(
  findByCountryAndGenre(contentIndex, "TR", "DRAMA").some((movie) => movie.id === "m_winter_sleep")
);

const broken: CanonicalCatalog = {
  movies: [],
  series: [],
  people: [],
  credits: [
    {
      id: "crd_dup",
      personId: "missing",
      productionId: "missing",
      productionType: "MOVIE",
      role: "ACTOR",
    },
    {
      id: "crd_dup",
      personId: "missing",
      productionId: "missing",
      productionType: "MOVIE",
      role: "ACTOR",
    },
  ],
  aliases: [],
  awards: [],
  ambiguousCredits: [],
};
const brokenReport = validateCatalog(broken);
assert.equal(brokenReport.ok, false);
assert.ok(brokenReport.errors.some((error) => error.includes("tekrarlı") || error.includes("yok")));

assert.equal(
  canonicalCatalog.credits.some(
    (credit) => credit.productionId === "s_breaking_bad" && credit.role === "DIRECTOR"
  ),
  false
);
assert.ok(canonicalCatalog.ambiguousCredits.some((credit) => credit.productionId === "s_breaking_bad"));
const playableCount = [...canonicalCatalog.movies, ...canonicalCatalog.series].filter(
  (production) => production.provenance.verificationStatus !== "INCOMPLETE"
).length;
assert.equal(MOVIES_DATABASE.length, playableCount);

const inventory = buildInventory(canonicalCatalog);
assert.equal(inventory.movies + inventory.series, canonicalCatalog.movies.length + canonicalCatalog.series.length);
assert.ok(inventory.creators > 0);
assert.equal(inventory.showrunners, 0);
assert.ok(inventory.directors > 0);
assert.ok(inventory.ambiguousCredits > 0);
assert.ok(
  canonicalCatalog.credits.some(
    (credit) => credit.productionId === "s_breaking_bad" && credit.role === "CREATOR"
  )
);
assert.ok(
  canonicalCatalog.credits.some(
    (credit) => credit.productionId === "s_behzat_c" && credit.role === "CREATOR"
  )
);

const sciFi = answersByGenre(contentIndex).find((row) => row.genreId === "SCI_FI");
assert.ok(sciFi && sciFi.count > 0);
assert.ok(
  answersByDirector(contentIndex).every(
    (row) => contentIndex.peopleById.get(row.personId)?.provenance.verificationStatus === "VERIFIED"
  )
);
assert.ok(sharedVerifiedActorCount(contentIndex, "m_inception", "m_dark_knight") >= 1);
assert.ok(answersForGenreAndDecade(contentIndex, "SCI_FI", "Y2010s") > 0);
assert.equal(answersForPersonAndGenre(contentIndex, "act_dicaprio", "ACTOR", "SCI_FI") > 0, true);
assert.deepEqual(acceptGameplayImport({
  id: "draft",
  entityType: "MOVIE",
  title: "Taslak",
  year: 2020,
  verificationStatus: "NEEDS_REVIEW",
}), { ok: false, reason: "Doğrulanmamış kayıt oyun cevabı olamaz." });

const winter = canonicalCatalog.movies.find((movie) => movie.id === "m_winter_sleep");
const winterGame = MOVIES_DATABASE.find((movie) => movie.id === "m_winter_sleep");
assert.ok(winterGame && movieMatchesTitleQuery(winterGame, "Kış Uykusu"));
assert.ok(winterGame && movieMatchesTitleQuery(winterGame, "kis uykusu"));
assert.equal(winter?.originalTitle, "Kış Uykusu");
assert.deepEqual(winter?.countryIds, ["TR", "DE", "FR"]);
assert.deepEqual(winter?.originalLanguageIds, ["tr", "en"]);
assert.equal(winter?.provenance.externalId, "Q15921329");
assert.ok(winter?.provenance.sourceUrl?.includes("Q15921329"));
assert.ok(
  canonicalCatalog.awards.some(
    (award) =>
      award.recipientId === "m_winter_sleep" &&
      award.organizationId === "CANNES" &&
      award.result === "WINNER" &&
      award.category === "Palme d'Or" &&
      award.year === 2014
  )
);
assert.ok(
  canonicalCatalog.awards.some(
    (award) =>
      award.organizationId === "OSCAR" &&
      award.result === "NOMINEE" &&
      award.recipientId === "m_shoplifters"
  )
);
const shoplifters = MOVIES_DATABASE.find((movie) => movie.id === "m_shoplifters");
assert.equal(shoplifters?.hasOscar, false);
assert.equal(shoplifters?.director, "Hirokazu Kore-eda");
const oldboy = MOVIES_DATABASE.find((movie) => movie.id === "m_oldboy");
assert.ok(oldboy);
assert.equal(
  isMovieMatchingCriterion(oldboy, { type: "DIRECTOR", label: "Yönetmen", value: "Park Chan-wook" }),
  true
);
assert.equal(
  isMovieMatchingCriterion(oldboy, { type: "GENRE", label: "Tür", value: "Thriller" }),
  true
);
assert.ok(findByDirector(contentIndex, "Park Chan-wook").some((movie) => movie.id === "m_oldboy"));
assert.ok(
  findSharedActorsByTitle(contentIndex, "Winter Sleep", "Şahsiyet").some(
    (person) => person.name === "Haluk Bilginer"
  )
);
assert.ok(productionsForPack(contentIndex, "DOMESTIC_CINEMA").some((movie) => movie.id === "m_winter_sleep"));
assert.equal(
  productionsForPack(contentIndex, "DOMESTIC_CINEMA").some((movie) => movie.id === "m_shoplifters"),
  false
);
assert.ok(productionsForPack(contentIndex, "DOMESTIC_SERIES").some((series) => series.id === "s_behzat_c"));
assert.ok(productionsForPack(contentIndex, "DOMESTIC_SERIES").some((series) => series.id === "s_sahsiyet"));
assert.ok(productionsForPack(contentIndex, "KOREAN_CINEMA").some((movie) => movie.id === "m_decision_to_leave"));
assert.equal(
  productionsForPack(contentIndex, "KOREAN_CINEMA").some((movie) => movie.id === "m_shoplifters"),
  false
);
assert.ok(productionsForPack(contentIndex, "WORLD_CINEMA").some((movie) => movie.id === "m_shoplifters"));
assert.equal(
  productionsForPack(contentIndex, "WORLD_CINEMA").some((movie) => movie.id === "m_winter_sleep"),
  false
);
assert.ok(productionsForPack(contentIndex, "CINEPHILE_CLUB").some((movie) => movie.id === "m_decision_to_leave"));
assert.equal(
  canonicalCatalog.credits.some(
    (credit) => credit.productionId === "s_leyla_ile_mecnun" && credit.role === "DIRECTOR"
  ),
  true
);
assert.equal(
  canonicalCatalog.credits.some(
    (credit) => credit.productionId === "m_winter_sleep" && credit.role === "WRITER"
  ),
  true
);

console.log("content-foundation: ok");
console.log(JSON.stringify(inventory));
