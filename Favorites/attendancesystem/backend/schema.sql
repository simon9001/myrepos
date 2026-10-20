-- ============================================================
-- Digital Meeting Attendance & Signature Management Platform
-- Supabase PostgreSQL Schema
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE public.platform_role AS ENUM (
    'platform_owner',
    'user'
);

CREATE TYPE public.org_member_role AS ENUM (
    'super_admin',
    'hr_admin',
    'department_admin',
    'meeting_organizer',
    'training_coordinator',
    'auditor',
    'participant'
);

CREATE TYPE public.meeting_type AS ENUM (
    'physical',
    'virtual',
    'hybrid'
);

CREATE TYPE public.virtual_platform AS ENUM (
    'zoom',
    'teams',
    'google_meet',
    'other'
);

CREATE TYPE public.meeting_status AS ENUM (
    'draft',
    'published',
    'open',
    'closed',
    'archived'
);

CREATE TYPE public.training_status AS ENUM (
    'draft',
    'published',
    'active',
    'completed',
    'archived'
);

CREATE TYPE public.session_type AS ENUM (
    'morning',
    'afternoon',
    'full_day',
    'custom'
);

CREATE TYPE public.session_status AS ENUM (
    'pending',
    'open',
    'closed'
);

CREATE TYPE public.attendance_frequency AS ENUM (
    'per_session',
    'once_per_day',
    'morning_and_afternoon',
    'every_lecture',
    'custom'
);

CREATE TYPE public.invitation_type AS ENUM (
    'public_link',
    'email',
    'bulk_upload',
    'internal_directory'
);

CREATE TYPE public.invitation_status AS ENUM (
    'pending',
    'sent',
    'opened',
    'signed',
    'expired'
);

CREATE TYPE public.template_type AS ENUM (
    'word_upload',
    'built_in'
);

CREATE TYPE public.signature_method AS ENUM (
    'finger',
    'mouse',
    'stylus'
);

CREATE TYPE public.document_format AS ENUM (
    'word',
    'pdf'
);

CREATE TYPE public.reminder_channel AS ENUM (
    'email',
    'sms',
    'whatsapp',
    'push'
);

CREATE TYPE public.reminder_status AS ENUM (
    'pending',
    'sent',
    'failed'
);

CREATE TYPE public.audit_action AS ENUM (
    -- Organization
    'org_created', 'org_updated', 'org_suspended', 'org_activated',
    -- Users
    'user_invited', 'user_joined', 'user_role_changed', 'user_removed',
    -- Meetings
    'meeting_created', 'meeting_updated', 'meeting_published',
    'meeting_closed', 'meeting_archived',
    -- Attendance window
    'attendance_opened', 'attendance_closed',
    -- Invitations
    'invitation_sent', 'invitation_opened',
    -- Attendance
    'participant_signed', 'attendance_deleted',
    -- Reminders
    'reminder_sent',
    -- Documents
    'attendance_exported', 'document_generated',
    -- Templates
    'template_created', 'template_updated', 'template_deleted',
    -- QR
    'qr_generated', 'qr_expired',
    -- Training
    'training_created', 'training_updated', 'training_session_created',
    -- OTP
    'otp_sent', 'otp_verified'
);

-- ============================================================
-- CORE USER & ORGANIZATION TABLES
-- ============================================================

