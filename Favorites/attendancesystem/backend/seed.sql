-- ============================================================
-- Seed Data — Development / Demo
-- Run AFTER schema.sql
-- ============================================================
-- NOTE: auth.users rows must be created through Supabase Auth
-- (Dashboard → Authentication → Users, or supabase.auth.signUp).
-- Replace the UUIDs below with the real IDs from your Auth table.
-- ============================================================

-- Placeholder UUIDs (replace with real auth.users IDs)
DO $$
DECLARE
    v_platform_owner_id  UUID := '00000000-0000-0000-0000-000000000001';
    v_super_admin_id     UUID := '00000000-0000-0000-0000-000000000002';
    v_hr_admin_id        UUID := '00000000-0000-0000-0000-000000000003';
    v_organizer_id       UUID := '00000000-0000-0000-0000-000000000004';
    v_auditor_id         UUID := '00000000-0000-0000-0000-000000000005';
    v_org_id             UUID;
    v_dept_finance_id    UUID;
    v_dept_ict_id        UUID;
    v_template_id        UUID;
    v_meeting_id         UUID;
    v_training_id        UUID;
    v_session1_id        UUID;
    v_session2_id        UUID;
BEGIN

-- --------------------------------
-- Profiles
-- --------------------------------
INSERT INTO public.profiles (id, full_name, email, platform_role) VALUES
    (v_platform_owner_id, 'System Owner',   'owner@platform.dev',      'platform_owner'),
    (v_super_admin_id,    'Alice Mwangi',   'alice@abccompany.co.ke',  'user'),
    (v_hr_admin_id,       'Brian Otieno',   'brian@abccompany.co.ke',  'user'),
    (v_organizer_id,      'Carol Njeri',    'carol@abccompany.co.ke',  'user'),
    (v_auditor_id,        'David Kamau',    'david@abccompany.co.ke',  'user')
ON CONFLICT (id) DO NOTHING;

-- --------------------------------
-- Organization
-- --------------------------------
INSERT INTO public.organizations (id, name, slug, branding, settings, created_by)
VALUES (
    uuid_generate_v4(),
    'ABC Company Ltd',
    'abc-company',
    '{"primary_color": "#1E3A5F", "secondary_color": "#F0A500", "footer_text": "ABC Company Ltd — Confidential"}'::JSONB,
    '{"require_otp": false, "require_photo": false, "require_gps": false, "allow_late_signin": true, "default_attendance_window_minutes": 120}'::JSONB,
    v_super_admin_id
)
RETURNING id INTO v_org_id;

-- --------------------------------
-- Departments
-- --------------------------------
INSERT INTO public.departments (id, organization_id, name, created_by)
VALUES
    (uuid_generate_v4(), v_org_id, 'Finance',    v_super_admin_id),
    (uuid_generate_v4(), v_org_id, 'ICT',        v_super_admin_id),
    (uuid_generate_v4(), v_org_id, 'HR',         v_super_admin_id),
    (uuid_generate_v4(), v_org_id, 'Operations', v_super_admin_id);

SELECT id INTO v_dept_finance_id FROM public.departments WHERE organization_id = v_org_id AND name = 'Finance';
SELECT id INTO v_dept_ict_id     FROM public.departments WHERE organization_id = v_org_id AND name = 'ICT';

-- --------------------------------
-- Organization Members
-- --------------------------------
INSERT INTO public.organization_members (organization_id, user_id, role, designation, joined_at) VALUES
    (v_org_id, v_super_admin_id, 'super_admin',        'Managing Director',      NOW()),
    (v_org_id, v_hr_admin_id,    'hr_admin',           'HR Manager',             NOW()),
    (v_org_id, v_organizer_id,   'meeting_organizer',  'Project Manager',        NOW()),
    (v_org_id, v_auditor_id,     'auditor',            'Compliance Officer',     NOW());

-- --------------------------------
-- Attendance Template (built-in)
-- --------------------------------
INSERT INTO public.attendance_templates (
    id, organization_id, name, description, template_type,
    placeholders, orientation, is_default, created_by
) VALUES (
    uuid_generate_v4(),
    v_org_id,
    'Standard Attendance Register',
    'Default template for all company meetings',
    'built_in',
    '[
        {"key": "meeting_title",   "label": "Meeting Title"},
        {"key": "meeting_date",    "label": "Meeting Date"},
        {"key": "meeting_time",    "label": "Time"},
        {"key": "location",        "label": "Location / Platform"},
        {"key": "attendance_table","label": "Attendance Table"},
        {"key": "prepared_by",     "label": "Prepared By"},
        {"key": "approved_by",     "label": "Approved By"}
    ]'::JSONB,
    'portrait',
    TRUE,
    v_super_admin_id
)
RETURNING id INTO v_template_id;

-- --------------------------------
-- Meeting
-- --------------------------------
INSERT INTO public.meetings (
    id, organization_id, department_id, template_id,
    title, description, agenda, meeting_type,
    location, scheduled_date, start_time, end_time,
    attendance_opens_at, attendance_closes_at,
    allow_late_signin, expected_attendees,
    status, public_link_enabled, created_by
) VALUES (
    uuid_generate_v4(),
    v_org_id,
    v_dept_finance_id,
    v_template_id,
    'Board of Directors Meeting',
    'Quarterly board review',
    '1. Opening\n2. Finance Report\n3. Strategy Review\n4. AOB',
    'physical',
    'Board Room, 3rd Floor',
    '2026-06-30',
    '10:00',
    '12:00',
    '2026-06-30 09:30:00+03',
    '2026-06-30 12:30:00+03',
    TRUE,
    12,
    'published',
    TRUE,
    v_organizer_id
)
RETURNING id INTO v_meeting_id;

