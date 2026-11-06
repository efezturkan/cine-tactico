/**
 * CineXOX MVP Feature Flags
 * Kaynak: MVP_SCOPE.md "2. MVP'de GİZLİ (Kod Silinmez, FLAGS Arkasına Alınır)"
 * Bu özellikler koddan silinmez, yalnızca MVP arayüzünde render edilmez.
 */

export interface CineFeatureFlags {
  /** Günlük görev şeridi ve ödül takibi */
  SHOW_DAILY_QUESTS: boolean;
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
  /** Kılavuz/Yardım üst bar butonu (Ayarlar içine taşınır) */
  SHOW_HEADER_HELP_BUTTON: boolean;
  /** Işık huzmesi (Gişe) */
  LIGHT_BEAM: boolean;
  /** Açılış ışık sızıntısı */
  OPENING_LEAK: boolean;
  /** Puan sistemi (+ Puan) */
  SHOW_POINTS_SYSTEM: boolean;
  /** Çevrimiçi Özel Gösterim + Supabase (v1.0: kapalı, tamamen çevrimdışı) */
  SHOW_ONLINE_ROOM: boolean;
}

export const FLAGS: CineFeatureFlags = {
  SHOW_DAILY_QUESTS: false,
  SHOW_LEAGUE_BAR: false,
  SHOW_COIN_ECONOMY: false,
  SHOW_NOTIFICATIONS: false,
  SHOW_PROBABILITY_MATRIX: false,
  SHOW_NEW_FORMATS: false,
  SHOW_HEADER_HELP_BUTTON: false,
  LIGHT_BEAM: true,
  OPENING_LEAK: true,
  SHOW_POINTS_SYSTEM: false,
  SHOW_ONLINE_ROOM: false,
};
