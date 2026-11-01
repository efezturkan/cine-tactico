import type { ContentIndex, Production } from "./index";

/** İçerik paketleri oyun modu değildir. Ülke, dil ve doğrulanmış ödül üzerinden seçer. */
export type ContentPackId =
  | "GENERAL_CINEMA"
  | "DOMESTIC_CINEMA"
  | "DOMESTIC_SERIES"
  | "WORLD_CINEMA"
  | "KOREAN_CINEMA"
  | "CINEPHILE_CLUB";

export const CONTENT_PACK_LABELS: Record<ContentPackId, string> = {
  GENERAL_CINEMA: "Genel Sinema",
  DOMESTIC_CINEMA: "Yerli Sinema",
  DOMESTIC_SERIES: "Yerli Diziler",
  WORLD_CINEMA: "Dünya Sineması",
  KOREAN_CINEMA: "Kore Sineması",
  CINEPHILE_CLUB: "Sinefil Kulübü",
};

function verified(production: Production): boolean {
  return production.provenance.verificationStatus === "VERIFIED";
}

function isDomestic(production: Production): boolean {
  return production.countryIds.includes("TR") || production.originalLanguageIds.includes("tr");
}

function hasVerifiedWin(index: ContentIndex, productionId: string): boolean {
  const creditedPeople = new Set(
    (index.creditsByProduction.get(productionId) ?? []).map((credit) => credit.personId)
  );
  return index.catalog.awards.some((award) => {
    if (award.result !== "WINNER" || award.provenance.verificationStatus !== "VERIFIED") return false;
    if (award.recipientType === "PRODUCTION") return award.recipientId === productionId;
    return creditedPeople.has(award.recipientId);
  });
}

export function productionsForPack(index: ContentIndex, packId: ContentPackId): Production[] {
  const productions = index.productions.filter(verified);
  switch (packId) {
    case "GENERAL_CINEMA":
      return productions.filter((production) => production.contentType === "MOVIE");
    case "DOMESTIC_CINEMA":
      return productions.filter((production) => production.contentType === "MOVIE" && isDomestic(production));
    case "DOMESTIC_SERIES":
      return productions.filter((production) => production.contentType === "TV_SERIES" && isDomestic(production));
    case "WORLD_CINEMA":
      return productions.filter(
        (production) =>
          production.contentType === "MOVIE" &&
          production.countryIds.length > 0 &&
          !production.countryIds.includes("TR")
      );
    case "KOREAN_CINEMA":
      return productions.filter(
        (production) =>
          production.contentType === "MOVIE" &&
          (production.countryIds.includes("KR") || production.originalLanguageIds.includes("ko"))
      );
    case "CINEPHILE_CLUB":
      return productions.filter((production) => hasVerifiedWin(index, production.id));
    default:
      return [];
  }
}
