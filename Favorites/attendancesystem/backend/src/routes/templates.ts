import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { adminDb } from '../lib/supabase';
import { AppError, mapDbError } from '../lib/errors';
import { requireRole } from '../hooks/requireRole';
import { uploadTemplateFile } from '../lib/storage';

const placeholderSchema = z.object({
  key: z.string(),
  label: z.string(),
});

const builtInTemplateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  template_type: z.literal('built_in'),
  config: z.record(z.unknown()).default({}),
  placeholders: z.array(placeholderSchema).default([]),
  orientation: z.enum(['portrait', 'landscape']).default('portrait'),
  is_default: z.boolean().default(false),
});

const editorRoles = ['super_admin', 'hr_admin', 'department_admin', 'meeting_organizer', 'training_coordinator'] as const;

export const templateRoutes: FastifyPluginAsync = async (fastify) => {
  // List templates
  fastify.get('/', {
    preHandler: [fastify.authenticate, requireRole([...editorRoles, 'auditor', 'participant'])],
  }, async (request, reply) => {
    const { orgId } = request.params as { orgId: string };

    const { data, error } = await adminDb
      .from('attendance_templates')
      .select('*')
      .eq('organization_id', orgId)
      .eq('is_active', true)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw mapDbError(error);
    return reply.send(data);
  });

  // Create built-in template
  fastify.post('/', {
    preHandler: [fastify.authenticate, requireRole([...editorRoles])],
  }, async (request, reply) => {
    const { orgId } = request.params as { orgId: string };
    const body = builtInTemplateSchema.parse(request.body);

    // If setting as default, unset previous default
    if (body.is_default) {
      await adminDb
        .from('attendance_templates')
        .update({ is_default: false })
        .eq('organization_id', orgId)
        .eq('is_default', true);
    }

    const { data, error } = await adminDb
      .from('attendance_templates')
      .insert({ ...body, organization_id: orgId, created_by: request.authUser.id })
      .select('*')
      .single();

    if (error) throw mapDbError(error);

    await adminDb.from('audit_logs').insert({
      organization_id: orgId,
      user_id: request.authUser.id,
      action: 'template_created',
      entity_type: 'attendance_templates',
      entity_id: data.id,
      metadata: { name: body.name },
    });

    return reply.status(201).send(data);
  });

  // Upload Word template (multipart)
  fastify.post('/upload', {
    preHandler: [fastify.authenticate, requireRole([...editorRoles])],
  }, async (request, reply) => {
    const { orgId } = request.params as { orgId: string };

    const data = await request.file();
    if (!data) throw new AppError('No file uploaded.', 400);

    const allowed = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];
    if (!allowed.includes(data.mimetype)) {
      throw new AppError('Only .docx and .doc files are allowed.', 400);
    }

    const buffer = await data.toBuffer();
    if (buffer.length > 20 * 1024 * 1024) throw new AppError('File too large (max 20 MB).', 413);

    const safeFilename = data.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileUrl = await uploadTemplateFile({
      orgId,
      filename: safeFilename,
      buffer,
      mimeType: data.mimetype,
    });

    const templateName = data.fields['name']
      ? (data.fields['name'] as { value: string }).value
      : data.filename.replace(/\.[^.]+$/, '');

    const { data: template, error } = await adminDb
      .from('attendance_templates')
      .insert({
        organization_id: orgId,
        name: templateName,
        template_type: 'word_upload',
        file_url: fileUrl,
        orientation: 'portrait',
        placeholders: [],
        created_by: request.authUser.id,
      })
      .select('*')
      .single();

    if (error) throw mapDbError(error);
    return reply.status(201).send(template);
  });

  // Get single template
  fastify.get('/:templateId', {
    preHandler: [fastify.authenticate, requireRole([...editorRoles, 'auditor', 'participant'])],
  }, async (request, reply) => {
    const { orgId, templateId } = request.params as { orgId: string; templateId: string };

    const { data, error } = await adminDb
      .from('attendance_templates')
      .select('*')
      .eq('id', templateId)
      .eq('organization_id', orgId)
      .single();

    if (error || !data) throw new AppError('Template not found.', 404);
    return reply.send(data);
  });

  // Update template
  fastify.patch('/:templateId', {
    preHandler: [fastify.authenticate, requireRole([...editorRoles])],
  }, async (request, reply) => {
    const { orgId, templateId } = request.params as { orgId: string; templateId: string };
    const body = builtInTemplateSchema.partial().parse(request.body);

    if (body.is_default) {
      await adminDb
        .from('attendance_templates')
        .update({ is_default: false })
        .eq('organization_id', orgId)
        .eq('is_default', true);
    }

    const { data, error } = await adminDb
      .from('attendance_templates')
      .update(body)
      .eq('id', templateId)
      .eq('organization_id', orgId)
      .select('*')
      .single();

    if (error) throw mapDbError(error);
    if (!data) throw new AppError('Template not found.', 404);

    await adminDb.from('audit_logs').insert({
      organization_id: orgId,
      user_id: request.authUser.id,
      action: 'template_updated',
      entity_type: 'attendance_templates',
      entity_id: templateId,
      metadata: {},
    });

    return reply.send(data);
  });

  // Delete (soft-delete) template
  fastify.delete('/:templateId', {
    preHandler: [fastify.authenticate, requireRole(['super_admin', 'hr_admin'])],
  }, async (request, reply) => {
    const { orgId, templateId } = request.params as { orgId: string; templateId: string };

    const { error } = await adminDb
      .from('attendance_templates')
      .update({ is_active: false })
      .eq('id', templateId)
      .eq('organization_id', orgId);

    if (error) throw mapDbError(error);

    await adminDb.from('audit_logs').insert({
      organization_id: orgId,
      user_id: request.authUser.id,
      action: 'template_deleted',
      entity_type: 'attendance_templates',
      entity_id: templateId,
      metadata: {},
    });

    return reply.status(204).send();
  });
};
