-- ==============================================================================
-- CINE-XOX (FİLMSEL) SUPABASE DATABASE SCHEMA & REALTIME CONFIGURATION
-- ==============================================================================

-- 1. Profiles & Global Leaderboard Table
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id text unique not null,
  username text not null,
  avatar_id text not null default 'avatar_director',
  rank_title text not null default 'Bilet Kontrolörü 🍿',
  rating int not null default 1000,
  wins int not null default 0,
  losses int not null default 0,
  draws int not null default 0,
  streak int not null default 0,
  highest_combo int not null default 0,
  reels_balance int not null default 350,
  letterboxd_username text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Realtime 1v1 Game Rooms Table
create table if not exists public.game_rooms (
  id uuid primary key default gen_random_uuid(),
  room_code text unique not null,
  host_id text not null,
  host_username text not null,
  host_avatar text not null default 'avatar_director',
  guest_id text,
  guest_username text,
  guest_avatar text,
  board_id text not null,
  board_data jsonb not null,
  status text not null default 'WAITING', -- 'WAITING', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED'
  current_turn text not null default 'X',
  winner text,
  settings jsonb not null default '{"shotClockSeconds": 12, "allowCellStealing": false}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Room Moves History Table
create table if not exists public.room_moves (
  id uuid primary key default gen_random_uuid(),
  room_code text not null references public.game_rooms(room_code) on delete cascade,
  cell_index int not null,
  movie_id text not null,
  movie_data jsonb not null,
  player_symbol text not null, -- 'X' or 'O'
  player_id text not null,
  is_stealing boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.game_rooms enable row level security;
alter table public.room_moves enable row level security;

-- Public Permissive Policies (Anon Key ile istemci erişimi)
drop policy if exists "Public read profiles" on public.profiles;
create policy "Public read profiles" on public.profiles for select using (true);

drop policy if exists "Public insert/update profiles" on public.profiles;
create policy "Public insert/update profiles" on public.profiles for all using (true);

drop policy if exists "Public read game_rooms" on public.game_rooms;
create policy "Public read game_rooms" on public.game_rooms for select using (true);

drop policy if exists "Public insert/update game_rooms" on public.game_rooms;
create policy "Public insert/update game_rooms" on public.game_rooms for all using (true);

drop policy if exists "Public read room_moves" on public.room_moves;
create policy "Public read room_moves" on public.room_moves for select using (true);

drop policy if exists "Public insert room_moves" on public.room_moves;
create policy "Public insert room_moves" on public.room_moves for all using (true);

-- 5. Realtime Yayın (Publication) Açma
-- Supabase Dashboard > Database > Replication bölümünden de açılabilir
alter publication supabase_realtime add table public.game_rooms;
alter publication supabase_realtime add table public.room_moves;
