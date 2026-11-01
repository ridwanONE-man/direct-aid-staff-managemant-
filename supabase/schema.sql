-- DirectAid staff portal schema.
-- Run once in Supabase Dashboard -> SQL Editor (safe to re-run).
-- Each row keeps the app's full record in `data`; key columns are split out for lookups and integrity.

create table if not exists public.divisions (
  id text primary key,
  code text not null unique,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.employees (
  id text primary key,
  division_id text not null references public.divisions (id) on delete restrict,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.compliance_items (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists employees_division_id_idx on public.employees (division_id);

-- Roles: each login's role lives in auth.users.app_metadata.role ('admin', 'hr' or 'staff').
-- Only the server (service role, api/admin-users.ts) can set it, and it travels inside the session token.
-- Every signed-in account can read; only admin and HR accounts can change data. Accounts without a role are read-only.
create or replace function public.can_edit_portal()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('admin', 'hr');
$$;

alter table public.divisions enable row level security;
alter table public.employees enable row level security;
alter table public.notifications enable row level security;
alter table public.compliance_items enable row level security;

-- Policies from the first version of this schema (full access for any signed-in user)
drop policy if exists "Signed-in users manage divisions" on public.divisions;
drop policy if exists "Signed-in users manage employees" on public.employees;
drop policy if exists "Signed-in users manage notifications" on public.notifications;
drop policy if exists "Signed-in users manage compliance items" on public.compliance_items;

drop policy if exists "Signed-in users read divisions" on public.divisions;
create policy "Signed-in users read divisions" on public.divisions
  for select to authenticated using (true);
drop policy if exists "Editors change divisions" on public.divisions;
create policy "Editors change divisions" on public.divisions
  for all to authenticated using (public.can_edit_portal()) with check (public.can_edit_portal());

drop policy if exists "Signed-in users read employees" on public.employees;
create policy "Signed-in users read employees" on public.employees
  for select to authenticated using (true);
drop policy if exists "Editors change employees" on public.employees;
create policy "Editors change employees" on public.employees
  for all to authenticated using (public.can_edit_portal()) with check (public.can_edit_portal());

drop policy if exists "Signed-in users read compliance items" on public.compliance_items;
create policy "Signed-in users read compliance items" on public.compliance_items
  for select to authenticated using (true);
drop policy if exists "Editors change compliance items" on public.compliance_items;
create policy "Editors change compliance items" on public.compliance_items
  for all to authenticated using (public.can_edit_portal()) with check (public.can_edit_portal());

-- Alerts: everyone signed in can read them and mark them as read
drop policy if exists "Signed-in users use notifications" on public.notifications;
create policy "Signed-in users use notifications" on public.notifications
  for all to authenticated using (true) with check (true);

-- File storage for staff documents (CV, contract, CID clearance, ID, certificates, photos).
-- Private bucket: files are only reachable through short-lived signed links for signed-in users.
insert into storage.buckets (id, name, public, file_size_limit)
values ('staff-documents', 'staff-documents', false, 10485760)
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit;

drop policy if exists "Signed-in users read staff documents" on storage.objects;
create policy "Signed-in users read staff documents" on storage.objects
  for select to authenticated using (bucket_id = 'staff-documents');

drop policy if exists "Signed-in users upload staff documents" on storage.objects;
drop policy if exists "Editors upload staff documents" on storage.objects;
create policy "Editors upload staff documents" on storage.objects
  for insert to authenticated with check (bucket_id = 'staff-documents' and public.can_edit_portal());

drop policy if exists "Signed-in users delete staff documents" on storage.objects;
drop policy if exists "Editors delete staff documents" on storage.objects;
create policy "Editors delete staff documents" on storage.objects
  for delete to authenticated using (bucket_id = 'staff-documents' and public.can_edit_portal());
