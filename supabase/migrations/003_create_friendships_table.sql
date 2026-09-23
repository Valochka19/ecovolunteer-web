-- ============================================================
-- Migration 003: Create `friendships` table
-- ============================================================

create table if not exists public.friendships (
  id uuid not null default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamp with time zone not null default now(),
  constraint friendships_pkey primary key (id)
);

-- Индексы
create index if not exists idx_friendships_sender on public.friendships (sender_id);
create index if not exists idx_friendships_receiver on public.friendships (receiver_id);
create index if not exists idx_friendships_status on public.friendships (status);
-- Уникальность: одна запись на пару (в любом направлении)
-- Используем индекс вместо constraint, т.к. least/greatest не работают в UNIQUE-constraint
create unique index if not exists idx_friendships_unique_pair
  on public.friendships (least(sender_id, receiver_id), greatest(sender_id, receiver_id));

-- RLS
alter table public.friendships enable row level security;

-- Политики
create policy "Users can read friendships they participate in"
  on public.friendships
  for select
  to authenticated
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can send friend requests"
  on public.friendships
  for insert
  to authenticated
  with check (auth.uid() = sender_id);

create policy "Users can update friendships they participate in"
  on public.friendships
  for update
  to authenticated
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can delete friendships they participate in"
  on public.friendships
  for delete
  to authenticated
  using (auth.uid() = sender_id or auth.uid() = receiver_id);
