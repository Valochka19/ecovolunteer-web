-- ============================================================
-- Migration 006: Add tags column to events + create storage bucket
-- ============================================================

-- 1. Add tags column (jsonb array of strings)
alter table public.events
  add column if not exists tags jsonb not null default '[]'::jsonb;

-- 2. Create storage bucket for event covers (idempotent via Supabase API)
-- Note: This SQL cannot create buckets directly; bucket must be created
-- via Supabase dashboard or client API. We'll handle in code.
-- However, we can set up RLS policies for the bucket if it exists.

-- Policy: allow authenticated users to upload to event-covers
-- (Executed via Supabase dashboard/SQL editor or client)

-- We'll rely on client-side bucket creation in the app code.