import type * as Online from "./online";

export * from "./supabase/types";

/**
 * Çevrimiçi katman yalnızca NEXT_PUBLIC_ENABLE_ONLINE=1 ile derlenir. Varsayılan
 * (ve App Store 1.0) paketi ağsızdır: derleyici koşulu sabit değerlendirir ve
 * kullanılmayan dalı, Supabase istemcisiyle birlikte pakete almaz.
 */
const impl: typeof Online =
  process.env.NEXT_PUBLIC_ENABLE_ONLINE === "1"
    ? require("./online")
    : (require("./offline") as typeof Online);

export const isSupabaseConfigured = impl.isSupabaseConfigured;
export const supabase = impl.supabase;
export const ensureAnonymousSession = impl.ensureAnonymousSession;
export const fetchProfileByUserId = impl.fetchProfileByUserId;
export const updateUsernameWithUniqueness = impl.updateUsernameWithUniqueness;
export const linkAnonymousAccountToEmail = impl.linkAnonymousAccountToEmail;
export const deleteUserAccount = impl.deleteUserAccount;
export const fetchGlobalLeaderboard = impl.fetchGlobalLeaderboard;
export const syncProfileToSupabase = impl.syncProfileToSupabase;
export const submitRealtimeMove = impl.submitRealtimeMove;
export const archiveMatchSession = impl.archiveMatchSession;
export const fetchPlayerMatchHistory = impl.fetchPlayerMatchHistory;
export const createRealtimeRoom = impl.createRealtimeRoom;
export const joinRealtimeRoom = impl.joinRealtimeRoom;
export const finishRealtimeGame = impl.finishRealtimeGame;
export type { AuthState } from "./supabase/auth";
