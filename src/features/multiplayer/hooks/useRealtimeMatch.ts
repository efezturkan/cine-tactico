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
  isHost: boolean;
  onRemoteMoveReceived: (cellIndex: number, movie: Movie, playerSymbol: PlayerSymbol) => void;
  onOpponentJoined?: (opponent: { username: string; avatarId: string }) => void;
  onGameCompleted?: (winner: PlayerSymbol | "DRAW") => void;
}

export function useRealtimeMatch({
  roomCode,
  userProfile,
  isHost,
  onRemoteMoveReceived,
  onOpponentJoined,
  onGameCompleted,
}: UseRealtimeMatchProps) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [opponentOnline, setOpponentOnline] = useState<boolean>(false);
  const [opponentInfo, setOpponentInfo] = useState<{ username: string; avatarId: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!roomCode || !isSupabaseConfigured || !supabase) {
      setIsConnected(false);
      return;
    }

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
        const state = channel.presenceState();
        const players = Object.keys(state);
        const hasOpponent = players.some(p => p !== userProfile.username);
        setOpponentOnline(hasOpponent);
      })
      .on("presence", { event: "join" }, ({ newPresences }) => {
        const joining = newPresences.find(
          (p: Record<string, unknown>) => p.username !== userProfile.username
        ) as { username: string; avatarId: string } | undefined;
        if (joining) {
          setOpponentOnline(true);
          setOpponentInfo({ username: joining.username, avatarId: joining.avatarId || "avatar_director" });
          if (onOpponentJoined) {
            onOpponentJoined({ username: joining.username, avatarId: joining.avatarId || "avatar_director" });
          }
        }
      })
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        const left = leftPresences.find(
          (p: Record<string, unknown>) => p.username !== userProfile.username
        );
        if (left) {
          setOpponentOnline(false);
        }
      });

    // 2. Broadcast ile Hızlı Hamle İletimi
    channel.on("broadcast", { event: "MOVE_MADE" }, ({ payload }) => {
      const { cellIndex, movie, playerSymbol, senderId } = payload;
      if (senderId !== userProfile.username) {
        onRemoteMoveReceived(cellIndex, movie, playerSymbol);
      }
    });

    // 3. Database Postgres Changes (Yedek Güvenilirlik & Geçmiş)
    channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "room_moves",
          filter: `room_code=eq.${roomCode}`,
        },
        payload => {
          const newMove = payload.new as RoomMoveRecord;
          if (newMove.player_id !== userProfile.username) {
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
        payload => {
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

    channel.subscribe(status => {
      if (status === "SUBSCRIBED") {
        setIsConnected(true);
        channel.track({
          username: userProfile.username,
          avatarId: userProfile.avatarId,
          role: isHost ? "HOST" : "GUEST",
          joinedAt: new Date().toISOString(),
        });
      } else if (status === "CHANNEL_ERROR") {
        setIsConnected(false);
        setError("Oda bağlantısı kurulamadı.");
      }
    });

    channelRef.current = channel;

    return () => {
      if (channelRef.current && supabase) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setIsConnected(false);
    };
  }, [roomCode, userProfile.username, userProfile.avatarId, isHost, onRemoteMoveReceived, onOpponentJoined, onGameCompleted]);

  // Hamle Gönderme (Hem Broadcast WebSocket hem de Supabase DB'ye çift kanallı)
  const broadcastMove = useCallback(
    async (cellIndex: number, movie: Movie, playerSymbol: PlayerSymbol, isStealing: boolean = false) => {
      if (!roomCode) return;

      if (channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "MOVE_MADE",
          payload: {
            cellIndex,
            movie,
            playerSymbol,
            senderId: userProfile.username,
            isStealing,
          },
        });
      }

      if (isSupabaseConfigured && supabase) {
        await submitRealtimeMove(
          roomCode,
          cellIndex,
          movie,
          playerSymbol,
          userProfile.username,
          isStealing
        );
      }
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
