import type { FastifyRequest, FastifyReply } from 'fastify';
import { adminDb } from '../lib/supabase';
import { AppError } from '../lib/errors';
import { membershipCache, orgSettingsCache } from '../lib/cache';
import type { OrgMemberRole, OrgMember, Organization } from '../types';

// Returns a Fastify preHandler that:
//  1. Reads :orgId from the URL params
//  2. Loads the caller's org membership (with caching)
//  3. Rejects if their role isn't in the allowedRoles list
//  4. Sets request.orgMember for downstream use
export function requireRole(allowedRoles: OrgMemberRole[]) {
  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    const { orgId } = request.params as { orgId?: string };
    if (!orgId) throw new AppError('Missing orgId in route.', 500);

    const userId = request.authUser.id;

    // Platform owners bypass all org-level role checks
    if (request.authUser.platform_role === 'platform_owner') {
      const org = await loadOrg(orgId);
      request.orgMember = {
        id: 'platform-owner',
        organization_id: orgId,
        user_id: userId,
        role: 'super_admin',
        department_id: null,
        designation: null,
        employee_id: null,
        is_active: true,
        invited_by: null,
        joined_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        organization: org,
      };
      return;
    }

    const cacheKey = `${userId}:${orgId}`;
    let member = membershipCache.get(cacheKey) as (OrgMember & { organization?: Organization }) | null | undefined;

    if (member === undefined) {
      const { data, error } = await adminDb
        .from('organization_members')
        .select(`
          *,
          organization:organizations (*)
        `)
        .eq('organization_id', orgId)
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      member = error ? null : (data as OrgMember & { organization: Organization });
      membershipCache.set(cacheKey, member);
    }

    if (!member) {
      throw new AppError('You do not have access to this organization.', 403);
    }

    if (!member.is_active) {
      throw new AppError('Your access to this organization has been turned off. Please contact your admin.', 403);
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(member.role)) {
      throw new AppError('You do not have permission to do that.', 403);
    }

    const org = (member as { organization?: Organization }).organization ?? await loadOrg(orgId);
    request.orgMember = { ...member, organization: org };
  };
}

async function loadOrg(orgId: string): Promise<Organization> {
  let org = orgSettingsCache.get(orgId);
  if (!org) {
    const { data, error } = await adminDb
      .from('organizations')
      .select('*')
      .eq('id', orgId)
      .single();
    if (error || !data) throw new AppError('Organization not found.', 404);
    org = data as Organization;
    orgSettingsCache.set(orgId, org);
  }
  return org;
}

// Shorthand for routes that only check membership (any role)
export function requireMember() {
  return requireRole([
    'super_admin', 'hr_admin', 'department_admin',
    'meeting_organizer', 'training_coordinator', 'auditor', 'participant',
  ]);
}
