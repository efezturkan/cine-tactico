import { supabase, isSupabaseConfigured } from "../supabase/client";
import { UserProfile } from "@/types/profile";

/**
 * Synchronizes user stats to Supabase profiles table.
 * Uses auth.users(id) UUID for secure RLS compliance.
 */
export async function syncProfileToSupabase(
  profile: UserProfile,
  authUserId?: string
): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    const userRes = await supabase.auth.getUser();
    const actualId = authUserId || userRes.data?.user?.id;
    if (!actualId) return;

    await supabase.from("profiles").upsert(
      {
        id: actualId,
        user_id: actualId,
        username: profile.username,
        avatar_id: profile.avatarId,
        rank_title: profile.rankTitle || "Bilet Kontrolörü 🍿",
        rating: Math.max(0, 1000 + profile.wins * 25 - profile.losses * 12),
        wins: profile.wins,
        losses: profile.losses,
        draws: profile.draws,
        streak: profile.dailyStreak || 0,
        highest_combo: profile.highestCombo || 0,
        reels_balance: profile.reelsBalance,
        letterboxd_username: profile.letterboxdUsername || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
  } catch {
    // Non-blocking background sync
  }
}
