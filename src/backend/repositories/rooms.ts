import { supabase, isSupabaseConfigured } from "../supabase/client";
import { GameRoomRecord } from "../supabase/types";
import { GameBoard, CustomRoomSettings, PlayerSymbol } from "@/core";
import { UserProfile } from "@/types/profile";

export async function createRealtimeRoom(
  roomCode: string,
  host: UserProfile,
  board: GameBoard,
  settings: CustomRoomSettings,
  hostUserId?: string
): Promise<{ success: boolean; room?: GameRoomRecord; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: "Supabase henüz yapılandırılmadı." };
  }

  try {
    const userRes = await supabase.auth.getUser();
    const actualHostId = hostUserId || userRes.data?.user?.id;
    if (!actualHostId) {
      return { success: false, error: "Oda oluşturmak için geçerli bir kullanıcı oturumu gerekli." };
    }

    const { data, error } = await supabase
      .from("game_rooms")
      .insert({
        room_code: roomCode,
        host_id: actualHostId,
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
  guest: UserProfile,
  guestUserId?: string
): Promise<{ success: boolean; room?: GameRoomRecord; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: "Supabase henüz yapılandırılmadı." };
  }

  try {
    const userRes = await supabase.auth.getUser();
    const actualGuestId = guestUserId || userRes.data?.user?.id;
    if (!actualGuestId) {
      return { success: false, error: "Odaya katılmak için geçerli bir kullanıcı oturumu gerekli." };
    }

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

    if (existing.host_id === actualGuestId) {
      return { success: true, room: existing as GameRoomRecord };
    }

    const { data, error } = await supabase
      .from("game_rooms")
      .update({
        guest_id: actualGuestId,
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
