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
-- Accounts with a role can read; only admin and HR accounts can change data.
-- Accounts without a role (e.g. someone who signed themselves up through the API) see nothing.
create or replace function public.can_view_portal()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('admin', 'hr', 'staff');
$$;

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

-- Policies from earlier versions of this schema
drop policy if exists "Signed-in users manage divisions" on public.divisions;
drop policy if exists "Signed-in users manage employees" on public.employees;
drop policy if exists "Signed-in users manage notifications" on public.notifications;
drop policy if exists "Signed-in users manage compliance items" on public.compliance_items;
drop policy if exists "Signed-in users read divisions" on public.divisions;
drop policy if exists "Signed-in users read employees" on public.employees;
drop policy if exists "Signed-in users read compliance items" on public.compliance_items;
drop policy if exists "Signed-in users use notifications" on public.notifications;

drop policy if exists "Portal accounts read divisions" on public.divisions;
create policy "Portal accounts read divisions" on public.divisions
  for select to authenticated using (public.can_view_portal());
drop policy if exists "Editors change divisions" on public.divisions;
create policy "Editors change divisions" on public.divisions
  for all to authenticated using (public.can_edit_portal()) with check (public.can_edit_portal());

drop policy if exists "Portal accounts read employees" on public.employees;
create policy "Portal accounts read employees" on public.employees
  for select to authenticated using (public.can_view_portal());
drop policy if exists "Editors change employees" on public.employees;
create policy "Editors change employees" on public.employees
  for all to authenticated using (public.can_edit_portal()) with check (public.can_edit_portal());

drop policy if exists "Portal accounts read compliance items" on public.compliance_items;
create policy "Portal accounts read compliance items" on public.compliance_items
  for select to authenticated using (public.can_view_portal());
drop policy if exists "Editors change compliance items" on public.compliance_items;
create policy "Editors change compliance items" on public.compliance_items
  for all to authenticated using (public.can_edit_portal()) with check (public.can_edit_portal());

-- Alerts: every portal account can read them and mark them as read; only admin and HR can add or delete them
drop policy if exists "Portal accounts read notifications" on public.notifications;
create policy "Portal accounts read notifications" on public.notifications
  for select to authenticated using (public.can_view_portal());
drop policy if exists "Portal accounts mark notifications read" on public.notifications;
create policy "Portal accounts mark notifications read" on public.notifications
  for update to authenticated using (public.can_view_portal()) with check (public.can_view_portal());
drop policy if exists "Editors add notifications" on public.notifications;
create policy "Editors add notifications" on public.notifications
  for insert to authenticated with check (public.can_edit_portal());
drop policy if exists "Editors delete notifications" on public.notifications;
create policy "Editors delete notifications" on public.notifications
  for delete to authenticated using (public.can_edit_portal());

-- Read-only accounts may only flip the "read" flag, not rewrite an alert
create or replace function public.guard_notification_update()
returns trigger
language plpgsql
as $$
begin
  -- Only checked for portal logins; the SQL Editor and server keys are not limited
  if coalesce(auth.role(), '') = 'authenticated'
     and not public.can_edit_portal()
     and (new.id is distinct from old.id or (new.data - 'read') is distinct from (old.data - 'read')) then
    raise exception 'Only admin and HR accounts can change notifications';
  end if;
  return new;
end;
$$;

drop trigger if exists guard_notification_update on public.notifications;
create trigger guard_notification_update
  before update on public.notifications
  for each row execute function public.guard_notification_update();

-- One device per account: the latest sign-in stores its session id here; other devices see a
-- different id and log themselves out. Each user can only see and change their own row.
create table if not exists public.active_sessions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  session_id text not null,
  updated_at timestamptz not null default now()
);

alter table public.active_sessions enable row level security;

drop policy if exists "Users manage their own active session" on public.active_sessions;
create policy "Users manage their own active session" on public.active_sessions
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Push changes to open browsers right away (they also re-check every 15 seconds)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'active_sessions'
  ) then
    alter publication supabase_realtime add table public.active_sessions;
  end if;
end $$;

-- File storage for staff documents (CV, contract, CID clearance, ID, certificates, photos).
-- Private bucket: files are only reachable through short-lived signed links for portal accounts.
-- Only PDF, Word, Excel and photo files are accepted (keep in sync with ALLOWED_FILE_TYPES in src/lib/storage.ts).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'staff-documents', 'staff-documents', false, 10485760,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'
  ]
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Signed-in users read staff documents" on storage.objects;
drop policy if exists "Portal accounts read staff documents" on storage.objects;
create policy "Portal accounts read staff documents" on storage.objects
  for select to authenticated using (bucket_id = 'staff-documents' and public.can_view_portal());

drop policy if exists "Signed-in users upload staff documents" on storage.objects;
drop policy if exists "Editors upload staff documents" on storage.objects;
create policy "Editors upload staff documents" on storage.objects
  for insert to authenticated with check (bucket_id = 'staff-documents' and public.can_edit_portal());

drop policy if exists "Signed-in users delete staff documents" on storage.objects;
drop policy if exists "Editors delete staff documents" on storage.objects;
create policy "Editors delete staff documents" on storage.objects
  for delete to authenticated using (bucket_id = 'staff-documents' and public.can_edit_portal());
