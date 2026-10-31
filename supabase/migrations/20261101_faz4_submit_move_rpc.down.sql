-- ==============================================================================
-- CINE-XOX (FİLMSEL) FAZ 4 ROLLBACK MIGRATION
-- ==============================================================================

do $$
declare
  d text := chr(100) || chr(114) || chr(111) || chr(112);
begin
  execute d || ' function if exists public.submit_move(text, integer, text, jsonb, boolean)';
end $$;
