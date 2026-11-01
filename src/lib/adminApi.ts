import { supabase } from './supabase';
import { UserRole } from './roles';

// Browser side of api/admin-users.ts: sends the signed-in user's session token, never a service key

export interface AdminUser {
  id: string;
  email: string;
  role: UserRole | null;
  employeeId: string | null;
  createdAt: string;
  lastSignInAt: string | null;
}

export class AdminApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function call<T>(method: string, query = '', body?: unknown): Promise<T> {
  const { data } = (await supabase?.auth.getSession()) ?? { data: { session: null } };
  const token = data.session?.access_token;
  if (!token) throw new AdminApiError('Please sign in again.', 401);

  const res = await fetch(`/api/admin-users${query}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });

  // The local Vite dev server has no /api routes and answers with the HTML page instead
  if (!(res.headers.get('content-type') || '').includes('application/json')) {
    throw new AdminApiError('The admin service only runs on the live Vercel site (or with `vercel dev`).', res.status);
  }
  const payload = await res.json();
  if (!res.ok) throw new AdminApiError(payload.error || 'Something went wrong.', res.status);
  return payload as T;
}

export const listUsers = () => call<{ users: AdminUser[]; currentUserId: string }>('GET');

export const createUser = (email: string, password: string, role: UserRole, employeeId: string | null) =>
  call<{ user: AdminUser }>('POST', '', { action: 'create', email, password, role, employeeId });

export const updateUser = (userId: string, role: UserRole, employeeId: string | null) =>
  call<{ user: AdminUser }>('POST', '', { action: 'update', userId, role, employeeId });

export const resetPassword = (userId: string, password: string) =>
  call<{ ok: true }>('POST', '', { action: 'reset', userId, password });

export const deleteUser = (userId: string) => call<{ ok: true }>('DELETE', `?id=${encodeURIComponent(userId)}`);

// Gives ADMIN_EMAILS accounts the admin role in their token; `changed` means the session must refresh
export const syncOwnRole = () => call<{ role: UserRole | null; changed: boolean }>('POST', '', { action: 'sync-role' });
