import { Calendar, Users, CheckSquare, Clock } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { selectActiveOrgId, selectCurrentUser } from '@/features/auth/authSlice';
import { useGetDashboardStatsQuery } from '@/features/dashboard/dashboardApi';
import { useGetMeetingsQuery } from '@/features/meetings/meetingsApi';
import { StatCard } from '@/components/ui/Card';
import { MeetingStatusBadge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Spinner';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';

function formatDate(iso: string) {
  try { return format(parseISO(iso), 'MMM d, h:mm a'); } catch { return iso; }
}

export function DashboardPage() {
  const user    = useAppSelector(selectCurrentUser);
  const orgId   = useAppSelector(selectActiveOrgId);

  const { data: stats,    isLoading: loadingStats }    = useGetDashboardStatsQuery(orgId ?? '', { skip: !orgId });
  const { data: meetings, isLoading: loadingMeetings } = useGetMeetingsQuery(
    { org_id: orgId ?? '', limit: 5 },
    { skip: !orgId }
  );

  if (loadingStats && loadingMeetings) return <PageLoader />;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-h3 font-semibold text-ink">
          {greeting}, {user?.full_name?.split(' ')[0] ?? 'there'} 👋
        </h1>
        <p className="text-sm text-steel mt-1">
          Here&apos;s what&apos;s happening in your workspace today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total meetings"
          value={stats?.total_meetings ?? 0}
          icon={<Calendar size={20} />}
          tint="lavender"
        />
        <StatCard
          label="Total members"
          value={stats?.total_members ?? 0}
          icon={<Users size={20} />}
          tint="mint"
        />
        <StatCard
          label="Attendance records"
          value={stats?.total_attendance ?? 0}
          icon={<CheckSquare size={20} />}
          tint="sky"
        />
        <StatCard
          label="Avg. attendance rate"
          value={stats?.avg_attendance_rate != null ? `${Math.round(stats.avg_attendance_rate)}%` : '—'}
          icon={<Clock size={20} />}
          tint="yellow"
        />
      </div>

      {/* Recent meetings */}
      <div className="bg-canvas border border-hairline rounded-lg overflow-hidden shadow-card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-hairline">
          <h2 className="text-base font-semibold text-ink">Recent meetings</h2>
          <Link to="/meetings" className="text-sm text-[#0075de] hover:underline">
            View all
          </Link>
        </div>

        {loadingMeetings ? (
          <div className="p-6 text-sm text-steel text-center">Loading…</div>
        ) : meetings?.data && meetings.data.length > 0 ? (
          <div className="divide-y divide-hairline">
            {meetings.data.map(m => (
              <Link
                key={m.id}
                to={`/meetings/${m.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-surface transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{m.title}</p>
                  <p className="text-xs text-steel mt-0.5">{formatDate(m.scheduled_at)}</p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <MeetingStatusBadge status={m.status} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-6 py-10 text-center">
            <Calendar size={32} className="text-stone mx-auto mb-3" />
            <p className="text-sm text-steel">No meetings yet.</p>
            <Link to="/meetings" className="mt-2 inline-block text-sm text-[#0075de] hover:underline">
              Create your first meeting
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
