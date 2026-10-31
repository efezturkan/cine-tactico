-- ==============================================================================
-- ROLLBACK SCRIPT FOR FAZ 1 (20261101_faz1_auth_profiles.down.sql)
-- ==============================================================================

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop function if exists public.change_username(text);
drop index if exists public.idx_profiles_username_lower;

alter table public.profiles
  drop constraint if exists profiles_id_fkey;

alter table public.profiles
  alter column user_id set not null;
