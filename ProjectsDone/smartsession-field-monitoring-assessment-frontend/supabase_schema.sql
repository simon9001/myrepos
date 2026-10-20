-- =============================================================
-- SmartSession Field Monitoring Assessment
-- Supabase / PostgreSQL Database Schema
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- EXTENSIONS
-- ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid(), crypt()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- trigram index for name searches


-- ─────────────────────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────────────────────
CREATE TYPE user_role   AS ENUM ('admin', 'agent');
CREATE TYPE field_stage AS ENUM ('Planted', 'Growing', 'Ready', 'Harvested');


-- =============================================================
-- TABLE: users
-- Stores both admins/coordinators and field agents.
-- =============================================================
CREATE TABLE users (
    user_id       UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name    VARCHAR(100) NOT NULL CHECK (char_length(first_name) >= 2),
    last_name     VARCHAR(100) NOT NULL CHECK (char_length(last_name)  >= 2),
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT         NOT NULL,   -- store bcrypt hash, never plaintext
    phone_number  VARCHAR(15)  CHECK (phone_number ~ '^[0-9]{10,15}$'),
    user_type     user_role    NOT NULL DEFAULT 'agent',
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email     ON users (email);
CREATE INDEX idx_users_user_type ON users (user_type);
CREATE INDEX idx_users_is_active ON users (is_active);


-- =============================================================
-- TABLE: fields
-- One row per agricultural field.
-- =============================================================
CREATE TABLE fields (
    field_id      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(255) NOT NULL,
    crop_type     VARCHAR(100) NOT NULL,
    planting_date DATE         NOT NULL,
    stage         field_stage  NOT NULL DEFAULT 'Planted',
    agent_id      UUID         REFERENCES users (user_id) ON DELETE SET NULL,
    notes         TEXT         NOT NULL DEFAULT '',
    last_updated  DATE         NOT NULL DEFAULT CURRENT_DATE,
    created_by    UUID         REFERENCES users (user_id) ON DELETE SET NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fields_agent_id     ON fields (agent_id);
CREATE INDEX idx_fields_stage        ON fields (stage);
CREATE INDEX idx_fields_last_updated ON fields (last_updated);
CREATE INDEX idx_fields_crop_type    ON fields (crop_type);
CREATE INDEX idx_fields_name_trgm    ON fields USING GIN (name gin_trgm_ops);


-- =============================================================
-- TABLE: field_assignments
-- Full history of every agent-to-field assignment.
-- The active assignment lives in fields.agent_id for fast reads;
-- this table keeps every past assignment for audit purposes.
-- =============================================================
CREATE TABLE field_assignments (
    assignment_id UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id      UUID        NOT NULL REFERENCES fields (field_id) ON DELETE CASCADE,
    agent_id      UUID        REFERENCES users (user_id) ON DELETE SET NULL,
    assigned_by   UUID        REFERENCES users (user_id) ON DELETE SET NULL,
    assigned_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    unassigned_at TIMESTAMPTZ           -- NULL means currently active
);

CREATE INDEX idx_fa_field_id ON field_assignments (field_id);
CREATE INDEX idx_fa_agent_id ON field_assignments (agent_id);
CREATE INDEX idx_fa_active   ON field_assignments (field_id) WHERE unassigned_at IS NULL;


-- =============================================================
-- TABLE: field_stage_history
-- Every stage + notes change made by a field agent.
-- Powers the timeline / audit trail.
-- =============================================================
CREATE TABLE field_stage_history (
    history_id     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id       UUID        NOT NULL REFERENCES fields (field_id) ON DELETE CASCADE,
    changed_by     UUID        REFERENCES users (user_id) ON DELETE SET NULL,
    previous_stage field_stage,
    new_stage      field_stage NOT NULL,
    previous_notes TEXT,
    new_notes      TEXT,
    changed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fsh_field_id   ON field_stage_history (field_id);
CREATE INDEX idx_fsh_changed_at ON field_stage_history (changed_at);
CREATE INDEX idx_fsh_changed_by ON field_stage_history (changed_by);


-- =============================================================
-- VIEW: field_status_view
-- Computes the derived status (Active / At Risk / Completed)
-- exactly as the frontend utility fieldStatus.js does.
-- =============================================================
CREATE OR REPLACE VIEW field_status_view AS
SELECT
    f.field_id,
    f.name,
    f.crop_type,
    f.planting_date,
    f.stage,
    f.agent_id,
    f.notes,
    f.last_updated,
    f.created_by,
    f.created_at,
    f.updated_at,
    u.first_name   AS agent_first_name,
    u.last_name    AS agent_last_name,
    u.email        AS agent_email,
    u.phone_number AS agent_phone,
    CASE
        WHEN f.stage = 'Harvested'
             THEN 'Completed'
        WHEN f.stage IN ('Planted', 'Growing')
             AND (CURRENT_DATE - f.last_updated) > 7
             THEN 'At Risk'
        ELSE 'Active'
    END AS field_status,
    (CURRENT_DATE - f.last_updated) AS days_since_update
FROM  fields f
LEFT JOIN users u ON u.user_id = f.agent_id;


-- =============================================================
-- TRIGGERS
-- =============================================================

-- Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_fields_updated_at
    BEFORE UPDATE ON fields
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- Record stage / notes changes into field_stage_history.
-- The application must pass the acting user's UUID in the
-- session variable "app.current_user_id" before executing
-- any UPDATE, e.g.:
--   SET LOCAL "app.current_user_id" = '<uuid>';
CREATE OR REPLACE FUNCTION record_field_stage_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_changed_by UUID;
BEGIN
    IF (OLD.stage IS DISTINCT FROM NEW.stage) OR
       (OLD.notes IS DISTINCT FROM NEW.notes) THEN

        -- Resolve the acting user from the session variable
        BEGIN
            v_changed_by := current_setting('app.current_user_id', TRUE)::UUID;
        EXCEPTION WHEN OTHERS THEN
            v_changed_by := NULL;
        END;

        INSERT INTO field_stage_history (
            field_id, changed_by,
            previous_stage, new_stage,
            previous_notes, new_notes
        ) VALUES (
            NEW.field_id, v_changed_by,
            OLD.stage,    NEW.stage,
            OLD.notes,    NEW.notes
        );

        NEW.last_updated = CURRENT_DATE;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_fields_stage_history
    BEFORE UPDATE ON fields
    FOR EACH ROW EXECUTE FUNCTION record_field_stage_change();


-- Record assignment changes into field_assignments.
CREATE OR REPLACE FUNCTION record_field_assignment_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_admin_id UUID;
BEGIN
    IF OLD.agent_id IS DISTINCT FROM NEW.agent_id THEN
        BEGIN
            v_admin_id := current_setting('app.current_user_id', TRUE)::UUID;
        EXCEPTION WHEN OTHERS THEN
            v_admin_id := NULL;
        END;

        -- Close the previous open assignment
        UPDATE field_assignments
        SET    unassigned_at = NOW()
        WHERE  field_id      = NEW.field_id
          AND  unassigned_at IS NULL;

        -- Open a new assignment row (skip when being unassigned)
        IF NEW.agent_id IS NOT NULL THEN
            INSERT INTO field_assignments (field_id, agent_id, assigned_by)
            VALUES (NEW.field_id, NEW.agent_id, v_admin_id);
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_fields_assignment_history
    AFTER UPDATE OF agent_id ON fields
    FOR EACH ROW EXECUTE FUNCTION record_field_assignment_change();


-- =============================================================
-- ROW LEVEL SECURITY (RLS)
-- Supabase enforces these automatically when auth is enabled.
-- Replace auth.uid() with your auth strategy if not using
-- Supabase built-in auth.
-- =============================================================

ALTER TABLE users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE fields              ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_assignments   ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_stage_history ENABLE ROW LEVEL SECURITY;

-- ── users ──────────────────────────────────────────────────
-- All authenticated users can read the user list (needed for
-- the agent-assignment dropdown in the frontend).
CREATE POLICY users_select ON users
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Users can update only their own profile.
CREATE POLICY users_update_self ON users
    FOR UPDATE
    USING (user_id = auth.uid()::UUID);

-- Only admins can insert new users (registration goes through
-- a server-side function in production).
CREATE POLICY users_insert_admin ON users
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE user_id = auth.uid()::UUID
              AND user_type = 'admin'
        )
    );

-- ── fields ─────────────────────────────────────────────────
-- Admins have full access to all fields.
CREATE POLICY fields_admin_all ON fields
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE user_id = auth.uid()::UUID
              AND user_type = 'admin'
        )
    );

