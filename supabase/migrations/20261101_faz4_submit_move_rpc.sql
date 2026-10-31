-- ==============================================================================
-- CINE-XOX (FİLMSEL) FAZ 4: SERVER-AUTHORITATIVE MULTIPLAYER RPC (submit_move)
-- Sorumluluk: Atomik tek transaction içinde hamle doğrulama, concurrency kilidi,
-- sıra kontrolü, hamle kaydı, galibiyet/beraberlik tespiti ve sıra geçişi.
-- ==============================================================================

create or replace function public.submit_move(
  p_room_code text,
  p_cell_index integer,
  p_movie_id text,
  p_movie_data jsonb,
  p_is_stealing boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller_id uuid;
  v_room record;
  v_player_symbol text;
  v_next_turn text;
  v_cells text[] := array[null, null, null, null, null, null, null, null, null];
  v_move record;
  v_lines int[][] := array[
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  v_line int[];
  v_winner text := null;
  v_filled_count int := 0;
  i int;
begin
  -- 1. Kimlik Kontrolü
  v_caller_id := auth.uid();
  if v_caller_id is null then
    return jsonb_build_object('success', false, 'error', 'Kimlik doğrulanmadı.');
  end if;

  -- 2. Hücre İndeks Kontrolü
  if p_cell_index < 0 or p_cell_index > 8 then
    return jsonb_build_object('success', false, 'error', 'Geçersiz hücre indeksi.');
  end if;

  -- 3. Odayı Kilitle (Pessimistic Lock - Eşzamanlı hamle yarışını önleme)
  select * into v_room
  from public.game_rooms
  where room_code = p_room_code
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Oda bulunamadı.');
  end if;

  if v_room.status != 'IN_PROGRESS' then
    return jsonb_build_object('success', false, 'error', 'Oyun devam etmiyor.');
  end if;

  -- 4. Katılımcı ve Sembol Belirleme
  if v_room.host_id = v_caller_id then
    v_player_symbol := 'X';
  elsif v_room.guest_id = v_caller_id then
    v_player_symbol := 'O';
  else
    return jsonb_build_object('success', false, 'error', 'Bu odanın oyuncusu değilsiniz.');
  end if;

  -- 5. Sıra Kontrolü
  if v_room.current_turn != v_player_symbol then
    return jsonb_build_object('success', false, 'error', 'Hamle sırası sizde değil.');
  end if;

  -- 6. Hücre Doluluk Kontrolü (Çalma modu değilse)
  if not coalesce(p_is_stealing, false) then
    if exists (
      select 1 from public.room_moves
      where room_code = p_room_code
        and cell_index = p_cell_index
        and is_stealing = false
    ) then
      return jsonb_build_object('success', false, 'error', 'Bu hücre zaten doldurulmuş.');
    end if;
  end if;

  -- 7. Hamleyi Kaydet
  insert into public.room_moves (
    room_code,
    cell_index,
    movie_id,
    movie_data,
    player_symbol,
    player_id,
    is_stealing
  ) values (
    p_room_code,
    p_cell_index,
    p_movie_id,
    p_movie_data,
    v_player_symbol,
    v_caller_id,
    coalesce(p_is_stealing, false)
  );

  -- 8. Tahtanın Güncel Durumunu Hesapla
  for v_move in
    select cell_index, player_symbol
    from public.room_moves
    where room_code = p_room_code
    order by created_at asc
  loop
    v_cells[v_move.cell_index + 1] := v_move.player_symbol;
  end loop;

  -- Galibiyet Çizgilerini Kontrol Et
  foreach v_line slice 1 in array v_lines loop
    if v_cells[v_line[1] + 1] is not null and
       v_cells[v_line[1] + 1] = v_cells[v_line[2] + 1] and
       v_cells[v_line[2] + 1] = v_cells[v_line[3] + 1] then
      v_winner := v_cells[v_line[1] + 1];
      exit;
    end if;
  end loop;

  -- Dolu Hücre Sayısını Hesapla
  for i in 1..9 loop
    if v_cells[i] is not null then
      v_filled_count := v_filled_count + 1;
    end if;
  end loop;

  -- 9. Sonuç Belirleme ve Oda Durumu Güncelleme
  if v_winner is not null then
    update public.game_rooms
    set status = 'COMPLETED',
        winner = v_winner,
        updated_at = timezone('utc'::text, now())
    where room_code = p_room_code;

    return jsonb_build_object(
      'success', true,
      'status', 'COMPLETED',
      'winner', v_winner,
      'player_symbol', v_player_symbol,
      'cell_index', p_cell_index
    );
  elsif v_filled_count = 9 then
    update public.game_rooms
    set status = 'COMPLETED',
        winner = 'DRAW',
        updated_at = timezone('utc'::text, now())
    where room_code = p_room_code;

    return jsonb_build_object(
      'success', true,
      'status', 'COMPLETED',
      'winner', 'DRAW',
      'player_symbol', v_player_symbol,
      'cell_index', p_cell_index
    );
  else
    v_next_turn := case when v_player_symbol = 'X' then 'O' else 'X' end;
    update public.game_rooms
    set current_turn = v_next_turn,
        updated_at = timezone('utc'::text, now())
    where room_code = p_room_code;

    return jsonb_build_object(
      'success', true,
      'status', 'IN_PROGRESS',
      'current_turn', v_next_turn,
      'player_symbol', v_player_symbol,
      'cell_index', p_cell_index
    );
  end if;
end;
$$;
