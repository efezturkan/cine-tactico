import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { GameBoard, Movie, PlayerSymbol, CustomRoomSettings } from "@/types/game";
import { UserProfile } from "@/types/profile";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== "https://your-project.supabase.co" &&
  supabaseAnonKey !== "your-anon-key"
);

// Güvenli istemci: Anahtarlar eksikse sahte/boş istemci ile çökme önlenir
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

export interface GameRoomRecord {
  id: string;
  room_code: string;
  host_id: string;
  host_username: string;
  host_avatar: string;
  guest_id: string | null;
  guest_username: string | null;
  guest_avatar: string | null;
  board_id: string;
  board_data: GameBoard;
  status: "WAITING" | "IN_PROGRESS" | "COMPLETED" | "ABANDONED";
  current_turn: PlayerSymbol;
  winner: PlayerSymbol | "DRAW" | null;
  settings: CustomRoomSettings;
  created_at: string;
  updated_at: string;
}

export interface RoomMoveRecord {
  id: string;
  room_code: string;
  cell_index: number;
  movie_id: string;
  movie_data: Movie;
  player_symbol: PlayerSymbol;
  player_id: string;
  is_stealing: boolean;
  created_at: string;
}

export interface LeaderboardProfileRecord {
  id: string;
  user_id: string;
  username: string;
  avatar_id: string;
  rank_title: string;
  rating: number;
  wins: number;
  losses: number;
  draws: number;
  streak: number;
  highest_combo: number;
  reels_balance: number;
  letterboxd_username?: string;
  updated_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Gerçek Zamanlı Oda Servisleri (Realtime Room Services)
// ─────────────────────────────────────────────────────────────────────────────

export async function createRealtimeRoom(
  roomCode: string,
  host: UserProfile,
  board: GameBoard,
  settings: CustomRoomSettings
): Promise<{ success: boolean; room?: GameRoomRecord; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: "Supabase henüz yapılandırılmadı." };
  }

  try {
    const { data, error } = await supabase
      .from("game_rooms")
      .insert({
        room_code: roomCode,
        host_id: host.username,
        host_username: host.username,
        host_avatar: host.avatarId,
        board_id: board.id,
        board_data: board,
        status: "WAITING",
        current_turn: "X",
        settings,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, room: data as GameRoomRecord };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Oda oluşturulamadı";
    return { success: false, error: msg };
  }
}

export async function joinRealtimeRoom(
  roomCode: string,
  guest: UserProfile
): Promise<{ success: boolean; room?: GameRoomRecord; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: "Supabase henüz yapılandırılmadı." };
  }

  try {
    const { data: existing, error: fetchErr } = await supabase
      .from("game_rooms")
      .select("*")
      .eq("room_code", roomCode)
      .single();

    if (fetchErr || !existing) {
      return { success: false, error: "Oda bulunamadı veya kod geçersiz." };
    }

    if (existing.status !== "WAITING") {
      return { success: false, error: "Bu maç zaten başladı veya tamamlandı." };
    }

    if (existing.host_id === guest.username) {
      return { success: true, room: existing as GameRoomRecord };
    }

    const { data, error } = await supabase
      .from("game_rooms")
      .update({
        guest_id: guest.username,
        guest_username: guest.username,
        guest_avatar: guest.avatarId,
        status: "IN_PROGRESS",
        updated_at: new Date().toISOString(),
      })
      .eq("room_code", roomCode)
      .select()
      .single();

    if (error) throw error;
    return { success: true, room: data as GameRoomRecord };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Odaya katılınamadı";
    return { success: false, error: msg };
  }
}

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

export async function finishRealtimeGame(
  roomCode: string,
  winner: PlayerSymbol | "DRAW"
): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    await supabase
      .from("game_rooms")
      .update({
        status: "COMPLETED",
        winner,
        updated_at: new Date().toISOString(),
      })
      .eq("room_code", roomCode);
  } catch {
    // Non-blocking
  }
}

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
