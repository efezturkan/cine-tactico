"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  supabase,
  isSupabaseConfigured,
  GameRoomRecord,
  RoomMoveRecord,
  submitRealtimeMove,
} from "@/backend";
import { Movie, PlayerSymbol } from "@/core/types";
import { UserProfile } from "@/types/profile";
import { RealtimeChannel } from "@supabase/supabase-js";

interface UseRealtimeMatchProps {
  roomCode: string | null;
  userProfile: UserProfile;
  currentUserId?: string;
  isHost: boolean;
  onRemoteMoveReceived: (cellIndex: number, movie: Movie, playerSymbol: PlayerSymbol) => void;
  onOpponentJoined?: (opponent: { username: string; avatarId: string }) => void;
  onGameCompleted?: (winner: PlayerSymbol | "DRAW") => void;
  onOpponentDisconnected?: () => void;
  onOpponentReconnected?: () => void;
}

export function useRealtimeMatch({
  roomCode,
  userProfile,
  currentUserId,
  isHost,
  onRemoteMoveReceived,
  onOpponentJoined,
  onGameCompleted,
  onOpponentDisconnected,
  onOpponentReconnected,
}: UseRealtimeMatchProps) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [opponentOnline, setOpponentOnline] = useState<boolean>(false);
  const [opponentInfo, setOpponentInfo] = useState<{ username: string; avatarId: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const resolvedUserIdRef = useRef<string | undefined>(currentUserId);

  // Rehydration: Fetch moves history on initial connect / reconnect
  const rehydrateMoves = useCallback(async (code: string, myUserId?: string) => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { data: moves, error: movesErr } = await supabase
        .from("room_moves")
        .select("*")
        .eq("room_code", code)
        .order("created_at", { ascending: true });

      if (movesErr || !moves) return;

      for (const m of moves as RoomMoveRecord[]) {
        if (!myUserId || m.player_id !== myUserId) {
          onRemoteMoveReceived(m.cell_index, m.movie_data, m.player_symbol);
        }
      }
    } catch {
      // Non-blocking rehydration
    }
  }, [onRemoteMoveReceived]);

  useEffect(() => {
    if (!roomCode || !isSupabaseConfigured || !supabase) {
      setIsConnected(false);
      return;
    }

    let isMounted = true;

    // Resolve current user ID if not provided
    const initSession = async () => {
      if (!resolvedUserIdRef.current && supabase) {
        const { data } = await supabase.auth.getUser();
        if (data?.user?.id) {
          resolvedUserIdRef.current = data.user.id;
        }
      }
    };
    initSession();

    const channelName = `cinexox_room_${roomCode}`;
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { ack: true },
        presence: { key: userProfile.username },
      },
    });

    // 1. Presence (Oyuncu Odada mı?)
    channel
      .on("presence", { event: "sync" }, () => {
        if (!isMounted) return;
        const state = channel.presenceState();
        const players = Object.keys(state);
        const hasOpponent = players.some((p) => p !== userProfile.username);
        setOpponentOnline(hasOpponent);
      })
      .on("presence", { event: "join" }, ({ newPresences }) => {
        if (!isMounted) return;
        const joining = newPresences.find(
          (p: Record<string, unknown>) => p.username !== userProfile.username
        ) as { username: string; avatarId: string } | undefined;
        if (joining) {
          setOpponentOnline(true);
          setOpponentInfo({ username: joining.username, avatarId: joining.avatarId || "avatar_director" });
          if (onOpponentJoined) {
            onOpponentJoined({ username: joining.username, avatarId: joining.avatarId || "avatar_director" });
          }
          if (onOpponentReconnected) {
            onOpponentReconnected();
          }
        }
      })
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        if (!isMounted) return;
        const left = leftPresences.find(
          (p: Record<string, unknown>) => p.username !== userProfile.username
        );
        if (left) {
          setOpponentOnline(false);
          if (onOpponentDisconnected) {
            onOpponentDisconnected();
          }
        }
      });

    // 2. Broadcast ile Düşük Gecikmeli Hamle İletimi
    channel.on("broadcast", { event: "MOVE_MADE" }, ({ payload }) => {
      if (!isMounted) return;
      const { cellIndex, movie, playerSymbol, senderUsername } = payload;
      if (senderUsername !== userProfile.username) {
        onRemoteMoveReceived(cellIndex, movie, playerSymbol);
      }
    });

    // 3. Database Postgres Changes (Yedek Güvenilirlik & Senkronizasyon)
    channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "room_moves",
          filter: `room_code=eq.${roomCode}`,
        },
        (payload) => {
          if (!isMounted) return;
          const newMove = payload.new as RoomMoveRecord;
          const myId = resolvedUserIdRef.current;
          if (!myId || newMove.player_id !== myId) {
            onRemoteMoveReceived(newMove.cell_index, newMove.movie_data, newMove.player_symbol);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "game_rooms",
          filter: `room_code=eq.${roomCode}`,
        },
        (payload) => {
          if (!isMounted) return;
          const updatedRoom = payload.new as GameRoomRecord;
          if (updatedRoom.status === "IN_PROGRESS" && updatedRoom.guest_username) {
            setOpponentInfo({
              username: updatedRoom.guest_username,
              avatarId: updatedRoom.guest_avatar || "avatar_director",
            });
            if (onOpponentJoined) {
              onOpponentJoined({
                username: updatedRoom.guest_username,
                avatarId: updatedRoom.guest_avatar || "avatar_director",
              });
            }
          }
          if (updatedRoom.status === "COMPLETED" && updatedRoom.winner && onGameCompleted) {
            onGameCompleted(updatedRoom.winner);
          }
        }
      );

    channel.subscribe(async (status) => {
      if (!isMounted) return;
      if (status === "SUBSCRIBED") {
        setIsConnected(true);
        channel.track({
          username: userProfile.username,
          avatarId: userProfile.avatarId,
          role: isHost ? "HOST" : "GUEST",
          joinedAt: new Date().toISOString(),
        });

        // Rehydrate moves on successful subscribe
        await rehydrateMoves(roomCode, resolvedUserIdRef.current);
      } else if (status === "CHANNEL_ERROR") {
        setIsConnected(false);
        setError("Oda bağlantısı kurulamadı.");
      }
    });

    channelRef.current = channel;

    return () => {
      isMounted = false;
      if (channelRef.current && supabase) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setIsConnected(false);
    };
  }, [
    roomCode,
    userProfile.username,
    userProfile.avatarId,
    isHost,
    onRemoteMoveReceived,
    onOpponentJoined,
    onGameCompleted,
    onOpponentDisconnected,
    onOpponentReconnected,
    rehydrateMoves,
  ]);

  // Hamle Gönderme: Hem Broadcast hem de Server RPC submit_move
  const broadcastMove = useCallback(
    async (
      cellIndex: number,
      movie: Movie,
      playerSymbol: PlayerSymbol,
      isStealing: boolean = false
    ) => {
      if (!roomCode) return { success: false, error: "Oda kodu yok" };

      // Hızlı broadcast
      if (channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "MOVE_MADE",
          payload: {
            cellIndex,
            movie,
            playerSymbol,
            senderUsername: userProfile.username,
            isStealing,
          },
        });
      }

      // Server-authoritative RPC
      if (isSupabaseConfigured && supabase) {
        const res = await submitRealtimeMove(
          roomCode,
          cellIndex,
          movie,
          playerSymbol,
          resolvedUserIdRef.current,
          isStealing
        );
        return res;
      }

      return { success: true };
    },
    [roomCode, userProfile.username]
  );

  return {
    isConnected,
    opponentOnline,
    opponentInfo,
    broadcastMove,
    error,
  };
}
