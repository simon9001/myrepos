import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { adminDb } from '../lib/supabase';
import { AppError, mapDbError } from '../lib/errors';
import { requireRole } from '../hooks/requireRole';
import { createMeetingQr } from '../lib/qrcode';

const meetingSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(2000).optional(),
  agenda: z.string().max(5000).optional(),
  meeting_type: z.enum(['physical', 'virtual', 'hybrid']),
  location: z.string().max(500).optional().nullable(),
  virtual_link: z.string().url().optional().nullable(),
  virtual_platform: z.enum(['zoom', 'teams', 'google_meet', 'other']).optional().nullable(),
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  attendance_opens_at: z.string().datetime({ offset: true }).optional().nullable(),
  attendance_closes_at: z.string().datetime({ offset: true }).optional().nullable(),
  allow_late_signin: z.boolean().default(false),
  max_participants: z.number().int().positive().optional().nullable(),
  expected_attendees: z.number().int().positive().optional().nullable(),
  registration_deadline: z.string().datetime({ offset: true }).optional().nullable(),
  department_id: z.string().uuid().optional().nullable(),
  template_id: z.string().uuid().optional().nullable(),
  public_link_enabled: z.boolean().default(false),
  require_otp: z.boolean().default(false),
  require_photo: z.boolean().default(false),
  require_gps: z.boolean().default(false),
});

const canManage = ['super_admin', 'hr_admin', 'department_admin', 'meeting_organizer'] as const;

