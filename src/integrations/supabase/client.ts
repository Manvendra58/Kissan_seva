import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const PROJECT_ID =
  import.meta.env.VITE_SUPABASE_PROJECT_ID || 'quyizppqbqbknrirnlkj';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || `https://${PROJECT_ID}.supabase.co`;

const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

/** True when a real Supabase anon/publishable key is present in env. */
export const isSupabaseConfigured = Boolean(
  SUPABASE_PUBLISHABLE_KEY &&
    SUPABASE_PUBLISHABLE_KEY !== 'your_supabase_anon_or_publishable_key' &&
    SUPABASE_PUBLISHABLE_KEY !== 'missing-supabase-key'
);

if (!isSupabaseConfigured) {
  console.warn(
    '[Kisan Seva] Missing VITE_SUPABASE_PUBLISHABLE_KEY in .env. Copy .env.example → .env and paste your key from Supabase → Project Settings → API (anon / publishable).'
  );
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY || 'missing-supabase-key',
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
