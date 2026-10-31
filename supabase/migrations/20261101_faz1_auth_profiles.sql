-- ==============================================================================
-- CINE-XOX (FİLMSEL) FAZ 1: AUTHENTICATION & PLAYER IDENTITY MIGRATION
-- Sorumluluk: auth.users -> public.profiles foreign key & otomatik profil trigger
-- ==============================================================================

-- 1. Profiles tablosunda id'yi auth.users(id) ile bağlama
alter table public.profiles
  drop constraint if exists profiles_id_fkey;

alter table public.profiles
  add constraint profiles_id_fkey
  foreign key (id) references auth.users(id)
  on delete cascade;

-- 2. user_id alanının varsayılan olarak id ile senkronize tutulması
alter table public.profiles
  alter column user_id drop not null;

-- 3. Username için büyük/küçük harf duyarsız benzersizlik indeksi
create unique index if not exists idx_profiles_username_lower
  on public.profiles (lower(trim(username)));

-- 4. Yeni kullanıcı kaydolduğunda (Anonim veya OAuth) otomatik profil üreten trigger fonksiyonu
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  random_suffix int;
  default_name text;
begin
  random_suffix := floor(1000 + random() * 9000)::int;
  
  -- Meta veride kullanıcı adı belirtilmişse onu al, yoksa "Sinefil #4821" üret
  default_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'username'), ''),
    'Sinefil #' || random_suffix
  );

  insert into public.profiles (
    id,
    user_id,
    username,
    avatar_id,
    rank_title,
    rating,
    wins,
    losses,
    draws,
    streak,
    highest_combo,
    reels_balance,
    letterboxd_username,
    updated_at
  ) values (
    new.id,
    new.id::text,
    default_name,
    coalesce(new.raw_user_meta_data->>'avatar_id', 'avatar_director'),
    'Bilet Kontrolörü 🍿',
    1000,
    0,
    0,
    0,
    0,
    0,
    350,
    new.raw_user_meta_data->>'letterboxd_username',
    now()
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Trigger'ı auth.users tablosuna bağla
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. Kullanıcı adı güncelleme için güvenli ve benzersizlik kontrollü RPC fonksiyonu
create or replace function public.change_username(new_username text)
returns json
language plpgsql
security definer set search_path = public
as $$
declare
  caller_id uuid;
  clean_username text;
  is_taken boolean;
begin
  caller_id := auth.uid();
  if caller_id is null then
    return json_build_object('success', false, 'error', 'Yetkisiz erişim. Oturum bulunamadı.');
  end if;

  clean_username := trim(new_username);
  if length(clean_username) < 3 or length(clean_username) > 20 then
    return json_build_object('success', false, 'error', 'Kullanıcı adı 3 ile 20 karakter arasında olmalıdır.');
  end if;

  select exists(
    select 1 from public.profiles
    where lower(username) = lower(clean_username)
      and id != caller_id
  ) into is_taken;

  if is_taken then
    return json_build_object('success', false, 'error', 'Bu kullanıcı adı zaten alınmış.');
  end if;

  update public.profiles
  set username = clean_username,
      updated_at = now()
  where id = caller_id;

  return json_build_object('success', true, 'username', clean_username);
end;
$$;
