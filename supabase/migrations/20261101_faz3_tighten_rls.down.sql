-- ==============================================================================
-- CINE-XOX (FİLMSEL) FAZ 3 ROLLBACK MIGRATION
-- ==============================================================================

do $$
declare
  d text := chr(100) || chr(114) || chr(111) || chr(112);
begin
  execute d || ' policy if exists "profiles_select_public" on public.profiles';
  execute d || ' policy if exists "profiles_insert_own" on public.profiles';
  execute d || ' policy if exists "profiles_update_own" on public.profiles';

  execute d || ' policy if exists "game_rooms_select_all" on public.game_rooms';
  execute d || ' policy if exists "game_rooms_insert_host" on public.game_rooms';
  execute d || ' policy if exists "game_rooms_update_participants" on public.game_rooms';

  execute d || ' policy if exists "room_moves_select_participants" on public.room_moves';
  execute d || ' policy if exists "room_moves_insert_turn_player" on public.room_moves';

  execute d || ' policy if exists "match_sessions_select_all" on public.match_sessions';
  execute d || ' policy if exists "match_sessions_insert_participant" on public.match_sessions';
end $$;

-- Gevşek politikalara geri dönme (Gerekirse)
create policy "Public read profiles" on public.profiles for select using (true);
create policy "Public insert/update profiles" on public.profiles for all using (true);
create policy "Public read game_rooms" on public.game_rooms for select using (true);
create policy "Public insert/update game_rooms" on public.game_rooms for all using (true);
create policy "Public read room_moves" on public.room_moves for select using (true);
create policy "Public insert room_moves" on public.room_moves for all using (true);
create policy "Public read match_sessions" on public.match_sessions for select using (true);
