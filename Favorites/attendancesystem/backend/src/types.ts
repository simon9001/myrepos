// ─── Shared enums matching schema.sql ────────────────────────────────────────

export type PlatformRole = 'platform_owner' | 'user';

export type OrgMemberRole =
  | 'super_admin'
  | 'hr_admin'
  | 'department_admin'
  | 'meeting_organizer'
  | 'training_coordinator'
  | 'auditor'
  | 'participant';

export type MeetingType = 'physical' | 'virtual' | 'hybrid';
export type VirtualPlatform = 'zoom' | 'teams' | 'google_meet' | 'other';
export type MeetingStatus = 'draft' | 'published' | 'open' | 'closed' | 'archived';
export type TrainingStatus = 'draft' | 'published' | 'active' | 'completed' | 'archived';
export type SessionType = 'morning' | 'afternoon' | 'full_day' | 'custom';
export type SessionStatus = 'pending' | 'open' | 'closed';
export type AttendanceFrequency =
  | 'per_session'
  | 'once_per_day'
  | 'morning_and_afternoon'
  | 'every_lecture'
  | 'custom';
export type InvitationType = 'public_link' | 'email' | 'bulk_upload' | 'internal_directory';
export type InvitationStatus = 'pending' | 'sent' | 'opened' | 'signed' | 'expired';
export type TemplateType = 'word_upload' | 'built_in';
export type SignatureMethod = 'finger' | 'mouse' | 'stylus';
export type DocumentFormat = 'word' | 'pdf';
export type ReminderChannel = 'email' | 'sms' | 'whatsapp' | 'push';
export type ReminderStatus = 'pending' | 'sent' | 'failed';

// ─── Database row shapes ──────────────────────────────────────────────────────

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  platform_role: PlatformRole;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  branding: Record<string, unknown>;
  settings: OrgSettings;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrgSettings {
  require_otp?: boolean;
  require_photo?: boolean;
  require_gps?: boolean;
  allow_late_signin?: boolean;
  default_attendance_window_minutes?: number;
}

export interface Department {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  parent_department_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrgMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrgMemberRole;
  department_id: string | null;
  designation: string | null;
  employee_id: string | null;
  is_active: boolean;
  invited_by: string | null;
  joined_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AttendanceTemplate {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  template_type: TemplateType;
  file_url: string | null;
  thumbnail_url: string | null;
  config: Record<string, unknown>;
  placeholders: TemplatePlaceholder[];
  orientation: 'portrait' | 'landscape';
  is_default: boolean;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface TemplatePlaceholder {
  key: string;
  label: string;
}

export interface Meeting {
  id: string;
  organization_id: string;
  department_id: string | null;
  template_id: string | null;
  title: string;
  description: string | null;
  agenda: string | null;
  meeting_type: MeetingType;
  location: string | null;
  virtual_link: string | null;
  virtual_platform: VirtualPlatform | null;
  scheduled_date: string;
  start_time: string;
  end_time: string | null;
  attendance_opens_at: string | null;
  attendance_closes_at: string | null;
  allow_late_signin: boolean;
  max_participants: number | null;
  expected_attendees: number | null;
  registration_deadline: string | null;
  status: MeetingStatus;
  public_link_enabled: boolean;
  public_link_token: string | null;
  require_otp: boolean;
  require_photo: boolean;
  require_gps: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TrainingEvent {
  id: string;
  organization_id: string;
  department_id: string | null;
  template_id: string | null;
  title: string;
  description: string | null;
  venue: string | null;
  start_date: string;
  end_date: string;
  attendance_frequency: AttendanceFrequency;
  frequency_config: unknown[];
  status: TrainingStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TrainingSession {
  id: string;
  training_event_id: string;
  title: string;
  session_date: string;
  session_type: SessionType;
  start_time: string;
  end_time: string | null;
  attendance_opens_at: string | null;
  attendance_closes_at: string | null;
  status: SessionStatus;
  public_link_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface QrCode {
  id: string;
  organization_id: string;
  meeting_id: string | null;
  training_session_id: string | null;
  code: string;
  qr_image_url: string | null;
  is_active: boolean;
  scan_count: number;
  expires_at: string | null;
  created_at: string;
}

export interface Invitation {
  id: string;
  organization_id: string;
  meeting_id: string | null;
  training_event_id: string | null;
  training_session_id: string | null;
  invitation_type: InvitationType;
  invited_by: string | null;
  token: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  designation: string | null;
  department_name: string | null;
  user_id: string | null;
  status: InvitationStatus;
  expires_at: string | null;
  sent_at: string | null;
  opened_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: string;
  organization_id: string;
  meeting_id: string | null;
  training_session_id: string | null;
  invitation_id: string | null;
  qr_code_id: string | null;
  user_id: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  designation: string | null;
  department_name: string | null;
  signature_url: string;
  signature_method: SignatureMethod;
  photo_url: string | null;
  gps_lat: number | null;
  gps_lng: number | null;
  device_info: Record<string, unknown>;
  ip_address: string | null;
  is_late: boolean;
  otp_verified: boolean;
  signed_at: string;
  created_at: string;
}

// ─── Request context ──────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  platform_role: PlatformRole;
}

export interface RequestOrgMember extends OrgMember {
  organization: Organization;
}

// ─── Fastify augmentations ────────────────────────────────────────────────────

declare module 'fastify' {
  interface FastifyRequest {
    authUser: AuthUser;
    orgMember: RequestOrgMember;
  }
}
