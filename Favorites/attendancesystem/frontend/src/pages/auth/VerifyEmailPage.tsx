import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, RefreshCw } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { selectCurrentUser, userUpdated } from '@/features/auth/authSlice';
import { useVerifyEmailMutation, useResendVerificationMutation } from '@/features/auth/authApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { APP_NAME } from '@/config/api';

export function VerifyEmailPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const dispatch  = useAppDispatch();
  const user      = useAppSelector(selectCurrentUser);

  // Email can come from the Redux store (registration path) or from
  // navigation state (unverified-login path where no tokens are set yet).
  const stateEmail  = (location.state as { email?: string; fromLogin?: boolean } | null)?.email;
  const fromLogin   = (location.state as { fromLogin?: boolean } | null)?.fromLogin === true;
  const email       = user?.email ?? stateEmail ?? '';

  const [verify,  { isLoading: verifying }]  = useVerifyEmailMutation();
  const [resend,  { isLoading: resending }]   = useResendVerificationMutation();

  const [code,   setCode]   = useState('');
  const [error,  setError]  = useState('');
  const [done,   setDone]   = useState(false);
  const [resent, setResent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setError('');
    try {
      await verify({ email, code }).unwrap();

      if (fromLogin) {
        // User was not logged in — send them back to login with a success banner.
        navigate('/login', { state: { verified: true }, replace: true });
        return;
      }

      // User is logged in (registration path) — update local state and proceed.
      dispatch(userUpdated({ email_verified: true }));
      setDone(true);
      const hasMemberships = (user?.memberships?.length ?? 0) > 0;
      setTimeout(() => navigate(hasMemberships ? '/' : '/onboarding', { replace: true }), 1800);
    } catch (err: unknown) {
      setError((err as { data?: { error?: string } })?.data?.error ?? 'Invalid code. Try again.');
    }
  };

  const handleResend = async () => {
    if (!email) return;
    await resend({ email }).catch(() => {});
    setResent(true);
    setTimeout(() => setResent(false), 5000);
  };

  // Guard: if no email context at all, prompt them to log in.
  if (!email) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <p className="text-sm text-steel mb-4">
            We couldn't find your session. Please log in first.
          </p>
          <Button onClick={() => navigate('/login', { replace: true })}>Go to login</Button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="text-center">
          <CheckCircle size={48} className="text-success mx-auto mb-4" />
          <h2 className="text-h4 font-semibold text-ink mb-2">Email verified!</h2>
          <p className="text-sm text-steel">Taking you to your workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="bg-brand-navy py-8 px-6 text-center">
        <div className="inline-flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">AT</span>
          </div>
          <span className="text-white font-semibold text-base">{APP_NAME}</span>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 pb-12">
        <div className="w-full max-w-sm bg-canvas border border-hairline rounded-lg shadow-mockup p-8 mt-[-16px]">
          <h2 className="text-h5 font-semibold text-ink mb-1">Verify your email</h2>
          <p className="text-sm text-steel mb-6">
            Enter the 6-digit code we sent to <strong>{email}</strong>.
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 bg-card-rose rounded-md text-sm text-danger">{error}</div>
          )}
          {resent && (
            <div className="mb-4 px-4 py-3 bg-card-mint rounded-md text-sm text-success">
              New code sent! Check your inbox.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Verification code"
              placeholder="123456"
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              pattern="\d{6}"
              required
            />
            <Button type="submit" className="w-full" loading={verifying}>
              Verify email
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-sm text-[#0075de] hover:underline inline-flex items-center gap-1 disabled:opacity-50"
            >
              <RefreshCw size={13} className={resending ? 'animate-spin' : ''} />
              Resend code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
