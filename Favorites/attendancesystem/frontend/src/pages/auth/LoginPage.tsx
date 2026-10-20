import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAppDispatch } from '@/app/hooks';
import { credentialsSet } from '@/features/auth/authSlice';
import { useLoginMutation } from '@/features/auth/authApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { APP_NAME } from '@/config/api';

export function LoginPage() {
  const dispatch   = useAppDispatch();
  const navigate   = useNavigate();
  const location   = useLocation();
  const from       = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';
  const verified   = (location.state as { verified?: boolean })?.verified === true;

  const [login, { isLoading }] = useLoginMutation();
  const [form, setForm]   = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const result = await login(form).unwrap();
      dispatch(credentialsSet(result));
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const data  = (err as { data?: { error?: string; code?: string } })?.data;
      if (data?.code === 'EMAIL_NOT_VERIFIED') {
        navigate('/verify-email', { state: { email: form.email, fromLogin: true } });
        return;
      }
      setError(data?.error ?? 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Navy hero band */}
      <div className="bg-brand-navy py-10 px-6 text-center">
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-base">AT</span>
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">{APP_NAME}</span>
        </div>
        <p className="text-white/60 text-sm">Digital Meeting Attendance & Signature Management</p>
      </div>

      {/* Auth card */}
      <div className="flex-1 flex items-start justify-center px-4 -mt-4 pb-12">
        <div className="w-full max-w-md bg-canvas border border-hairline rounded-lg shadow-mockup p-8 mt-0">
          <h2 className="text-h4 font-semibold text-ink mb-1">Sign in to your account</h2>
          <p className="text-sm text-steel mb-6">Welcome back! Enter your credentials to continue.</p>

          {verified && (
            <div className="mb-4 px-4 py-3 bg-card-mint rounded-md text-sm text-success">
              Email verified! You can now sign in.
            </div>
          )}

          {error && (
            <div className="mb-4 px-4 py-3 bg-card-rose border border-card-rose rounded-md text-sm text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              iconLeft={<Mail size={16} />}
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              iconLeft={<Lock size={16} />}
              required
              autoComplete="current-password"
            />

            <div className="flex items-center justify-end">
              <Link to="/forgot-password" className="text-sm text-[#0075de] hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" loading={isLoading} size="md">
              Sign in
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-steel">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-[#0075de] hover:underline font-medium">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
