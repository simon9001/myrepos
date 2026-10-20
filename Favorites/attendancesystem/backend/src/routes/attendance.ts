// ─── Public attendance routes (no auth required) ─────────────────────────────
// These endpoints handle 10 000+ concurrent users signing simultaneously.
//
// Race-condition safety strategy:
//   - Duplicate protection relies on PostgreSQL unique partial indexes, NOT
//     application-level checks. Two simultaneous requests with the same email
//     will both pass the app-layer, but only one INSERT will succeed; the other
//     receives error code 23505 (unique_violation), which we map to HTTP 409.
//   - All DB writes use parameterized queries via the Supabase client; no
//     string interpolation → zero SQL injection surface.
//   - Invitation tokens are single-use (unique index on invitation_id).
//   - OTP attempts are incremented with an atomic UPDATE before the code is
//     checked, so race conditions on OTP exhaustion are handled at DB level.

import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { adminDb } from '../lib/supabase';
import { AppError, mapDbError } from '../lib/errors';
import { resolveQrCode } from '../lib/qrcode';
import { issueOtp, verifyOtp } from '../lib/otp';
import { uploadSignature, uploadPhoto } from '../lib/storage';
import { randomUUID } from 'crypto';

// ─── Validation schemas ───────────────────────────────────────────────────────

const submitSchema = z.object({
  // Token to identify the event. Exactly one must be provided.
  invitation_token: z.string().optional(),
  qr_code: z.string().optional(),
  public_link_token: z.string().optional(),

  // Participant details
  full_name: z.string().min(1).max(300).trim(),
  email: z.string().email().optional().nullable(),
  phone: z.string().min(5).max(30).optional().nullable(),
  designation: z.string().max(200).optional().nullable(),
  department_name: z.string().max(200).optional().nullable(),

  // Signature — required, base64 data URL (PNG or SVG)
  signature_data: z.string()
    .min(50)
    .regex(/^data:image\/(png|svg\+xml|jpeg|webp);base64,/, 'Invalid signature format'),
  signature_method: z.enum(['finger', 'mouse', 'stylus']).default('mouse'),

  // Optional captures
  photo_data: z.string()
    .regex(/^data:image\/(png|jpeg|webp);base64,/)
    .optional()
    .nullable(),
  gps_lat: z.number().min(-90).max(90).optional().nullable(),
  gps_lng: z.number().min(-180).max(180).optional().nullable(),

  // OTP verification code (if required by the meeting)
  otp_code: z.string().length(6).optional(),
});

const otpRequestSchema = z.object({
  invitation_token: z.string(),
  contact: z.string().email().or(z.string().min(5)),
  contact_type: z.enum(['email', 'phone']),
});

const otpVerifySchema = z.object({
  invitation_token: z.string(),
  code: z.string().length(6),
});

// ─── Rate limit: stricter on the public submission endpoint ──────────────────
// 10 submissions per IP per 60 seconds per worker.
// At 10 000 users + N workers this remains practical while deterring bots.
const attendanceRateLimit = { max: 10, timeWindow: '60 seconds' };

// ─── Plugin ───────────────────────────────────────────────────────────────────

