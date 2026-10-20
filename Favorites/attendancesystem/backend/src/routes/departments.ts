import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { adminDb } from '../lib/supabase';
import { AppError, mapDbError } from '../lib/errors';
import { requireRole } from '../hooks/requireRole';

const deptSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  parent_department_id: z.string().uuid().optional().nullable(),
});

export const departmentRoutes: FastifyPluginAsync = async (fastify) => {
  // List departments
  fastify.get('/', {
    preHandler: [
      fastify.authenticate,
      requireRole(['super_admin', 'hr_admin', 'department_admin', 'meeting_organizer',
        'training_coordinator', 'auditor', 'participant']),
    ],
  }, async (request, reply) => {
    const { orgId } = request.params as { orgId: string };

    const { data, error } = await adminDb
      .from('departments')
      .select('*')
      .eq('organization_id', orgId)
      .order('name');

    if (error) throw mapDbError(error);
    return reply.send(data);
  });

  // Create department
  fastify.post('/', {
    preHandler: [
      fastify.authenticate,
      requireRole(['super_admin', 'hr_admin', 'department_admin']),
    ],
  }, async (request, reply) => {
    const { orgId } = request.params as { orgId: string };
    const body = deptSchema.parse(request.body);

    const { data, error } = await adminDb
      .from('departments')
      .insert({ ...body, organization_id: orgId, created_by: request.authUser.id })
      .select('*')
      .single();

    if (error) throw mapDbError(error);
    return reply.status(201).send(data);
  });

  // Update department
  fastify.patch('/:deptId', {
    preHandler: [
      fastify.authenticate,
      requireRole(['super_admin', 'hr_admin', 'department_admin']),
    ],
  }, async (request, reply) => {
    const { orgId, deptId } = request.params as { orgId: string; deptId: string };
    const body = deptSchema.partial().parse(request.body);

    // Prevent circular parent reference
    if (body.parent_department_id === deptId) {
      throw new AppError('A department cannot be its own parent.', 400);
    }

    const { data, error } = await adminDb
      .from('departments')
      .update(body)
      .eq('id', deptId)
      .eq('organization_id', orgId)
      .select('*')
      .single();

    if (error) throw mapDbError(error);
    if (!data) throw new AppError('Department not found.', 404);
    return reply.send(data);
  });

  // Delete department
  fastify.delete('/:deptId', {
    preHandler: [
      fastify.authenticate,
      requireRole(['super_admin', 'hr_admin']),
    ],
  }, async (request, reply) => {
    const { orgId, deptId } = request.params as { orgId: string; deptId: string };

    const { error } = await adminDb
      .from('departments')
      .delete()
      .eq('id', deptId)
      .eq('organization_id', orgId);

    if (error) throw mapDbError(error);
    return reply.status(204).send();
  });
};
