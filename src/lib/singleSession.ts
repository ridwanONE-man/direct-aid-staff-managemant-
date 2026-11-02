import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

// One device per account: the latest sign-in records its session id in public.active_sessions.
// Every other device sees a different id there and signs itself out (see AppContext).

export const SIGNED_IN_ELSEWHERE =
  'You were logged out because this account signed in on another device.';

// Supabase puts a stable session id in the access token; it survives token refreshes
export const sessionIdOf = (session: Session | null): string | null => {
  if (!session) return null;
  try {
    const payload = session.access_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(payload)).session_id ?? null;
  } catch {
    return null;
  }
};

// Make this device the account's active session and revoke every other session's refresh token
export const claimSession = async (session: Session) => {
  if (!supabase) return;
  const sessionId = sessionIdOf(session);
  if (!sessionId) return;
  const { error } = await supabase
    .from('active_sessions')
    .upsert({ user_id: session.user.id, session_id: sessionId, updated_at: new Date().toISOString() });
  if (error) console.error('Could not record the active session:', error.message);
  await supabase.auth.signOut({ scope: 'others' });
};

// null = no record yet (or the table is not set up), so nothing to compare against
export const fetchActiveSessionId = async (userId: string): Promise<string | null> => {
  if (!supabase) return null;
  const { data, error } = await supabase.from('active_sessions').select('session_id').eq('user_id', userId).maybeSingle();
  if (error) return null;
  return data?.session_id ?? null;
};
