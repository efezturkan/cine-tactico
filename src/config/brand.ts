/**
 * MARKA: tek kaynak. Adı değiştirmek gerekirse yalnızca buradaki ve yerel dosya/Info.plist satırları değişir.
 * Depolama anahtarları (`cinexox_*`) ve dahili günlük etiketleri bilerek eski kalır: oyuncu verisi korunur.
 */
export const BRAND_NAME = "Crosscut";
export const BRAND_WORDMARK: [string, string] = ["CROSS", "CUT"];

/**
 * Genel site adresi. Kendi alan adı alınınca (örn. crosscutgame.com) yalnızca burası ve
 * public/robots.txt, sitemap.xml, llms.txt güncellenir.
 */
export const SITE_URL = "https://cine-tactico.vercel.app";

/** Varlık tanımı cümlesi: site, mağaza, sosyal profiller ve yapılandırılmış veride AYNEN kullanılır (GEO tutarlılığı). */
export const ENTITY_SENTENCE =
  "Crosscut is a free iOS movie trivia game where each square of a 3x3 grid is the crossing of two film clues.";
