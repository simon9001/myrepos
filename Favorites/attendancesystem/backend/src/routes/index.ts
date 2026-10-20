import type { FastifyPluginAsync } from 'fastify';
import { authRoutes } from './auth';
import { organizationRoutes } from './organizations';
import { departmentRoutes } from './departments';
import { memberRoutes } from './members';
import { templateRoutes } from './templates';
import { meetingRoutes } from './meetings';
import { trainingRoutes } from './training';
import { attendanceRoutes } from './attendance';
import { invitationRoutes } from './invitations';
import { qrRoutes } from './qrcodes';
import { documentRoutes } from './documents';
import { notificationRoutes } from './notifications';
import { dashboardRoutes } from './dashboard';

export const registerRoutes: FastifyPluginAsync = async (fastify) => {
  // ── Public (no auth) ──────────────────────────────────────────────────────
  await fastify.register(authRoutes,       { prefix: '/auth' });
  await fastify.register(attendanceRoutes, { prefix: '/attend' });

  // ── Authenticated ─────────────────────────────────────────────────────────
  await fastify.register(organizationRoutes,  { prefix: '/orgs' });
  await fastify.register(departmentRoutes,    { prefix: '/orgs/:orgId/departments' });
  await fastify.register(memberRoutes,        { prefix: '/orgs/:orgId/members' });
  await fastify.register(templateRoutes,      { prefix: '/orgs/:orgId/templates' });
  await fastify.register(meetingRoutes,       { prefix: '/orgs/:orgId/meetings' });
  await fastify.register(trainingRoutes,      { prefix: '/orgs/:orgId/training' });
  await fastify.register(invitationRoutes,    { prefix: '/orgs/:orgId/invitations' });
  await fastify.register(qrRoutes,            { prefix: '/orgs/:orgId/qr' });
  await fastify.register(documentRoutes,      { prefix: '/orgs/:orgId/documents' });
  await fastify.register(notificationRoutes,  { prefix: '/notifications' });
  await fastify.register(dashboardRoutes,     { prefix: '/orgs/:orgId/dashboard' });
};