-- Extends Supabase auth.users with application-level profile data
CREATE TABLE public.profiles (
    id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name     TEXT NOT NULL DEFAULT '',
    email         TEXT NOT NULL,
    phone         TEXT,
    avatar_url    TEXT,
    platform_role public.platform_role NOT NULL DEFAULT 'user',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Each tenant (company, university, NGO, etc.) is an organization
CREATE TABLE public.organizations (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT NOT NULL,
    slug        TEXT UNIQUE NOT NULL,
    logo_url    TEXT,
    -- { primary_color, secondary_color, letterhead_url, footer_text }
    branding    JSONB NOT NULL DEFAULT '{}',
    -- { require_otp, require_photo, require_gps, default_attendance_window_minutes, allow_late_signin }
    settings    JSONB NOT NULL DEFAULT '{}',
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_by  UUID REFERENCES public.profiles(id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Departments within an organization (supports nesting)
CREATE TABLE public.departments (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id      UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name                 TEXT NOT NULL,
    description          TEXT,
    parent_department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    created_by           UUID REFERENCES public.profiles(id),
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (organization_id, name)
);

-- Maps users to organizations with a specific role
CREATE TABLE public.organization_members (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role            public.org_member_role NOT NULL DEFAULT 'participant',
    department_id   UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    designation     TEXT,
    employee_id     TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    invited_by      UUID REFERENCES public.profiles(id),
    joined_at       TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (organization_id, user_id)
);

-- ============================================================
-- ATTENDANCE TEMPLATES
-- ============================================================

CREATE TABLE public.attendance_templates (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    description     TEXT,
    template_type   public.template_type NOT NULL DEFAULT 'built_in',
    -- URL to uploaded .docx file (for word_upload type)
    file_url        TEXT,
    thumbnail_url   TEXT,
    -- Layout config for built-in designer (logo position, fields, colors, table columns)
    config          JSONB NOT NULL DEFAULT '{}',
    -- Maps template placeholders to data fields: [{ key: "meeting_title", label: "Meeting Title" }]
    placeholders    JSONB NOT NULL DEFAULT '[]',
    orientation     TEXT NOT NULL DEFAULT 'portrait' CHECK (orientation IN ('portrait', 'landscape')),
    is_default      BOOLEAN NOT NULL DEFAULT FALSE,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_by      UUID REFERENCES public.profiles(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MEETINGS
-- ============================================================

CREATE TABLE public.meetings (
    id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id        UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    department_id          UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    template_id            UUID REFERENCES public.attendance_templates(id) ON DELETE SET NULL,
    title                  TEXT NOT NULL,
    description            TEXT,
    agenda                 TEXT,
    meeting_type           public.meeting_type NOT NULL DEFAULT 'physical',
    location               TEXT,
    virtual_link           TEXT,
    virtual_platform       public.virtual_platform,
    scheduled_date         DATE NOT NULL,
    start_time             TIME NOT NULL,
    end_time               TIME,
    -- When attendance collection opens and closes
    attendance_opens_at    TIMESTAMPTZ,
    attendance_closes_at   TIMESTAMPTZ,
    allow_late_signin      BOOLEAN NOT NULL DEFAULT FALSE,
    max_participants       INT,
    expected_attendees     INT,
    registration_deadline  TIMESTAMPTZ,
    status                 public.meeting_status NOT NULL DEFAULT 'draft',
    -- Public / open link settings
    public_link_enabled    BOOLEAN NOT NULL DEFAULT FALSE,
    public_link_token      TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
    -- Per-meeting optional capture settings (override org settings)
    require_otp            BOOLEAN NOT NULL DEFAULT FALSE,
    require_photo          BOOLEAN NOT NULL DEFAULT FALSE,
    require_gps            BOOLEAN NOT NULL DEFAULT FALSE,
    created_by             UUID NOT NULL REFERENCES public.profiles(id),
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TRAINING EVENTS & SESSIONS
-- ============================================================

CREATE TABLE public.training_events (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id      UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    department_id        UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    template_id          UUID REFERENCES public.attendance_templates(id) ON DELETE SET NULL,
    title                TEXT NOT NULL,
    description          TEXT,
    venue                TEXT,
    start_date           DATE NOT NULL,
    end_date             DATE NOT NULL,
    attendance_frequency public.attendance_frequency NOT NULL DEFAULT 'per_session',
    -- Custom frequency config: [{ label: "Day 1 Morning", opens_at: "...", closes_at: "..." }]
    frequency_config     JSONB NOT NULL DEFAULT '[]',
    status               public.training_status NOT NULL DEFAULT 'draft',
    created_by           UUID NOT NULL REFERENCES public.profiles(id),
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (end_date >= start_date)
);

-- Individual sessions within a training event (e.g. Day 2 Morning)
CREATE TABLE public.training_sessions (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    training_event_id    UUID NOT NULL REFERENCES public.training_events(id) ON DELETE CASCADE,
    title                TEXT NOT NULL,
    session_date         DATE NOT NULL,
    session_type         public.session_type NOT NULL DEFAULT 'full_day',
    start_time           TIME NOT NULL,
    end_time             TIME,
    attendance_opens_at  TIMESTAMPTZ,
    attendance_closes_at TIMESTAMPTZ,
    status               public.session_status NOT NULL DEFAULT 'pending',
    -- Unique token for the attendance link for this session
    public_link_token    TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- QR CODES
-- ============================================================

CREATE TABLE public.qr_codes (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id     UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    meeting_id          UUID REFERENCES public.meetings(id) ON DELETE CASCADE,
    training_session_id UUID REFERENCES public.training_sessions(id) ON DELETE CASCADE,
    code                TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
    qr_image_url        TEXT,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    scan_count          INT NOT NULL DEFAULT 0,
    expires_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Each QR must belong to exactly one: a meeting OR a training session
    CONSTRAINT qr_belongs_to_one CHECK (
        (meeting_id IS NOT NULL AND training_session_id IS NULL) OR
        (meeting_id IS NULL AND training_session_id IS NOT NULL)
    )
);

-- ============================================================
-- INVITATIONS
-- ============================================================

-- Tracks every invitation sent for a meeting or training session
CREATE TABLE public.invitations (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id     UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    meeting_id          UUID REFERENCES public.meetings(id) ON DELETE CASCADE,
    training_event_id   UUID REFERENCES public.training_events(id) ON DELETE CASCADE,
    training_session_id UUID REFERENCES public.training_sessions(id) ON DELETE CASCADE,
    invitation_type     public.invitation_type NOT NULL DEFAULT 'email',
    invited_by          UUID REFERENCES public.profiles(id),
    -- Unique token per invitation — used in attendance URL, cannot be reused
    token               TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
    -- Pre-filled details for the invitee
    email               TEXT,
    phone               TEXT,
    full_name           TEXT,
    designation         TEXT,
    department_name     TEXT,
    -- If the invitee is an existing platform user
    user_id             UUID REFERENCES public.profiles(id),
    status              public.invitation_status NOT NULL DEFAULT 'pending',
    expires_at          TIMESTAMPTZ,
    sent_at             TIMESTAMPTZ,
    opened_at           TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- OTP VERIFICATION
-- ============================================================

CREATE TABLE public.otp_verifications (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invitation_id UUID REFERENCES public.invitations(id) ON DELETE CASCADE,
    -- The email or phone the OTP was sent to
    contact       TEXT NOT NULL,
    contact_type  TEXT NOT NULL CHECK (contact_type IN ('email', 'phone')),
    otp_code      TEXT NOT NULL,
    is_used       BOOLEAN NOT NULL DEFAULT FALSE,
    attempts      INT NOT NULL DEFAULT 0,
    expires_at    TIMESTAMPTZ NOT NULL,
    verified_at   TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ATTENDANCE RECORDS
-- ============================================================

-- The core record: one row = one person's attendance for one event/session
CREATE TABLE public.attendance_records (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id     UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    meeting_id          UUID REFERENCES public.meetings(id) ON DELETE CASCADE,
    training_session_id UUID REFERENCES public.training_sessions(id) ON DELETE CASCADE,
    invitation_id       UUID REFERENCES public.invitations(id) ON DELETE SET NULL,
    qr_code_id          UUID REFERENCES public.qr_codes(id) ON DELETE SET NULL,
    -- Platform user (optional — anonymous participants won't have this)
    user_id             UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    -- Fields submitted on the attendance form
    full_name           TEXT NOT NULL,
    email               TEXT,
    phone               TEXT,
    designation         TEXT,
    department_name     TEXT,
    -- Digital signature stored as a URL to a PNG/SVG file
    signature_url       TEXT NOT NULL,
    signature_method    public.signature_method NOT NULL DEFAULT 'mouse',
    -- Optional capture fields
    photo_url           TEXT,
    gps_lat             DECIMAL(10, 8),
    gps_lng             DECIMAL(11, 8),
    -- Metadata captured at sign time
    device_info         JSONB NOT NULL DEFAULT '{}',
    ip_address          INET,
    is_late             BOOLEAN NOT NULL DEFAULT FALSE,
    otp_verified        BOOLEAN NOT NULL DEFAULT FALSE,
    signed_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Each record must belong to exactly one: meeting OR training session
    CONSTRAINT attendance_belongs_to_one CHECK (
        (meeting_id IS NOT NULL AND training_session_id IS NULL) OR
        (meeting_id IS NULL AND training_session_id IS NOT NULL)
    )
);

-- Prevent duplicate email signatures per meeting / per training session
CREATE UNIQUE INDEX uq_email_per_meeting
    ON public.attendance_records (meeting_id, LOWER(email))
    WHERE meeting_id IS NOT NULL AND email IS NOT NULL;

CREATE UNIQUE INDEX uq_email_per_session
    ON public.attendance_records (training_session_id, LOWER(email))
    WHERE training_session_id IS NOT NULL AND email IS NOT NULL;

-- Prevent duplicate phone signatures per meeting / per training session
CREATE UNIQUE INDEX uq_phone_per_meeting
    ON public.attendance_records (meeting_id, phone)
    WHERE meeting_id IS NOT NULL AND phone IS NOT NULL;

CREATE UNIQUE INDEX uq_phone_per_session
    ON public.attendance_records (training_session_id, phone)
    WHERE training_session_id IS NOT NULL AND phone IS NOT NULL;

-- Each invitation token can only be used to sign once
CREATE UNIQUE INDEX uq_invitation_per_attendance
    ON public.attendance_records (invitation_id)
    WHERE invitation_id IS NOT NULL;

-- ============================================================
-- GENERATED DOCUMENTS
-- ============================================================

CREATE TABLE public.generated_documents (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id  UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    meeting_id       UUID REFERENCES public.meetings(id) ON DELETE CASCADE,
    training_event_id UUID REFERENCES public.training_events(id) ON DELETE CASCADE,
    template_id      UUID REFERENCES public.attendance_templates(id) ON DELETE SET NULL,
    file_format      public.document_format NOT NULL DEFAULT 'pdf',
    file_url         TEXT NOT NULL,
    file_size_bytes  BIGINT,
    generated_by     UUID NOT NULL REFERENCES public.profiles(id),
    generated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- REMINDERS
-- ============================================================

-- Scheduled reminder messages to participants who haven't signed yet
CREATE TABLE public.reminders (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id     UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    meeting_id          UUID REFERENCES public.meetings(id) ON DELETE CASCADE,
    training_session_id UUID REFERENCES public.training_sessions(id) ON DELETE CASCADE,
    invitation_id       UUID REFERENCES public.invitations(id) ON DELETE CASCADE,
    channel             public.reminder_channel NOT NULL DEFAULT 'email',
    message             TEXT,
    scheduled_at        TIMESTAMPTZ NOT NULL,
    sent_at             TIMESTAMPTZ,
    status              public.reminder_status NOT NULL DEFAULT 'pending',
    created_by          UUID REFERENCES public.profiles(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE public.notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    type            TEXT NOT NULL,
    title           TEXT NOT NULL,
    message         TEXT NOT NULL,
    -- Extra data (e.g. meeting_id, action link)
    metadata        JSONB NOT NULL DEFAULT '{}',
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    read_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- AUDIT LOGS
-- ============================================================

-- Immutable log of every significant action on the platform
CREATE TABLE public.audit_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    user_id         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action          public.audit_action NOT NULL,
    entity_type     TEXT,
    entity_id       UUID,
    -- Additional context: before/after values, changed fields, etc.
    metadata        JSONB NOT NULL DEFAULT '{}',
    ip_address      INET,
    user_agent      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Organizations
CREATE INDEX idx_organizations_is_active   ON public.organizations (is_active);

-- Organization members
CREATE INDEX idx_org_members_org_id        ON public.organization_members (organization_id);
CREATE INDEX idx_org_members_user_id       ON public.organization_members (user_id);
CREATE INDEX idx_org_members_role          ON public.organization_members (role);
CREATE INDEX idx_org_members_dept_id       ON public.organization_members (department_id);

-- Departments
CREATE INDEX idx_departments_org_id        ON public.departments (organization_id);
CREATE INDEX idx_departments_parent        ON public.departments (parent_department_id);

-- Templates
CREATE INDEX idx_templates_org_id          ON public.attendance_templates (organization_id);

-- Meetings
CREATE INDEX idx_meetings_org_id           ON public.meetings (organization_id);
CREATE INDEX idx_meetings_dept_id          ON public.meetings (department_id);
CREATE INDEX idx_meetings_status           ON public.meetings (status);
CREATE INDEX idx_meetings_date             ON public.meetings (scheduled_date);
CREATE INDEX idx_meetings_created_by       ON public.meetings (created_by);
CREATE INDEX idx_meetings_public_token     ON public.meetings (public_link_token);

-- Training
CREATE INDEX idx_training_events_org_id    ON public.training_events (organization_id);
CREATE INDEX idx_training_sessions_event   ON public.training_sessions (training_event_id);
CREATE INDEX idx_training_sessions_date    ON public.training_sessions (session_date);
CREATE INDEX idx_training_sessions_token   ON public.training_sessions (public_link_token);

-- QR codes
CREATE INDEX idx_qr_meeting_id             ON public.qr_codes (meeting_id);
CREATE INDEX idx_qr_session_id             ON public.qr_codes (training_session_id);
CREATE INDEX idx_qr_code                   ON public.qr_codes (code);
CREATE INDEX idx_qr_is_active              ON public.qr_codes (is_active);

-- Invitations
CREATE INDEX idx_invitations_meeting_id    ON public.invitations (meeting_id);
CREATE INDEX idx_invitations_event_id      ON public.invitations (training_event_id);
CREATE INDEX idx_invitations_session_id    ON public.invitations (training_session_id);
CREATE INDEX idx_invitations_token         ON public.invitations (token);
CREATE INDEX idx_invitations_email         ON public.invitations (email);
CREATE INDEX idx_invitations_status        ON public.invitations (status);
CREATE INDEX idx_invitations_user_id       ON public.invitations (user_id);

-- OTP
CREATE INDEX idx_otp_invitation_id         ON public.otp_verifications (invitation_id);
CREATE INDEX idx_otp_contact               ON public.otp_verifications (contact);

-- Attendance records
CREATE INDEX idx_attendance_org_id         ON public.attendance_records (organization_id);
CREATE INDEX idx_attendance_meeting_id     ON public.attendance_records (meeting_id);
CREATE INDEX idx_attendance_session_id     ON public.attendance_records (training_session_id);
CREATE INDEX idx_attendance_signed_at      ON public.attendance_records (signed_at);
CREATE INDEX idx_attendance_email          ON public.attendance_records (email);
CREATE INDEX idx_attendance_user_id        ON public.attendance_records (user_id);

-- Generated documents
CREATE INDEX idx_documents_meeting_id      ON public.generated_documents (meeting_id);
CREATE INDEX idx_documents_event_id        ON public.generated_documents (training_event_id);

-- Reminders
CREATE INDEX idx_reminders_meeting_id      ON public.reminders (meeting_id);
CREATE INDEX idx_reminders_session_id      ON public.reminders (training_session_id);
CREATE INDEX idx_reminders_status          ON public.reminders (status);
CREATE INDEX idx_reminders_scheduled_at    ON public.reminders (scheduled_at);

-- Notifications
CREATE INDEX idx_notifications_user_id     ON public.notifications (user_id);
CREATE INDEX idx_notifications_unread      ON public.notifications (user_id) WHERE is_read = FALSE;

-- Audit logs
CREATE INDEX idx_audit_org_id              ON public.audit_logs (organization_id);
CREATE INDEX idx_audit_user_id             ON public.audit_logs (user_id);
CREATE INDEX idx_audit_action              ON public.audit_logs (action);
CREATE INDEX idx_audit_entity              ON public.audit_logs (entity_type, entity_id);
CREATE INDEX idx_audit_created_at          ON public.audit_logs (created_at DESC);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Returns the calling user's platform role
CREATE OR REPLACE FUNCTION public.is_platform_owner()
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND platform_role = 'platform_owner'
    );
$$;

-- Returns the calling user's role within a specific organization
CREATE OR REPLACE FUNCTION public.get_org_role(org_id UUID)
RETURNS public.org_member_role
LANGUAGE SQL STABLE SECURITY DEFINER AS $$
    SELECT role FROM public.organization_members
    WHERE organization_id = org_id
      AND user_id = auth.uid()
      AND is_active = TRUE
    LIMIT 1;
$$;

-- Returns TRUE if the calling user is an active member of the org
CREATE OR REPLACE FUNCTION public.is_org_member(org_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = org_id
          AND user_id = auth.uid()
          AND is_active = TRUE
    );
$$;

-- Returns TRUE if the calling user is super_admin or hr_admin of the org
CREATE OR REPLACE FUNCTION public.is_org_admin(org_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = org_id
          AND user_id = auth.uid()
          AND is_active = TRUE
          AND role IN ('super_admin', 'hr_admin')
    );
$$;

-- Returns TRUE if the calling user can create/manage meetings in the org
CREATE OR REPLACE FUNCTION public.can_manage_meetings(org_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = org_id
          AND user_id = auth.uid()
          AND is_active = TRUE
          AND role IN ('super_admin', 'hr_admin', 'department_admin', 'meeting_organizer')
    );
$$;

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_organizations_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_departments_updated_at
    BEFORE UPDATE ON public.departments
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_org_members_updated_at
    BEFORE UPDATE ON public.organization_members
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_templates_updated_at
    BEFORE UPDATE ON public.attendance_templates
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_meetings_updated_at
    BEFORE UPDATE ON public.meetings
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_training_events_updated_at
    BEFORE UPDATE ON public.training_events
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_training_sessions_updated_at
    BEFORE UPDATE ON public.training_sessions
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_invitations_updated_at
    BEFORE UPDATE ON public.invitations
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_org_members_member_updated_at
    BEFORE UPDATE ON public.organization_members
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create a profile row when a new Supabase auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_templates  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_events       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_sessions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_codes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_verifications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_documents   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs            ENABLE ROW LEVEL SECURITY;

-- --------------------------------
-- profiles
-- --------------------------------
CREATE POLICY "Own profile: full access"
    ON public.profiles FOR ALL
    USING (id = auth.uid());

CREATE POLICY "Org peers: can view"
    ON public.profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.organization_members a
            JOIN public.organization_members b ON a.organization_id = b.organization_id
            WHERE a.user_id = auth.uid()
              AND b.user_id = profiles.id
              AND a.is_active = TRUE
        )
    );

CREATE POLICY "Platform owner: full access"
    ON public.profiles FOR ALL
    USING (public.is_platform_owner());

-- --------------------------------
-- organizations
-- --------------------------------
CREATE POLICY "Org members: can view own org"
    ON public.organizations FOR SELECT
    USING (public.is_org_member(id));

CREATE POLICY "Super admin: can update own org"
    ON public.organizations FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.organization_members
            WHERE organization_id = organizations.id
              AND user_id = auth.uid()
              AND role = 'super_admin'
              AND is_active = TRUE
        )
    );

CREATE POLICY "Platform owner: full access"
    ON public.organizations FOR ALL
    USING (public.is_platform_owner());

-- --------------------------------
-- departments
-- --------------------------------
CREATE POLICY "Org members: can view"
    ON public.departments FOR SELECT
    USING (public.is_org_member(organization_id));

CREATE POLICY "Org admin / dept admin: can manage"
    ON public.departments FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.organization_members
            WHERE organization_id = departments.organization_id
              AND user_id = auth.uid()
              AND is_active = TRUE
              AND role IN ('super_admin', 'hr_admin', 'department_admin')
        )
    );

-- --------------------------------
-- organization_members
-- --------------------------------
CREATE POLICY "Own membership: can view"
    ON public.organization_members FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Org members: can view peers"
    ON public.organization_members FOR SELECT
    USING (public.is_org_member(organization_id));

CREATE POLICY "Org admin: full management"
    ON public.organization_members FOR ALL
    USING (public.is_org_admin(organization_id));

CREATE POLICY "Platform owner: full access"
    ON public.organization_members FOR ALL
    USING (public.is_platform_owner());

-- --------------------------------
-- attendance_templates
-- --------------------------------
CREATE POLICY "Org members: can view templates"
    ON public.attendance_templates FOR SELECT
    USING (public.is_org_member(organization_id));

CREATE POLICY "Org admin / organizers: can manage templates"
    ON public.attendance_templates FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.organization_members
            WHERE organization_id = attendance_templates.organization_id
              AND user_id = auth.uid()
              AND is_active = TRUE
              AND role IN ('super_admin', 'hr_admin', 'department_admin', 'meeting_organizer', 'training_coordinator')
        )
    );

-- --------------------------------
-- meetings
-- --------------------------------
CREATE POLICY "Org members: can view meetings"
    ON public.meetings FOR SELECT
    USING (public.is_org_member(organization_id));

CREATE POLICY "Organizers and above: can create meetings"
    ON public.meetings FOR INSERT
    WITH CHECK (public.can_manage_meetings(organization_id));

CREATE POLICY "Creator or org admin: can update meeting"
    ON public.meetings FOR UPDATE
    USING (created_by = auth.uid() OR public.is_org_admin(organization_id));

CREATE POLICY "Creator or org admin: can delete meeting"
    ON public.meetings FOR DELETE
    USING (created_by = auth.uid() OR public.is_org_admin(organization_id));

-- --------------------------------
-- training_events
-- --------------------------------
CREATE POLICY "Org members: can view training events"
    ON public.training_events FOR SELECT
    USING (public.is_org_member(organization_id));

CREATE POLICY "HR admin / training coordinator: can manage"
    ON public.training_events FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.organization_members
            WHERE organization_id = training_events.organization_id
              AND user_id = auth.uid()
              AND is_active = TRUE
              AND role IN ('super_admin', 'hr_admin', 'training_coordinator')
        )
    );

-- --------------------------------
-- training_sessions
-- --------------------------------
CREATE POLICY "Org members: can view training sessions"
    ON public.training_sessions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.training_events te
            WHERE te.id = training_sessions.training_event_id
              AND public.is_org_member(te.organization_id)
        )
    );

