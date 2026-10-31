-- ==============================================================================
-- ROLLBACK SCRIPT FOR FAZ 2 (20261101_faz2_schema_integrity.down.sql)
-- ==============================================================================

drop table if exists public.match_sessions cascade;

drop index if exists public.idx_room_moves_unique_cell_non_stealing;
drop index if exists public.idx_room_moves_room_code_created;
drop index if exists public.idx_game_rooms_status_created;

alter table public.room_moves
  drop constraint if exists check_room_moves_player_symbol,
  drop constraint if exists check_room_moves_cell_index,
  drop constraint if exists room_moves_player_id_fkey;

alter table public.room_moves
  alter column player_id type text using player_id::text;

drop trigger if exists set_game_rooms_updated_at on public.game_rooms;
drop function if exists public.set_current_timestamp_updated_at();

alter table public.game_rooms
  drop constraint if exists check_game_rooms_status,
  drop constraint if exists check_game_rooms_current_turn,
  drop constraint if exists check_game_rooms_winner,
  drop constraint if exists check_game_rooms_code_format,
  drop constraint if exists game_rooms_host_id_fkey,
  drop constraint if exists game_rooms_guest_id_fkey;

alter table public.game_rooms
  alter column host_id type text using host_id::text,
  alter column guest_id type text using guest_id::text;
