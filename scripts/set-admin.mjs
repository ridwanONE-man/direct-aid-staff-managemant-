// One-off: give an existing login the admin role. Usage: node scripts/set-admin.mjs email@example.com
// Reads the service role key from .env.local; never prints it.
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const email = (process.argv[2] || '').trim().toLowerCase();
const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!email || !url || !key) {
  console.error('Usage: node scripts/set-admin.mjs <email>  (needs VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local)');
  process.exit(1);
}

const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
if (error) {
  console.error('Could not list users:', error.message);
  process.exit(1);
}

const user = data.users.find(u => (u.email || '').toLowerCase() === email);
if (!user) {
  console.error(`No login found for ${email}. Existing logins: ${data.users.map(u => u.email).join(', ')}`);
  process.exit(1);
}

const { error: updateError } = await admin.auth.admin.updateUserById(user.id, {
  app_metadata: { ...user.app_metadata, role: 'admin' }
});
if (updateError) {
  console.error('Could not update the role:', updateError.message);
  process.exit(1);
}
console.log(`${email} is now an admin (previous role: ${user.app_metadata?.role ?? 'none'}).`);
