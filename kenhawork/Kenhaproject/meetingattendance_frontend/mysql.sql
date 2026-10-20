-- =====================================================================
-- KeNHA Meeting & Training Attendance Management System (KMTAMS)
-- Supabase / PostgreSQL Schema
-- =====================================================================
-- Notes for Supabase:
--   * Supabase already provides `auth.users` for authentication.
--   * `profiles` extends auth.users with app-specific fields (role,
--     department, must_change_password, etc.) and is the FK target
--     for everything else instead of a separate custom users table.
--   * UUIDs are used throughout to match Supabase auth.uid().
-- =====================================================================

create extension if not exists "pgcrypto"; -- for gen_random_uuid()

-- =====================================================================
-- 1. DEPARTMENTS
-- =====================================================================
create table departments (
    department_id   uuid primary key default gen_random_uuid(),
    department_code varchar(20) not null unique,   -- e.g. 'ICT', 'HR', 'ENG-01'
    name             varchar(150) not null unique,
    description      text,
    created_at       timestamptz not null default now(),
    updated_at       timestamptz not null default now()
);

create index idx_departments_name on departments (name);
create index idx_departments_code on departments (department_code);

-- =====================================================================
-- 2. ROLES (app roles, not Supabase auth roles)
-- =====================================================================
create type app_role as enum ('ict_admin', 'hr_officer', 'Staff');

-- =====================================================================
-- 3. PROFILES (extends auth.users — one row per KeNHA employee account)
-- =====================================================================
create table profiles (
    id                     uuid primary key references auth.users (id) on delete cascade,
    full_name              varchar(150) not null,
    email                  varchar(150) not null unique,      -- official KeNHA email
    role                   app_role not null default 'Staff',
    department_id          uuid references departments (department_id),
    is_active              boolean not null default true,
    must_change_password   boolean not null default true,      -- forces reset on first login
    last_login             timestamptz,
    created_at             timestamptz not null default now(),
    updated_at             timestamptz not null default now()
);

create index idx_profiles_role on profiles (role);
create index idx_profiles_department on profiles (department_id);
create index idx_profiles_is_active on profiles (is_active);

-- =====================================================================
-- 4. MEETINGS / TRAININGS
--    (created_by = the KeNHA employee/"meeting creator" who set it up)
-- =====================================================================
create type meeting_type as enum ('physical', 'virtual', 'hybrid');
create type attendance_status as enum ('not_started', 'open', 'closed');

create table meetings (
    meeting_id               uuid primary key default gen_random_uuid(),
    title                    varchar(200) not null,
    description              text,
    meeting_type             meeting_type not null,
    venue                    varchar(255),
    virtual_link             varchar(500),
    meeting_date             date not null,
    start_time               time not null,
    end_time                 time not null,
    attendance_open_time     timestamptz not null,
    attendance_close_time    timestamptz not null,
    department_id            uuid references departments (department_id),
    created_by               uuid not null references profiles (id),
    meeting_pin              varchar(10) not null,
    qr_code_url              varchar(500),
    attendance_url           varchar(500),
    attendance_status        attendance_status not null default 'not_started',
    created_at               timestamptz not null default now(),
    updated_at               timestamptz not null default now(),

    constraint uq_meeting_pin_per_date unique (meeting_pin, meeting_date)
);

create index idx_meetings_date on meetings (meeting_date);
create index idx_meetings_created_by on meetings (created_by);
create index idx_meetings_department on meetings (department_id);
create index idx_meetings_status on meetings (attendance_status);
create index idx_meetings_title on meetings using gin (to_tsvector('english', title)); -- search by title

-- =====================================================================
-- 5. ATTENDANCE - ORGANIZATION STAFF
-- =====================================================================
create table attendance_staff (
    attendance_id     uuid primary key default gen_random_uuid(),
    meeting_id        uuid not null references meetings (meeting_id) on delete cascade,
    full_name         varchar(150) not null,
    designation       varchar(150) not null,
    department_id     uuid references departments (department_id),
    signature_data    text not null,             -- base64 / SVG digital signature
    submitted_at      timestamptz not null default now(),
    ip_address        inet,

    -- prevents duplicate attendance submissions per meeting
    constraint uq_staff_per_meeting unique (meeting_id, full_name, department_id)
);

create index idx_attendance_staff_meeting on attendance_staff (meeting_id);
create index idx_attendance_staff_name on attendance_staff (full_name);

