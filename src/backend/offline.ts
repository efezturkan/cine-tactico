import type * as Online from "./online";

/**
 * Sürüm 1.0 paketinde ağ kodu yoktur. Bu modül, çevrimiçi katmanın imzalarını
 * ağsız ve etkisiz olarak karşılar; böylece Supabase istemcisi ve çevrimiçi
 * oda kodu pakete hiç girmez. Gerçek katman: ./online (NEXT_PUBLIC_ENABLE_ONLINE=1).
 */
const NOT_AVAILABLE = "Çevrimiçi özellikler bu sürümde yok.";

export const isSupabaseConfigured = false;
export const supabase = null;

export const ensureAnonymousSession: typeof Online.ensureAnonymousSession = async () => ({
  user: null,
  session: null,
  profile: null,
  isAnonymous: true,
  error: NOT_AVAILABLE,
});
export const fetchProfileByUserId: typeof Online.fetchProfileByUserId = async () => null;
export const updateUsernameWithUniqueness: typeof Online.updateUsernameWithUniqueness = async () => ({
  success: false,
  error: NOT_AVAILABLE,
});
export const linkAnonymousAccountToEmail: typeof Online.linkAnonymousAccountToEmail = async () => ({
  success: false,
  error: NOT_AVAILABLE,
});
export const deleteUserAccount: typeof Online.deleteUserAccount = async () => ({
  success: false,
  error: NOT_AVAILABLE,
});
export const fetchGlobalLeaderboard: typeof Online.fetchGlobalLeaderboard = async () => [];
export const syncProfileToSupabase: typeof Online.syncProfileToSupabase = async () => {};
export const submitRealtimeMove: typeof Online.submitRealtimeMove = async () => ({
  success: false,
  error: NOT_AVAILABLE,
});
export const archiveMatchSession: typeof Online.archiveMatchSession = async () => ({
  success: false,
  error: NOT_AVAILABLE,
});
export const fetchPlayerMatchHistory: typeof Online.fetchPlayerMatchHistory = async () => ({
  success: false,
  matches: [],
  error: NOT_AVAILABLE,
});
export const createRealtimeRoom: typeof Online.createRealtimeRoom = async () => ({
  success: false,
  error: NOT_AVAILABLE,
});
export const joinRealtimeRoom: typeof Online.joinRealtimeRoom = async () => ({
  success: false,
  error: NOT_AVAILABLE,
});
export const finishRealtimeGame: typeof Online.finishRealtimeGame = async () => {};
