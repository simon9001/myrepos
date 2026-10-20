import { QrCode, Link2, Smartphone, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { selectActiveOrgId } from '@/features/auth/authSlice';
import { useGetMeetingsQuery } from '@/features/meetings/meetingsApi';

export function QrPage() {
  const orgId = useAppSelector(selectActiveOrgId);
  const { data: meetings } = useGetMeetingsQuery(
    { org_id: orgId ?? '', limit: 20 },
    { skip: !orgId },
  );

  const openMeetings = (meetings?.data ?? []).filter(m => m.status === 'open').slice(0, 5);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-h3 font-semibold text-ink">QR Codes</h1>
        <p className="text-sm text-steel mt-0.5">
          Generate and share QR codes for contactless attendance sign-in.
        </p>
      </div>

      {/* Live meetings callout */}
      {openMeetings.length > 0 && (
        <div className="bg-card-mint border border-hairline rounded-lg p-5 mb-6">
          <p className="text-sm font-semibold text-success mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success inline-block animate-pulse" />
            {openMeetings.length} meeting{openMeetings.length > 1 ? 's' : ''} currently open for attendance
          </p>
          <div className="space-y-2">
            {openMeetings.map(m => (
              <Link
                key={m.id}
                to={`/meetings/${m.id}`}
                className="flex items-center justify-between bg-canvas border border-hairline rounded-md px-4 py-3 hover:border-primary transition-colors group"
              >
                <span className="text-sm font-medium text-ink group-hover:text-primary">{m.title}</span>
                <span className="text-xs text-[#0075de]">View &amp; share link →</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="bg-canvas border border-hairline rounded-lg shadow-card overflow-hidden mb-6">
        <div className="bg-card-sky border-b border-hairline px-6 py-4 flex items-center gap-3">
          <span className="inline-flex items-center px-2.5 py-1 bg-brand-teal text-white text-xs font-semibold rounded-full">
            Coming soon
          </span>
          <span className="text-sm text-steel">QR code generator is under development</span>
        </div>
        <div className="px-6 py-12 text-center">
          <div className="w-20 h-20 rounded-2xl bg-card-sky flex items-center justify-center mx-auto mb-5">
            <QrCode size={36} className="text-brand-teal" />
          </div>
          <h2 className="text-h4 font-semibold text-ink mb-3">Contactless Sign-in</h2>
          <p className="text-sm text-steel max-w-md mx-auto">
            Generate a QR code for any meeting. Participants scan it with their phone to open
            the attendance page — no app install needed. Display it on-screen or print it at the venue.
          </p>
        </div>
      </div>

      <p className="text-xs font-semibold text-steel uppercase tracking-wide mb-3">What's coming</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon:  <QrCode size={20} className="text-brand-teal" />,
            tint:  'bg-card-sky',
            title: 'Per-meeting QR codes',
            desc:  'Unique QR code per meeting, valid only while the meeting is open.',
          },
          {
            icon:  <Smartphone size={20} className="text-primary" />,
            tint:  'bg-card-lavender',
            title: 'Mobile-friendly sign-in',
            desc:  'Attendees sign on their phone screen — no printer required.',
          },
          {
            icon:  <Shield size={20} className="text-success" />,
            tint:  'bg-card-mint',
            title: 'Fraud prevention',
            desc:  'One submission per device, GPS location capture, and time-locked tokens.',
          },
        ].map(f => (
          <div key={f.title} className="bg-canvas border border-hairline rounded-lg p-5 shadow-card">
            <div className={`w-10 h-10 rounded-lg ${f.tint} flex items-center justify-center mb-3`}>
              {f.icon}
            </div>
            <h3 className="text-sm font-semibold text-ink mb-1">{f.title}</h3>
            <p className="text-xs text-steel leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      <p className="mt-8 text-sm text-steel text-center">
        Attendance links already work today —{' '}
        <Link to="/meetings" className="text-[#0075de] hover:underline">open a meeting</Link>
        {' '}to copy the sign-in URL.
      </p>
    </div>
  );
}