-- QR Code for the meeting
INSERT INTO public.qr_codes (organization_id, meeting_id, expires_at)
VALUES (v_org_id, v_meeting_id, '2026-06-30 12:30:00+03');

-- Email invitations
INSERT INTO public.invitations (
    organization_id, meeting_id, invitation_type, invited_by,
    email, full_name, designation, status, sent_at
) VALUES
    (v_org_id, v_meeting_id, 'email', v_organizer_id, 'john@abccompany.co.ke',  'John Doe',   'CFO',              'sent', NOW()),
    (v_org_id, v_meeting_id, 'email', v_organizer_id, 'mary@abccompany.co.ke',  'Mary Wanja', 'CEO',              'sent', NOW()),
    (v_org_id, v_meeting_id, 'email', v_organizer_id, 'james@abccompany.co.ke', 'James Muli', 'Legal Counsel',    'sent', NOW());

-- --------------------------------
-- Training Event
-- --------------------------------
INSERT INTO public.training_events (
    id, organization_id, template_id,
    title, description, venue,
    start_date, end_date,
    attendance_frequency, status, created_by
) VALUES (
    uuid_generate_v4(),
    v_org_id,
    v_template_id,
    'Leadership Development Program',
    '5-day leadership training for senior staff',
    'Safari Park Hotel, Nairobi',
    '2026-07-07',
    '2026-07-11',
    'morning_and_afternoon',
    'published',
    v_hr_admin_id
)
RETURNING id INTO v_training_id;

-- Training Sessions — Day 1
INSERT INTO public.training_sessions (
    id, training_event_id, title, session_date,
    session_type, start_time, end_time,
    attendance_opens_at, attendance_closes_at, status
) VALUES
(
    uuid_generate_v4(), v_training_id, 'Day 1 — Morning Session',
    '2026-07-07', 'morning', '08:00', '12:00',
    '2026-07-07 07:30:00+03', '2026-07-07 12:30:00+03', 'pending'
),
(
    uuid_generate_v4(), v_training_id, 'Day 1 — Afternoon Session',
    '2026-07-07', 'afternoon', '13:00', '17:00',
    '2026-07-07 12:30:00+03', '2026-07-07 17:30:00+03', 'pending'
),
(
    uuid_generate_v4(), v_training_id, 'Day 2 — Morning Session',
    '2026-07-08', 'morning', '08:00', '12:00',
    '2026-07-08 07:30:00+03', '2026-07-08 12:30:00+03', 'pending'
),
(
    uuid_generate_v4(), v_training_id, 'Day 2 — Afternoon Session',
    '2026-07-08', 'afternoon', '13:00', '17:00',
    '2026-07-08 12:30:00+03', '2026-07-08 17:30:00+03', 'pending'
),
(
    uuid_generate_v4(), v_training_id, 'Day 3 — Morning Session',
    '2026-07-09', 'morning', '08:00', '12:00',
    '2026-07-09 07:30:00+03', '2026-07-09 12:30:00+03', 'pending'
),
(
    uuid_generate_v4(), v_training_id, 'Day 3 — Afternoon Session',
    '2026-07-09', 'afternoon', '13:00', '17:00',
    '2026-07-09 12:30:00+03', '2026-07-09 17:30:00+03', 'pending'
),
(
    uuid_generate_v4(), v_training_id, 'Day 4 — Morning Session',
    '2026-07-10', 'morning', '08:00', '12:00',
    '2026-07-10 07:30:00+03', '2026-07-10 12:30:00+03', 'pending'
),
(
    uuid_generate_v4(), v_training_id, 'Day 4 — Afternoon Session',
    '2026-07-10', 'afternoon', '13:00', '17:00',
    '2026-07-10 12:30:00+03', '2026-07-10 17:30:00+03', 'pending'
),
(
    uuid_generate_v4(), v_training_id, 'Day 5 — Morning Session',
    '2026-07-11', 'morning', '08:00', '12:00',
    '2026-07-11 07:30:00+03', '2026-07-11 12:30:00+03', 'pending'
),
(
    uuid_generate_v4(), v_training_id, 'Day 5 — Afternoon Session (Closing)',
    '2026-07-11', 'afternoon', '13:00', '16:00',
    '2026-07-11 12:30:00+03', '2026-07-11 16:30:00+03', 'pending'
);

-- Audit log — initial setup
INSERT INTO public.audit_logs (organization_id, user_id, action, entity_type, entity_id, metadata) VALUES
    (v_org_id, v_super_admin_id, 'org_created',        'organizations',  v_org_id,      '{"note": "Initial org setup"}'),
    (v_org_id, v_super_admin_id, 'template_created',   'templates',      v_template_id, '{"name": "Standard Attendance Register"}'),
    (v_org_id, v_organizer_id,   'meeting_created',    'meetings',       v_meeting_id,  '{"title": "Board of Directors Meeting"}'),
    (v_org_id, v_hr_admin_id,    'training_created',   'training_events',v_training_id, '{"title": "Leadership Development Program"}');

END $$;
