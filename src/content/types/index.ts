export type ContentTypeId = "MOVIE" | "TV_SERIES";

export type GenreId =
  | "ACTION"
  | "ADVENTURE"
  | "ANIMATION"
  | "BIOGRAPHY"
  | "COMEDY"
  | "CRIME"
  | "DOCUMENTARY"
  | "DRAMA"
  | "FAMILY"
  | "FANTASY"
  | "HISTORY"
  | "HORROR"
  | "MUSIC"
  | "MUSICAL"
  | "MYSTERY"
  | "ROMANCE"
  | "SCI_FI"
  | "SPORT"
  | "THRILLER"
  | "WAR"
  | "WESTERN";

export type ReleasePeriodId =
  | "Y1960s"
  | "Y1970s"
  | "Y1980s"
  | "Y1990s"
  | "Y2000s"
  | "Y2010s"
  | "Y2020s";

export type PersonRoleId =
  | "ACTOR"
  | "DIRECTOR"
  | "CREATOR"
  | "SHOWRUNNER"
  | "WRITER"
  | "PRODUCER"
  | "COMPOSER"
  | "CINEMATOGRAPHER";

export type AwardId = "OSCAR" | "BAFTA" | "GOLDEN_GLOBE" | "CANNES" | "VENICE" | "BERLIN";

export type AwardResult = "WINNER" | "NOMINEE";

export type AwardRecipientType = "PRODUCTION" | "PERSON";

export type FranchiseId = "DC" | "MARVEL" | "LOTR" | "HARRY_POTTER" | "DUNE" | "STAR_WARS";

export type ProductionType = "MOVIE" | "TV_SERIES";

export type VerificationStatus = "VERIFIED" | "NEEDS_REVIEW" | "INCOMPLETE";

export type AliasKind = "ORIGINAL_TITLE" | "LOCALIZED_TITLE" | "ALTERNATIVE_TITLE" | "PERSON_NAME";

export interface Provenance {
  sourceName: string;
  externalId?: string;
  sourceUrl?: string;
  lastVerifiedAt?: string;
  verificationStatus: VerificationStatus;
  importedAt?: string;
}

export interface Alias {
  id: string;
  entityId: string;
  entityType: "MOVIE" | "TV_SERIES" | "PERSON";
  kind: AliasKind;
  text: string;
  normalized: string;
  languageId?: string;
}

export interface AwardGrant {
  id: string;
  organizationId: AwardId;
  category?: string;
  year?: number;
  result: AwardResult;
  recipientType: AwardRecipientType;
  recipientId: string;
  provenance: Provenance;
}

export interface Person {
  id: string;
  name: string;
  birthYear?: number;
  provenance: Provenance;
}

export interface Credit {
  id: string;
  personId: string;
  productionId: string;
  productionType: ProductionType;
  role: PersonRoleId;
  characterName?: string;
  billingOrder?: number;
}

export interface ProductionBase {
  id: string;
  title: string;
  originalTitle?: string;
  year: number;
  genreIds: GenreId[];
  countryIds: string[];
  originalLanguageIds: string[];
  /** Kazanılan organizasyonlar. Adaylıklar award kayıtlarındadır. */
  awardIds: AwardId[];
  franchiseId?: FranchiseId;
  releasePeriodId?: ReleasePeriodId;
  provenance: Provenance;
  legacyId: string;
}

export interface MovieEntity extends ProductionBase {
  contentType: "MOVIE";
}

export interface TvSeriesEntity extends ProductionBase {
  contentType: "TV_SERIES";
}

export interface AmbiguousCredit {
  id: string;
  productionId: string;
  name: string;
  sourceField: "director";
  status: "NEEDS_REVIEW";
  reason: string;
}

export interface CanonicalCatalog {
  movies: MovieEntity[];
  series: TvSeriesEntity[];
  people: Person[];
  credits: Credit[];
  aliases: Alias[];
  awards: AwardGrant[];
  ambiguousCredits: AmbiguousCredit[];
}
