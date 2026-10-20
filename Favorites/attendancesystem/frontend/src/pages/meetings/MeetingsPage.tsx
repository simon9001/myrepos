import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Calendar } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { selectActiveOrgId } from '@/features/auth/authSlice';
import {
  useGetMeetingsQuery,
  useCreateMeetingMutation,
} from '@/features/meetings/meetingsApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MeetingStatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/Spinner';
import { format, parseISO } from 'date-fns';

function fmtDate(iso: string) {
  try { return format(parseISO(iso), 'MMM d, yyyy · h:mm a'); } catch { return iso; }
}

export function MeetingsPage() {
  const orgId = useAppSelector(selectActiveOrgId);

  const [search,  setSearch]  = useState('');
  const [page,    setPage]    = useState(1);
  const [showNew, setShowNew] = useState(false);

  const { data, isLoading } = useGetMeetingsQuery(
    { org_id: orgId ?? '', search: search || undefined, page, limit: 20 },
    { skip: !orgId }
  );

  if (isLoading && !data) return <PageLoader />;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-h4 font-semibold text-ink flex-1 min-w-max">Meetings</h1>
        <div className="w-56">
          <Input
            placeholder="Search meetings…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            iconLeft={<Search size={15} />}
          />
        </div>
        <Button size="sm" iconLeft={<Plus size={15} />} onClick={() => setShowNew(true)}>
          New meeting
        </Button>
      </div>

      {/* Table */}
      <div className="bg-canvas border border-hairline rounded-lg overflow-hidden shadow-card">
        <div className="divide-y divide-hairline">
          {data?.data && data.data.length > 0 ? (
            data.data.map(m => (
              <Link
                key={m.id}
                to={`/meetings/${m.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-surface transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink truncate">{m.title}</p>
                  <p className="text-xs text-steel mt-0.5">{fmtDate(m.scheduled_at)}</p>
                  {m.location && (
                    <p className="text-xs text-stone mt-0.5 truncate">{m.location}</p>
                  )}
                </div>
                <div className="ml-4 flex items-center gap-4 flex-shrink-0">
                  <span className="text-xs text-stone hidden sm:block">
                    {m.expected_attendees ?? '—'} expected
                  </span>
                  <MeetingStatusBadge status={m.status} />
                </div>
              </Link>
            ))
          ) : (
            <div className="px-6 py-14 text-center">
              <Calendar size={36} className="text-stone mx-auto mb-3" />
              <p className="text-sm text-steel">
                {search ? 'No meetings match your search.' : 'No meetings yet. Create your first one!'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {data && data.total > 20 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-hairline text-sm text-steel">
            <span>
              {(page - 1) * 20 + 1}–{Math.min(page * 20, data.total)} of {data.total}
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                Previous
              </Button>
              <Button size="sm" variant="secondary" disabled={page * 20 >= data.total} onClick={() => setPage(p => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {showNew && <NewMeetingModal orgId={orgId!} onClose={() => setShowNew(false)} />}
    </div>
  );
}

/* ---- New Meeting Modal ---- */

interface NewMeetingModalProps { orgId: string; onClose: () => void; }

function NewMeetingModal({ orgId, onClose }: NewMeetingModalProps) {
  const [createMeeting, { isLoading }] = useCreateMeetingMutation();

  const [form, setForm] = useState({
    title:              '',
    scheduled_at:       '',
    location:           '',
    expected_attendees: '',
    description:        '',
  });
  const [error, setError] = useState('');

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await createMeeting({
        org_id:             orgId,
        title:              form.title,
        scheduled_at:       form.scheduled_at,
        location:           form.location || undefined,
        description:        form.description || undefined,
        expected_attendees: form.expected_attendees ? Number(form.expected_attendees) : undefined,
      }).unwrap();
      onClose();
    } catch (err: unknown) {
      setError((err as { data?: { error?: string } })?.data?.error ?? 'Failed to create meeting.');
    }
  };

  return (
    <Modal title="New meeting" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="px-4 py-3 bg-card-rose rounded-md text-sm text-danger">{error}</div>
        )}
        <Input label="Title" placeholder="Weekly team sync" value={form.title} onChange={set('title')} required />
        <Input label="Date & time" type="datetime-local" value={form.scheduled_at} onChange={set('scheduled_at')} required />
        <Input label="Location (optional)" placeholder="Room 201 or Zoom link" value={form.location} onChange={set('location')} />
        <Input label="Expected attendees" type="number" min="1" placeholder="20" value={form.expected_attendees} onChange={set('expected_attendees')} />
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Description (optional)</label>
          <textarea
            className="w-full border border-hairline rounded-md px-3 py-2.5 text-sm text-ink placeholder:text-stone focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none"
            rows={3}
            placeholder="Add agenda or notes…"
            value={form.description}
            onChange={set('description')}
          />
        </div>
        <div className="flex gap-3 justify-end pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isLoading}>Create meeting</Button>
        </div>
      </form>
    </Modal>
  );
}
