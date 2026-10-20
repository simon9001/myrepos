import { createClient } from '@supabase/supabase-js';
import { appConfig } from '../config';

// Service-role client: bypasses RLS — used only server-side.
// Permission checks are enforced in application code (routes/hooks).
export const adminDb = createClient(
  appConfig.SUPABASE_URL,
  appConfig.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: 'public' },
  },
);

// Anon client: used only to verify Supabase-issued JWTs.
export const anonDb = createClient(
  appConfig.SUPABASE_URL,
  appConfig.SUPABASE_ANON_KEY,
  {
    auth: { persistSession: false, autoRefreshToken: false },
  },
);