-- =====================================================================
-- 6. ATTENDANCE - VISITORS / EXTERNAL PARTICIPANTS
-- =====================================================================
create type visitor_purpose as enum (
    'guest', 'consultant', 'contractor', 'partner', 'trainer', 'auditor', 'other'
);

create table attendance_visitor (
    attendance_id     uuid primary key default gen_random_uuid(),
    meeting_id        uuid not null references meetings (meeting_id) on delete cascade,
    full_name         varchar(150) not null,
    organization       varchar(200) not null,
    position_title     varchar(150),
    purpose            visitor_purpose not null,
    signature_data     text not null,
    submitted_at       timestamptz not null default now(),
    ip_address         inet
);

create index idx_attendance_visitor_meeting on attendance_visitor (meeting_id);
create index idx_attendance_visitor_name on attendance_visitor (full_name);

-- =====================================================================
-- 7. REPORTS
-- =====================================================================
create type report_status as enum ('draft', 'submitted_to_hr', 'archived');

create table reports (
    report_id                uuid primary key default gen_random_uuid(),
    meeting_id               uuid not null references meetings (meeting_id) on delete cascade,
    generated_by             uuid not null references profiles (id),
    generated_at             timestamptz not null default now(),
    total_staff              int not null default 0,
    total_visitors           int not null default 0,
    total_attendance         int not null default 0,
    attendance_percentage    numeric(5,2),
    status                   report_status not null default 'draft',
    submitted_at             timestamptz,
    file_path                varchar(500),   -- generated PDF/doc location in Supabase Storage

    constraint uq_report_per_meeting unique (meeting_id)
);

create index idx_reports_status on reports (status);
create index idx_reports_meeting on reports (meeting_id);
create index idx_reports_generated_by on reports (generated_by);

-- =====================================================================
-- 8. NOTIFICATIONS
-- =====================================================================
create type notification_type as enum (
    'attendance_opened',
    'attendance_closed',
    'report_generated',
    'report_submitted',
    'report_received_by_hr',
    'training_completed',
    'awaiting_review'
);

create table notifications (
    notification_id      uuid primary key default gen_random_uuid(),
    user_id               uuid not null references profiles (id) on delete cascade,
    related_meeting_id    uuid references meetings (meeting_id) on delete set null,
    related_report_id     uuid references reports (report_id) on delete set null,
    message               varchar(500) not null,
    notification_type     notification_type not null,
    is_read               boolean not null default false,
    created_at            timestamptz not null default now()
);

create index idx_notifications_user_unread on notifications (user_id, is_read);
create index idx_notifications_meeting on notifications (related_meeting_id);

-- =====================================================================
-- 9. AUDIT LOG
-- =====================================================================
create type audit_action as enum (
    'login',
    'logout',
    'password_change',
    'meeting_created',
    'meeting_updated',
    'attendance_opened',
    'attendance_closed',
    'attendance_submitted',
    'report_generated',
    'report_submitted_to_hr',
    'user_created',
    'user_disabled',
    'user_password_reset',
    'other'
);

create table audit_logs (
    log_id        bigint generated always as identity primary key,
    user_id       uuid references profiles (id) on delete set null,
    action        audit_action not null,
    details       text,
    ip_address    inet,
    created_at    timestamptz not null default now()
);

create index idx_audit_user on audit_logs (user_id);
create index idx_audit_action on audit_logs (action);
create index idx_audit_created_at on audit_logs (created_at);

-- =====================================================================
-- VIEW: Live Attendance Dashboard / Report Summary
-- =====================================================================
create or replace view vw_meeting_attendance_summary as
select
    m.meeting_id,
    m.title,
    m.attendance_status,
    coalesce(s.staff_count, 0)                                  as total_staff,
    coalesce(v.visitor_count, 0)                                as total_visitors,
    coalesce(s.staff_count, 0) + coalesce(v.visitor_count, 0)   as total_attendance
from meetings m
left join (
    select meeting_id, count(*) as staff_count
    from attendance_staff
    group by meeting_id
) s on s.meeting_id = m.meeting_id
left join (
    select meeting_id, count(*) as visitor_count
    from attendance_visitor
    group by meeting_id
) v on v.meeting_id = m.meeting_id;

