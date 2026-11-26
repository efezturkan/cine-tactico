import { AssetManifestItem } from "@/core";

/**
 * CROSSCUT MERKEZİ ASSET MANİFESTİ
 *
 * Sürüm 1.0 hiçbir portre, afiş veya üçüncü taraf görsel paketlemez: manifest bilerek boştur.
 * Görsel eklenirse yalnızca lisansı, yazarı ve atfı doğrulanmış olarak, Ayarlar'da atıf listesiyle birlikte eklenir.
 *
 * Kural: Yalnızca lisansı, yazarı, yerel dosya yolu ve checksum'ı doğrulanmış varlıklar kaydedilir.
 * Stüdyo telifli modern film afişleri lisans riski nedeniyle hariç tutulmuş,
 * bu filmler için sistem fail-silent tipografik 35mm fallback'e yönlendirilmiştir.
 */
const RAW_ASSET_MANIFEST: AssetManifestItem[] = [];

export const ASSET_MANIFEST: AssetManifestItem[] = RAW_ASSET_MANIFEST.map((item) => ({
  ...item,
  width: 160,
  height: 160,
  format: "jpeg",
}));

/**
 * Manifest bütünlüğü ve lisans eksiksizliği doğrulayıcısı
 */
export function isValidAssetManifestItem(item: AssetManifestItem): boolean {
  if (!item.id || !item.entityId || !item.entityType || !item.assetType) {
    return false;
  }
  if (!item.source || !item.license || !item.author || !item.attribution) {
    return false;
  }
  if (item.localPath && /^https?:/i.test(item.localPath)) {
    return false;
  }
  return true;
}

export function auditAssetManifest(items: AssetManifestItem[]): string[] {
  const problems: string[] = [];
  const ids = new Set<string>();
  const slots = new Set<string>();

  for (const item of items) {
    if (!isValidAssetManifestItem(item)) {
      problems.push(`${item.id || "?"} metadata`);
    }
    if (item.id && ids.has(item.id)) problems.push(`duplicate id ${item.id}`);
    if (item.id) ids.add(item.id);
    const slot = `${item.entityType}:${item.entityId}:${item.assetType}`;
    if (slots.has(slot)) problems.push(`duplicate slot ${slot}`);
    slots.add(slot);
    if (!item.localPath || /^https?:/i.test(item.localPath)) {
      problems.push(`${item.id} not packaged locally`);
    }
    if (!item.checksum) problems.push(`${item.id} missing checksum`);
  }

  return problems;
}
