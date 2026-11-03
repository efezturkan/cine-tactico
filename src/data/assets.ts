import { AssetManifestItem } from "@/core";

/**
 * CINE-XOX MERKEZİ ASSET MANİFESTİ (PHASE 3 PİLOT KATALOĞU)
 * 
 * Kural: Yalnızca lisansı, yazarı, yerel dosya yolu ve checksum'ı doğrulanmış varlıklar kaydedilir.
 * Stüdyo telifli modern film afişleri lisans riski nedeniyle hariç tutulmuş,
 * bu filmler için sistem fail-silent tipografik 35mm fallback'e yönlendirilmiştir.
 */
const RAW_ASSET_MANIFEST: AssetManifestItem[] = [
  // ── 10 OYUNCU PİLOT PORTRELERİ (WIKIMEDIA COMMONS VERIFIED) ──
  {
    id: "ast_act_dicaprio_portrait",
    entityType: "person",
    entityId: "act_dicaprio",
    assetType: "portrait",
    title: "Leonardo DiCaprio - BFI Southbank 3 (crop).jpg",
    localPath: "/assets/portraits/act_dicaprio.jpg",
    source: "Wikimedia Commons",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    author: "Raph_PH",
    attribution: "Photo: Raph_PH / Wikimedia Commons / CC BY 4.0",
    sourcePageUrl: "https://commons.wikimedia.org/wiki/File:Leonardo%20DiCaprio%20-%20BFI%20Southbank%203%20%28crop%29.jpg",
    modified: true,
    checksum: "a5f1169c527d",
  },
  {
    id: "ast_act_deniro_portrait",
    entityType: "person",
    entityId: "act_deniro",
    assetType: "portrait",
    title: "Robert De Niro Cannes 2016.jpg",
    localPath: "/assets/portraits/act_deniro.jpg",
    source: "Wikimedia Commons",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    author: "Georges Biard",
    attribution: "Photo: Georges Biard / Wikimedia Commons / CC BY-SA 3.0",
    sourcePageUrl: "https://commons.wikimedia.org/wiki/File:Robert%20De%20Niro%20Cannes%202016.jpg",
    modified: true,
    checksum: "3f62bb6ed0d8",
  },
  {
    id: "ast_act_bale_portrait",
    entityType: "person",
    entityId: "act_bale",
    assetType: "portrait",
    title: "Christian Bale-7837.jpg",
    localPath: "/assets/portraits/act_bale.jpg",
    source: "Wikimedia Commons",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    author: "Harald Krichel",
    attribution: "Photo: Harald Krichel / Wikimedia Commons / CC BY-SA 4.0",
    sourcePageUrl: "https://commons.wikimedia.org/wiki/File:Christian%20Bale-7837.jpg",
    modified: true,
    checksum: "f3aff7accc05",
  },
  {
    id: "ast_act_pitt_portrait",
    entityType: "person",
    entityId: "act_pitt",
    assetType: "portrait",
    title: "Brad Pitt 2019 by Glenn Francis.jpg",
    localPath: "/assets/portraits/act_pitt.jpg",
    source: "Wikimedia Commons",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    author: "Glenn Francis (Toglenn)",
    attribution: "© Glenn Francis, www.PacificProDigital.com / Wikimedia Commons / CC BY-SA 4.0",
    sourcePageUrl: "https://commons.wikimedia.org/wiki/File:Brad%20Pitt%202019%20by%20Glenn%20Francis.jpg",
    modified: true,
    checksum: "60f6f0de3c1f",
  },
  {
    id: "ast_act_murphy_portrait",
    entityType: "person",
    entityId: "act_murphy",
    assetType: "portrait",
    title: "CillianMurphy-TIFF2025-01-Cropped (cropped).png",
    localPath: "/assets/portraits/act_murphy.jpg",
    source: "Wikimedia Commons",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    author: "JoshPopov / WikiPortraits",
    attribution: "Photo: JoshPopov / WikiPortraits / Wikimedia Commons / CC BY 4.0",
    sourcePageUrl: "https://commons.wikimedia.org/wiki/File:CillianMurphy-TIFF2025-01-Cropped%20%28cropped%29.png",
    modified: true,
    checksum: "ef83aded1be3",
  },
  {
    id: "ast_act_chalamet_portrait",
    entityType: "person",
    entityId: "act_chalamet",
    assetType: "portrait",
    title: "Timothée Chalamet-63541 (cropped).jpg",
    localPath: "/assets/portraits/act_chalamet.jpg",
    source: "Wikimedia Commons",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    author: "Harald Krichel",
    attribution: "Photo: Harald Krichel / Wikimedia Commons / CC BY-SA 4.0",
    sourcePageUrl: "https://commons.wikimedia.org/wiki/File:Timoth%C3%A9e%20Chalamet-63541%20%28cropped%29.jpg",
    modified: true,
    checksum: "a80e94a2d574",
  },
  {
    id: "ast_act_pacino_portrait",
    entityType: "person",
    entityId: "act_pacino",
    assetType: "portrait",
    title: "ALPACINO 0234e (30401875260) (cropped).jpg",
    localPath: "/assets/portraits/act_pacino.jpg",
    source: "Wikimedia Commons",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
    author: "Embajada de EEUU en la Argentina",
    attribution: "Photo: Embajada de EEUU en la Argentina / Wikimedia Commons / CC BY 2.0",
    sourcePageUrl: "https://commons.wikimedia.org/wiki/File:ALPACINO%200234e%20%2830401875260%29%20%28cropped%29.jpg",
    modified: true,
    checksum: "71fab927b173",
  },
  {
    id: "ast_act_mcconaughey_portrait",
    entityType: "person",
    entityId: "act_mcconaughey",
    assetType: "portrait",
    title: "Matthew McConaughey 2025.jpg",
    localPath: "/assets/portraits/act_mcconaughey.jpg",
    source: "Wikimedia Commons",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    author: "Raph_PH",
    attribution: "Photo: Raph_PH / Wikimedia Commons / CC BY 4.0",
    sourcePageUrl: "https://commons.wikimedia.org/wiki/File:Matthew%20McConaughey%202025.jpg",
    modified: true,
    checksum: "68b52fe2ad87",
  },
  {
    id: "ast_act_hanks_portrait",
    entityType: "person",
    entityId: "act_hanks",
    assetType: "portrait",
    title: "Tom Hanks at the Elvis Premiere 2022.jpg",
    localPath: "/assets/portraits/act_hanks.jpg",
    source: "Wikimedia Commons",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/",
    author: "Eva Rinaldi",
    attribution: "Photo: Eva Rinaldi / Wikimedia Commons / CC BY-SA 2.0",
    sourcePageUrl: "https://commons.wikimedia.org/wiki/File:Tom%20Hanks%20at%20the%20Elvis%20Premiere%202022.jpg",
    modified: true,
    checksum: "4ad73d542853",
  },
  {
    id: "ast_act_damon_portrait",
    entityType: "person",
    entityId: "act_damon",
    assetType: "portrait",
    title: "MattDamon-byPhilipRomano2.jpg",
    localPath: "/assets/portraits/act_damon.jpg",
    source: "Wikimedia Commons",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    author: "Philip Romano",
    attribution: "Photo: Philip Romano / Wikimedia Commons / CC BY-SA 4.0",
    sourcePageUrl: "https://commons.wikimedia.org/wiki/File:MattDamon-byPhilipRomano2.jpg",
    modified: true,
    checksum: "6f7209e52473",
  },

  // ── 1 YÖNETMEN PİLOT PORTRESİ ──
  {
    id: "ast_dir_nolan_portrait",
    entityType: "person",
    entityId: "dir_nolan",
    assetType: "portrait",
    title: "Christopher Nolan.jpg",
    localPath: "/assets/portraits/dir_nolan.jpg",
    source: "Wikimedia Commons",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    author: "Republic of Korea (KOREA.NET)",
    attribution: "Photo: Republic of Korea (KOREA.NET) / Wikimedia Commons / CC BY-SA 4.0",
    sourcePageUrl: "https://commons.wikimedia.org/wiki/File:Christopher%20Nolan.jpg",
    modified: true,
    checksum: "84df09b0a709",
  },
];

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
