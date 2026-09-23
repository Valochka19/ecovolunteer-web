-- ============================================================
-- Migration 009: RPC function to add tokens to user balance
-- ============================================================

create or replace function add_tokens(p_user_id uuid, p_amount int)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set token_balance = coalesce(token_balance, 0) + p_amount
  where id = p_user_id;
end;
$$;