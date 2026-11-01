/// <reference types="node" />
// Vercel server function for managing portal login accounts and their roles.
// The service role key lives only here (server-side env var), never in the browser bundle.
// Roles live in each user's app_metadata.role, which users cannot change themselves and which
// row level security reads from the session token (see supabase/schema.sql).
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';

type UserRole = 'admin' | 'hr' | 'staff';
const ROLES: UserRole[] = ['admin', 'hr', 'staff'];
const MIN_PASSWORD_LENGTH = 8;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

// Emails in ADMIN_EMAILS are always admins; this bootstraps the first admin account
const bootstrapAdmins = () =>
  (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);

const isBootstrapAdmin = (email?: string | null) => !!email && bootstrapAdmins().includes(email.toLowerCase());

const roleOf = (u: User): UserRole | null => {
  const role = u.app_metadata?.role;
  return ROLES.includes(role) ? role : null;
};

const isAdmin = (u: User) => roleOf(u) === 'admin' || isBootstrapAdmin(u.email);

type Session = { client: SupabaseClient; caller: User };

// Verify the caller's Supabase session; returns an error response otherwise
async function authenticate(request: Request): Promise<Session | Response> {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return json({ error: 'The server is missing SUPABASE_SERVICE_ROLE_KEY. Add it in Vercel → Settings → Environment Variables.' }, 500);
  }

  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: 'Please sign in again.' }, 401);

  const client = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) return json({ error: 'Your session has expired. Please sign in again.' }, 401);
  return { client, caller: data.user };
}

async function authorizeAdmin(request: Request): Promise<Session | Response> {
  const session = await authenticate(request);
  if (session instanceof Response) return session;
  if (!isAdmin(session.caller)) return json({ error: 'Only admins can manage user accounts.' }, 403);
  return session;
}

const publicUser = (u: User) => ({
  id: u.id,
  email: u.email ?? '',
  role: isBootstrapAdmin(u.email) ? 'admin' : roleOf(u),
  employeeId: (u.app_metadata?.employee_id as string | undefined) ?? null,
  createdAt: u.created_at,
  lastSignInAt: u.last_sign_in_at ?? null
});

const parseBody = async (request: Request) =>
  (await request.json().catch(() => ({}))) as {
    action?: string;
    email?: string;
    password?: string;
    userId?: string;
    role?: string;
    employeeId?: string | null;
  };

export async function GET(request: Request) {
  const auth = await authorizeAdmin(request);
  if (auth instanceof Response) return auth;

  const { data, error } = await auth.client.auth.admin.listUsers({ perPage: 1000 });
  if (error) return json({ error: error.message }, 500);
  return json({ users: data.users.map(publicUser), currentUserId: auth.caller.id });
}

export async function POST(request: Request) {
  const body = await parseBody(request);

  // Any signed-in user: make sure ADMIN_EMAILS accounts carry the admin role in their token
  if (body.action === 'sync-role') {
    const session = await authenticate(request);
    if (session instanceof Response) return session;
    const { caller, client } = session;
    if (isBootstrapAdmin(caller.email) && roleOf(caller) !== 'admin') {
      const { error } = await client.auth.admin.updateUserById(caller.id, {
        app_metadata: { ...caller.app_metadata, role: 'admin' }
      });
      if (error) return json({ error: error.message }, 500);
      return json({ role: 'admin', changed: true });
    }
    return json({ role: roleOf(caller), changed: false });
  }

  const auth = await authorizeAdmin(request);
  if (auth instanceof Response) return auth;
  const { client, caller } = auth;
  const role = body.role as UserRole;

  if (body.action === 'create') {
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Please enter a valid email address.' }, 400);
    if (password.length < MIN_PASSWORD_LENGTH) {
      return json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` }, 400);
    }
    if (!ROLES.includes(role)) return json({ error: 'Please choose a role.' }, 400);
    const { data, error } = await client.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { role, employee_id: body.employeeId || null }
    });
    if (error) return json({ error: error.message }, 400);
    return json({ user: publicUser(data.user) }, 201);
  }

  if (body.action === 'update') {
    if (!body.userId) return json({ error: 'Missing user.' }, 400);
    if (!ROLES.includes(role)) return json({ error: 'Please choose a role.' }, 400);
    if (body.userId === caller.id && role !== 'admin') {
      return json({ error: 'You cannot remove your own admin access.' }, 400);
    }
    const { data: existing, error: findError } = await client.auth.admin.getUserById(body.userId);
    if (findError || !existing.user) return json({ error: 'That account no longer exists.' }, 404);
    if (isBootstrapAdmin(existing.user.email) && role !== 'admin') {
      return json({ error: 'This account is listed in ADMIN_EMAILS on the server, so it always stays an admin.' }, 400);
    }
    const { data, error } = await client.auth.admin.updateUserById(body.userId, {
      app_metadata: { ...existing.user.app_metadata, role, employee_id: body.employeeId || null }
    });
    if (error) return json({ error: error.message }, 400);
    return json({ user: publicUser(data.user) });
  }

  if (body.action === 'reset') {
    const password = body.password || '';
    if (!body.userId) return json({ error: 'Missing user.' }, 400);
    if (password.length < MIN_PASSWORD_LENGTH) {
      return json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` }, 400);
    }
    const { error } = await client.auth.admin.updateUserById(body.userId, { password });
    if (error) return json({ error: error.message }, 400);
    return json({ ok: true });
  }

  return json({ error: 'Unknown action.' }, 400);
}

export async function DELETE(request: Request) {
  const auth = await authorizeAdmin(request);
  if (auth instanceof Response) return auth;

  const id = new URL(request.url).searchParams.get('id');
  if (!id) return json({ error: 'Missing user.' }, 400);
  if (id === auth.caller.id) return json({ error: 'You cannot remove your own account.' }, 400);

  const { error } = await auth.client.auth.admin.deleteUser(id);
  if (error) return json({ error: error.message }, 400);
  return json({ ok: true });
}
