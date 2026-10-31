import { supabase, isSupabaseConfigured } from "../supabase/client";
import { MatchSessionRecord } from "../supabase/types";
import { Movie, PlayerSymbol } from "@/core/types";

export async function submitRealtimeMove(
  roomCode: string,
  cellIndex: number,
  movie: Movie,
  playerSymbol: PlayerSymbol,
  playerId: string,
  isStealing: boolean = false
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: "Supabase henüz yapılandırılmadı." };
  }

  try {
    const { error: moveErr } = await supabase.from("room_moves").insert({
      room_code: roomCode,
      cell_index: cellIndex,
      movie_id: movie.id,
      movie_data: movie,
      player_symbol: playerSymbol,
      player_id: playerId,
      is_stealing: isStealing,
    });

    if (moveErr) throw moveErr;

    const nextTurn = playerSymbol === "X" ? "O" : "X";
    await supabase
      .from("game_rooms")
      .update({
        current_turn: nextTurn,
        updated_at: new Date().toISOString(),
      })
      .eq("room_code", roomCode);

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Hamle iletilemedi";
    return { success: false, error: msg };
  }
}

export async function archiveMatchSession(
  session: Omit<MatchSessionRecord, "id" | "completed_at">
): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: "Supabase henüz yapılandırılmadı." };
  }

  try {
    const { data, error } = await supabase
      .from("match_sessions")
      .insert({
        room_code: session.room_code || null,
        player_x_id: session.player_x_id || null,
        player_o_id: session.player_o_id || null,
        winner_id: session.winner_id || null,
        outcome: session.outcome,
        game_mode: session.game_mode,
        board_id: session.board_id,
        board_title: session.board_title || null,
        moves_count: session.moves_count,
        score_rarity_x: session.score_rarity_x,
        score_rarity_o: session.score_rarity_o,
        total_arcade_score: session.total_arcade_score,
        final_cells: session.final_cells,
      })
      .select("id")
      .single();

    if (error) throw error;
    return { success: true, id: data?.id };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Maç oturumu arşivlenemedi";
    return { success: false, error: msg };
  }
}

export async function fetchPlayerMatchHistory(
  userId: string,
  limit: number = 20
): Promise<{ success: boolean; matches: MatchSessionRecord[]; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, matches: [], error: "Supabase henüz yapılandırılmadı." };
  }

  try {
    const { data, error } = await supabase
      .from("match_sessions")
      .select("*")
      .or(`player_x_id.eq.${userId},player_o_id.eq.${userId}`)
      .order("completed_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { success: true, matches: (data || []) as MatchSessionRecord[] };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Maç geçmişi yüklenemedi";
    return { success: false, matches: [], error: msg };
  }
}
