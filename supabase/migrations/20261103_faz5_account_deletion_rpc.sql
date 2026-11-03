-- ==============================================================================
-- CINE-XOX (FİLMSEL) FAZ 5: ACCOUNT DELETION & DATA PRIVACY RPC (Apple 5.1.1(v))
-- Sorumluluk: Atomik tek transaction içinde kullanıcının kendi hesabını,
-- ilişkili odalarını, profilini ve oturumunu silmesi; maç arşivini anonimleştirmesi.
-- ==============================================================================

create or replace function public.delete_user_account()
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_user_id uuid;
begin
  -- 1. Kimlik Doğrulama: Yalnızca aktif oturum açmış kullanıcı kendi hesabını silebilir
  v_user_id := auth.uid();
  if v_user_id is null then
    return pg_catalog.jsonb_build_object('success', false, 'error', 'Yetkisiz erişim. Oturum bulunamadı.');
  end if;

  -- 2. Bekleyen veya terk edilmiş odaları temizle
  delete from public.game_rooms
  where host_id = v_user_id and status in ('WAITING', 'ABANDONED');

  -- 3. Devam eden bir maç varsa odayı hükmen terk et (rakibin oyunu kilitlenmesin)
  update public.game_rooms
  set status = 'ABANDONED',
      winner = case when host_id = v_user_id then 'O' else 'X' end
  where (host_id = v_user_id or guest_id = v_user_id) and status = 'IN_PROGRESS';

  -- 4. auth.users kaydını sil
  -- Bu işlem veritabanı kısıtları (FK) gereğince:
  -- - public.profiles tablosunu ON DELETE CASCADE ile siler
  -- - public.room_moves tablosunu ON DELETE CASCADE ile siler
  -- - public.game_rooms tablosundaki host olduğu odaları ON DELETE CASCADE ile siler
  -- - public.game_rooms tablosundaki guest olduğu odaları ON DELETE SET NULL yapar
  -- - public.match_sessions tablosundaki maç kayıtlarını ON DELETE SET NULL ile anonimleştirir (rakibin geçmişi bozulmaz)
  delete from auth.users where id = v_user_id;

  return pg_catalog.jsonb_build_object('success', true);
exception
  when others then
    -- Güvenlik: Dahili SQLERRM veya veritabanı detayları istemciye sızdırılmaz
    raise warning 'delete_user_account failed for user %: % (SQLSTATE: %)', v_user_id, SQLERRM, SQLSTATE;
    return pg_catalog.jsonb_build_object('success', false, 'error', 'Hesap silme işlemi sırasında bir veritabanı hatası oluştu.');
end;
$$;

-- Yalnızca kimliği doğrulanmış kullanıcılar kendi hesabını silebilir
revoke execute on function public.delete_user_account() from anon, public;
grant execute on function public.delete_user_account() to authenticated;
