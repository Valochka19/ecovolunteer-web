-- ============================================================
-- Migration 008: Organization Membership & Community
-- ============================================================

-- Add description field to profiles (useful for organization "about" sections)
alter table public.profiles
  add column if not exists description text not null default '';

-- ── organization_members table ──────────────────────────────
-- Tracks volunteer → organization membership requests
create table if not exists public.organization_members (
  id uuid not null default gen_random_uuid(),
  organization_id uuid not null references public.profiles(id) on delete cascade,
  volunteer_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamp with time zone not null default now(),
  constraint organization_members_pkey primary key (id)
);

-- Unique composite: a volunteer can only apply once to an org
create unique index if not exists idx_org_members_unique_pair
  on public.organization_members (organization_id, volunteer_id);

-- Indexes for querying
create index if not exists idx_org_members_org_status
  on public.organization_members (organization_id, status);
create index if not exists idx_org_members_volunteer
  on public.organization_members (volunteer_id);

-- ── RLS Policies ────────────────────────────────────────────
alter table public.organization_members enable row level security;

-- Anyone authenticated can read membership records
create policy "Memberships are viewable by authenticated users"
  on public.organization_members
  for select
  to authenticated
  using (true);

-- Volunteers can apply (insert their own request)
create policy "Volunteers can apply to organizations"
  on public.organization_members
  for insert
  to authenticated
  with check (auth.uid() = volunteer_id);

-- Volunteers can update their own requests (e.g. cancel = set to 'rejected' by self)
-- Organization admins can update requests to their org (accept/reject)
create policy "Org admins and volunteers can update memberships"
  on public.organization_members
  for update
  to authenticated
  using (
    auth.uid() = volunteer_id
    or
    exists (
      select 1 from public.profiles
      where id = auth.uid()
        and id = organization_id
        and role in ('organization', 'admin')
    )
  );

-- Volunteers can delete their own requests; org admins can delete membership records
create policy "Org admins and volunteers can delete memberships"
  on public.organization_members
  for delete
  to authenticated
  using (
    auth.uid() = volunteer_id
    or
    exists (
      select 1 from public.profiles
      where id = auth.uid()
        and id = organization_id
        and role in ('organization', 'admin')
    )
  );