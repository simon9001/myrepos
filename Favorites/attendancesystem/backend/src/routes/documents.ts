import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { adminDb } from '../lib/supabase';
import { AppError, mapDbError } from '../lib/errors';
import { requireRole } from '../hooks/requireRole';
import { uploadDocument } from '../lib/storage';
import {
  generateMeetingPdf,
  generateMeetingDocx,
  generateTrainingPdf,
  generateTrainingDocx,
} from '../lib/documents';

const generateSchema = z.object({
  format: z.enum(['pdf', 'word']).default('pdf'),
});

const canGenerate = ['super_admin', 'hr_admin', 'department_admin', 'meeting_organizer', 'training_coordinator'] as const;

export const documentRoutes: FastifyPluginAsync = async (fastify) => {
  // List generated documents
  fastify.get('/', {
    preHandler: [fastify.authenticate, requireRole([...canGenerate, 'auditor'])],
  }, async (request, reply) => {
    const { orgId } = request.params as { orgId: string };

    const { data, error } = await adminDb
      .from('generated_documents')
      .select('id, file_format, file_url, file_size_bytes, generated_at, meeting_id, training_event_id')
      .eq('organization_id', orgId)
      .order('generated_at', { ascending: false })
      .limit(100);

    if (error) throw mapDbError(error);
    return reply.send(data);
  });

  // Generate attendance document for a MEETING
  fastify.post('/meetings/:meetingId', {
    preHandler: [fastify.authenticate, requireRole([...canGenerate])],
  }, async (request, reply) => {
    const { orgId, meetingId } = request.params as { orgId: string; meetingId: string };
    const { format } = generateSchema.parse(request.body);

    // Load meeting + org info
    const { data: meeting, error: meetingErr } = await adminDb
      .from('meetings')
      .select(`
        *,
        template:attendance_templates (id, file_url, template_type),
        organization:organizations (name, logo_url)
      `)
      .eq('id', meetingId)
      .eq('organization_id', orgId)
      .single();

    if (meetingErr || !meeting) throw new AppError('Meeting not found.', 404);

    // Load all attendance records for this meeting
    const { data: records, error: recErr } = await adminDb
      .from('attendance_records')
      .select('*')
      .eq('meeting_id', meetingId)
      .order('signed_at');

    if (recErr) throw mapDbError(recErr);

    const ctx = {
      meeting: meeting as never,
      orgName: (meeting.organization as { name: string }).name,
      records: records ?? [],
    };

    const template = meeting.template as { id: string; file_url: string | null; template_type: string } | null;

    let buffer: Buffer;
    let mimeType: string;
    let ext: string;

    if (format === 'word') {
      if (template?.template_type === 'word_upload' && template.file_url) {
        buffer = await generateMeetingDocx(ctx, template.file_url);
      } else {
        throw new AppError('No Word template is assigned to this meeting.', 400);
      }
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      ext = 'docx';
    } else {
      buffer = await generateMeetingPdf(ctx);
      mimeType = 'application/pdf';
      ext = 'pdf';
    }

    const filename = `attendance_${meetingId}_${Date.now()}.${ext}`;
    const fileUrl = await uploadDocument({ orgId, meetingId, filename, buffer, mimeType });

    const { data: doc, error: docErr } = await adminDb
      .from('generated_documents')
      .insert({
        organization_id: orgId,
        meeting_id: meetingId,
        template_id: template?.id ?? null,
        file_format: format,
        file_url: fileUrl,
        file_size_bytes: buffer.length,
        generated_by: request.authUser.id,
      })
      .select('id, file_format, file_url, generated_at')
      .single();

    if (docErr) throw mapDbError(docErr);

    await adminDb.from('audit_logs').insert({
      organization_id: orgId,
      user_id: request.authUser.id,
      action: 'document_generated',
      entity_type: 'meetings',
      entity_id: meetingId,
      metadata: { format, file_url: fileUrl },
    });

    return reply.send(doc);
  });

  // Generate attendance report for a TRAINING EVENT
  fastify.post('/training/:eventId', {
    preHandler: [fastify.authenticate, requireRole([...canGenerate])],
  }, async (request, reply) => {
    const { orgId, eventId } = request.params as { orgId: string; eventId: string };
    const { format } = generateSchema.parse(request.body);

    const { data: event, error: eventErr } = await adminDb
      .from('training_events')
      .select(`
        *,
        template:attendance_templates (id, file_url, template_type),
        organization:organizations (name, logo_url)
      `)
      .eq('id', eventId)
      .eq('organization_id', orgId)
      .single();

    if (eventErr || !event) throw new AppError('Training event not found.', 404);

    // Load all sessions with their attendance records
    const { data: sessions, error: sessErr } = await adminDb
      .from('training_sessions')
      .select('*')
      .eq('training_event_id', eventId)
      .order('session_date')
      .order('start_time');

    if (sessErr) throw mapDbError(sessErr);

    const sessionsWithRecords = await Promise.all(
      (sessions ?? []).map(async (session) => {
        const { data: records } = await adminDb
          .from('attendance_records')
          .select('*')
          .eq('training_session_id', session.id)
          .order('signed_at');
        return { ...session, records: records ?? [] };
      }),
    );

    const ctx = {
      event: event as never,
      sessions: sessionsWithRecords,
      orgName: (event.organization as { name: string }).name,
    };

    const template = event.template as { id: string; file_url: string | null; template_type: string } | null;

    let buffer: Buffer;
    let mimeType: string;
    let ext: string;

    if (format === 'word') {
      if (template?.template_type === 'word_upload' && template.file_url) {
        buffer = await generateTrainingDocx(ctx, template.file_url);
      } else {
        throw new AppError('No Word template is assigned to this training event.', 400);
      }
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      ext = 'docx';
    } else {
      buffer = await generateTrainingPdf(ctx);
      mimeType = 'application/pdf';
      ext = 'pdf';
    }

    const filename = `training_${eventId}_${Date.now()}.${ext}`;
    const fileUrl = await uploadDocument({ orgId, meetingId: eventId, filename, buffer, mimeType });

    const { data: doc, error: docErr } = await adminDb
      .from('generated_documents')
      .insert({
        organization_id: orgId,
        training_event_id: eventId,
        template_id: template?.id ?? null,
        file_format: format,
        file_url: fileUrl,
        file_size_bytes: buffer.length,
        generated_by: request.authUser.id,
      })
      .select('id, file_format, file_url, generated_at')
      .single();

    if (docErr) throw mapDbError(docErr);

    await adminDb.from('audit_logs').insert({
      organization_id: orgId,
      user_id: request.authUser.id,
      action: 'document_generated',
      entity_type: 'training_events',
      entity_id: eventId,
      metadata: { format, file_url: fileUrl },
    });

    return reply.send(doc);
  });
};