CREATE POLICY "Training event managers: can manage sessions"
    ON public.training_sessions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.training_events te
            JOIN public.organization_members om ON om.organization_id = te.organization_id
            WHERE te.id = training_sessions.training_event_id
              AND om.user_id = auth.uid()
              AND om.is_active = TRUE
              AND om.role IN ('super_admin', 'hr_admin', 'training_coordinator')
        )
    );

-- --------------------------------
-- qr_codes
-- --------------------------------
CREATE POLICY "Org members: can view QR codes"
    ON public.qr_codes FOR SELECT
    USING (public.is_org_member(organization_id));

CREATE POLICY "Organizers and above: can manage QR codes"
    ON public.qr_codes FOR ALL
    USING (public.can_manage_meetings(organization_id));

-- --------------------------------
-- invitations
-- --------------------------------
CREATE POLICY "Org members: can view invitations"
    ON public.invitations FOR SELECT
    USING (public.is_org_member(organization_id));

CREATE POLICY "Own invitation: can view by token (anon)"
    ON public.invitations FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Organizers and above: can create invitations"
    ON public.invitations FOR INSERT
    WITH CHECK (public.can_manage_meetings(organization_id));

CREATE POLICY "Organizers and above: can update invitations"
    ON public.invitations FOR UPDATE
    USING (public.can_manage_meetings(organization_id));

