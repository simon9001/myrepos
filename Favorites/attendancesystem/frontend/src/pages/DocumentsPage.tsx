import { FolderOpen, FileDown, Search, Archive } from 'lucide-react';
import { Link } from 'react-router-dom';

export function DocumentsPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-h3 font-semibold text-ink">Documents</h1>
        <p className="text-sm text-steel mt-0.5">
          Meeting minutes, attendance registers, and organization documents.
        </p>
      </div>

      <div className="bg-canvas border border-hairline rounded-lg shadow-card overflow-hidden mb-6">
        <div className="bg-card-cream border-b border-hairline px-6 py-4 flex items-center gap-3">
          <span className="inline-flex items-center px-2.5 py-1 bg-slate text-white text-xs font-semibold rounded-full">
            Coming soon
          </span>
          <span className="text-sm text-steel">Document centre is under development</span>
        </div>
        <div className="px-6 py-12 text-center">
          <div className="w-20 h-20 rounded-2xl bg-card-cream flex items-center justify-center mx-auto mb-5">
            <FolderOpen size={36} className="text-slate" />
          </div>
          <h2 className="text-h4 font-semibold text-ink mb-3">Document Centre</h2>
          <p className="text-sm text-steel max-w-md mx-auto">
            A central repository for all meeting-related documents — signed attendance
            registers, generated minutes, uploaded agendas, and org-wide policy files.
          </p>
        </div>
      </div>

      <p className="text-xs font-semibold text-steel uppercase tracking-wide mb-3">What's coming</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon:  <FileDown size={20} className="text-brand-teal" />,
            tint:  'bg-card-sky',
            title: 'Auto-generated registers',
            desc:  'Signed attendance sheets generated automatically after each meeting.',
          },
          {
            icon:  <Search size={20} className="text-primary" />,
            tint:  'bg-card-lavender',
            title: 'Full-text search',
            desc:  'Find any document by meeting name, date, attendee, or keyword.',
          },
          {
            icon:  <Archive size={20} className="text-brand-orange-deep" />,
            tint:  'bg-card-peach',
            title: 'Long-term archiving',
            desc:  'Documents stored securely with audit trail for compliance.',
          },
          {
            icon:  <FolderOpen size={20} className="text-success" />,
            tint:  'bg-card-mint',
            title: 'Folder organisation',
            desc:  'Group documents by department, project, or date range.',
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
        Meeting attendance records are already downloadable from each{' '}
        <Link to="/meetings" className="text-[#0075de] hover:underline">meeting page</Link>.
      </p>
    </div>
  );
}
