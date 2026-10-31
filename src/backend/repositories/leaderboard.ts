import { supabase, isSupabaseConfigured } from "../supabase/client";
import { LeaderboardProfileRecord } from "../supabase/types";

export async function fetchGlobalLeaderboard(
  limit: number = 20
): Promise<LeaderboardProfileRecord[]> {
  if (!isSupabaseConfigured || !supabase) return [];

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("rating", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data as LeaderboardProfileRecord[]) || [];
  } catch {
    return [];
  }
}