-- --------------------------------
-- otp_verifications
-- --------------------------------
-- OTP checks are handled server-side; restrict client reads
CREATE POLICY "No direct client read on OTP"
    ON public.otp_verifications FOR SELECT
    USING (FALSE);

CREATE POLICY "System insert only"
    ON public.otp_verifications FOR INSERT
    WITH CHECK (TRUE);

-- --------------------------------
-- attendance_records
-- --------------------------------
-- Public INSERT so anonymous participants can sign; validation is enforced by
-- the unique indexes and server-side invitation token verification.
CREATE POLICY "Anyone can submit attendance"
    ON public.attendance_records FOR INSERT
    WITH CHECK (TRUE);

CREATE POLICY "Org members: can view attendance records"
    ON public.attendance_records FOR SELECT
    USING (public.is_org_member(organization_id));

CREATE POLICY "Own record: participant can view"
    ON public.attendance_records FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Org admin: can update or delete"
    ON public.attendance_records FOR ALL
    USING (public.is_org_admin(organization_id));

-- --------------------------------
-- generated_documents
-- --------------------------------
CREATE POLICY "Org members: can view documents"
    ON public.generated_documents FOR SELECT
    USING (public.is_org_member(organization_id));

CREATE POLICY "Organizers and above: can create documents"
    ON public.generated_documents FOR INSERT
    WITH CHECK (public.can_manage_meetings(organization_id));

