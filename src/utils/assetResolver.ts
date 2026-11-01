import { AssetEntityType, AssetType, AssetManifestItem, ResolvedAsset, Criterion } from "@/core";
import { ASSET_MANIFEST, isValidAssetManifestItem } from "@/data/assets";
import { ACTORS_DATABASE } from "@/content/adapters/gameCatalog";
import { normalizeCinemaString } from "@/core";

/**
 * CINE-XOX MERKEZİ ASSET ÇÖZÜCÜ (ASSET RESOLVER)
 * 
 * Amaç: Oyun motorunu veya UI bileşenlerini asla bloklamadan,
 * senkron manifest kontrolüyle görsel varlık veya zarif fallback sunar.
 * 1.000+ film ve kişi kaydına ölçeklenebilir; UI bileşenleri pilot ID'lerine
 * bağımlı olmadan genel entity modelini kullanır.
 */
export class AssetResolver {
  private bySlot = new Map<string, AssetManifestItem>();
  private byEntityAsset = new Map<string, AssetManifestItem>();

  constructor(customManifest: AssetManifestItem[] = ASSET_MANIFEST) {
    for (const item of customManifest) {
      if (!isValidAssetManifestItem(item) || !item.localPath) continue;
      const slot = `${item.entityType}|${item.entityId}|${item.assetType}`;
      const loose = `${item.entityId}|${item.assetType}`;
      if (!this.bySlot.has(slot)) this.bySlot.set(slot, item);
      if (!this.byEntityAsset.has(loose)) this.byEntityAsset.set(loose, item);
    }
  }

  /**
   * Belirtilen varlık için görsel çözer.
   * 
   * @param entityId Varlık kimliği (örn: "act_dicaprio", "m_inception")
   * @param assetType Varlık türü (örn: "portrait", "poster")
   * @param entityType İsteğe bağlı varlık kategorisi (örn: "person", "movie")
   * @returns ResolvedAsset
   */
  public resolve(
    entityId: string,
    assetType: AssetType,
    entityType?: AssetEntityType
  ): ResolvedAsset {
    if (!entityId || !assetType) {
      return this.createFallback(entityId);
    }

    const item = entityType
      ? this.bySlot.get(`${entityType}|${entityId}|${assetType}`)
      : this.byEntityAsset.get(`${entityId}|${assetType}`);

    if (!item || !isValidAssetManifestItem(item)) {
      return this.createFallback(entityId);
    }

    const resolvedSrc = item.localPath || undefined;

    return {
      isAvailable: Boolean(resolvedSrc),
      asset: item,
      src: resolvedSrc,
      fallbackText: this.getInitialsFallback(entityId),
    };
  }

  /**
   * Film varlığı için afiş (poster) çözer.
   */
  public resolveForMovie(movie: { id: string }): ResolvedAsset {
    if (!movie || !movie.id) return this.createFallback();
    return this.resolve(movie.id, "poster", "movie");
  }

  /**
   * Aktör için portre çözer (ID veya isim ile eşleştirilir).
   */
  public resolveForActor(nameOrId: string): ResolvedAsset {
    if (!nameOrId) return this.createFallback();
    if (nameOrId.startsWith("act_")) {
      return this.resolve(nameOrId, "portrait", "person");
    }

    const norm = normalizeCinemaString(nameOrId);
    const actor = ACTORS_DATABASE.find(
      (a) => a.normalizedName === norm || a.normalizedAliases.includes(norm)
    );

    if (actor) {
      return this.resolve(actor.id, "portrait", "person");
    }

    return this.createFallback(nameOrId);
  }

  /**
   * Yönetmen için portre çözer (ID veya isim ile eşleştirilir).
   */
  public resolveForDirector(nameOrId: string): ResolvedAsset {
    if (!nameOrId) return this.createFallback();
    if (nameOrId.startsWith("dir_")) {
      return this.resolve(nameOrId, "portrait", "person");
    }

    const norm = normalizeCinemaString(nameOrId);
    const parts = norm.split(" ");
    const lastName = parts[parts.length - 1];
    const slugCandidates = [`dir_${lastName}`, `dir_${norm.replace(/\s+/g, "_")}`];

    for (const cand of slugCandidates) {
      const res = this.resolve(cand, "portrait", "person");
      if (res.isAvailable) return res;
    }

    return this.createFallback(nameOrId);
  }

  /**
   * Oyun kriteri (Criterion) için uygun görseli çözer.
   */
  public resolveForCriterion(criterion: Criterion): ResolvedAsset {
    if (!criterion) return this.createFallback();

    if (criterion.type === "ACTOR") {
      return this.resolveForActor(criterion.value || criterion.label);
    }

    if (criterion.type === "DIRECTOR") {
      return this.resolveForDirector(criterion.value || criterion.label);
    }

    return this.createFallback(criterion.label);
  }

  /**
   * Görsel bulunamadığında oyun akışını kesintisiz sürdüren fallback nesnesi
   */
  private createFallback(entityId?: string): ResolvedAsset {
    return {
      isAvailable: false,
      asset: null,
      src: undefined,
      fallbackText: this.getInitialsFallback(entityId),
    };
  }

  /**
   * İsimden/ID'den 2 harfli sinematik baş harf rozeti üretir
   */
  private getInitialsFallback(entityId?: string): string {
    if (!entityId) return "--";
    const parts = entityId
      .replace(/^(act_|dir_|m_|s_)/, "")
      .split(/[\s_]+/)
      .filter((part) => part && !/^\d+$/.test(part));
    if (parts.length === 0) return "--";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
}

// Global Singleton Instance
export const assetResolver = new AssetResolver();
