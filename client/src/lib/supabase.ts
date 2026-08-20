import { createClient } from "@supabase/supabase-js";
import type { Session } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/** Reads the Supabase session persisted by supabase-js without requiring network. */
export function getPersistedSupabaseSession(): Session | null {
  try {
    const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
    const raw = window.localStorage.getItem(`sb-${projectRef}-auth-token`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Session> & { currentSession?: Session; session?: Session };
    const session = parsed.currentSession ?? parsed.session ?? parsed;
    if (!session.access_token || !session.user) return null;
    return session as Session;
  } catch {
    return null;
  }
}
