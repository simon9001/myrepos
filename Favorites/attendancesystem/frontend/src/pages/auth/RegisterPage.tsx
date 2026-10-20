import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, User, Phone, Globe, MapPin, Briefcase } from 'lucide-react';
import { useAppDispatch } from '@/app/hooks';
import { credentialsSet, activeOrgChanged } from '@/features/auth/authSlice';
import { useRegisterOrgMutation } from '@/features/auth/authApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { APP_NAME } from '@/config/api';
import type { OrgMembership } from '@/types';

const INDUSTRIES = [
  'Technology', 'Finance & Banking', 'Healthcare', 'Education',
  'Government', 'Non-Profit', 'Manufacturing', 'Retail',
  'Legal', 'Real Estate', 'Construction', 'Agriculture',
  'Media & Entertainment', 'Transportation', 'Hospitality & Tourism', 'Other',
].map(i => ({ value: i, label: i }));

const PLANS = [
  { id: 'free_trial' as const,  name: 'Free Trial',    price: 'Free',    note: '30 days • up to 5 users' },
  { id: 'basic' as const,       name: 'Basic',         price: '$29/mo',  note: 'Up to 50 users' },
  { id: 'professional' as const, name: 'Professional', price: '$79/mo',  note: 'Up to 500 users' },
  { id: 'enterprise' as const,  name: 'Enterprise',    price: 'Custom',  note: 'Unlimited + SSO' },
];

type Plan = 'free_trial' | 'basic' | 'professional' | 'enterprise';

interface FormState {
  // Company
  org_name:      string;
  industry:      string;
  country:       string;
  company_email: string;
  company_phone: string;
  website:       string;
  address:       string;
  // Admin
  first_name: string;
  last_name:  string;
  job_title:  string;
  email:      string;
  phone:      string;
  password:   string;
  confirm:    string;
}

const EMPTY: FormState = {
  org_name: '', industry: '', country: '', company_email: '',
  company_phone: '', website: '', address: '',
  first_name: '', last_name: '', job_title: '',
  email: '', phone: '', password: '', confirm: '',
};

