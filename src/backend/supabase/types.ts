import { GameBoard, Movie, PlayerSymbol, CustomRoomSettings } from "@/core/types";

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
