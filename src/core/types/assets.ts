export type AssetEntityType = "movie" | "person" | "character";

export type AssetType = "poster" | "portrait" | "backdrop" | "logo";

export interface AssetManifestItem {
  id: string;
  entityType: AssetEntityType;
  entityId: string;
  assetType: AssetType;
  localPath?: string;
  source: string;
  license: string;
  author: string;
  attribution: string;
  sourcePageUrl?: string;
  modified?: boolean;
  checksum?: string;
  width?: number;
  height?: number;
  format?: "jpeg" | "png" | "webp";
}

export interface ResolvedAsset {
  isAvailable: boolean;
  asset: AssetManifestItem | null;
  src?: string;
  fallbackText?: string;
}