-- Agents can read only their own assigned fields.
CREATE POLICY fields_agent_select ON fields
    FOR SELECT
    USING (agent_id = auth.uid()::UUID);

-- Agents can update only their own fields (stage + notes).
CREATE POLICY fields_agent_update ON fields
    FOR UPDATE
    USING (agent_id = auth.uid()::UUID)
    WITH CHECK (agent_id = auth.uid()::UUID);

-- ── field_assignments ──────────────────────────────────────
CREATE POLICY fa_admin_all ON field_assignments
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE user_id = auth.uid()::UUID
              AND user_type = 'admin'
        )
    );

CREATE POLICY fa_agent_select ON field_assignments
    FOR SELECT
    USING (agent_id = auth.uid()::UUID);

-- ── field_stage_history ────────────────────────────────────
CREATE POLICY fsh_admin_all ON field_stage_history
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE user_id = auth.uid()::UUID
              AND user_type = 'admin'
        )
    );

CREATE POLICY fsh_agent_select ON field_stage_history
    FOR SELECT
    USING (changed_by = auth.uid()::UUID);


-- =============================================================
-- SEED DATA  (mirrors the mock localStorage data in the app)
-- Passwords hashed with bcrypt cost 10.
-- Plaintext: admin → "admin123", agent → "agent123"
-- =============================================================

