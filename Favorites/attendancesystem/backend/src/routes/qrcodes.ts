import type { FastifyPluginAsync } from 'fastify';
import { adminDb } from '../lib/supabase';
import { AppError, mapDbError } from '../lib/errors';
import { requireRole } from '../hooks/requireRole';
import { createMeetingQr, createSessionQr } from '../lib/qrcode';

const canManage = ['super_admin', 'hr_admin', 'department_admin', 'meeting_organizer', 'training_coordinator'] as const;

export const qrRoutes: FastifyPluginAsync = async (fastify) => {
  // List QR codes for org
  fastify.get('/', {
    preHandler: [fastify.authenticate, requireRole([...canManage])],
  }, async (request, reply) => {
    const { orgId } = request.params as { orgId: string };
    const { meeting_id, session_id } = request.query as { meeting_id?: string; session_id?: string };

    let query = adminDb
      .from('qr_codes')
      .select('id, code, qr_image_url, is_active, scan_count, expires_at, created_at, meeting_id, training_session_id')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (meeting_id)  query = query.eq('meeting_id', meeting_id);
    if (session_id)  query = query.eq('training_session_id', session_id);

    const { data, error } = await query;
    if (error) throw mapDbError(error);
    return reply.send(data);
  });

  // Generate QR for a meeting
  fastify.post('/meeting/:meetingId', {
    preHandler: [fastify.authenticate, requireRole([...canManage])],
  }, async (request, reply) => {
    const { orgId, meetingId } = request.params as { orgId: string; meetingId: string };

    const { data: meeting } = await adminDb
      .from('meetings')
      .select('id, status, attendance_closes_at')
      .eq('id', meetingId)
      .eq('organization_id', orgId)
      .single();

    if (!meeting) throw new AppError('Meeting not found.', 404);
    if (!['published', 'open'].includes(meeting.status)) {
      throw new AppError('QR codes can only be generated for published or open meetings.', 400);
    }

    const { code, qrImageUrl } = await createMeetingQr({
      orgId,
      meetingId,
      expiresAt: meeting.attendance_closes_at,
    });

    await adminDb.from('audit_logs').insert({
      organization_id: orgId,
      user_id: request.authUser.id,
      action: 'qr_generated',
      entity_type: 'meetings',
      entity_id: meetingId,
      metadata: { code },
    });

    return reply.status(201).send({ code, qr_image_url: qrImageUrl });
  });

  // Generate QR for a training session
  fastify.post('/session/:sessionId', {
    preHandler: [fastify.authenticate, requireRole([...canManage])],
  }, async (request, reply) => {
    const { orgId, sessionId } = request.params as { orgId: string; sessionId: string };

    const { data: session } = await adminDb
      .from('training_sessions')
      .select('id, status, attendance_closes_at, training_event:training_events(organization_id)')
      .eq('id', sessionId)
      .single();

    if (!session) throw new AppError('Session not found.', 404);
    const sessionOrgId = (session.training_event as unknown as { organization_id: string }).organization_id;
    if (sessionOrgId !== orgId) throw new AppError('Session not found.', 404);
    if (!['open'].includes(session.status)) {
      throw new AppError('QR codes can only be generated for open sessions.', 400);
    }

    const { code, qrImageUrl } = await createSessionQr({
      orgId,
      sessionId,
      expiresAt: session.attendance_closes_at,
    });

    await adminDb.from('audit_logs').insert({
      organization_id: orgId,
      user_id: request.authUser.id,
      action: 'qr_generated',
      entity_type: 'training_sessions',
      entity_id: sessionId,
      metadata: { code },
    });

    return reply.status(201).send({ code, qr_image_url: qrImageUrl });
  });

  // Expire a QR code manually
  fastify.delete('/:qrId', {
    preHandler: [fastify.authenticate, requireRole(['super_admin', 'hr_admin', 'meeting_organizer'])],
  }, async (request, reply) => {
    const { orgId, qrId } = request.params as { orgId: string; qrId: string };

    const { data, error } = await adminDb
      .from('qr_codes')
      .update({ is_active: false })
      .eq('id', qrId)
      .eq('organization_id', orgId)
      .select('id')
      .single();

    if (error || !data) throw new AppError('QR code not found.', 404);

    await adminDb.from('audit_logs').insert({
      organization_id: orgId,
      user_id: request.authUser.id,
      action: 'qr_expired',
      entity_type: 'qr_codes',
      entity_id: qrId,
      metadata: {},
    });

    return reply.status(204).send();
  });
};
