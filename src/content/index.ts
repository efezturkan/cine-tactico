import { mergePilotCatalog } from "./ingest/mergePilot";
import { mergeWikidataCatalog } from "./ingest/mergeWikidata";
import { migrateLegacyCatalog } from "./migrations/fromLegacy";
import { indexCatalog } from "./queries";
import { validateCatalog } from "./validation/validateCatalog";

const migrated = migrateLegacyCatalog();

export const canonicalCatalog = mergeWikidataCatalog(mergePilotCatalog(migrated.catalog));
export const legacyMigrationNotes = migrated.notes;
export const contentIndex = indexCatalog(canonicalCatalog);
export const catalogValidation = validateCatalog(canonicalCatalog);

export { buildInventory } from "./inventory";
export { acceptGameplayImport } from "./ingest/importRecord";
export {
  answersByActor,
  answersByDecade,
  answersByDirector,
  answersByGenre,
  answersForGenreAndDecade,
  answersForPersonAndGenre,
  sharedVerifiedActorCount,
} from "./queries/readiness";
export { normalizeForSearch } from "./search/normalize";
export { validateCatalog } from "./validation/validateCatalog";
export { migrateLegacyCatalog } from "./migrations/fromLegacy";
export {
  countIntersection,
  findByActor,
  findByCountryAndGenre,
  findByDirector,
  findByFranchise,
  findByGenreAndYear,
  findProductions,
  findSharedActors,
  findSharedActorsByTitle,
} from "./queries";
export {
  AWARD_LABELS,
  CONTENT_TYPE_LABELS,
  FRANCHISE_LABELS,
  GENRE_LABELS,
  LANGUAGE_LABELS,
  PERSON_ROLE_LABELS,
  RELEASE_PERIOD_LABELS,
} from "./taxonomy";
export { CONTENT_PACK_LABELS, productionsForPack } from "./queries/packs";
export type { ContentPackId } from "./queries/packs";