-- =====================================================================
-- ROW LEVEL SECURITY (Supabase requires RLS to be explicitly enabled)
-- =====================================================================
alter table departments enable row level security;
alter table profiles enable row level security;
alter table meetings enable row level security;
alter table attendance_staff enable row level security;
alter table attendance_visitor enable row level security;
alter table reports enable row level security;
alter table notifications enable row level security;
alter table audit_logs enable row level security;

-- Baseline policies (tighten per your auth flow / roles as needed):

-- Any authenticated KeNHA staff can read departments
create policy "departments_read_authenticated"
    on departments for select
    to authenticated
    using (true);

-- Users can read their own profile; ICT admins can read all
create policy "profiles_read_own_or_admin"
    on profiles for select
    to authenticated
    using (
        id = auth.uid()
        or exists (
            select 1 from profiles p
            where p.id = auth.uid() and p.role = 'ict_admin'
        )
    );

-- Meeting creators manage their own meetings; HR/ICT admin can read all
create policy "meetings_read_all_authenticated"
    on meetings for select
    to authenticated
    using (true);

create policy "meetings_insert_own"
    on meetings for insert
    to authenticated
    with check (created_by = auth.uid());

create policy "meetings_update_own_or_admin"
    on meetings for update
    to authenticated
    using (
        created_by = auth.uid()
        or exists (
            select 1 from profiles p
            where p.id = auth.uid() and p.role = 'ict_admin'
        )
    );

-- Attendance submission is public (no login) — handled via a
-- restricted anon-safe RPC/edge function that validates the PIN and
-- attendance window server-side, rather than direct table inserts.
create policy "attendance_staff_read_authenticated"
    on attendance_staff for select
    to authenticated
    using (true);

create policy "attendance_visitor_read_authenticated"
    on attendance_visitor for select
    to authenticated
    using (true);

-- Reports visible to the creator, HR officers, and ICT admins
create policy "reports_read_creator_hr_admin"
    on reports for select
    to authenticated
    using (
        generated_by = auth.uid()
        or exists (
            select 1 from profiles p
            where p.id = auth.uid() and p.role in ('hr_officer', 'ict_admin')
        )
    );

-- Notifications only visible to their owner
create policy "notifications_read_own"
    on notifications for select
    to authenticated
    using (user_id = auth.uid());

-- Audit logs readable by ICT admins only
create policy "audit_logs_read_admin_only"
    on audit_logs for select
    to authenticated
    using (
        exists (
            select 1 from profiles p
            where p.id = auth.uid() and p.role = 'ict_admin'
        )
    );

-- =====================================================================
-- NOTES
-- =====================================================================
-- * departments.department_code is a short, unique, human-readable
--   code (e.g. 'ICT', 'HR', 'ENG-01') for use in dropdowns, search,
--   and report headers, separate from the full department name.
-- * "Meeting Organizer" from the requirements doc is modeled as the
--   `meeting_creator` role, and meetings.created_by (not organizer_id)
--   tracks who set up each meeting/training.
-- * meeting_pin is unique per meeting_date to avoid collisions between
--   concurrently active meetings while still allowing PIN reuse on
--   different days.
-- * Duplicate staff submissions are blocked via uq_staff_per_meeting.
-- * PIN validation and attendance-window enforcement (open/close time)
--   should happen in a Supabase Edge Function / RPC that public
--   participants call — do not expose direct table inserts to anon
--   users for attendance_staff / attendance_visitor.
-- * Passwords are managed entirely by Supabase Auth (auth.users);
--   no password_hash column is needed in profiles.\











do $$
declare
    new_user_id uuid := gen_random_uuid();
begin
    insert into auth.users (
        id, instance_id, email, encrypted_password,
        email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
        aud, role, created_at, updated_at
    )
    values (
        new_user_id,
        'admin2@kenha.co.ke',
        crypt('Admin@2056', gen_salt('bf')),   -- set a real password
        now(),
        '{"provider":"email","providers":["email"]}',
        '{}',
        'authenticated',
        'authenticated',
        now(),
        now()
    );

    insert into profiles (id, full_name, email, role, department_id, must_change_password)
    values (
        new_user_id,
        'ICT Administrator',
        'admin1@kenha.co.ke',
        'ict_admin',
        (select department_id from departments where department_code = 'ICT'),
        true
    );
end $$;





update auth.users
set
    confirmation_token = '',
    email_change = '',
    email_change_token_new = '',
    email_change_token_current = '',
    recovery_token = ''
where email = 'admin@kenha.co.ke';