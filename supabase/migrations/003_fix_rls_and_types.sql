-- ==========================================
-- Миграция 003: RLS для profiles + индексы + функция очистки
-- ==========================================

-- 1. Проверяем, что email есть (если миграция 002 не накатилась)
alter table public.profiles add column if not exists email text not null default '';

-- 2. Добавляем RLS политики для profiles
--    (RLS включён в 001_init.sql, но политики не заданы — это блокирует все запросы)
alter table public.profiles enable row level security;

-- Политика: профиль может видеть сам пользователь (для volunteer/organization)
-- Админ и партнёр видят все профили
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (
    auth.uid() = id
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'partner')
    )
  );

-- Политика: пользователь может обновлять ТОЛЬКО свой профиль
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Политика: вставка профилей — только через триггер (security definer),
-- админ может создать профиль напрямую
drop policy if exists "Admins can insert profiles" on public.profiles;
create policy "Admins can insert profiles"
  on public.profiles for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 3. Индексы для ускорения запросов
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_events_date on public.events(date);
create index if not exists idx_events_organizer on public.events(organizer_id);
create index if not exists idx_events_status on public.events(status);
create index if not exists idx_event_participants_event on public.event_participants(event_id);
create index if not exists idx_event_participants_user on public.event_participants(user_id);
create index if not exists idx_event_participants_status on public.event_participants(status);

-- 4. Политика для event_participants: организатор видит участников своих мероприятий
drop policy if exists "Organizers can view participants of their events" on public.event_participants;
create policy "Organizers can view participants of their events"
  on public.event_participants for select
  using (
    exists (
      select 1 from public.events
      where events.id = event_participants.event_id
      and events.organizer_id = auth.uid()
    )
  );

-- 5. Функция очистки демо-данных (вызывается из API)
create or replace function public.cleanup_demo_data()
returns void as $$
declare
  demo_emails text[] := array[
    'demo-org@volunteer.app',
    'demo-volunteer-1@volunteer.app',
    'demo-volunteer-2@volunteer.app'
  ];
  demo_user_ids uuid[];
begin
  -- Собираем ID демо-пользователей
  select array_agg(id) into demo_user_ids
  from auth.users
  where email = any(demo_emails);

  -- Удаляем участников событий (FK → profiles)
  delete from public.event_participants
  where user_id = any(demo_user_ids);

  -- Удаляем события организаторов-демо
  delete from public.events
  where organizer_id = any(demo_user_ids);

  -- Удаляем профили
  delete from public.profiles
  where id = any(demo_user_ids);

  -- Удаляем auth-юзерев (каскадно удалит всё остальное)
  delete from auth.users
  where email = any(demo_emails);
end;
$$ language plpgsql security definer;