-- --------------------------------
-- reminders
-- --------------------------------
CREATE POLICY "Org members: can view reminders"
    ON public.reminders FOR SELECT
    USING (public.is_org_member(organization_id));

CREATE POLICY "Organizers and above: can manage reminders"
    ON public.reminders FOR ALL
    USING (public.can_manage_meetings(organization_id));

-- --------------------------------
-- notifications
-- --------------------------------
CREATE POLICY "Own notifications only"
    ON public.notifications FOR ALL
    USING (user_id = auth.uid());

-- --------------------------------
-- audit_logs
-- --------------------------------
CREATE POLICY "Platform owner: view all logs"
    ON public.audit_logs FOR SELECT
    USING (public.is_platform_owner());

CREATE POLICY "Org admin / auditor: view org logs"
    ON public.audit_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.organization_members
            WHERE organization_id = audit_logs.organization_id
              AND user_id = auth.uid()
              AND is_active = TRUE
              AND role IN ('super_admin', 'hr_admin', 'auditor')
        )
    );

-- Audit logs are insert-only; updates/deletes are blocked for all clients
CREATE POLICY "System insert only"
    ON public.audit_logs FOR INSERT
    WITH CHECK (TRUE);

-- ============================================================
-- VIEWS (analytics & live dashboard)
-- ============================================================

