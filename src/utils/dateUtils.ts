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
