import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { adminDb } from '../lib/supabase';
import { AppError, mapDbError } from '../lib/errors';
import { requireRole } from '../hooks/requireRole';
import { sendInvitationEmail } from '../lib/email';
import { membershipCache } from '../lib/cache';
import { appConfig } from '../config';
import { randomBytes } from 'crypto';

const inviteSchema = z.object({
  email: z.string().email(),
  full_name: z.string().default(''),  // optional — filled when they accept the invite
  role: z.enum(['hr_admin', 'department_admin', 'meeting_organizer', 'training_coordinator', 'auditor', 'participant']),
  department_id: z.string().uuid().optional().nullable(),
  designation: z.string().optional(),
  employee_id: z.string().optional(),
});

const bulkInviteSchema = z.object({
  members: z.array(inviteSchema).min(1).max(500),
});

const updateMemberSchema = z.object({
  role: z.enum(['hr_admin', 'department_admin', 'meeting_organizer', 'training_coordinator', 'auditor', 'participant']).optional(),
  department_id: z.string().uuid().nullable().optional(),
  designation: z.string().optional(),
  employee_id: z.string().optional(),
  is_active: z.boolean().optional(),
});

export const memberRoutes: FastifyPluginAsync = async (fastify) => {
  // List members
  fastify.get('/', {
    preHandler: [fastify.authenticate, requireRole(['super_admin', 'hr_admin', 'department_admin',
      'meeting_organizer', 'training_coordinator', 'auditor', 'participant'])],
  }, async (request, reply) => {
    const { orgId } = request.params as { orgId: string };
    const { role, dept } = request.query as { role?: string; dept?: string };

    let query = adminDb
      .from('organization_members')
      .select(`
        *,
        profile:profiles (id, full_name, email, avatar_url),
        department:departments (id, name)
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (role) query = query.eq('role', role);
    if (dept) query = query.eq('department_id', dept);

    const { data, error } = await query;
    if (error) throw mapDbError(error);
    return reply.send(data);
  });

  // Invite single member
  fastify.post('/invite', {
    preHandler: [fastify.authenticate, requireRole(['super_admin', 'hr_admin'])],
  }, async (request, reply) => {
    const { orgId } = request.params as { orgId: string };
    const body = inviteSchema.parse(request.body);

    const inviteToken = randomBytes(32).toString('hex');

    // Check if a Supabase user with this email already exists
    const { data: existingProfile } = await adminDb
      .from('profiles')
      .select('id')
      .eq('email', body.email)
      .single();

    const { data: invitation, error: invError } = await adminDb
      .from('invitations')
      .insert({
        organization_id: orgId,
        invitation_type: 'email',
        invited_by: request.authUser.id,
        token: inviteToken,
        email: body.email,
        full_name: body.full_name || body.email.split('@')[0],
        designation: body.designation,
        user_id: existingProfile?.id ?? null,
        org_role: body.role,    // store intended role for new users joining later
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .select('id, token')
      .single();

    if (invError) throw mapDbError(invError);

    // If user already exists, add them to the org immediately
    if (existingProfile) {
      const { error: memberError } = await adminDb
        .from('organization_members')
        .upsert({
          organization_id: orgId,
          user_id: existingProfile.id,
          role: body.role,
          department_id: body.department_id ?? null,
          designation: body.designation ?? null,
          employee_id: body.employee_id ?? null,
          invited_by: request.authUser.id,
          is_active: true,
          joined_at: new Date().toISOString(),
        }, { onConflict: 'organization_id,user_id' });

      if (memberError) throw mapDbError(memberError);
    }

    const joinUrl = `${appConfig.APP_URL}/join/${inviteToken}`;
    await sendInvitationEmail({
      to: body.email,
      recipientName: body.full_name,
      orgName: request.orgMember.organization.name,
      eventTitle: `${request.orgMember.organization.name} — Team Invitation`,
      eventDate: new Date().toLocaleDateString('en-KE'),
      attendanceUrl: joinUrl,
    });

    await adminDb.from('audit_logs').insert({
      organization_id: orgId,
      user_id: request.authUser.id,
      action: 'user_invited',
      entity_type: 'invitations',
      entity_id: invitation.id,
      metadata: { email: body.email, role: body.role },
    });

    return reply.status(201).send({ message: 'Invitation sent.', invitationId: invitation.id });
  });

  // Bulk invite
  fastify.post('/bulk', {
    preHandler: [fastify.authenticate, requireRole(['super_admin', 'hr_admin'])],
  }, async (request, reply) => {
    const { orgId } = request.params as { orgId: string };
    const { members } = bulkInviteSchema.parse(request.body);

    const results: { email: string; status: 'invited' | 'error'; message?: string }[] = [];

    // Process in parallel batches of 20 to avoid overloading the DB
    const BATCH_SIZE = 20;
    for (let i = 0; i < members.length; i += BATCH_SIZE) {
      const batch = members.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(async (member) => {
          try {
            const inviteToken = randomBytes(32).toString('hex');
            await adminDb.from('invitations').insert({
              organization_id: orgId,
              invitation_type: 'bulk_upload',
              invited_by: request.authUser.id,
              token: inviteToken,
              email: member.email,
              full_name: member.full_name,
              designation: member.designation,
              status: 'sent',
              sent_at: new Date().toISOString(),
            });

            const joinUrl = `${appConfig.APP_URL}/join/${inviteToken}`;
            await sendInvitationEmail({
              to: member.email,
              recipientName: member.full_name,
              orgName: request.orgMember.organization.name,
              eventTitle: `${request.orgMember.organization.name} — Team Invitation`,
              eventDate: new Date().toLocaleDateString('en-KE'),
              attendanceUrl: joinUrl,
            });

            results.push({ email: member.email, status: 'invited' });
          } catch {
            results.push({ email: member.email, status: 'error', message: 'Failed to invite.' });
          }
        }),
      );
    }

    return reply.send({ results });
  });

  // Update member role/department
  fastify.patch('/:memberId', {
    preHandler: [fastify.authenticate, requireRole(['super_admin', 'hr_admin'])],
  }, async (request, reply) => {
    const { orgId, memberId } = request.params as { orgId: string; memberId: string };
    const body = updateMemberSchema.parse(request.body);

    const { data, error } = await adminDb
      .from('organization_members')
      .update(body)
      .eq('id', memberId)
      .eq('organization_id', orgId)
      .select('*')
      .single();

    if (error) throw mapDbError(error);
    if (!data) throw new AppError('Member not found.', 404);

    // Invalidate cache for this user+org combination
    membershipCache.delete(`${data.user_id}:${orgId}`);

    await adminDb.from('audit_logs').insert({
      organization_id: orgId,
      user_id: request.authUser.id,
      action: 'user_role_changed',
      entity_type: 'organization_members',
      entity_id: memberId,
      metadata: { changes: body },
    });

    return reply.send(data);
  });

  // Remove member
  fastify.delete('/:memberId', {
    preHandler: [fastify.authenticate, requireRole(['super_admin'])],
  }, async (request, reply) => {
    const { orgId, memberId } = request.params as { orgId: string; memberId: string };

    const { data: member, error: fetchErr } = await adminDb
      .from('organization_members')
      .select('user_id')
      .eq('id', memberId)
      .eq('organization_id', orgId)
      .single();

    if (fetchErr || !member) throw new AppError('Member not found.', 404);

    const { error } = await adminDb
      .from('organization_members')
      .update({ is_active: false })
      .eq('id', memberId)
      .eq('organization_id', orgId);

    if (error) throw mapDbError(error);

    membershipCache.delete(`${member.user_id}:${orgId}`);

    await adminDb.from('audit_logs').insert({
      organization_id: orgId,
      user_id: request.authUser.id,
      action: 'user_removed',
      entity_type: 'organization_members',
      entity_id: memberId,
      metadata: {},
    });

    return reply.status(204).send();
  });
};
