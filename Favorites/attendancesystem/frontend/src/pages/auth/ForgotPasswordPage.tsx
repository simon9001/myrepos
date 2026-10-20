import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useForgotPasswordMutation } from '@/features/auth/authApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { APP_NAME } from '@/config/api';

export function ForgotPasswordPage() {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [email, setEmail]   = useState('');
  const [sent,  setSent]    = useState(false);
  const [error, setError]   = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await forgotPassword({ email }).unwrap();
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    }
  };

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
          {sent ? (
            <div className="text-center">
              <CheckCircle size={40} className="text-success mx-auto mb-4" />
              <h2 className="text-h5 font-semibold text-ink mb-2">Check your email</h2>
              <p className="text-sm text-steel mb-6">
                If an account with <strong>{email}</strong> exists, we sent a 6-digit reset code.
              </p>
              <Link to="/reset-password">
                <Button className="w-full">Enter reset code</Button>
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-h5 font-semibold text-ink mb-1">Reset your password</h2>
              <p className="text-sm text-steel mb-6">
                We'll send a 6-digit code to your email address.
              </p>

              {error && (
                <div className="mb-4 px-4 py-3 bg-card-rose rounded-md text-sm text-danger">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  iconLeft={<Mail size={16} />}
                  required
                />
                <Button type="submit" className="w-full" loading={isLoading}>
                  Send reset code
                </Button>
              </form>
            </>
          )}

          <div className="mt-5 text-center">
            <Link to="/login" className="text-sm text-steel hover:text-ink inline-flex items-center gap-1">
              <ArrowLeft size={14} />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