INSERT INTO users (user_id, first_name, last_name, email, password_hash, phone_number, user_type)
VALUES
    ('00000000-0000-0000-0000-000000000001',
     'Admin', 'User', 'admin@crop.com',
     crypt('admin123', gen_salt('bf', 10)),
     '0700000001', 'admin'),

    ('00000000-0000-0000-0000-000000000002',
     'Field', 'Agent', 'agent@crop.com',
     crypt('agent123', gen_salt('bf', 10)),
     '0700000002', 'agent');


INSERT INTO fields (
    field_id, name, crop_type, planting_date, stage,
    agent_id, notes, last_updated, created_by
)
VALUES
    ('10000000-0000-0000-0000-000000000001',
     'North Acre', 'Corn', '2026-03-01', 'Planted',
     '00000000-0000-0000-0000-000000000002',
     '', '2026-04-24',
     '00000000-0000-0000-0000-000000000001'),

    ('10000000-0000-0000-0000-000000000002',
     'South Field', 'Wheat', '2026-02-15', 'Growing',
     '00000000-0000-0000-0000-000000000002',
     '', '2026-04-10',
     '00000000-0000-0000-0000-000000000001'),

    ('10000000-0000-0000-0000-000000000003',
     'East Meadow', 'Soybeans', '2025-10-01', 'Harvested',
     NULL,
     '', '2025-11-20',
     '00000000-0000-0000-0000-000000000001');


-- Seed initial assignment history for the two assigned fields
INSERT INTO field_assignments (field_id, agent_id, assigned_by)
VALUES
    ('10000000-0000-0000-0000-000000000001',
     '00000000-0000-0000-0000-000000000002',
     '00000000-0000-0000-0000-000000000001'),

    ('10000000-0000-0000-0000-000000000002',
     '00000000-0000-0000-0000-000000000002',
     '00000000-0000-0000-0000-000000000001');


-- =============================================================
-- HELPER RPC FUNCTIONS (callable from frontend via supabase.rpc())
-- =============================================================

-- Returns all fields with computed status (admin use)
CREATE OR REPLACE FUNCTION get_all_fields_with_status()
RETURNS SETOF field_status_view
LANGUAGE sql SECURITY DEFINER
AS $$
    SELECT * FROM field_status_view ORDER BY last_updated ASC;
$$;

-- Returns fields assigned to a specific agent with computed status
CREATE OR REPLACE FUNCTION get_agent_fields(p_agent_id UUID)
RETURNS SETOF field_status_view
LANGUAGE sql SECURITY DEFINER
AS $$
    SELECT * FROM field_status_view
    WHERE  agent_id = p_agent_id
    ORDER BY last_updated ASC;
$$;

-- Safely updates stage and notes; history is captured by the trigger.
-- Call as: supabase.rpc('update_field_stage_and_notes', {...})
CREATE OR REPLACE FUNCTION update_field_stage_and_notes(
    p_field_id UUID,
    p_stage    field_stage,
    p_notes    TEXT,
    p_agent_id UUID
)
RETURNS fields
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    updated_field fields;
BEGIN
    UPDATE fields
    SET    stage = p_stage,
           notes = p_notes
    WHERE  field_id = p_field_id
      AND  agent_id = p_agent_id
    RETURNING * INTO updated_field;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Field not found or access denied';
    END IF;

    RETURN updated_field;
END;
$$;

-- Assigns a field to an agent; only admins may call this.
-- Call as: supabase.rpc('assign_field_to_agent', {...})
CREATE OR REPLACE FUNCTION assign_field_to_agent(
    p_field_id UUID,
    p_agent_id UUID,
    p_admin_id UUID
)
RETURNS fields
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    updated_field fields;
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM users
        WHERE user_id = p_admin_id AND user_type = 'admin'
    ) THEN
        RAISE EXCEPTION 'Only admins can assign fields';
    END IF;

    UPDATE fields
    SET    agent_id = p_agent_id
    WHERE  field_id = p_field_id
    RETURNING * INTO updated_field;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Field not found';
    END IF;

    RETURN updated_field;
END;
$$;
