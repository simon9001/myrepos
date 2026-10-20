-- ================================================================
-- Org Features Migration — run once in Supabase SQL editor
-- Adds extended org fields, invite role column, saved signatures
-- ================================================================

BEGIN;

-- ── 1. Extended fields on organizations ──────────────────────────────────────
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS industry          TEXT,
  ADD COLUMN IF NOT EXISTS country           TEXT,
  ADD COLUMN IF NOT EXISTS company_email     TEXT,
  ADD COLUMN IF NOT EXISTS company_phone     TEXT,
  ADD COLUMN IF NOT EXISTS address           TEXT,
  ADD COLUMN IF NOT EXISTS website           TEXT,
  ADD COLUMN IF NOT EXISTS subscription_plan TEXT NOT NULL DEFAULT 'free_trial'
    CHECK (subscription_plan IN ('free_trial', 'basic', 'professional', 'enterprise'));

-- ── 2. Store intended org role on member invitations ─────────────────────────
-- When a super_admin invites someone who doesn't have an account yet,
-- we record the role here so complete-invite can assign it when they join.
ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS org_role public.org_member_role;

-- ── 3. Saved digital signature on profiles ───────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS signature_url TEXT;

COMMIT;
