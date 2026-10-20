import { useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import { CheckCircle, RotateCcw } from 'lucide-react';
import { useGetInviteContextQuery, useSubmitAttendanceMutation } from '@/features/attendance/attendanceApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageLoader } from '@/components/ui/Spinner';
import { APP_NAME } from '@/config/api';

export function AttendPage() {
  const { token } = useParams<{ token: string }>();

  const { data: ctx, isLoading, isError } = useGetInviteContextQuery(token!, { skip: !token });
  const [submitAttendance, { isLoading: submitting }] = useSubmitAttendanceMutation();

  const sigRef = useRef<SignatureCanvas>(null);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', department_name: '' });
  const [errors, setErrors]  = useState<Record<string, string>>({});
  const [error, setError]    = useState('');
  const [done, setDone]      = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.full_name.trim()) e.full_name = 'Full name is required.';
    if (!form.email.includes('@')) e.email  = 'Valid email required.';
    if (!sigRef.current || sigRef.current.isEmpty()) e.signature = 'Please draw your signature.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate() || !token) return;

    const signatureData = sigRef.current!.toDataURL('image/png');

    try {
      await submitAttendance({
        token,
        full_name:       form.full_name,
        email:           form.email || undefined,
        phone:           form.phone || undefined,
        department_name: form.department_name || undefined,
        signature_data:  signatureData,
      }).unwrap();
      setDone(true);
    } catch (err: unknown) {
      setError((err as { data?: { error?: string } })?.data?.error ?? 'Submission failed. Please try again.');
    }
  };

  if (isLoading) return <PageLoader />;

  if (isError || !ctx) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
        <div className="bg-canvas border border-hairline rounded-lg p-8 max-w-sm w-full text-center shadow-card">
          <h2 className="text-h5 font-semibold text-ink mb-2">Link not found</h2>
          <p className="text-sm text-steel">
            This attendance link is invalid or has expired. Please contact your meeting organizer.
          </p>
        </div>
      </div>
    );
  }

  if (ctx.meeting?.status !== 'open') {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
        <div className="bg-canvas border border-hairline rounded-lg p-8 max-w-sm w-full text-center shadow-card">
          <h2 className="text-h5 font-semibold text-ink mb-2">Attendance is closed</h2>
          <p className="text-sm text-steel">
            The attendance window for <strong>{ctx.meeting?.title}</strong> is no longer open.
          </p>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
        <div className="bg-canvas border border-hairline rounded-lg p-8 max-w-sm w-full text-center shadow-card">
          <CheckCircle size={44} className="text-success mx-auto mb-4" />
          <h2 className="text-h5 font-semibold text-ink mb-2">You&apos;re signed in!</h2>
          <p className="text-sm text-steel">
            Your attendance for <strong>{ctx.meeting?.title}</strong> has been recorded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <div className="bg-brand-navy py-8 px-6 text-center">
        <div className="inline-flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">AT</span>
          </div>
          <span className="text-white font-semibold text-base">{APP_NAME}</span>
        </div>
        <h1 className="text-white font-semibold text-lg">{ctx.meeting.title}</h1>
        <p className="text-white/60 text-sm mt-1">
          Sign attendance below to confirm your presence
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-start justify-center px-4 pb-12">
        <div className="w-full max-w-md bg-canvas border border-hairline rounded-lg shadow-mockup p-6 mt-[-16px]">
          {error && (
            <div className="mb-4 px-4 py-3 bg-card-rose rounded-md text-sm text-danger">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full name *"
              placeholder="Your full name"
              value={form.full_name}
              onChange={set('full_name')}
              error={errors.full_name}
              required
            />
            <Input
              label="Email address *"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set('email')}
              error={errors.email}
              required
            />
            <Input
              label="Phone (optional)"
              type="tel"
              placeholder="+1 234 567 8900"
              value={form.phone}
              onChange={set('phone')}
            />
            <Input
              label="Department (optional)"
              placeholder="e.g. Engineering"
              value={form.department_name}
              onChange={set('department_name')}
            />

            {/* Signature pad */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-ink">Signature *</label>
                <button
                  type="button"
                  onClick={() => sigRef.current?.clear()}
                  className="text-xs text-steel hover:text-ink inline-flex items-center gap-1"
                >
                  <RotateCcw size={12} /> Clear
                </button>
              </div>
              <div className={`border rounded-md overflow-hidden ${errors.signature ? 'border-danger' : 'border-hairline'}`}>
                <SignatureCanvas
                  ref={sigRef}
                  penColor="#1a1a1a"
                  backgroundColor="#fefefe"
                  canvasProps={{ width: 420, height: 160, className: 'w-full' }}
                />
              </div>
              {errors.signature && (
                <p className="mt-1 text-xs text-danger">{errors.signature}</p>
              )}
              <p className="mt-1 text-xs text-stone">Draw your signature in the box above.</p>
            </div>

            <Button type="submit" className="w-full" loading={submitting}>
              Submit attendance
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
