/**
 * Arama ve karşılaştırma için. Özgün metni değiştirmez.
 * Türkçe harfler, boşluk, noktalama ve büyük-küçük harf eşitlenir.
 */
export function normalizeForSearch(input: string): string {
  if (!input) return "";
  return input
    .trim()
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
