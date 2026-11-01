// Portal account roles. Stored in the Supabase user's app_metadata (only the server can change it)
// and enforced by row level security; see supabase/schema.sql.
export type UserRole = 'admin' | 'hr' | 'staff';

export const USER_ROLES: { value: UserRole; label: string; description: string }[] = [
  { value: 'admin', label: 'Admin', description: 'Full access, plus creating and managing accounts.' },
  { value: 'hr', label: 'HR Officer', description: 'Can register, edit and delete staff, schools and contracts.' },
  { value: 'staff', label: 'Staff (read-only)', description: 'Can view the portal but cannot change anything.' }
];

export const roleLabel = (role: UserRole | null) => USER_ROLES.find(r => r.value === role)?.label ?? 'No role';

export const isUserRole = (value: unknown): value is UserRole => value === 'admin' || value === 'hr' || value === 'staff';
