import {
  AWARD_LABELS,
  COUNTRY_LABELS,
  FRANCHISE_LABELS,
  GENRE_LABELS,
  LANGUAGE_LABELS,
  RELEASE_PERIOD_LABELS,
} from "../taxonomy";
import type { CanonicalCatalog, Credit } from "../types";

export interface CatalogValidation {
  ok: boolean;
  errors: string[];
}

function duplicateIds(ids: string[], label: string, errors: string[]) {
  const seen = new Set<string>();
  for (const id of ids) {
    if (!id) errors.push(`${label} kaydında boş kimlik var.`);
    else if (seen.has(id)) errors.push(`${label} kimliği tekrarlı: ${id}`);
    else seen.add(id);
  }
}

export function validateCatalog(catalog: CanonicalCatalog): CatalogValidation {
  const errors: string[] = [];
  const productions = [...catalog.movies, ...catalog.series];

  duplicateIds(productions.map((item) => item.id), "Yapım", errors);
  duplicateIds(catalog.people.map((item) => item.id), "Kişi", errors);
  duplicateIds(catalog.credits.map((item) => item.id), "Künye", errors);
  duplicateIds(catalog.aliases.map((item) => item.id), "Takma ad", errors);
  duplicateIds(catalog.awards.map((item) => item.id), "Ödül", errors);

  const externalKeys = new Set<string>();
  for (const item of [...productions, ...catalog.people]) {
    const externalId = item.provenance.externalId;
    if (!externalId) continue;
    const key = `${item.provenance.sourceName}:${externalId}`;
    if (externalKeys.has(key)) errors.push(`Dış kimlik tekrarlı: ${key}`);
    else externalKeys.add(key);
  }

  const people = new Set(catalog.people.map((person) => person.id));
  const productionIds = new Set(productions.map((item) => item.id));
  const creditKeys = new Set<string>();

  for (const production of productions) {
    if (!production.title.trim()) errors.push(`Başlık yok: ${production.id}`);
    if (!Number.isInteger(production.year) || production.year < 1888 || production.year > 2026) {
      errors.push(`Geçersiz yıl: ${production.id} ${production.year}`);
    }
    for (const genreId of production.genreIds) {
      if (!(genreId in GENRE_LABELS)) errors.push(`Geçersiz tür: ${production.id} ${genreId}`);
    }
    for (const countryId of production.countryIds) {
      if (!(countryId in COUNTRY_LABELS)) errors.push(`Geçersiz ülke: ${production.id} ${countryId}`);
    }
    for (const languageId of production.originalLanguageIds) {
      if (!(languageId in LANGUAGE_LABELS)) errors.push(`Geçersiz dil: ${production.id} ${languageId}`);
    }
    for (const awardId of production.awardIds) {
      if (!(awardId in AWARD_LABELS)) errors.push(`Geçersiz ödül: ${production.id} ${awardId}`);
    }
    if (production.franchiseId && !(production.franchiseId in FRANCHISE_LABELS)) {
      errors.push(`Geçersiz seri: ${production.id} ${production.franchiseId}`);
    }
    if (production.releasePeriodId && !(production.releasePeriodId in RELEASE_PERIOD_LABELS)) {
      errors.push(`Geçersiz dönem: ${production.id} ${production.releasePeriodId}`);
    }
  }

  for (const credit of catalog.credits) {
    if (!people.has(credit.personId)) errors.push(`Künye kişisi yok: ${credit.id}`);
    if (!productionIds.has(credit.productionId)) errors.push(`Künye yapımı yok: ${credit.id}`);
    const key = creditKey(credit);
    if (creditKeys.has(key)) errors.push(`Künye tekrarlı: ${key}`);
    else creditKeys.add(key);
  }

  for (const alias of catalog.aliases) {
    if (!alias.text.trim() || !alias.normalized.trim()) errors.push(`Boş takma ad: ${alias.id}`);
    if (alias.languageId && !(alias.languageId in LANGUAGE_LABELS)) {
      errors.push(`Geçersiz takma ad dili: ${alias.id} ${alias.languageId}`);
    }
    const known =
      productionIds.has(alias.entityId) || people.has(alias.entityId);
    if (!known) errors.push(`Takma ad varlığı yok: ${alias.id}`);
  }

  for (const award of catalog.awards) {
    if (!(award.organizationId in AWARD_LABELS)) {
      errors.push(`Geçersiz ödül organizasyonu: ${award.id}`);
    }
    if (award.result !== "WINNER" && award.result !== "NOMINEE") {
      errors.push(`Geçersiz ödül sonucu: ${award.id}`);
    }
    if (award.year !== undefined && (!Number.isInteger(award.year) || award.year < 1888 || award.year > 2026)) {
      errors.push(`Geçersiz ödül yılı: ${award.id}`);
    }
    const recipientKnown =
      award.recipientType === "PRODUCTION"
        ? productionIds.has(award.recipientId)
        : people.has(award.recipientId);
    if (!recipientKnown) errors.push(`Ödül alıcısı yok: ${award.id}`);
  }

  return { ok: errors.length === 0, errors };
}

function creditKey(credit: Credit): string {
  return [
    credit.personId,
    credit.productionId,
    credit.productionType,
    credit.role,
    credit.characterName ?? "",
  ].join("|");
}
