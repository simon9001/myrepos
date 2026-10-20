import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { adminDb } from '../lib/supabase';
import { AppError, mapDbError } from '../lib/errors';
import { requireRole } from '../hooks/requireRole';
import { createSessionQr } from '../lib/qrcode';
import { sendEmail } from '../lib/email';
import { appConfig } from '../config';

const trainingSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(2000).optional(),
  venue: z.string().max(500).optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  attendance_frequency: z.enum(['per_session', 'once_per_day', 'morning_and_afternoon', 'every_lecture', 'custom']),
  frequency_config: z.array(z.unknown()).default([]),
  department_id: z.string().uuid().optional().nullable(),
  template_id: z.string().uuid().optional().nullable(),
});

const sessionSchema = z.object({
  title: z.string().min(1).max(300),
  session_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  session_type: z.enum(['morning', 'afternoon', 'full_day', 'custom']),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  attendance_opens_at: z.string().datetime({ offset: true }).optional().nullable(),
  attendance_closes_at: z.string().datetime({ offset: true }).optional().nullable(),
});

const canManage = ['super_admin', 'hr_admin', 'training_coordinator'] as const;

export const trainingRoutes: FastifyPluginAsync = async (fastify) => {
  // List training events
  fastify.get('/', {
    preHandler: [fastify.authenticate, requireRole([...canManage, 'department_admin', 'auditor', 'participant'])],
  }, async (request, reply) => {
    const { orgId } = request.params as { orgId: string };
    const { status, limit = '20', offset = '0' } = request.query as Record<string, string>;

    let query = adminDb
      .from('training_events')
      .select('id, title, venue, start_date, end_date, status, attendance_frequency', { count: 'exact' })
      .eq('organization_id', orgId)
      .order('start_date', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (status) query = query.eq('status', status);

    const { data, error, count } = await query;
    if (error) throw mapDbError(error);
    return reply.send({ data, total: count });
  });

  // Create training event
  fastify.post('/', {
    preHandler: [fastify.authenticate, requireRole([...canManage])],
  }, async (request, reply) => {
    const { orgId } = request.params as { orgId: string };
    const body = trainingSchema.parse(request.body);

    if (body.end_date < body.start_date) {
      throw new AppError('End date cannot be before start date.', 400);
    }

    const { data, error } = await adminDb
      .from('training_events')
      .insert({ ...body, organization_id: orgId, created_by: request.authUser.id })
      .select('*')
      .single();

    if (error) throw mapDbError(error);

    await adminDb.from('audit_logs').insert({
      organization_id: orgId,
      user_id: request.authUser.id,
      action: 'training_created',
      entity_type: 'training_events',
      entity_id: data.id,
      metadata: { title: body.title },
    });

    return reply.status(201).send(data);
  });

  // Get training event with sessions
  fastify.get('/:eventId', {
    preHandler: [fastify.authenticate, requireRole([...canManage, 'department_admin', 'auditor', 'participant'])],
  }, async (request, reply) => {
    const { orgId, eventId } = request.params as { orgId: string; eventId: string };

    const [eventRes, sessionsRes] = await Promise.all([
      adminDb
        .from('training_events')
        .select('*, template:attendance_templates(id, name, template_type)')
        .eq('id', eventId)
        .eq('organization_id', orgId)
        .single(),

      adminDb
        .from('training_sessions')
        .select('*')
        .eq('training_event_id', eventId)
        .order('session_date')
        .order('start_time'),
    ]);

    if (eventRes.error || !eventRes.data) throw new AppError('Training event not found.', 404);

    return reply.send({ ...eventRes.data, sessions: sessionsRes.data ?? [] });
  });

  // Update training event
  fastify.patch('/:eventId', {
    preHandler: [fastify.authenticate, requireRole([...canManage])],
  }, async (request, reply) => {
    const { orgId, eventId } = request.params as { orgId: string; eventId: string };
    const body = trainingSchema.partial().parse(request.body);

    const { data, error } = await adminDb
      .from('training_events')
      .update(body)
      .eq('id', eventId)
      .eq('organization_id', orgId)
      .select('*')
      .single();

    if (error) throw mapDbError(error);
    if (!data) throw new AppError('Training event not found.', 404);

    await adminDb.from('audit_logs').insert({
      organization_id: orgId,
      user_id: request.authUser.id,
      action: 'training_updated',
      entity_type: 'training_events',
      entity_id: eventId,
      metadata: {},
    });

    return reply.send(data);
  });

  // Add session to training event
  fastify.post('/:eventId/sessions', {
    preHandler: [fastify.authenticate, requireRole([...canManage])],
  }, async (request, reply) => {
    const { orgId, eventId } = request.params as { orgId: string; eventId: string };
    const body = sessionSchema.parse(request.body);

    // Verify event belongs to org
    const { data: event } = await adminDb
      .from('training_events')
      .select('id, status')
      .eq('id', eventId)
      .eq('organization_id', orgId)
      .single();

    if (!event) throw new AppError('Training event not found.', 404);
    if (event.status === 'completed') throw new AppError('Cannot add sessions to a completed event.', 400);

    const { data, error } = await adminDb
      .from('training_sessions')
      .insert({ ...body, training_event_id: eventId })
      .select('*')
      .single();

    if (error) throw mapDbError(error);

    await adminDb.from('audit_logs').insert({
      organization_id: orgId,
      user_id: request.authUser.id,
      action: 'training_session_created',
      entity_type: 'training_sessions',
      entity_id: data.id,
      metadata: { title: body.title },
    });

    return reply.status(201).send(data);
  });

  // Update session
  fastify.patch('/:eventId/sessions/:sessionId', {
    preHandler: [fastify.authenticate, requireRole([...canManage])],
  }, async (request, reply) => {
    const { orgId, eventId, sessionId } = request.params as {
      orgId: string; eventId: string; sessionId: string;
    };
    const body = sessionSchema.partial().parse(request.body);

    // Verify session belongs to this event and org
    const { data: existing } = await adminDb
      .from('training_sessions')
      .select('training_event_id, status')
      .eq('id', sessionId)
      .single();

    if (!existing || existing.training_event_id !== eventId) {
      throw new AppError('Session not found.', 404);
    }
    if (existing.status === 'closed') {
      throw new AppError('Cannot edit a closed session.', 400);
    }

    // Also verify the event is in this org
    const { data: eventCheck } = await adminDb
      .from('training_events')
      .select('id')
      .eq('id', eventId)
      .eq('organization_id', orgId)
      .single();
    if (!eventCheck) throw new AppError('Training event not found.', 404);

    const { data, error } = await adminDb
      .from('training_sessions')
      .update(body)
      .eq('id', sessionId)
      .select('*')
      .single();

    if (error) throw mapDbError(error);
    return reply.send(data);
  });

  // Open / close session attendance
  for (const action of ['open', 'close'] as const) {
    fastify.post('/:eventId/sessions/:sessionId/' + action, {
      preHandler: [fastify.authenticate, requireRole([...canManage])],
    }, async (request, reply) => {
      const { orgId, eventId, sessionId } = request.params as {
        orgId: string; eventId: string; sessionId: string;
      };

      // Verify session → event → org ownership
      const { data: session } = await adminDb
        .from('training_sessions')
        .select('*, training_event:training_events(organization_id)')
        .eq('id', sessionId)
        .single();

      if (!session) throw new AppError('Session not found.', 404);
      const eventOrg = (session.training_event as { organization_id: string }).organization_id;
      if (eventOrg !== orgId) throw new AppError('Session not found.', 404);

      const newStatus = action === 'open' ? 'open' : 'closed';
      const allowedFrom = action === 'open' ? ['pending'] : ['open'];

      if (!allowedFrom.includes(session.status)) {
        throw new AppError(`Cannot ${action} a session with status '${session.status}'.`, 400);
      }

      const updates: Record<string, unknown> = { status: newStatus };
      if (action === 'open') {
        updates.attendance_opens_at = new Date().toISOString();

        // Auto-generate QR for the session
        await createSessionQr({
          orgId,
          sessionId,
          expiresAt: session.attendance_closes_at,
        });

        // Send attendance link to all invited participants
        const { data: invitations } = await adminDb
          .from('invitations')
          .select('email, full_name, token')
          .eq('training_session_id', sessionId)
          .neq('status', 'signed');

        if (invitations?.length) {
          const emailJobs = invitations
            .filter((inv) => inv.email)
            .map((inv) =>
              sendEmail({
                to: inv.email!,
                subject: `Attendance open: ${session.title}`,
                text: `Please sign your attendance for ${session.title}:\n${appConfig.APP_URL}/attend/invite/${inv.token}`,
                html: `<p>Please sign your attendance for <strong>${session.title}</strong>:</p>
                       <a href="${appConfig.APP_URL}/attend/invite/${inv.token}">Sign Attendance</a>`,
              }).catch(() => {/* swallow per-email failures */}),
            );
          await Promise.all(emailJobs);
        }
      }

      const { data, error } = await adminDb
        .from('training_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select('*')
        .single();

      if (error) throw mapDbError(error);

      await adminDb.from('audit_logs').insert({
        organization_id: orgId,
        user_id: request.authUser.id,
        action: action === 'open' ? 'attendance_opened' : 'attendance_closed',
        entity_type: 'training_sessions',
        entity_id: sessionId,
        metadata: { event_id: eventId },
      });

      return reply.send(data);
    });
  }

  // Get attendance records for a session
  fastify.get('/:eventId/sessions/:sessionId/attendance', {
    preHandler: [fastify.authenticate, requireRole([...canManage, 'auditor'])],
  }, async (request, reply) => {
    const { orgId, sessionId } = request.params as { orgId: string; eventId: string; sessionId: string };

    const { data, error } = await adminDb
      .from('attendance_records')
      .select('*')
      .eq('training_session_id', sessionId)
      .eq('organization_id', orgId)
      .order('signed_at');

    if (error) throw mapDbError(error);
    return reply.send(data);
  });

  // Training-level attendance matrix view
  fastify.get('/:eventId/attendance', {
    preHandler: [fastify.authenticate, requireRole([...canManage, 'auditor'])],
  }, async (request, reply) => {
    const { orgId, eventId } = request.params as { orgId: string; eventId: string };

    const { data, error } = await adminDb
      .from('v_participant_training_matrix')
      .select('*')
      .eq('training_event_id', eventId)
      .eq('organization_id', orgId);

    if (error) throw mapDbError(error);
    return reply.send(data);
  });
};
