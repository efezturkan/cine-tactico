import bulkFile from "../ingest/wikidataBulk.json";
import type {
  AwardId,
  ContentTypeId,
  FranchiseId,
  GenreId,
  PersonRoleId,
  ReleasePeriodId,
} from "../types";

const bulkLabels = bulkFile as {
  countryLabels: Record<string, string>;
  languageLabels: Record<string, string>;
};

export const GENRE_LABELS: Record<GenreId, string> = {
  ACTION: "Aksiyon",
  ADVENTURE: "Macera",
  ANIMATION: "Animasyon",
  BIOGRAPHY: "Biyografi",
  COMEDY: "Komedi",
  CRIME: "Suç",
  DOCUMENTARY: "Belgesel",
  DRAMA: "Dram",
  FAMILY: "Aile",
  FANTASY: "Fantastik",
  HISTORY: "Tarih",
  HORROR: "Korku",
  MUSIC: "Müzik",
  MUSICAL: "Müzikal",
  MYSTERY: "Gizem",
  ROMANCE: "Romantik",
  SCI_FI: "Bilim Kurgu",
  SPORT: "Spor",
  THRILLER: "Gerilim",
  WAR: "Savaş",
  WESTERN: "Western",
};

export const CONTENT_TYPE_LABELS: Record<ContentTypeId, string> = {
  MOVIE: "Film",
  TV_SERIES: "Dizi",
};

export const RELEASE_PERIOD_LABELS: Record<ReleasePeriodId, string> = {
  Y1910s: "1910'lar",
  Y1920s: "1920'ler",
  Y1930s: "1930'lar",
  Y1940s: "1940'lar",
  Y1950s: "1950'ler",
  Y1960s: "1960'lar",
  Y1970s: "1970'ler",
  Y1980s: "1980'ler",
  Y1990s: "1990'lar",
  Y2000s: "2000'ler",
  Y2010s: "2010'lar",
  Y2020s: "2020'ler",
};

export const PERSON_ROLE_LABELS: Record<PersonRoleId, string> = {
  ACTOR: "Oyuncu",
  DIRECTOR: "Yönetmen",
  CREATOR: "Yaratıcı",
  SHOWRUNNER: "Dizi sorumlusu",
  WRITER: "Senarist",
  PRODUCER: "Yapımcı",
  COMPOSER: "Besteci",
  CINEMATOGRAPHER: "Görüntü yönetmeni",
};

export const AWARD_LABELS: Record<AwardId, string> = {
  OSCAR: "Oscar",
  BAFTA: "BAFTA",
  GOLDEN_GLOBE: "Altın Küre",
  CANNES: "Cannes",
  VENICE: "Venedik",
  BERLIN: "Berlin",
};

export const FRANCHISE_LABELS: Record<FranchiseId, string> = {
  DC: "DC",
  MARVEL: "Marvel",
  LOTR: "Yüzüklerin Efendisi",
  HARRY_POTTER: "Harry Potter",
  DUNE: "Dune",
  STAR_WARS: "Yıldız Savaşları",
};

/** Ülke kodu ISO 3166-1 alpha-2. Etiket Wikidata'daki addır. */
export const COUNTRY_LABELS: Record<string, string> = {
  ...bulkLabels.countryLabels,
  DE: "Almanya",
  FR: "Fransa",
  JP: "Japonya",
  KR: "Güney Kore",
  TR: "Türkiye",
};

/** Dil kodu ISO 639-1. Etiket Wikidata'daki addır. */
export const LANGUAGE_LABELS: Record<string, string> = {
  ...bulkLabels.languageLabels,
  de: "Almanca",
  en: "İngilizce",
  ja: "Japonca",
  ko: "Korece",
  tr: "Türkçe",
};

export const PRODUCTION_COMPANY_LABELS: Record<string, string> = {};
export const DISTRIBUTION_NETWORK_LABELS: Record<string, string> = {};
export const CONTENT_FORMAT_LABELS: Record<string, string> = {};

const GENRE_FROM_LEGACY: Record<string, GenreId> = {
  action: "ACTION",
  adventure: "ADVENTURE",
  animation: "ANIMATION",
  biography: "BIOGRAPHY",
  comedy: "COMEDY",
  crime: "CRIME",
  documentary: "DOCUMENTARY",
  drama: "DRAMA",
  family: "FAMILY",
  fantasy: "FANTASY",
  history: "HISTORY",
  horror: "HORROR",
  music: "MUSIC",
  musical: "MUSICAL",
  mystery: "MYSTERY",
  romance: "ROMANCE",
  "sci-fi": "SCI_FI",
  "science fiction": "SCI_FI",
  sport: "SPORT",
  thriller: "THRILLER",
  war: "WAR",
  western: "WESTERN",
};

export function genreIdFromLegacyLabel(label: string): GenreId | null {
  return GENRE_FROM_LEGACY[label.trim().toLowerCase()] ?? null;
}

export function releasePeriodFromYear(year: number): ReleasePeriodId | null {
  const decade = Math.floor(year / 10) * 10;
  const id = `Y${decade}s` as ReleasePeriodId;
  return id in RELEASE_PERIOD_LABELS ? id : null;
}

export function franchiseIdFromLegacy(value: string | undefined): FranchiseId | null {
  if (!value || value === "OTHER") return null;
  return value in FRANCHISE_LABELS ? (value as FranchiseId) : null;
}
