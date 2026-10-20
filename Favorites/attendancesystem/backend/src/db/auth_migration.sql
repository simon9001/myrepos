-- ================================================================
-- Custom Auth Migration — run once in Supabase SQL editor
-- Replaces Supabase Auth with bcrypt + custom JWT
-- ================================================================

BEGIN;

-- ── 1. Drop the FK that ties profiles.id to auth.users ──────────────────────
DO $$
DECLARE
  v_constraint TEXT;
BEGIN
  SELECT tc.constraint_name INTO v_constraint
  FROM information_schema.table_constraints tc
  WHERE tc.table_schema = 'public'
    AND tc.table_name   = 'profiles'
    AND tc.constraint_type = 'FOREIGN KEY'
  LIMIT 1;

  IF v_constraint IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT %I', v_constraint);
    RAISE NOTICE 'Dropped FK constraint: %', v_constraint;
  ELSE
    RAISE NOTICE 'No FK constraint found on profiles.id — skipping';
  END IF;
END $$;

-- ── 2. Give profiles.id a proper default so we can INSERT without auth.users ─
ALTER TABLE public.profiles
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- ── 3. Auth columns on profiles ──────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS password_hash          TEXT,
  ADD COLUMN IF NOT EXISTS email_verified         BOOLEAN      NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS failed_login_attempts  INT          NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_until           TIMESTAMPTZ;

-- ── 4. Refresh tokens table ───────────────────────────────────────────────────
--   token_hash = SHA-256 of the raw opaque token (raw token never stored)
--   Deleted on use → rotated every refresh cycle (replay protection)
CREATE TABLE IF NOT EXISTS public.refresh_tokens (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token_hash  TEXT        NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at  TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id
  ON public.refresh_tokens(user_id);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at
  ON public.refresh_tokens(expires_at);

-- ── 5. Auth OTPs table (email verification + password reset) ─────────────────
--   Completely separate from attendance otp_verifications
CREATE TABLE IF NOT EXISTS public.auth_otps (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT        NOT NULL,
  purpose    TEXT        NOT NULL CHECK (purpose IN ('email_verification', 'password_reset')),
  code       TEXT        NOT NULL,
  attempts   INT         NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  is_used    BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Composite index: the hot lookup path (email + purpose + not used + not expired)
CREATE INDEX IF NOT EXISTS idx_auth_otps_lookup
  ON public.auth_otps(email, purpose, is_used, expires_at);

-- ── 6. Drop Supabase Auth trigger (we create profiles directly now) ──────────
DROP TRIGGER  IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_auth_user();

-- ── 7. RLS: expose new tables to service role only (app uses service key) ────
ALTER TABLE public.refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_otps      ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS automatically — no policy needed for the backend.
-- Deny direct access for anon/authenticated roles:
CREATE POLICY "deny_anon_refresh_tokens" ON public.refresh_tokens
  FOR ALL TO anon, authenticated USING (false);

CREATE POLICY "deny_anon_auth_otps" ON public.auth_otps
  FOR ALL TO anon, authenticated USING (false);

COMMIT;
