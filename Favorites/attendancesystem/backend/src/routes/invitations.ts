import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { adminDb } from '../lib/supabase';
import { AppError, mapDbError } from '../lib/errors';
import { requireRole } from '../hooks/requireRole';
import { sendInvitationEmail } from '../lib/email';
import { appConfig } from '../config';
import { randomBytes } from 'crypto';

const inviteSchema = z.object({
  // Exactly one target
  meeting_id: z.string().uuid().optional(),
  training_event_id: z.string().uuid().optional(),
  training_session_id: z.string().uuid().optional(),

  recipients: z.array(z.object({
    email: z.string().email(),
    full_name: z.string().min(1).max(300),
    designation: z.string().max(200).optional(),
    department_name: z.string().max(200).optional(),
    phone: z.string().max(30).optional(),
  })).min(1).max(500),
});

const canManage = ['super_admin', 'hr_admin', 'department_admin', 'meeting_organizer', 'training_coordinator'] as const;

export const invitationRoutes: FastifyPluginAsync = async (fastify) => {
  // List invitations for a meeting or training event
  fastify.get('/', {
    preHandler: [fastify.authenticate, requireRole([...canManage, 'auditor'])],
  }, async (request, reply) => {
    const { orgId } = request.params as { orgId: string };
    const { meeting_id, session_id, status, limit = '100', offset = '0' } =
      request.query as Record<string, string>;

    let query = adminDb
      .from('invitations')
      .select('id, email, full_name, designation, status, sent_at, opened_at, created_at', { count: 'exact' })
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (meeting_id)  query = query.eq('meeting_id', meeting_id);
    if (session_id)  query = query.eq('training_session_id', session_id);
    if (status)      query = query.eq('status', status);

    const { data, error, count } = await query;
    if (error) throw mapDbError(error);
    return reply.send({ data, total: count });
  });

  // Create + send invitations
  fastify.post('/', {
    preHandler: [fastify.authenticate, requireRole([...canManage])],
  }, async (request, reply) => {
    const { orgId } = request.params as { orgId: string };
    const body = inviteSchema.parse(request.body);

    const targetCount = [body.meeting_id, body.training_event_id, body.training_session_id].filter(Boolean).length;
    if (targetCount !== 1) {
      throw new AppError('Provide exactly one of: meeting_id, training_event_id, or training_session_id.', 400);
    }

    // Determine event title for the email
    let eventTitle = 'Event';
    let eventDate = '';
    if (body.meeting_id) {
      const { data: m } = await adminDb.from('meetings').select('title, scheduled_date').eq('id', body.meeting_id).eq('organization_id', orgId).single();
      if (!m) throw new AppError('Meeting not found.', 404);
      eventTitle = m.title;
      eventDate = m.scheduled_date;
    } else if (body.training_session_id) {
      const { data: s } = await adminDb
        .from('training_sessions')
        .select('title, session_date, training_event:training_events(organization_id)')
        .eq('id', body.training_session_id)
        .single();
      if (!s || (s.training_event as unknown as { organization_id: string }).organization_id !== orgId) {
        throw new AppError('Session not found.', 404);
      }
      eventTitle = s.title;
      eventDate = s.session_date;
    } else if (body.training_event_id) {
      const { data: te } = await adminDb.from('training_events').select('title, start_date').eq('id', body.training_event_id).eq('organization_id', orgId).single();
      if (!te) throw new AppError('Training event not found.', 404);
      eventTitle = te.title;
      eventDate = te.start_date;
    }

    const orgName = request.orgMember.organization.name;
    const results: { email: string; status: string }[] = [];

    // Process in batches of 20
    const BATCH = 20;
    for (let i = 0; i < body.recipients.length; i += BATCH) {
      const batch = body.recipients.slice(i, i + BATCH);

      await Promise.all(batch.map(async (recipient) => {
        try {
          const token = randomBytes(32).toString('hex');

          const { data: inv } = await adminDb
            .from('invitations')
            .insert({
              organization_id:     orgId,
              meeting_id:          body.meeting_id ?? null,
              training_event_id:   body.training_event_id ?? null,
              training_session_id: body.training_session_id ?? null,
              invitation_type:     'email',
              invited_by:          request.authUser.id,
              token,
              email:               recipient.email,
              full_name:           recipient.full_name,
              designation:         recipient.designation ?? null,
              department_name:     recipient.department_name ?? null,
              phone:               recipient.phone ?? null,
              status:              'sent',
              sent_at:             new Date().toISOString(),
            })
            .select('id')
            .single();

          if (!inv) throw new Error('Insert failed');

          await sendInvitationEmail({
            to: recipient.email,
            recipientName: recipient.full_name,
            orgName,
            eventTitle,
            eventDate,
            attendanceUrl: `${appConfig.APP_URL}/attend/invite/${token}`,
          });

          results.push({ email: recipient.email, status: 'sent' });
        } catch {
          results.push({ email: recipient.email, status: 'error' });
        }
      }));
    }

    await adminDb.from('audit_logs').insert({
      organization_id: orgId,
      user_id: request.authUser.id,
      action: 'invitation_sent',
      entity_type: body.meeting_id ? 'meetings' : 'training_sessions',
      entity_id: (body.meeting_id ?? body.training_session_id ?? body.training_event_id)!,
      metadata: { count: body.recipients.length },
    });

    return reply.status(201).send({ results });
  });

  // Resend a single invitation
  fastify.post('/:invitationId/resend', {
    preHandler: [fastify.authenticate, requireRole([...canManage])],
  }, async (request, reply) => {
    const { orgId, invitationId } = request.params as { orgId: string; invitationId: string };

    const { data: inv, error } = await adminDb
      .from('invitations')
      .select('id, email, full_name, token, status, meeting_id, training_session_id')
      .eq('id', invitationId)
      .eq('organization_id', orgId)
      .single();

    if (error || !inv) throw new AppError('Invitation not found.', 404);
    if (inv.status === 'signed') throw new AppError('This person has already signed.', 409);
    if (!inv.email)              throw new AppError('Invitation has no email address.', 400);

    let eventTitle = 'Event';
    let eventDate = '';
    if (inv.meeting_id) {
      const { data: m } = await adminDb.from('meetings').select('title, scheduled_date').eq('id', inv.meeting_id).single();
      eventTitle = m?.title ?? 'Event';
      eventDate  = m?.scheduled_date ?? '';
    } else if (inv.training_session_id) {
      const { data: s } = await adminDb.from('training_sessions').select('title, session_date').eq('id', inv.training_session_id).single();
      eventTitle = s?.title ?? 'Session';
      eventDate  = s?.session_date ?? '';
    }

    await sendInvitationEmail({
      to: inv.email,
      recipientName: inv.full_name ?? inv.email,
      orgName: request.orgMember.organization.name,
      eventTitle,
      eventDate,
      attendanceUrl: `${appConfig.APP_URL}/attend/invite/${inv.token}`,
    });

    await adminDb
      .from('invitations')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', invitationId);

    return reply.send({ message: 'Invitation resent.' });
  });

  // Delete invitation
  fastify.delete('/:invitationId', {
    preHandler: [fastify.authenticate, requireRole(['super_admin', 'hr_admin'])],
  }, async (request, reply) => {
    const { orgId, invitationId } = request.params as { orgId: string; invitationId: string };

    const { error } = await adminDb
      .from('invitations')
      .delete()
      .eq('id', invitationId)
      .eq('organization_id', orgId);

    if (error) throw mapDbError(error);
    return reply.status(204).send();
  });

  // Reminder — send to all unsigned invitees for a meeting
  fastify.post('/remind', {
    preHandler: [fastify.authenticate, requireRole([...canManage])],
  }, async (request, reply) => {
    const { orgId } = request.params as { orgId: string };
    const { meeting_id, session_id } = z.object({
      meeting_id: z.string().uuid().optional(),
      session_id: z.string().uuid().optional(),
    }).parse(request.body);

    if (!meeting_id && !session_id) throw new AppError('Provide meeting_id or session_id.', 400);

    let query = adminDb
      .from('invitations')
      .select('id, email, full_name, token')
      .eq('organization_id', orgId)
      .in('status', ['pending', 'sent', 'opened']);

    if (meeting_id)  query = query.eq('meeting_id', meeting_id);
    if (session_id)  query = query.eq('training_session_id', session_id);

    const { data: pending } = await query;
    if (!pending?.length) return reply.send({ sent: 0 });

    let eventTitle = 'Event';
    if (meeting_id) {
      const { data: m } = await adminDb.from('meetings').select('title').eq('id', meeting_id).single();
      eventTitle = m?.title ?? 'Event';
    } else if (session_id) {
      const { data: s } = await adminDb.from('training_sessions').select('title').eq('id', session_id!).single();
      eventTitle = s?.title ?? 'Session';
    }

    let sent = 0;
    await Promise.all(pending.map(async (inv) => {
      if (!inv.email) return;
      try {
        const { sendReminderEmail } = await import('../lib/email');
        await sendReminderEmail({
          to: inv.email,
          recipientName: inv.full_name ?? inv.email,
          orgName: request.orgMember.organization.name,
          eventTitle,
          attendanceUrl: `${appConfig.APP_URL}/attend/invite/${inv.token}`,
        });
        sent++;
      } catch { /* swallow per-recipient errors */ }
    }));

    await adminDb.from('audit_logs').insert({
      organization_id: orgId,
      user_id: request.authUser.id,
      action: 'reminder_sent',
      entity_type: meeting_id ? 'meetings' : 'training_sessions',
      entity_id: (meeting_id ?? session_id)!,
      metadata: { sent },
    });

    return reply.send({ sent });
  });
};
