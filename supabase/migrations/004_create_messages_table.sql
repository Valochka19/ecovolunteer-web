-- ============================================================
-- Migration 004: Create `messages` table for real-time chat
-- ============================================================

create table if not exists public.messages (
  id uuid not null default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  created_at timestamp with time zone not null default now(),
  constraint messages_pkey primary key (id)
);

-- Индексы для быстрой загрузки истории чата
create index if not exists idx_messages_participants
  on public.messages (sender_id, receiver_id);
create index if not exists idx_messages_created_at
  on public.messages (created_at asc);

-- RLS
alter table public.messages enable row level security;

-- Политики: видеть и отправлять сообщения могут только участники диалога
create policy "Users can read their own messages"
  on public.messages
  for select
  to authenticated
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can send messages"
  on public.messages
  for insert
  to authenticated
  with check (auth.uid() = sender_id);

-- Включаем Realtime для таблицы messages (для live-чата)
-- Эту команду нужно выполнить отдельно или через Supabase Interface
-- alter publication supabase_realtime add table public.messages;
