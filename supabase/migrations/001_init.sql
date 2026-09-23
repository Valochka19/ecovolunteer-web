-- ==========================================
-- Таблица профилей (расширение auth.users)
-- ==========================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  avatar text not null default '',
  city text not null default '',
  interests text[] default '{}',
  role text not null default 'volunteer' check (role in ('volunteer', 'organization', 'admin', 'partner')),
  token_balance integer not null default 0,
  verification_status text not null default 'none' check (verification_status in ('pending', 'verified', 'rejected', 'none')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Триггер автообновления updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profiles_updated
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Автосоздание профиля при регистрации
create or replace function public.handle_new_user()
returns trigger as $$
declare
  default_avatar text;
begin
  default_avatar := 'https://api.dicebear.com/9.x/avataaars/svg?seed=' || new.email;
  
  insert into public.profiles (id, name, avatar, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'avatar', default_avatar),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'role', 'volunteer')
  );
  
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ==========================================
-- Таблица мероприятий
-- ==========================================
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  full_description text not null default '',
  image text not null default '',
  date date not null,
  time time not null default '10:00',
  location text not null default '',
  city text not null default '',
  category text not null default '',
  max_participants integer not null default 20,
  reward integer not null default 0,
  organizer_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'open' check (status in ('open', 'closed', 'full')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger on_events_updated
  before update on public.events
  for each row execute function public.handle_updated_at();

-- Row Level Security для events
alter table public.events enable row level security;

create policy "Events are viewable by everyone"
  on public.events for select
  using (true);

create policy "Organizations can insert events"
  on public.events for insert
  with check (
    auth.role() = 'authenticated' 
    and exists (
      select 1 from public.profiles 
      where id = auth.uid() 
      and role in ('organization', 'admin')
    )
  );

create policy "Organizers can update their events"
  on public.events for update
  using (organizer_id = auth.uid())
  with check (organizer_id = auth.uid());


-- ==========================================
-- Таблица участников мероприятий
-- ==========================================
create table if not exists public.event_participants (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'registered' check (status in ('registered', 'attended', 'cancelled')),
  created_at timestamptz not null default now(),
  unique(event_id, user_id)
);

alter table public.event_participants enable row level security;

create policy "Participants can view their own registrations"
  on public.event_participants for select
  using (user_id = auth.uid());

create policy "Users can register for events"
  on public.event_participants for insert
  with check (
    auth.role() = 'authenticated' 
    and user_id = auth.uid()
  );

create policy "Users can cancel their registration"
  on public.event_participants for update
  using (user_id = auth.uid());


-- ==========================================
-- Вспомогательная функция: количество участников
-- ==========================================
create or replace function public.get_event_participant_count(event_id uuid)
returns integer as $$
  select count(*)::integer from public.event_participants
  where event_id = $1 and status = 'registered';
$$ language sql stable;
