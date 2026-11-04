/**
 * Global UTC Günlük Tarih Standardı (UTC 00:00).
 * CINE-XOX Günün Kadrajı ve günlük hak/seri kontrollerinin dünya genelindeki tek referansıdır.
 * Kullanıcının yerel cihaz saat diliminden veya konumundan bağımsız olarak
 * tüm dünyada aynı anda aynı UTC gününü temsil eder.
 */

/**
 * Verilen tarih veya geçerli an için UTC takvim gününü YYYY-MM-DD formatında döner.
 * @param date - Opsiyonel Date nesnesi (varsayılan: geçerli sistem anı)
 * @returns 'YYYY-MM-DD' formatında deterministik UTC tarih anahtarı
 */
export function getGlobalDailyDateKey(date: Date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Günün Kadrası sayı numarası: lansman günü (UTC 2026-11-05) = NO.01. Ana ekran ve paylaşım kartı aynı sayıyı kullanır. */
export function getDailyEditionNumber(date: Date = new Date()): string {
  const launch = Date.UTC(2026, 10, 5);
  const today = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const n = Math.max(1, Math.floor((today - launch) / 86_400_000) + 1);
  return String(n).padStart(2, "0");
}
