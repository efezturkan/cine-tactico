/**
 * CineXOX MVP Feature Flags
 * Kaynak: MVP_SCOPE.md "2. MVP'de GİZLİ (Kod Silinmez, FLAGS Arkasına Alınır)"
 * Bu özellikler koddan silinmez, yalnızca MVP arayüzünde render edilmez.
 */

export interface CineFeatureFlags {
  /** Canlı çevrimiçi sayısı göstergesi */
  SHOW_ONLINE_COUNT: boolean;
  /** Canlı maç ticker'ı / son hamleler feed'i */
  SHOW_LIVE_TICKER: boolean;
  /** Günlük görev şeridi ve ödül takibi */
  SHOW_DAILY_QUESTS: boolean;
  /** Zevk DNA'sı radarı ve Letterboxd bağlantısı */
  SHOW_TASTE_DNA: boolean;
  /** Letterboxd hesap bağlama kutusu */
  SHOW_LETTERBOXD_CONNECT: boolean;
  /** Lig yerleşimi çubuğu ve dereceli sezon göstergeleri */
  SHOW_LEAGUE_BAR: boolean;
  /** Makara / coin ekonomisi, bakiye rozeti ve mağaza ödülleri */
  SHOW_COIN_ECONOMY: boolean;
  /** Bildirim zili ve uyarı açılır penceresi */
  SHOW_NOTIFICATIONS: boolean;
  /** Olasılık Matrisi sekmesi */
  SHOW_PROBABILITY_MATRIX: boolean;
  /** Yeni Formatlar sekmesi */
  SHOW_NEW_FORMATS: boolean;
  /** Tahta Arşivi sekmesi */
  SHOW_BOARD_ARCHIVE: boolean;
  /** Ambiyans konsolu üst bar butonu (Ayarlar içine taşınır) */
  SHOW_HEADER_AMBIENCE_BUTTON: boolean;
  /** Kılavuz/Yardım üst bar butonu (Ayarlar içine taşınır) */
  SHOW_HEADER_HELP_BUTTON: boolean;
}

export const FLAGS: CineFeatureFlags = {
  SHOW_ONLINE_COUNT: false,
  SHOW_LIVE_TICKER: false,
  SHOW_DAILY_QUESTS: false,
  SHOW_TASTE_DNA: false,
  SHOW_LETTERBOXD_CONNECT: false,
  SHOW_LEAGUE_BAR: false,
  SHOW_COIN_ECONOMY: false,
  SHOW_NOTIFICATIONS: false,
  SHOW_PROBABILITY_MATRIX: false,
  SHOW_NEW_FORMATS: false,
  SHOW_BOARD_ARCHIVE: false,
  SHOW_HEADER_AMBIENCE_BUTTON: false,
  SHOW_HEADER_HELP_BUTTON: false,
};
