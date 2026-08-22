import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Supabase is optional. Without env vars the app is fully functional, local-only
// (Phases 0–2 behaviour). Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY and
// run supabase/schema.sql to enable laptop <-> phone sync.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseEnabled = Boolean(url && key);

export const supabase: SupabaseClient | null = supabaseEnabled
  ? createClient(url as string, key as string)
  : null;