export function RegisterPage() {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const [registerOrg, { isLoading }] = useRegisterOrgMutation();

  const [form,    setForm]    = useState<FormState>(EMPTY);
  const [plan,    setPlan]    = useState<Plan>('free_trial');
  const [terms,   setTerms]   = useState({ service: false, privacy: false });
  const [error,   setError]   = useState('');
  const [errors,  setErrors]  = useState<Partial<Record<keyof FormState | 'terms', string>>>({});

  const set = (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e: typeof errors = {};
    if (!form.org_name.trim())      e.org_name      = 'Required';
    if (!form.industry)             e.industry      = 'Required';
    if (!form.country.trim())       e.country       = 'Required';
    if (!form.company_email.includes('@')) e.company_email = 'Valid email required';
    if (!form.company_phone.trim()) e.company_phone = 'Required';
    if (!form.first_name.trim())    e.first_name    = 'Required';
    if (!form.last_name.trim())     e.last_name     = 'Required';
    if (!form.job_title.trim())     e.job_title     = 'Required';
    if (!form.email.includes('@'))  e.email         = 'Valid email required';
    if (form.password.length < 8)   e.password      = 'Min 8 characters';
    if (!/[A-Z]/.test(form.password)) e.password    = 'Must include uppercase letter';
    if (!/[0-9]/.test(form.password)) e.password    = 'Must include a number';
    if (form.password !== form.confirm) e.confirm   = 'Passwords do not match';
    if (!terms.service || !terms.privacy) e.terms   = 'Please accept both agreements';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    try {
      const result = await registerOrg({
        org_name:      form.org_name,
        industry:      form.industry,
        country:       form.country,
        company_email: form.company_email,
        company_phone: form.company_phone,
        address:       form.address  || undefined,
        website:       form.website  || undefined,
        first_name:    form.first_name,
        last_name:     form.last_name,
        job_title:     form.job_title,
        email:         form.email,
        phone:         form.phone    || undefined,
        password:      form.password,
        plan,
      }).unwrap();

      // Construct membership so the store has org context immediately
      const membership: OrgMembership = {
        id:           'pending',
        role:         'super_admin',
        designation:  form.job_title,
        organization: { id: result.org.id, name: result.org.name, logo_url: result.org.logo_url },
      };

      dispatch(credentialsSet({
        user:          { ...result.user, memberships: [membership] },
        access_token:  result.access_token,
        refresh_token: result.refresh_token,
      }));
      dispatch(activeOrgChanged(result.org.id));

      // Mark this org as needing setup wizard
      localStorage.setItem(`at_setup_${result.org.id}`, 'pending');

      navigate('/verify-email', { replace: true });
    } catch (err: unknown) {
      const msg = (err as { data?: { error?: string } })?.data?.error;
      setError(msg ?? 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <div className="bg-brand-navy py-8 px-6 text-center">
        <div className="inline-flex items-center gap-2 mb-2">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-base">AT</span>
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">{APP_NAME}</span>
        </div>
        <p className="text-white/60 text-sm">Digital Meeting Attendance & Signature Management</p>
      </div>

      {/* Form card */}
      <div className="flex-1 flex justify-center px-4 pb-16">
        <div className="w-full max-w-2xl bg-canvas border border-hairline rounded-lg shadow-mockup mt-[-16px] overflow-hidden">
          <div className="px-8 py-6 border-b border-hairline bg-surface">
            <h1 className="text-h4 font-semibold text-ink">Create your organization</h1>
            <p className="text-sm text-steel mt-1">
              Set up your workspace in minutes. You'll be the administrator.
            </p>
          </div>

          {error && (
            <div className="mx-8 mt-6 px-4 py-3 bg-card-rose rounded-md text-sm text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-8">

            {/* ── Company Information ─────────────────────────────────── */}
            <section>
              <h2 className="text-sm font-semibold text-ink uppercase tracking-wide mb-4 flex items-center gap-2">
                <Building2 size={14} className="text-primary" />
                Company Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    label="Organization name *"
                    placeholder="ABC Company"
                    value={form.org_name}
                    onChange={set('org_name')}
                    error={errors.org_name}
                    iconLeft={<Building2 size={16} />}
                  />
                </div>
                <Select
                  label="Industry *"
                  options={INDUSTRIES}
                  placeholder="Select industry…"
                  value={form.industry}
                  onChange={set('industry')}
                  error={errors.industry}
                />
                <Input
                  label="Country *"
                  placeholder="Kenya"
                  value={form.country}
                  onChange={set('country')}
                  error={errors.country}
                />
                <Input
                  label="Company email *"
                  type="email"
                  placeholder="info@company.com"
                  value={form.company_email}
                  onChange={set('company_email')}
                  error={errors.company_email}
                  iconLeft={<Mail size={16} />}
                />
                <Input
                  label="Company phone *"
                  type="tel"
                  placeholder="+254 700 000 000"
                  value={form.company_phone}
                  onChange={set('company_phone')}
                  error={errors.company_phone}
                  iconLeft={<Phone size={16} />}
                />
                <Input
                  label="Website"
                  type="url"
                  placeholder="https://company.com"
                  value={form.website}
                  onChange={set('website')}
                  iconLeft={<Globe size={16} />}
                />
                <Input
                  label="Address"
                  placeholder="123 Main St, Nairobi"
                  value={form.address}
                  onChange={set('address')}
                  iconLeft={<MapPin size={16} />}
                />
              </div>
            </section>

            {/* ── Administrator Account ───────────────────────────────── */}
            <section>
              <h2 className="text-sm font-semibold text-ink uppercase tracking-wide mb-4 flex items-center gap-2">
                <User size={14} className="text-primary" />
                Administrator Account
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First name *"
                  placeholder="John"
                  value={form.first_name}
                  onChange={set('first_name')}
                  error={errors.first_name}
                  iconLeft={<User size={16} />}
                />
                <Input
                  label="Last name *"
                  placeholder="Doe"
                  value={form.last_name}
                  onChange={set('last_name')}
                  error={errors.last_name}
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Job title *"
                    placeholder="HR Manager"
                    value={form.job_title}
                    onChange={set('job_title')}
                    error={errors.job_title}
                    iconLeft={<Briefcase size={16} />}
                  />
                </div>
                <Input
                  label="Work email *"
                  type="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={set('email')}
                  error={errors.email}
                  iconLeft={<Mail size={16} />}
                  autoComplete="email"
                />
                <Input
                  label="Phone"
                  type="tel"
                  placeholder="+254 700 000 000"
                  value={form.phone}
                  onChange={set('phone')}
                  iconLeft={<Phone size={16} />}
                />
                <Input
                  label="Password *"
                  type="password"
                  placeholder="Min 8 chars, upper + lower + number"
                  value={form.password}
                  onChange={set('password')}
                  error={errors.password}
                  iconLeft={<Lock size={16} />}
                  autoComplete="new-password"
                />
                <Input
                  label="Confirm password *"
                  type="password"
                  placeholder="Repeat password"
                  value={form.confirm}
                  onChange={set('confirm')}
                  error={errors.confirm}
                  iconLeft={<Lock size={16} />}
                  autoComplete="new-password"
                />
              </div>
            </section>

            {/* ── Subscription Plan ───────────────────────────────────── */}
            <section>
              <h2 className="text-sm font-semibold text-ink uppercase tracking-wide mb-4">
                Choose your plan
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PLANS.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlan(p.id)}
                    className={[
                      'rounded-lg border-2 p-3 text-left transition-all',
                      plan === p.id
                        ? 'border-primary bg-card-lavender'
                        : 'border-hairline hover:border-hairline-strong bg-canvas',
                    ].join(' ')}
                  >
                    <p className="text-xs font-semibold text-ink">{p.name}</p>
                    <p className="text-sm font-bold text-primary mt-0.5">{p.price}</p>
                    <p className="text-[11px] text-steel mt-1 leading-snug">{p.note}</p>
                  </button>
                ))}
              </div>
            </section>

            {/* ── Terms ───────────────────────────────────────────────── */}
            <section className="space-y-3">
              {errors.terms && (
                <p className="text-xs text-danger">{errors.terms}</p>
              )}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={terms.service}
                  onChange={e => setTerms(t => ({ ...t, service: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 rounded border-hairline-strong text-primary"
                />
                <span className="text-sm text-steel">
                  I agree to the{' '}
                  <a href="#" className="text-[#0075de] hover:underline">Terms and Conditions</a>
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={terms.privacy}
                  onChange={e => setTerms(t => ({ ...t, privacy: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 rounded border-hairline-strong text-primary"
                />
                <span className="text-sm text-steel">
                  I agree to the{' '}
                  <a href="#" className="text-[#0075de] hover:underline">Privacy Policy</a>
                </span>
              </label>
            </section>

            <Button type="submit" className="w-full" size="md" loading={isLoading}>
              Create organization
            </Button>

            <p className="text-center text-sm text-steel">
              Already have an account?{' '}
              <Link to="/login" className="text-[#0075de] hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
