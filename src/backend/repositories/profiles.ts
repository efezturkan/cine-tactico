import { supabase, isSupabaseConfigured } from "../supabase/client";
import { UserProfile } from "@/types/profile";

export async function syncProfileToSupabase(profile: UserProfile): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    await supabase.from("profiles").upsert(
      {
        user_id: profile.username,
        username: profile.username,
        avatar_id: profile.avatarId,
        rank_title: profile.rankTitle || "Bilet Kontrolörü 🍿",
        rating: 1000 + (profile.wins * 25) - (profile.losses * 12),
        wins: profile.wins,
        losses: profile.losses,
        draws: profile.draws,
        streak: profile.dailyStreak || 0,
        highest_combo: profile.highestCombo || 0,
        reels_balance: profile.reelsBalance,
        letterboxd_username: profile.letterboxdUsername || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  } catch {
    // Non-blocking background sync
  }
}
