-- ============================================================
-- Migration 010: Create event-covers storage bucket + policies
-- ============================================================

-- 1. Создаём публичный bucket для обложек мероприятий
insert into storage.buckets (id, name, public)
values ('event-covers', 'event-covers', true)
on conflict (id) do nothing;

-- 2. Просматривать могут все (в том числе неавторизованные, т.к. public)
create policy "Anyone can view event covers"
  on storage.objects
  for select
  using (bucket_id = 'event-covers');

-- 3. Загружать могут только организации и админы
create policy "Organizations can upload event covers"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'event-covers'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('organization', 'admin')
    )
  );

-- 4. Удалять могут владельцы (организаторы) и админы
create policy "Owners can delete event covers"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'event-covers'
    and (
      exists (
        select 1 from public.profiles
        where id = auth.uid() and role in ('organization', 'admin')
      )
    )
  );