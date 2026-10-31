-- ==============================================================================
-- CINE-XOX (FİLMSEL) FAZ 2: SCHEMA & DATA INTEGRITY MIGRATION
-- Sorumluluk: game_rooms, room_moves ve match_sessions ilişkisel bütünlüğü
-- ==============================================================================

-- 1. Otomatik updated_at tetikleyici fonksiyonu
create or replace function public.set_current_timestamp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- 2. game_rooms Tablosu Sertleştirme
-- host_id ve guest_id kolonlarını uuid references auth.users(id) tipine dönüştürme
alter table public.game_rooms
  alter column host_id type uuid using host_id::uuid,
  alter column guest_id type uuid using guest_id::uuid;

alter table public.game_rooms
  drop constraint if exists game_rooms_host_id_fkey,
  add constraint game_rooms_host_id_fkey
    foreign key (host_id) references auth.users(id) on delete cascade;

alter table public.game_rooms
  drop constraint if exists game_rooms_guest_id_fkey,
  add constraint game_rooms_guest_id_fkey
    foreign key (guest_id) references auth.users(id) on delete set null;

-- Status, Current Turn, Winner ve Room Code Kısıtları
alter table public.game_rooms
  drop constraint if exists check_game_rooms_status,
  add constraint check_game_rooms_status
    check (status in ('WAITING', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED'));

alter table public.game_rooms
  drop constraint if exists check_game_rooms_current_turn,
  add constraint check_game_rooms_current_turn
    check (current_turn in ('X', 'O'));

alter table public.game_rooms
  drop constraint if exists check_game_rooms_winner,
  add constraint check_game_rooms_winner
    check (winner in ('X', 'O', 'DRAW') or winner is null);

alter table public.game_rooms
  drop constraint if exists check_game_rooms_code_format,
  add constraint check_game_rooms_code_format
    check (room_code ~ '^[A-Z0-9_-]{4,16}$');

-- updated_at trigger'ı bağla
drop trigger if exists set_game_rooms_updated_at on public.game_rooms;
create trigger set_game_rooms_updated_at
  before update on public.game_rooms
  for each row execute function public.set_current_timestamp_updated_at();

-- 3. room_moves Tablosu Sertleştirme
alter table public.room_moves
  alter column player_id type uuid using player_id::uuid;

alter table public.room_moves
  drop constraint if exists room_moves_player_id_fkey,
  add constraint room_moves_player_id_fkey
    foreign key (player_id) references auth.users(id) on delete cascade;

alter table public.room_moves
  drop constraint if exists check_room_moves_player_symbol,
  add constraint check_room_moves_player_symbol
    check (player_symbol in ('X', 'O'));

alter table public.room_moves
  drop constraint if exists check_room_moves_cell_index,
  add constraint check_room_moves_cell_index
    check (cell_index >= 0 and cell_index <= 8);

-- Çalma (steal) olmayan hamleler için aynı hücreye çift oynamayı engelleyen unique index
create unique index if not exists idx_room_moves_unique_cell_non_stealing
  on public.room_moves (room_code, cell_index)
  where (is_stealing = false);

-- Performans indeksleri
create index if not exists idx_room_moves_room_code_created
  on public.room_moves (room_code, created_at asc);

create index if not exists idx_game_rooms_status_created
  on public.game_rooms (status, created_at desc);

-- 4. match_sessions Tablosu (Kalıcı Maç Arşivi)
create table if not exists public.match_sessions (
  id uuid primary key default gen_random_uuid(),
  room_code text,
  player_x_id uuid references auth.users(id) on delete set null,
  player_o_id uuid references auth.users(id) on delete set null,
  winner_id uuid references auth.users(id) on delete set null,
  outcome text not null check (outcome in ('VICTORY_X', 'VICTORY_O', 'DRAW', 'ABANDONED')),
  game_mode text not null,
  board_id text not null,
  board_title text,
  moves_count int not null default 0,
  score_rarity_x int not null default 0,
  score_rarity_o int not null default 0,
  total_arcade_score int not null default 0,
  final_cells jsonb not null default '[]'::jsonb,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_match_sessions_player_x
  on public.match_sessions (player_x_id, completed_at desc);

create index if not exists idx_match_sessions_player_o
  on public.match_sessions (player_o_id, completed_at desc);

-- RLS etkinleştirme
alter table public.match_sessions enable row level security;

-- Herkes maç arşivini görebilir (veya sadece oyuncular)
drop policy if exists "Public read match_sessions" on public.match_sessions;
create policy "Public read match_sessions"
  on public.match_sessions
  for select
  using (true);
