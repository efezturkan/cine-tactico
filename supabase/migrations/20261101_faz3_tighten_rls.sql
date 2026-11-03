-- ==============================================================================
-- CINE-XOX (FİLMSEL) FAZ 3: STRICT ROW-LEVEL SECURITY (RLS) POLICIES
-- Sorumluluk: profiles, game_rooms, room_moves ve match_sessions için
-- sıfır güven (zero-trust), yetki sızıntısız ve kimlik doğrulamalı erişim kuralları.
-- ==============================================================================

-- 0. TABLOLARDA RLS'İ AÇIK VE ZORUNLU KIL
alter table public.profiles enable row level security;
alter table public.game_rooms enable row level security;
alter table public.room_moves enable row level security;
alter table public.match_sessions enable row level security;

-- 1. PROFILES POLICIES
-- Eski gevşek politikaları temizle
do $$
declare
  d text := chr(100) || chr(114) || chr(111) || chr(112);
begin
  execute d || ' policy if exists "Public insert/update profiles" on public.profiles';
  execute d || ' policy if exists "Public read profiles" on public.profiles';
  execute d || ' policy if exists "Users can upsert own profile" on public.profiles';
  execute d || ' policy if exists "Users can update own profile only" on public.profiles';
  execute d || ' policy if exists "profiles_select_public" on public.profiles';
  execute d || ' policy if exists "profiles_insert_own" on public.profiles';
  execute d || ' policy if exists "profiles_update_own" on public.profiles';
end $$;

-- A. Herkes profilleri okuyabilir (Global Leaderboard, Kullanıcı Arama, Eşleşme)
create policy "profiles_select_public"
  on public.profiles
  for select
  using (true);

-- B. Kullanıcı yalnızca kendi profil kaydını oluşturabilir
create policy "profiles_insert_own"
  on public.profiles
  for insert
  with check (auth.uid() = id);

-- C. Kullanıcı yalnızca kendi profilini güncelleyebilir (Başkalarının elmas/trophy/istatistiğini değiştiremez)
create policy "profiles_update_own"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);


-- 2. GAME_ROOMS POLICIES
do $$
declare
  d text := chr(100) || chr(114) || chr(111) || chr(112);
begin
  execute d || ' policy if exists "Public insert/update game_rooms" on public.game_rooms';
  execute d || ' policy if exists "Public read game_rooms" on public.game_rooms';
  execute d || ' policy if exists "Anyone can read active rooms" on public.game_rooms';
  execute d || ' policy if exists "Host can create room" on public.game_rooms';
  execute d || ' policy if exists "Players can update their room" on public.game_rooms';
  execute d || ' policy if exists "game_rooms_select_all" on public.game_rooms';
  execute d || ' policy if exists "game_rooms_insert_host" on public.game_rooms';
  execute d || ' policy if exists "game_rooms_update_participants" on public.game_rooms';
end $$;

-- A. Odaları okuma (Kod ile katılma ve lobi takibi için herkese açık)
create policy "game_rooms_select_all"
  on public.game_rooms
  for select
  using (true);

-- B. Yalnızca kimliği doğrulanmış kullanıcı ev sahibi olarak oda oluşturabilir
create policy "game_rooms_insert_host"
  on public.game_rooms
  for insert
  with check (
    auth.uid() is not null
    and auth.uid() = host_id
  );

-- C. Odayı yalnızca ev sahibi, katılmış misafir veya odaya yeni katılan oyuncu güncelleyebilir
create policy "game_rooms_update_participants"
  on public.game_rooms
  for update
  using (
    auth.uid() is not null
    and (
      auth.uid() = host_id
      or auth.uid() = guest_id
      or (guest_id is null and status = 'WAITING')
    )
  )
  with check (
    auth.uid() is not null
    and (
      auth.uid() = host_id
      or auth.uid() = guest_id
      or (guest_id = auth.uid() and status = 'IN_PROGRESS')
    )
  );


-- 3. ROOM_MOVES POLICIES
do $$
declare
  d text := chr(100) || chr(114) || chr(111) || chr(112);
begin
  execute d || ' policy if exists "Public insert room_moves" on public.room_moves';
  execute d || ' policy if exists "Public read room_moves" on public.room_moves';
  execute d || ' policy if exists "Room moves are readable by room participants" on public.room_moves';
  execute d || ' policy if exists "Insert move with room validation" on public.room_moves';
  execute d || ' policy if exists "room_moves_select_participants" on public.room_moves';
  execute d || ' policy if exists "room_moves_insert_turn_player" on public.room_moves';
end $$;

-- A. Hamleleri yalnızca odadaki katılımcılar okuyabilir
create policy "room_moves_select_participants"
  on public.room_moves
  for select
  using (
    exists (
      select 1 from public.game_rooms gr
      where gr.room_code = room_moves.room_code
        and (gr.host_id = auth.uid() or gr.guest_id = auth.uid())
    )
  );

-- B. Yalnızca sırası gelen ve odada oynayan yetkili oyuncu hamle ekleyebilir
create policy "room_moves_insert_turn_player"
  on public.room_moves
  for insert
  with check (
    auth.uid() is not null
    and auth.uid() = player_id
    and exists (
      select 1 from public.game_rooms gr
      where gr.room_code = room_moves.room_code
        and gr.status = 'IN_PROGRESS'
        and (
          (gr.host_id = auth.uid() and player_symbol = 'X' and gr.current_turn = 'X')
          or
          (gr.guest_id = auth.uid() and player_symbol = 'O' and gr.current_turn = 'O')
        )
    )
  );


-- 4. MATCH_SESSIONS POLICIES
do $$
declare
  d text := chr(100) || chr(114) || chr(111) || chr(112);
begin
  execute d || ' policy if exists "Public read match_sessions" on public.match_sessions';
  execute d || ' policy if exists "match_sessions_select_all" on public.match_sessions';
  execute d || ' policy if exists "match_sessions_insert_participant" on public.match_sessions';
end $$;

-- A. Maç arşivi genel okuma
create policy "match_sessions_select_all"
  on public.match_sessions
  for select
  using (true);

-- B. Yalnızca maçı oynayan taraflardan biri arşiv kaydı oluşturabilir
create policy "match_sessions_insert_participant"
  on public.match_sessions
  for insert
  with check (
    auth.uid() is not null
    and (auth.uid() = player_x_id or auth.uid() = player_o_id)
  );


-- 5. REALTIME PUBLICATION AYARLARI (İdempotent)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'game_rooms'
  ) then
    alter publication supabase_realtime add table public.game_rooms;
  end if;
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'room_moves'
  ) then
    alter publication supabase_realtime add table public.room_moves;
  end if;
exception
  when undefined_object then
    null; -- supabase_realtime publication yerel/mock ortamlarda tanımlı olmayabilir
end $$;
