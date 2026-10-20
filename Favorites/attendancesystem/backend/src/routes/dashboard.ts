import type { FastifyPluginAsync } from 'fastify';
import { adminDb } from '../lib/supabase';
import { AppError, mapDbError } from '../lib/errors';
import { requireRole } from '../hooks/requireRole';

const canView = [
  'super_admin', 'hr_admin', 'department_admin',
  'meeting_organizer', 'training_coordinator', 'auditor',
] as const;

export const dashboardRoutes: FastifyPluginAsync = async (fastify) => {
  // Org overview — all stats in a single round trip using Promise.all
  fastify.get('/', {
    preHandler: [fastify.authenticate, requireRole([...canView])],
  }, async (request, reply) => {
    const { orgId } = request.params as { orgId: string };

    const [
      meetingStats,
      trainingStats,
      recentMeetings,
      upcomingMeetings,
      _topMembers,
      attendanceTrend,
    ] = await Promise.all([
      // Total meetings by status
      adminDb
        .from('meetings')
        .select('status', { count: 'exact' })
        .eq('organization_id', orgId),

      // Total training events by status
      adminDb
        .from('training_events')
        .select('status', { count: 'exact' })
        .eq('organization_id', orgId),

      // 5 most recent meetings with attendance count
      adminDb
        .from('v_meeting_attendance_summary')
        .select('meeting_id, title, scheduled_date, meeting_type, status, total_signed, attendance_pct')
        .eq('organization_id', orgId)
        .order('scheduled_date', { ascending: false })
        .limit(5),

      // Next 5 upcoming meetings
      adminDb
        .from('meetings')
        .select('id, title, scheduled_date, start_time, meeting_type, status')
        .eq('organization_id', orgId)
        .gte('scheduled_date', new Date().toISOString().slice(0, 10))
        .in('status', ['published', 'open'])
        .order('scheduled_date')
        .limit(5),

      // Top 5 members by meetings organized
      adminDb
        .from('meetings')
        .select('created_by, profiles:profiles!meetings_created_by_fkey(full_name)', { count: 'exact' })
        .eq('organization_id', orgId),

      // Attendance trend: last 30 days, records per day
      adminDb
        .from('attendance_records')
        .select('signed_at')
        .eq('organization_id', orgId)
        .gte('signed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('signed_at'),
    ]);

    // Aggregate meeting statuses
    const meetingsByStatus: Record<string, number> = {};
    (meetingStats.data ?? []).forEach((r) => {
      const s = (r as { status: string }).status;
      meetingsByStatus[s] = (meetingsByStatus[s] ?? 0) + 1;
    });

    // Attendance trend by day
    const trendMap = new Map<string, number>();
    (attendanceTrend.data ?? []).forEach((r) => {
      const day = (r.signed_at as string).slice(0, 10);
      trendMap.set(day, (trendMap.get(day) ?? 0) + 1);
    });
    const trend = Array.from(trendMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return reply.send({
      meetings: {
        by_status: meetingsByStatus,
        total: meetingStats.count ?? 0,
      },
      training: {
        total: trainingStats.count ?? 0,
      },
      recent_meetings:   recentMeetings.data   ?? [],
      upcoming_meetings: upcomingMeetings.data  ?? [],
      attendance_trend:  trend,
    });
  });

  // Department-level attendance breakdown
  fastify.get('/by-department', {
    preHandler: [fastify.authenticate, requireRole(['super_admin', 'hr_admin', 'auditor'])],
  }, async (request, reply) => {
    const { orgId } = request.params as { orgId: string };

    const { data: depts, error } = await adminDb
      .from('departments')
      .select('id, name')
      .eq('organization_id', orgId);

    if (error) throw mapDbError(error);

    const results = await Promise.all(
      (depts ?? []).map(async (dept) => {
        const { count: meetingCount } = await adminDb
          .from('meetings')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', orgId)
          .eq('department_id', dept.id);

        const { count: signedCount } = await adminDb
          .from('attendance_records')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', orgId)
          .eq('department_name', dept.name);

        return {
          department_id:   dept.id,
          department_name: dept.name,
          meetings:        meetingCount ?? 0,
          total_signed:    signedCount  ?? 0,
        };
      }),
    );

    return reply.send(results);
  });

  // Audit log viewer — last 200 events for this org
  fastify.get('/audit', {
    preHandler: [fastify.authenticate, requireRole(['super_admin', 'hr_admin', 'auditor'])],
  }, async (request, reply) => {
    const { orgId } = request.params as { orgId: string };
    const { action, entity_type, limit = '100', offset = '0' } =
      request.query as Record<string, string>;

    let query = adminDb
      .from('audit_logs')
      .select(`
        id, action, entity_type, entity_id, metadata, ip_address,
        created_at,
        actor:profiles!audit_logs_user_id_fkey (id, full_name, email)
      `, { count: 'exact' })
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (action)      query = query.eq('action', action);
    if (entity_type) query = query.eq('entity_type', entity_type);

    const { data, error, count } = await query;
    if (error) throw mapDbError(error);
    return reply.send({ data, total: count });
  });

  // Platform-wide stats — platform owner only
  fastify.get('/platform', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    if (request.authUser.platform_role !== 'platform_owner') {
      throw new AppError('You do not have permission to view this.', 403);
    }

    const [orgCount, userCount, meetingCount, signatureCount] = await Promise.all([
      adminDb.from('organizations').select('id', { count: 'exact', head: true }),
      adminDb.from('profiles').select('id', { count: 'exact', head: true }),
      adminDb.from('meetings').select('id', { count: 'exact', head: true }),
      adminDb.from('attendance_records').select('id', { count: 'exact', head: true }),
    ]);

    return reply.send({
      total_organizations: orgCount.count ?? 0,
      total_users:         userCount.count ?? 0,
      total_meetings:      meetingCount.count ?? 0,
      total_signatures:    signatureCount.count ?? 0,
    });
  });
};
