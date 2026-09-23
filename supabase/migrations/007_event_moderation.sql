-- ============================================================
-- Migration 007: Event moderation flow
-- ============================================================

-- 1. Add new statuses: moderation, rejected
-- Need to drop existing check first
ALTER TABLE public.events
  DROP CONSTRAINT IF EXISTS events_status_check;

ALTER TABLE public.events
  ADD CONSTRAINT events_status_check
  CHECK (status IN ('moderation', 'open', 'closed', 'full', 'rejected'));

-- 2. Create moderation_response column (reason for rejection)
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS moderation_message text DEFAULT NULL;

-- 3. Create table for tracking moderation decisions
CREATE TABLE IF NOT EXISTS public.event_moderation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  decision TEXT NOT NULL CHECK (decision IN ('approved', 'rejected')),
  reason TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.event_moderation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view moderation"
  ON public.event_moderation FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin')
  ));

CREATE POLICY "Admins can insert moderation"
  ON public.event_moderation FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin')
  ));

-- 4. Policy for admin to update any event status
DROP POLICY IF EXISTS "Admins can update events" ON public.events;
CREATE POLICY "Admins can update events"
  ON public.events FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin')
  ));
