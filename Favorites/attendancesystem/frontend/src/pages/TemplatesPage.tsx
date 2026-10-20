import { FileText, Download, Upload, Wand2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function TemplatesPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-h3 font-semibold text-ink">Templates</h1>
        <p className="text-sm text-steel mt-0.5">
          Meeting agenda and attendance sheet templates.
        </p>
      </div>

      <div className="bg-canvas border border-hairline rounded-lg shadow-card overflow-hidden mb-6">
        <div className="bg-card-peach border-b border-hairline px-6 py-4 flex items-center gap-3">
          <span className="inline-flex items-center px-2.5 py-1 bg-brand-orange-deep text-white text-xs font-semibold rounded-full">
            Coming soon
          </span>
          <span className="text-sm text-steel">Templates module is under development</span>
        </div>
        <div className="px-6 py-12 text-center">
          <div className="w-20 h-20 rounded-2xl bg-card-peach flex items-center justify-center mx-auto mb-5">
            <FileText size={36} className="text-brand-orange-deep" />
          </div>
          <h2 className="text-h4 font-semibold text-ink mb-3">Meeting Templates</h2>
          <p className="text-sm text-steel max-w-md mx-auto mb-8">
            Upload Word (.docx) or PDF templates for meeting agendas and attendance registers.
            The system will auto-fill participant details and generate ready-to-sign documents.
          </p>
        </div>
      </div>

      <p className="text-xs font-semibold text-steel uppercase tracking-wide mb-3">What's coming</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            icon:  <Upload size={20} className="text-brand-orange-deep" />,
            tint:  'bg-card-peach',
            title: 'Upload templates',
            desc:  'Upload your own Word or PDF templates with merge fields.',
          },
          {
            icon:  <Wand2 size={20} className="text-primary" />,
            tint:  'bg-card-lavender',
            title: 'Auto-fill fields',
            desc:  'Meeting title, date, venue, and attendee list filled automatically.',
          },
          {
            icon:  <Download size={20} className="text-success" />,
            tint:  'bg-card-mint',
            title: 'One-click export',
            desc:  'Download completed attendance registers as PDF or Word.',
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
        Attendance records are already captured —{' '}
        <Link to="/meetings" className="text-[#0075de] hover:underline">view your meetings</Link>
        {' '}to download them.
      </p>
    </div>
  );
}