export const meetingRoutes: FastifyPluginAsync = async (fastify) => {
  // List meetings
  fastify.get('/', {
    preHandler: [fastify.authenticate, requireRole([...canManage, 'training_coordinator', 'auditor', 'participant'])],
  }, async (request, reply) => {
    const { orgId } = request.params as { orgId: string };
    const { status, date_from, date_to, dept, limit = '50', offset = '0' } =
      request.query as Record<string, string>;

    let query = adminDb
      .from('meetings')
      .select(`
        id, title, meeting_type, scheduled_date, start_time, status,
        department:departments (id, name),
        created_by_profile:profiles!meetings_created_by_fkey (id, full_name)
      `, { count: 'exact' })
      .eq('organization_id', orgId)
      .order('scheduled_date', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (status) query = query.eq('status', status);
    if (date_from) query = query.gte('scheduled_date', date_from);
    if (date_to) query = query.lte('scheduled_date', date_to);
    if (dept) query = query.eq('department_id', dept);

    const { data, error, count } = await query;
    if (error) throw mapDbError(error);
    return reply.send({ data, total: count });
  });

  // Create meeting
  fastify.post('/', {
    preHandler: [fastify.authenticate, requireRole([...canManage])],
  }, async (request, reply) => {
    const { orgId } = request.params as { orgId: string };
    const body = meetingSchema.parse(request.body);

    const { data, error } = await adminDb
      .from('meetings')
      .insert({ ...body, organization_id: orgId, created_by: request.authUser.id })
      .select('*')
      .single();

    if (error) throw mapDbError(error);

    await adminDb.from('audit_logs').insert({
      organization_id: orgId,
      user_id: request.authUser.id,
      action: 'meeting_created',
      entity_type: 'meetings',
      entity_id: data.id,
      metadata: { title: body.title },
    });

    return reply.status(201).send(data);
  });

  // Get meeting details
  fastify.get('/:meetingId', {
    preHandler: [fastify.authenticate, requireRole([...canManage, 'training_coordinator', 'auditor', 'participant'])],
  }, async (request, reply) => {
    const { orgId, meetingId } = request.params as { orgId: string; meetingId: string };

    const { data, error } = await adminDb
      .from('meetings')
      .select(`
        *,
        department:departments (id, name),
        template:attendance_templates (id, name, template_type)
      `)
      .eq('id', meetingId)
      .eq('organization_id', orgId)
      .single();

    if (error || !data) throw new AppError('Meeting not found.', 404);
    return reply.send(data);
  });

  // Update meeting
  fastify.patch('/:meetingId', {
    preHandler: [fastify.authenticate, requireRole([...canManage])],
  }, async (request, reply) => {
    const { orgId, meetingId } = request.params as { orgId: string; meetingId: string };
    const body = meetingSchema.partial().parse(request.body);

    // Only the creator or admins can update
    const { data: existing } = await adminDb
      .from('meetings')
      .select('created_by, status')
      .eq('id', meetingId)
      .eq('organization_id', orgId)
      .single();

    if (!existing) throw new AppError('Meeting not found.', 404);

    const isAdmin = ['super_admin', 'hr_admin'].includes(request.orgMember.role);
    if (!isAdmin && existing.created_by !== request.authUser.id) {
      throw new AppError('You do not have permission to edit this meeting.', 403);
    }
    if (existing.status === 'archived') {
      throw new AppError('This meeting has been archived and cannot be edited.', 400);
    }

    const { data, error } = await adminDb
      .from('meetings')
      .update(body)
      .eq('id', meetingId)
      .eq('organization_id', orgId)
      .select('*')
      .single();

    if (error) throw mapDbError(error);

    await adminDb.from('audit_logs').insert({
      organization_id: orgId,
      user_id: request.authUser.id,
      action: 'meeting_updated',
      entity_type: 'meetings',
      entity_id: meetingId,
      metadata: {},
    });

    return reply.send(data);
  });

  // Lifecycle transitions (publish / open / close / archive)
  const transitions: Array<{
    action: string;
    from: string[];
    to: string;
    auditAction: string;
    genQr?: boolean;
  }> = [
    { action: 'publish',  from: ['draft'],             to: 'published', auditAction: 'meeting_published', genQr: true },
    { action: 'open',     from: ['published'],          to: 'open',      auditAction: 'attendance_opened' },
    { action: 'close',    from: ['open'],               to: 'closed',    auditAction: 'attendance_closed' },
    { action: 'archive',  from: ['published', 'closed'], to: 'archived', auditAction: 'meeting_archived' },
  ];

  for (const t of transitions) {
    fastify.post(`/:meetingId/${t.action}`, {
      preHandler: [fastify.authenticate, requireRole([...canManage])],
    }, async (request, reply) => {
      const { orgId, meetingId } = request.params as { orgId: string; meetingId: string };

      const { data: existing } = await adminDb
        .from('meetings')
        .select('status, attendance_closes_at, created_by')
        .eq('id', meetingId)
        .eq('organization_id', orgId)
        .single();

      if (!existing) throw new AppError('Meeting not found.', 404);

      const isAdmin = ['super_admin', 'hr_admin'].includes(request.orgMember.role);
      if (!isAdmin && existing.created_by !== request.authUser.id) {
        throw new AppError('You do not have permission to do that.', 403);
      }
      if (!t.from.includes(existing.status)) {
        throw new AppError(`This meeting cannot be ${t.action}ed while it is ${existing.status}.`, 400);
      }

      const updates: Record<string, unknown> = { status: t.to };
      if (t.action === 'open' && !existing.attendance_closes_at) {
        // Default: close in 24 hours if no close time set
        updates.attendance_closes_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      }

      const { data, error } = await adminDb
        .from('meetings')
        .update(updates)
        .eq('id', meetingId)
        .select('*')
        .single();

      if (error) throw mapDbError(error);

      // Generate QR code on publish
      if (t.genQr) {
        await createMeetingQr({
          orgId,
          meetingId,
          expiresAt: data.attendance_closes_at,
        });
      }

      await adminDb.from('audit_logs').insert({
        organization_id: orgId,
        user_id: request.authUser.id,
        action: t.auditAction as never,
        entity_type: 'meetings',
        entity_id: meetingId,
        metadata: {},
      });

      return reply.send(data);
    });
  }

  // Attendance records for a meeting
  fastify.get('/:meetingId/attendance', {
    preHandler: [fastify.authenticate, requireRole([...canManage, 'auditor'])],
  }, async (request, reply) => {
    const { orgId, meetingId } = request.params as { orgId: string; meetingId: string };

    const { data, error } = await adminDb
      .from('attendance_records')
      .select('*')
      .eq('meeting_id', meetingId)
      .eq('organization_id', orgId)
      .order('signed_at');

    if (error) throw mapDbError(error);
    return reply.send(data);
  });

  // Live attendance stats (for real-time dashboard polling)
  fastify.get('/:meetingId/live', {
    preHandler: [fastify.authenticate, requireRole([...canManage])],
  }, async (request, reply) => {
    const { orgId, meetingId } = request.params as { orgId: string; meetingId: string };

    const [meetingRes, statsRes, recentRes] = await Promise.all([
      adminDb
        .from('meetings')
        .select('title, expected_attendees, status, attendance_closes_at')
        .eq('id', meetingId)
        .eq('organization_id', orgId)
        .single(),

      adminDb
        .from('attendance_records')
        .select('id, is_late', { count: 'exact' })
        .eq('meeting_id', meetingId),

      adminDb
        .from('attendance_records')
        .select('id, full_name, designation, signed_at, is_late')
        .eq('meeting_id', meetingId)
        .order('signed_at', { ascending: false })
        .limit(20),
    ]);

    if (meetingRes.error || !meetingRes.data) throw new AppError('Meeting not found.', 404);

    const totalSigned = statsRes.count ?? 0;
    const lateCount = (statsRes.data ?? []).filter((r) => r.is_late).length;
    const expected = meetingRes.data.expected_attendees ?? 0;

    return reply.send({
      meeting: meetingRes.data,
      stats: {
        total_signed: totalSigned,
        late_count: lateCount,
        on_time_count: totalSigned - lateCount,
        remaining: Math.max(0, expected - totalSigned),
        attendance_pct: expected > 0 ? ((totalSigned / expected) * 100).toFixed(1) : null,
      },
      recent: recentRes.data ?? [],
    });
  });
};
