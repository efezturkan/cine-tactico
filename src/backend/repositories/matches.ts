import { supabase, isSupabaseConfigured } from "../supabase/client";
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