-- Per-meeting attendance summary (used by live dashboard and reports)
CREATE OR REPLACE VIEW public.v_meeting_attendance_summary AS
SELECT
    m.id                                                             AS meeting_id,
    m.organization_id,
    m.title,
    m.scheduled_date,
    m.meeting_type,
    m.status,
    m.expected_attendees,
    COUNT(ar.id)                                                     AS total_signed,
    COUNT(ar.id) FILTER (WHERE ar.is_late)                          AS late_count,
    ROUND(
        CASE WHEN COALESCE(m.expected_attendees, 0) > 0
             THEN COUNT(ar.id)::DECIMAL / m.expected_attendees * 100
             ELSE 0
        END, 2
    )                                                                AS attendance_pct,
    MIN(ar.signed_at)                                                AS first_signed_at,
    MAX(ar.signed_at)                                                AS last_signed_at
FROM public.meetings m
LEFT JOIN public.attendance_records ar ON ar.meeting_id = m.id
GROUP BY m.id;

-- Per-session attendance summary for training events
CREATE OR REPLACE VIEW public.v_training_attendance_summary AS
SELECT
    te.id                AS training_event_id,
    te.organization_id,
    te.title             AS training_title,
    te.start_date,
    te.end_date,
    ts.id                AS session_id,
    ts.title             AS session_title,
    ts.session_date,
    ts.session_type,
    ts.status            AS session_status,
    COUNT(ar.id)         AS total_signed
FROM public.training_events te
JOIN public.training_sessions ts ON ts.training_event_id = te.id
LEFT JOIN public.attendance_records ar ON ar.training_session_id = ts.id
GROUP BY te.id, ts.id;

-- Participant training completion view (who attended which sessions)
CREATE OR REPLACE VIEW public.v_participant_training_matrix AS
SELECT
    te.id                                    AS training_event_id,
    te.organization_id,
    te.title                                 AS training_title,
    ar.full_name,
    ar.email,
    ar.designation,
    ts.id                                    AS session_id,
    ts.title                                 AS session_title,
    ts.session_date,
    ts.session_type,
    ar.signed_at,
    ar.signature_url
FROM public.training_events te
JOIN public.training_sessions ts ON ts.training_event_id = te.id
JOIN public.attendance_records ar ON ar.training_session_id = ts.id;

-- ============================================================
-- REALTIME (enable for live attendance dashboard)
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance_records;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meetings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.training_sessions;
