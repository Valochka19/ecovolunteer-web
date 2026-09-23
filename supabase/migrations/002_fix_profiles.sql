-- ==========================================
-- Миграция: добавляем email в profiles + фикс триггера
-- ==========================================

-- 1. Добавляем колонку email в profiles
alter table public.profiles add column if not exists email text not null default '';

-- 2. Обновляем функцию автосоздания профиля — теперь с city из metadata
create or replace function public.handle_new_user()
returns trigger as $$
declare
  default_avatar text;
begin
  default_avatar := 'https://api.dicebear.com/9.x/avataaars/svg?seed=' || new.email;
  
  insert into public.profiles (id, name, avatar, email, city, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'avatar', default_avatar),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'city', ''),
    coalesce(new.raw_user_meta_data ->> 'role', 'volunteer')
  );
  
  return new;
end;
$$ language plpgsql security definer;
