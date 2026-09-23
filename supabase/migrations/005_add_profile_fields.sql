-- ============================================================
-- Migration 005: Add profile fields for Volunteer Profile
-- ============================================================

alter table public.profiles
  add column if not exists bio text not null default '',
  add column if not exists social_links jsonb not null default '[]'::jsonb,
  add column if not exists privacy_hide_contacts boolean not null default false,
  add column if not exists privacy_hide_feed boolean not null default false,
  add column if not exists level integer not null default 1,
  add column if not exists xp integer not null default 0;
