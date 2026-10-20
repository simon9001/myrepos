import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Play, Square, Users, QrCode, Copy, Trash2,
  MapPin, Calendar, FileText, Download
} from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { selectActiveMembership } from '@/features/auth/authSlice';
import {
  useGetMeetingQuery,
  useOpenAttendanceMutation,
  useCloseAttendanceMutation,
  useGetAttendanceRecordsQuery,
  useDeleteMeetingMutation,
} from '@/features/meetings/meetingsApi';
import { Button } from '@/components/ui/Button';
import { MeetingStatusBadge } from '@/components/ui/Badge';
import { ConfirmModal } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/Spinner';
import { format, parseISO } from 'date-fns';

function fmtDate(iso: string) {
  try { return format(parseISO(iso), 'MMMM d, yyyy · h:mm a'); } catch { return iso; }
}

export function MeetingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const membership = useAppSelector(selectActiveMembership);
  const canManage  = membership?.role === 'owner' || membership?.role === 'admin';

  const { data: meeting, isLoading } = useGetMeetingQuery(id!, { skip: !id });
  const { data: records }            = useGetAttendanceRecordsQuery(id!, { skip: !id });

  const [openAtt,  { isLoading: opening }] = useOpenAttendanceMutation();
  const [closeAtt, { isLoading: closing }] = useCloseAttendanceMutation();
  const [deleteMtg]                         = useDeleteMeetingMutation();

  const [copied,    setCopied]    = useState(false);
  const [showDel,   setShowDel]   = useState(false);
  const [showQr,    setShowQr]    = useState(false);

  if (isLoading || !meeting) return <PageLoader />;

  const attendLink = `${window.location.origin}/attend/${meeting.id}`;
  const copyLink   = () => {
    navigator.clipboard.writeText(attendLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    await deleteMtg(meeting.id);
    navigate('/meetings');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Back */}
      <Link to="/meetings" className="inline-flex items-center gap-1.5 text-sm text-steel hover:text-ink">
        <ArrowLeft size={15} /> Back to meetings
      </Link>

      {/* Header card */}
      <div className="bg-canvas border border-hairline rounded-lg shadow-card p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-h4 font-semibold text-ink truncate">{meeting.title}</h1>
              <MeetingStatusBadge status={meeting.status} />
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-steel">
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={14} /> {fmtDate(meeting.scheduled_at)}
              </span>
              {meeting.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={14} /> {meeting.location}
                </span>
              )}
              {meeting.expected_attendees && (
                <span className="inline-flex items-center gap-1.5">
                  <Users size={14} /> {meeting.expected_attendees} expected
                </span>
              )}
            </div>
            {meeting.description && (
              <p className="mt-3 text-sm text-steel whitespace-pre-line">{meeting.description}</p>
            )}
          </div>

          {canManage && (
            <div className="flex gap-2 flex-shrink-0 flex-wrap">
              {meeting.status === 'scheduled' && (
                <Button size="sm" iconLeft={<Play size={14} />} loading={opening}
                  onClick={() => openAtt(meeting.id)}>
                  Open attendance
                </Button>
              )}
              {meeting.status === 'open' && (
                <>
                  <Button size="sm" variant="secondary" iconLeft={<QrCode size={14} />}
                    onClick={() => setShowQr(true)}>
                    QR / Link
                  </Button>
                  <Button size="sm" variant="danger" iconLeft={<Square size={14} />} loading={closing}
                    onClick={() => closeAtt(meeting.id)}>
                    Close
                  </Button>
                </>
              )}
              <Button size="sm" variant="secondary" iconLeft={<Trash2 size={14} />}
                onClick={() => setShowDel(true)}>
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Attendance link (shown when open) */}
      {meeting.status === 'open' && (
        <div className="bg-card-mint border border-hairline rounded-lg p-4 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-success mb-0.5">Attendance is OPEN</p>
            <p className="text-sm text-ink truncate font-mono">{attendLink}</p>
          </div>
          <Button size="sm" variant="secondary" iconLeft={<Copy size={13} />} onClick={copyLink}>
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>
      )}

      {/* Attendance records */}
      <div className="bg-canvas border border-hairline rounded-lg overflow-hidden shadow-card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-hairline">
          <h2 className="text-base font-semibold text-ink">
            Attendance records
            {records && (
              <span className="ml-2 text-sm font-normal text-steel">({records.total})</span>
            )}
          </h2>
          {records && records.total > 0 && (
            <Button size="sm" variant="secondary" iconLeft={<Download size={13} />}
              onClick={() => exportCsv(meeting.title, records.data)}>
              Export CSV
            </Button>
          )}
        </div>

        {records && records.data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface border-b border-hairline">
                <tr>
                  <th className="text-left px-6 py-3 font-medium text-steel">Name</th>
                  <th className="text-left px-6 py-3 font-medium text-steel">Department</th>
                  <th className="text-left px-6 py-3 font-medium text-steel">Signed at</th>
                  <th className="text-left px-6 py-3 font-medium text-steel">Signature</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {records.data.map(r => (
                  <tr key={r.id} className="hover:bg-surface transition-colors">
                    <td className="px-6 py-3 text-ink font-medium">{r.attendee_name}</td>
                    <td className="px-6 py-3 text-steel">{r.department_name ?? '—'}</td>
                    <td className="px-6 py-3 text-steel">
                      {r.signed_at ? fmtDate(r.signed_at) : '—'}
                    </td>
                    <td className="px-6 py-3">
                      {r.signature_url ? (
                        <a href={r.signature_url} target="_blank" rel="noopener noreferrer">
                          <img src={r.signature_url} alt="sig" className="h-8 border rounded" />
                        </a>
                      ) : (
                        <span className="text-stone">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-10 text-center">
            <FileText size={32} className="text-stone mx-auto mb-3" />
            <p className="text-sm text-steel">No attendance records yet.</p>
          </div>
        )}
      </div>

      {/* QR modal */}
      {showQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-canvas rounded-lg shadow-modal p-6 w-full max-w-sm space-y-4">
            <h3 className="text-base font-semibold text-ink">Attendance link</h3>
            <div className="bg-surface rounded-md p-3 font-mono text-xs text-ink break-all">
              {attendLink}
            </div>
            <div className="flex gap-3">
              <Button className="flex-1" iconLeft={<Copy size={14} />} onClick={copyLink}>
                {copied ? 'Copied!' : 'Copy link'}
              </Button>
              <Button variant="secondary" onClick={() => setShowQr(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {showDel && (
        <ConfirmModal
          title="Delete meeting"
          message={`Are you sure you want to delete "${meeting.title}"? All attendance records will be lost.`}
          confirmLabel="Delete"
          danger
          onConfirm={handleDelete}
          onClose={() => setShowDel(false)}
        />
      )}
    </div>
  );
}

function exportCsv(title: string, rows: { attendee_name: string; department_name?: string | null; signed_at?: string | null }[]) {
  const header = 'Name,Department,Signed At\n';
  const body   = rows.map(r => `"${r.attendee_name}","${r.department_name ?? ''}","${r.signed_at ?? ''}"`).join('\n');
  const blob   = new Blob([header + body], { type: 'text/csv' });
  const url    = URL.createObjectURL(blob);
  const a      = document.createElement('a');
  a.href       = url;
  a.download   = `${title.replace(/[^a-z0-9]/gi, '_')}_attendance.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
