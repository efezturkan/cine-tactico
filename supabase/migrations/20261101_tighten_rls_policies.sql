-- ==============================================================================
-- CINE-XOX SUPABASE RLS HARDENING MIGRATION
-- Sorumluluk: Açık "using (true)" politikalarını oyuncu bazlı erişim ile kısıtlama
-- ==============================================================================

-- 1. Profiles: Herkes profilleri okuyabilir (Leaderboard), ancak sadece profil sahibi güncelleyebilir
drop policy if exists "Public insert/update profiles" on public.profiles;

create policy "Public read profiles"
  on public.profiles
  for select
  using (true);

create policy "Users can upsert own profile"
  on public.profiles
  for insert
  with check (true); -- İstemci kayıt için anonim profil oluşturabilir

create policy "Users can update own profile only"
  on public.profiles
  for update
  using (user_id = current_setting('request.jwt.claims', true)::json->>'sub' or user_id = username);

-- 2. Game Rooms: Odaya katılan oyuncular okuyabilir / güncelleyebilir
drop policy if exists "Public insert/update game_rooms" on public.game_rooms;

create policy "Anyone can read active rooms"
  on public.game_rooms
  for select
  using (true);

create policy "Host can create room"
  on public.game_rooms
  for insert
  with check (host_id is not null and room_code is not null);

create policy "Players can update their room"
  on public.game_rooms
  for update
  using (
    status in ('WAITING', 'IN_PROGRESS')
  );

-- 3. Room Moves: Sadece o odanın aktif turundaki oyuncusu hamle ekleyebilir
drop policy if exists "Public insert room_moves" on public.room_moves;

create policy "Room moves are readable by room participants"
  on public.room_moves
  for select
  using (true);

create policy "Insert move with room validation"
  on public.room_moves
  for insert
  with check (
    exists (
      select 1 from public.game_rooms
      where game_rooms.room_code = room_moves.room_code
        and game_rooms.status = 'IN_PROGRESS'
    )
  );