export const attendanceRoutes: FastifyPluginAsync = async (fastify) => {

  // ── GET /attend/invite/:token  ─────────────────────────────────────────────
  // Returns event context so the frontend can pre-fill the form.
  fastify.get('/invite/:token', async (request, reply) => {
    const { token } = request.params as { token: string };

    const { data: invitation, error } = await adminDb
      .from('invitations')
      .select(`
        id, token, status, email, full_name, designation, department_name,
        meeting:meetings (
          id, title, scheduled_date, start_time, end_time,
          meeting_type, location, virtual_link, status,
          attendance_opens_at, attendance_closes_at,
          require_otp, require_photo, require_gps, allow_late_signin,
          organization:organizations (name, logo_url, branding)
        ),
        training_session:training_sessions (
          id, title, session_date, session_type, start_time,
          status, attendance_opens_at, attendance_closes_at,
          training_event:training_events (
            id, title, venue,
            organization:organizations (name, logo_url, branding)
          )
        )
      `)
      .eq('token', token)
      .single();

    if (error || !invitation) throw new AppError('Invitation not found or link is invalid.', 404);
    if (invitation.status === 'signed') {
      throw new AppError('You have already signed attendance using this link.', 409);
    }
    if (invitation.status === 'expired') {
      throw new AppError('This invitation has expired.', 410);
    }

    // Mark as opened (non-blocking — fire and forget)
    adminDb
      .from('invitations')
      .update({ status: 'opened', opened_at: new Date().toISOString() })
      .eq('id', invitation.id)
      .eq('status', 'sent')   // only transition from 'sent'
      .then(() => { /* no-op */ });

    return reply.send(invitation);
  });

  // ── GET /attend/qr/:code  ─────────────────────────────────────────────────
  // Resolves a QR code to its event context.
  fastify.get('/qr/:code', async (request, reply) => {
    const { code } = request.params as { code: string };
    const resolved = await resolveQrCode(code);

    if (resolved.type === 'meeting') {
      const { data, error } = await adminDb
        .from('meetings')
        .select(`
          id, title, scheduled_date, start_time, end_time, meeting_type,
          location, virtual_link, status, attendance_opens_at, attendance_closes_at,
          require_otp, require_photo, require_gps, allow_late_signin, expected_attendees,
          organization:organizations (name, logo_url, branding)
        `)
        .eq('id', resolved.id)
        .single();

      if (error || !data) throw new AppError('Meeting not found.', 404);
      assertAttendanceOpen(data);
      return reply.send({ type: 'meeting', qr_code: code, event: data });
    }

    // Training session
    const { data, error } = await adminDb
      .from('training_sessions')
      .select(`
        id, title, session_date, session_type, start_time, status,
        attendance_opens_at, attendance_closes_at,
        training_event:training_events (
          id, title, venue,
          organization:organizations (name, logo_url, branding)
        )
      `)
      .eq('id', resolved.id)
      .single();

    if (error || !data) throw new AppError('Session not found.', 404);
    assertSessionOpen(data);
    return reply.send({ type: 'session', qr_code: code, event: data });
  });

  // ── POST /attend/submit  ──────────────────────────────────────────────────
  // The hot path: 10 000 concurrent submissions must be safe and fast.
  fastify.post('/submit', {
    config: { rateLimit: attendanceRateLimit },
  }, async (request, reply) => {
    const ip = request.ip;
    const userAgent = request.headers['user-agent'] ?? '';
    const body = submitSchema.parse(request.body);

    // ── 1. Exactly one token must be present ─────────────────────────────────
    const tokenCount = [body.invitation_token, body.qr_code, body.public_link_token]
      .filter(Boolean).length;
    if (tokenCount !== 1) {
      throw new AppError('Provide exactly one of: invitation_token, qr_code, or public_link_token.', 400);
    }

    // ── 2. Resolve to meeting or session, and get org/settings ───────────────
    let meetingId: string | null = null;
    let sessionId: string | null = null;
    let orgId!: string;
    let invitationId: string | null = null;
    let qrCodeId: string | null = null;
    let requireOtp = false;
    let requirePhoto = false;
    let requireGps = false;
    let allowLate = false;
    let opensAt: string | null = null;
    let closesAt: string | null = null;

    if (body.invitation_token) {
      const { data: inv, error: invErr } = await adminDb
        .from('invitations')
        .select(`
          id, status,
          meeting:meetings (
            id, organization_id, status, attendance_opens_at, attendance_closes_at,
            require_otp, require_photo, require_gps, allow_late_signin
          ),
          training_session:training_sessions (
            id, status, attendance_opens_at, attendance_closes_at,
            training_event:training_events (organization_id)
          )
        `)
        .eq('token', body.invitation_token)
        .single();

      if (invErr || !inv) throw new AppError('Invalid invitation link.', 404);
      if (inv.status === 'signed')   throw new AppError('You have already signed.', 409);
      if (inv.status === 'expired')  throw new AppError('This invitation has expired.', 410);

      invitationId = inv.id;

      if (inv.meeting) {
        const m = inv.meeting as unknown as Record<string, unknown>;
        meetingId = m.id as string;
        orgId     = m.organization_id as string;
        opensAt   = m.attendance_opens_at as string | null;
        closesAt  = m.attendance_closes_at as string | null;
        requireOtp   = Boolean(m.require_otp);
        requirePhoto = Boolean(m.require_photo);
        requireGps   = Boolean(m.require_gps);
        allowLate    = Boolean(m.allow_late_signin);
        assertStatusOpen(m.status as string, 'Meeting');
      } else if (inv.training_session) {
        const s = inv.training_session as unknown as Record<string, unknown>;
        const te = s.training_event as Record<string, unknown>;
        sessionId = s.id as string;
        orgId     = te.organization_id as string;
        opensAt   = s.attendance_opens_at as string | null;
        closesAt  = s.attendance_closes_at as string | null;
        assertStatusOpen(s.status as string, 'Session');
      }

    } else if (body.qr_code) {
      const resolved = await resolveQrCode(body.qr_code);
      orgId = resolved.organizationId;

      const qrRes = await adminDb
        .from('qr_codes')
        .select('id')
        .eq('code', body.qr_code)
        .single();
      qrCodeId = qrRes.data?.id ?? null;

      if (resolved.type === 'meeting') {
        meetingId = resolved.id;
        const { data: m } = await adminDb
          .from('meetings')
          .select('status, attendance_opens_at, attendance_closes_at, require_otp, require_photo, require_gps, allow_late_signin')
          .eq('id', meetingId)
          .single();
        if (!m) throw new AppError('Meeting not found.', 404);
        assertStatusOpen(m.status, 'Meeting');
        opensAt = m.attendance_opens_at; closesAt = m.attendance_closes_at;
        requireOtp = m.require_otp; requirePhoto = m.require_photo;
        requireGps = m.require_gps; allowLate = m.allow_late_signin;
      } else {
        sessionId = resolved.id;
        const { data: s } = await adminDb
          .from('training_sessions')
          .select('status, attendance_opens_at, attendance_closes_at')
          .eq('id', sessionId)
          .single();
        if (!s) throw new AppError('Session not found.', 404);
        assertStatusOpen(s.status, 'Session');
        opensAt = s.attendance_opens_at; closesAt = s.attendance_closes_at;
      }

    } else if (body.public_link_token) {
      const { data: m } = await adminDb
        .from('meetings')
        .select('id, organization_id, status, attendance_opens_at, attendance_closes_at, require_otp, require_photo, require_gps, allow_late_signin, public_link_enabled')
        .eq('public_link_token', body.public_link_token)
        .single();

      if (!m) throw new AppError('Link not found.', 404);
      if (!m.public_link_enabled) throw new AppError('Public link is not enabled for this meeting.', 403);
      assertStatusOpen(m.status, 'Meeting');

      meetingId    = m.id;
      orgId        = m.organization_id;
      opensAt      = m.attendance_opens_at;
      closesAt     = m.attendance_closes_at;
      requireOtp   = m.require_otp;
      requirePhoto = m.require_photo;
      requireGps   = m.require_gps;
      allowLate    = m.allow_late_signin;
    }

    // ── 3. Attendance window check ────────────────────────────────────────────
    const now = new Date();
    if (opensAt && new Date(opensAt) > now) {
      throw new AppError('Attendance is not open yet.', 400);
    }
    if (closesAt && new Date(closesAt) < now && !allowLate) {
      throw new AppError('Attendance has closed.', 400);
    }
    const isLate = Boolean(closesAt && new Date(closesAt) < now);

    // ── 4. Validate required captures ─────────────────────────────────────────
    if (requirePhoto && !body.photo_data) {
      throw new AppError('A photo is required for this event.', 400);
    }
    if (requireGps && (body.gps_lat == null || body.gps_lng == null)) {
      throw new AppError('GPS location is required for this event.', 400);
    }

    // ── 5. OTP verification ───────────────────────────────────────────────────
    if (requireOtp && invitationId) {
      if (!body.otp_code) {
        throw new AppError('An OTP verification code is required.', 400);
      }
      const otpValid = await verifyOtp(invitationId, body.otp_code);
      if (!otpValid) {
        throw new AppError('Invalid verification code.', 400);
      }
    }

    // ── 6. Upload signature ────────────────────────────────────────────────────
    const recordId = randomUUID();
    const eventId = (meetingId ?? sessionId)!;

    const signatureUrl = await uploadSignature({
      orgId,
      eventId,
      recordId,
      dataUrl: body.signature_data,
    });

    let photoUrl: string | null = null;
    if (body.photo_data) {
      photoUrl = await uploadPhoto({ orgId, eventId, recordId, dataUrl: body.photo_data });
    }

    // ── 7. Insert attendance record ────────────────────────────────────────────
    // Uses INSERT … not ON CONFLICT — the unique indexes handle duplicates.
    // PostgreSQL serializes conflicting inserts; the loser gets error 23505.
    const { data: record, error: insertErr } = await adminDb
      .from('attendance_records')
      .insert({
        id:                  recordId,
        organization_id:     orgId,
        meeting_id:          meetingId,
        training_session_id: sessionId,
        invitation_id:       invitationId,
        qr_code_id:          qrCodeId,
        full_name:           body.full_name,
        email:               body.email ?? null,
        phone:               body.phone ?? null,
        designation:         body.designation ?? null,
        department_name:     body.department_name ?? null,
        signature_url:       signatureUrl,
        signature_method:    body.signature_method,
        photo_url:           photoUrl,
        gps_lat:             body.gps_lat ?? null,
        gps_lng:             body.gps_lng ?? null,
        device_info: {
          user_agent:  userAgent,
          ip_address:  ip,
        },
        ip_address:    ip,
        is_late:       isLate,
        otp_verified:  requireOtp,
        signed_at:     now.toISOString(),
      })
      .select('id, full_name, signed_at')
      .single();

    if (insertErr) {
      if (insertErr.code === '23505') {
        throw new AppError('You have already signed attendance for this event.', 409);
      }
      throw mapDbError(insertErr);
    }

    // ── 8. Mark invitation as signed (non-blocking) ───────────────────────────
    if (invitationId) {
      adminDb
        .from('invitations')
        .update({ status: 'signed' })
        .eq('id', invitationId)
        .then(() => { /* no-op */ });
    }

    // ── 9. Audit log (non-blocking) ───────────────────────────────────────────
    adminDb.from('audit_logs').insert({
      organization_id: orgId,
      action: 'participant_signed',
      entity_type: meetingId ? 'meetings' : 'training_sessions',
      entity_id: (meetingId ?? sessionId)!,
      metadata: { record_id: recordId, name: body.full_name },
      ip_address: ip,
      user_agent: userAgent,
    }).then(() => { /* no-op */ });

    return reply.status(201).send({
      message: 'Attendance signed successfully.',
      record_id: record.id,
      name: record.full_name,
      signed_at: record.signed_at,
    });
  });

  // ── POST /attend/otp/request  ─────────────────────────────────────────────
  fastify.post('/otp/request', {
    config: { rateLimit: { max: 3, timeWindow: '5 minutes' } },
  }, async (request, reply) => {
    const body = otpRequestSchema.parse(request.body);

    const { data: invitation } = await adminDb
      .from('invitations')
      .select('id, status')
      .eq('token', body.invitation_token)
      .single();

    if (!invitation) throw new AppError('Invalid invitation.', 404);
    if (invitation.status === 'signed') throw new AppError('Already signed.', 409);

    await issueOtp(invitation.id, body.contact, body.contact_type);

    return reply.send({ message: 'Verification code sent.' });
  });

  // ── POST /attend/otp/verify  ──────────────────────────────────────────────
  fastify.post('/otp/verify', {
    config: { rateLimit: { max: 10, timeWindow: '5 minutes' } },
  }, async (request, reply) => {
    const body = otpVerifySchema.parse(request.body);

    const { data: invitation } = await adminDb
      .from('invitations')
      .select('id')
      .eq('token', body.invitation_token)
      .single();

    if (!invitation) throw new AppError('Invalid invitation.', 404);

    const valid = await verifyOtp(invitation.id, body.code);
    if (!valid) throw new AppError('Invalid verification code.', 400);

    return reply.send({ message: 'Verification successful.', verified: true });
  });
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function assertStatusOpen(status: string, label: string): void {
  if (status === 'open') return;
  if (status === 'draft' || status === 'published' || status === 'pending') {
    throw new AppError(`${label} attendance is not open yet.`, 400);
  }
  if (status === 'closed') {
    throw new AppError(`${label} attendance is closed.`, 400);
  }
  if (status === 'archived' || status === 'completed') {
    throw new AppError(`${label} has ended.`, 410);
  }
  throw new AppError(`${label} is not accepting attendance (status: ${status}).`, 400);
}

function assertAttendanceOpen(event: Record<string, unknown>): void {
  assertStatusOpen(event.status as string, 'Meeting');
}

function assertSessionOpen(event: Record<string, unknown>): void {
  assertStatusOpen(event.status as string, 'Session');
}
