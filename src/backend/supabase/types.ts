import { GameBoard, Movie, PlayerSymbol, CustomRoomSettings, CellAnswer } from "@/core";

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

export interface MatchSessionRecord {
  id: string;
  room_code?: string;
  player_x_id?: string | null;
  player_o_id?: string | null;
  winner_id?: string | null;
  outcome: "VICTORY_X" | "VICTORY_O" | "DRAW" | "ABANDONED";
  game_mode: string;
  board_id: string;
  board_title?: string;
  moves_count: number;
  score_rarity_x: number;
  score_rarity_o: number;
  total_arcade_score: number;
  final_cells: (CellAnswer | null)[];
  completed_at: string;
}
