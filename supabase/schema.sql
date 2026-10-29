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

-- Only signed-in portal users (created under Authentication -> Users) can read or write.
alter table public.divisions enable row level security;
alter table public.employees enable row level security;
alter table public.notifications enable row level security;
alter table public.compliance_items enable row level security;

drop policy if exists "Signed-in users manage divisions" on public.divisions;
create policy "Signed-in users manage divisions" on public.divisions
  for all to authenticated using (true) with check (true);

drop policy if exists "Signed-in users manage employees" on public.employees;
create policy "Signed-in users manage employees" on public.employees
  for all to authenticated using (true) with check (true);

drop policy if exists "Signed-in users manage notifications" on public.notifications;
create policy "Signed-in users manage notifications" on public.notifications
  for all to authenticated using (true) with check (true);

drop policy if exists "Signed-in users manage compliance items" on public.compliance_items;
create policy "Signed-in users manage compliance items" on public.compliance_items
  for all to authenticated using (true) with check (true);
