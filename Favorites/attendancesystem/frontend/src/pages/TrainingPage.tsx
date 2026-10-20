import { GraduationCap, CalendarDays, Users, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export function TrainingPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-h3 font-semibold text-ink">Training</h1>
        <p className="text-sm text-steel mt-0.5">
          Manage training events, sessions, and attendee records.
        </p>
      </div>

      {/* Coming soon banner */}
      <div className="bg-canvas border border-hairline rounded-lg shadow-card overflow-hidden mb-6">
        <div className="bg-card-lavender border-b border-hairline px-6 py-4 flex items-center gap-3">
          <span className="inline-flex items-center px-2.5 py-1 bg-primary text-white text-xs font-semibold rounded-full">
            Coming soon
          </span>
          <span className="text-sm text-steel">Training module is under development</span>
        </div>
        <div className="px-6 py-12 text-center">
          <div className="w-20 h-20 rounded-2xl bg-card-lavender flex items-center justify-center mx-auto mb-5">
            <GraduationCap size={36} className="text-primary" />
          </div>
          <h2 className="text-h4 font-semibold text-ink mb-3">Training &amp; Development Hub</h2>
          <p className="text-sm text-steel max-w-md mx-auto mb-8">
            Schedule training events, track attendance across multiple sessions, issue
            certificates, and generate completion reports — all from one place.
          </p>
        </div>
      </div>

      {/* Feature preview cards */}
      <p className="text-xs font-semibold text-steel uppercase tracking-wide mb-3">What's coming</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            icon:  <CalendarDays size={20} className="text-primary" />,
            tint:  'bg-card-lavender',
            title: 'Training events',
            desc:  'Create multi-day training programmes with multiple sessions.',
          },
          {
            icon:  <Users size={20} className="text-success" />,
            tint:  'bg-card-mint',
            title: 'Attendance tracking',
            desc:  'Capture signatures, photos, and OTP-verified attendance per session.',
          },
          {
            icon:  <FileText size={20} className="text-brand-orange-deep" />,
            tint:  'bg-card-peach',
            title: 'Reports & certificates',
            desc:  'Export attendance sheets and auto-generate participation certificates.',
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
        In the meantime, use{' '}
        <Link to="/meetings" className="text-[#0075de] hover:underline">Meetings</Link>
        {' '}to track attendance for any session.
      </p>
    </div>
  );
}
