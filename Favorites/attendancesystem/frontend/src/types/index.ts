// ── Enums ─────────────────────────────────────────────────────────────────────

export type PlatformRole    = 'platform_owner' | 'user';
export type OrgMemberRole   =
  | 'super_admin'
  | 'hr_admin'
  | 'department_admin'
  | 'meeting_organizer'
  | 'training_coordinator'
  | 'auditor'
  | 'participant';
export type MeetingType     = 'physical' | 'virtual' | 'hybrid';
export type MeetingStatus   = 'draft' | 'published' | 'open' | 'closed' | 'archived';
export type SessionStatus   = 'pending' | 'open' | 'closed';
export type TrainingStatus  = 'draft' | 'published' | 'active' | 'completed' | 'archived';
export type SignatureMethod = 'finger' | 'mouse' | 'stylus';

// ── Users ─────────────────────────────────────────────────────────────────────

export interface User {
  id:             string;
  email:          string;
  full_name:      string;
  phone:          string | null;
  avatar_url:     string | null;
  platform_role:  PlatformRole;
  email_verified: boolean;
  created_at:     string;
}

export interface OrgMembership {
  id:           string;
  role:         OrgMemberRole;
  designation:  string | null;
  organization: Pick<Organization, 'id' | 'name' | 'logo_url'>;
}

export type UserWithMemberships = User & { memberships?: OrgMembership[] };

// ── Organizations ─────────────────────────────────────────────────────────────

export interface Organization {
  id:                string;
  name:              string;
  slug:              string;
  logo_url:          string | null;
  is_active:         boolean;
  industry:          string | null;
  country:           string | null;
  company_email:     string | null;
  company_phone:     string | null;
  address:           string | null;
  website:           string | null;
  subscription_plan: 'free_trial' | 'basic' | 'professional' | 'enterprise';
  created_by:        string | null;
  created_at:        string;
  updated_at:        string;
}

export interface Department {
  id:                   string;
  organization_id:      string;
  name:                 string;
  description:          string | null;
  parent_department_id: string | null;
  created_at:           string;
}

export interface OrgMember {
  id:              string;
  organization_id: string;
  user_id:         string;
  role:            OrgMemberRole;
  designation:     string | null;
  employee_id:     string | null;
  is_active:       boolean;
  profile?:        Pick<User, 'id' | 'email' | 'full_name' | 'avatar_url'>;
  created_at:      string;
}

// ── Meetings ──────────────────────────────────────────────────────────────────

export interface Meeting {
  id:                  string;
  organization_id:     string;
  title:               string;
  description:         string | null;
  meeting_type:        MeetingType;
  location:            string | null;
  virtual_link:        string | null;
  /** Full ISO-8601 datetime: backend merges scheduled_date + start_time */
  scheduled_at:        string;
  status:              MeetingStatus;
  expected_attendees:  number | null;
  created_at:          string;
  updated_at:          string;
}

// ── Attendance ────────────────────────────────────────────────────────────────

export interface AttendanceRecord {
  id:              string;
  meeting_id:      string | null;
  attendee_name:   string;
  email:           string | null;
  phone:           string | null;
  department_name: string | null;
  designation:     string | null;
  signature_url:   string | null;
  photo_url:       string | null;
  signed_at:       string | null;
}

// ── Training ──────────────────────────────────────────────────────────────────

export interface TrainingEvent {
  id:              string;
  organization_id: string;
  title:           string;
  description:     string | null;
  venue:           string | null;
  start_date:      string;
  end_date:        string;
  status:          TrainingStatus;
  created_at:      string;
}

export interface TrainingSession {
  id:                   string;
  training_event_id:    string;
  title:                string;
  session_date:         string;
  start_time:           string;
  end_time:             string | null;
  status:               SessionStatus;
  created_at:           string;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export interface DashboardStats {
  total_meetings:      number;
  total_members:       number;
  total_attendance:    number;
  avg_attendance_rate: number | null;
}

// ── API responses ─────────────────────────────────────────────────────────────

export interface ApiError {
  error:    string;
  code?:    string;
  details?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data:  T[];
  total: number;
  page:  number;
  limit: number;
}
