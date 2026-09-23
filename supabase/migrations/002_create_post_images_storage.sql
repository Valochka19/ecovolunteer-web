-- ============================================================
-- Migration 002: Create `post-images` storage bucket + policies
-- ============================================================

-- 1. Создаём публичный bucket
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

-- 2. Политики доступа к storage.objects

--    — читать изображения могут все авторизованные
create policy "Anyone can view post images"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'post-images');

--    — загружать можно только в свою папку {userId}/
create policy "Users can upload post images"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'post-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
