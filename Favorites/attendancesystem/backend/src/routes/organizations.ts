import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { adminDb } from '../lib/supabase';
import { AppError, mapDbError } from '../lib/errors';
import { orgSettingsCache } from '../lib/cache';

const createOrgSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(60).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens'),
  branding: z.record(z.unknown()).optional().default({}),
  settings: z.object({
    require_otp: z.boolean().optional(),
    require_photo: z.boolean().optional(),
    require_gps: z.boolean().optional(),
    allow_late_signin: z.boolean().optional(),
    default_attendance_window_minutes: z.number().int().positive().optional(),
  }).optional().default({}),
});

const updateOrgSchema = createOrgSchema.partial().omit({ slug: true });

export const organizationRoutes: FastifyPluginAsync = async (fastify) => {
  // Create organization — any authenticated user; creator becomes super_admin
  fastify.post('/', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const body = createOrgSchema.parse(request.body);

    const { data: org, error } = await adminDb
      .from('organizations')
      .insert({ ...body, created_by: request.authUser.id })
      .select('*')
      .single();

    if (error) throw mapDbError(error);

    const { error: memberError } = await adminDb
      .from('organization_members')
      .insert({
        organization_id: org.id,
        user_id:         request.authUser.id,
        role:            'super_admin',
        is_active:       true,
        joined_at:       new Date().toISOString(),
      });

    if (memberError) throw mapDbError(memberError);

    return reply.status(201).send(org);
  });

  // List all organizations — platform owner only
  fastify.get('/', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    if (request.authUser.platform_role !== 'platform_owner') {
      throw new AppError('You do not have permission to do that.', 403);
    }

    const { data, error } = await adminDb
      .from('organizations')
      .select('id, name, slug, logo_url, is_active, created_at')
      .order('created_at', { ascending: false });

    if (error) throw mapDbError(error);
    return reply.send(data);
  });

  // Get single organization
  fastify.get('/:orgId', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { orgId } = request.params as { orgId: string };

    // Platform owner can see any org; regular users can only see their own
    const isMember = await adminDb
      .from('organization_members')
      .select('id')
      .eq('organization_id', orgId)
      .eq('user_id', request.authUser.id)
      .eq('is_active', true)
      .single();

    if (!isMember.data && request.authUser.platform_role !== 'platform_owner') {
      throw new AppError('Organization not found.', 404);
    }

    const { data, error } = await adminDb
      .from('organizations')
      .select('*')
      .eq('id', orgId)
      .single();

    if (error || !data) throw new AppError('Organization not found.', 404);
    return reply.send(data);
  });

  // Update organization — super_admin of that org
  fastify.patch('/:orgId', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { orgId } = request.params as { orgId: string };
    const body = updateOrgSchema.parse(request.body);

    // Verify caller is super_admin or platform_owner
    if (request.authUser.platform_role !== 'platform_owner') {
      const { data: member } = await adminDb
        .from('organization_members')
        .select('role')
        .eq('organization_id', orgId)
        .eq('user_id', request.authUser.id)
        .eq('is_active', true)
        .single();

      if (!member || member.role !== 'super_admin') {
        throw new AppError('Only a Super Admin can change organization settings.', 403);
      }
    }

    const { data, error } = await adminDb
      .from('organizations')
      .update(body)
      .eq('id', orgId)
      .select('*')
      .single();

    if (error) throw mapDbError(error);

    // Invalidate cache
    orgSettingsCache.delete(orgId);

    return reply.send(data);
  });

  // Suspend/activate org — platform owner only
  fastify.patch('/:orgId/status', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    if (request.authUser.platform_role !== 'platform_owner') {
      throw new AppError('You do not have permission to do that.', 403);
    }

    const { orgId } = request.params as { orgId: string };
    const { is_active } = z.object({ is_active: z.boolean() }).parse(request.body);

    const { data, error } = await adminDb
      .from('organizations')
      .update({ is_active })
      .eq('id', orgId)
      .select('id, name, is_active')
      .single();

    if (error) throw mapDbError(error);
    orgSettingsCache.delete(orgId);
    return reply.send(data);
  });
};
