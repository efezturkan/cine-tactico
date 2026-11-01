import type { GenreId, PersonRoleId, VerificationStatus } from "../types";

export interface ContentImportCredit {
  personId: string;
  role: PersonRoleId;
  characterName?: string;
  billingOrder?: number;
}

export interface ContentImportRecord {
  id: string;
  entityType: "MOVIE" | "TV_SERIES" | "PERSON";
  title?: string;
  name?: string;
  originalTitle?: string;
  localizedTitles?: string[];
  year?: number;
  genreIds?: GenreId[];
  countryIds?: string[];
  credits?: ContentImportCredit[];
  externalId?: string;
  sourceName?: string;
  verificationStatus: VerificationStatus;
}

export function acceptGameplayImport(record: ContentImportRecord): { ok: true } | { ok: false; reason: string } {
  if (record.verificationStatus !== "VERIFIED") {
    return { ok: false, reason: "Doğrulanmamış kayıt oyun cevabı olamaz." };
  }
  if (!record.sourceName?.trim() || !record.externalId?.trim()) {
    return { ok: false, reason: "Doğrulanmış kayıt kaynak adı ve dış kimlik ister." };
  }
  if (record.entityType === "PERSON") {
    if (!record.name?.trim()) return { ok: false, reason: "Kişi adı yok." };
    return { ok: true };
  }
  if (!record.title?.trim() || !record.year) {
    return { ok: false, reason: "Yapım başlığı ve yılı yok." };
  }
  return { ok: true };
}
