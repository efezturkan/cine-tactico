import { supabase, isSupabaseConfigured } from "../supabase/client";
import { MatchSessionRecord } from "../supabase/types";
import { Movie, PlayerSymbol } from "@/core/types";

export interface SubmitMoveResponse {
  success: boolean;
  status?: "IN_PROGRESS" | "COMPLETED";
  winner?: PlayerSymbol | "DRAW";
  current_turn?: PlayerSymbol;
  player_symbol?: PlayerSymbol;
  cell_index?: number;
  error?: string;
}

/**
 * Server-authoritative move submission via PostgreSQL RPC `submit_move`.
 * Atomically checks turn, updates moves table, evaluates win lines and advances turn.
 */
export async function submitRealtimeMove(
  roomCode: string,
  cellIndex: number,
  movie: Movie,
  _playerSymbol?: PlayerSymbol,
  _playerId?: string,
  isStealing: boolean = false
): Promise<SubmitMoveResponse> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: "Supabase henüz yapılandırılmadı." };
  }

  try {
    const { data, error } = await supabase.rpc("submit_move", {
      p_room_code: roomCode,
      p_cell_index: cellIndex,
      p_movie_id: movie.id,
      p_movie_data: movie,
      p_is_stealing: isStealing,
    });

    if (error) throw error;

    if (data && typeof data === "object" && !data.success) {
      return { success: false, error: data.error || "Hamle reddedildi." };
    }

    return (data || { success: true }) as SubmitMoveResponse;
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
