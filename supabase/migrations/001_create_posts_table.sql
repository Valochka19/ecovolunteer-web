-- ============================================================
-- Migration 001: Create `posts` table for Global Community Feed
-- ============================================================

-- 1. Таблица постов
create table if not exists public.posts (
  id uuid not null default gen_random_uuid(),
  content text not null default '',
  image_url text null,
  created_at timestamp with time zone not null default now(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  constraint posts_pkey primary key (id)
);

-- 2. Индекс для быстрой сортировки (новые сверху)
create index if not exists idx_posts_created_at
  on public.posts (created_at desc);

-- 3. Row Level Security
alter table public.posts enable row level security;

-- 4. Политики RLS
--    — читать могут все авторизованные
--    — вставлять может только владелец
create policy "Anyone can read posts"
  on public.posts
  for select
  to authenticated
  using (true);

create policy "Users can insert own posts"
  on public.posts
  for insert
  to authenticated
  with check (auth.uid() = user_id);

--    — удалять может только владелец поста
create policy "Users can delete own posts"
  on public.posts
  for delete
  to authenticated
  using (auth.uid() = user_id);
