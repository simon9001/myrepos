import { useState, type FormEvent } from 'react';
import { User, Building2, Lock, Save, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { selectCurrentUser, selectActiveOrgId, selectActiveMembership, userUpdated } from '@/features/auth/authSlice';
import { useAppDispatch } from '@/app/hooks';
import { useUpdateMeMutation, useChangePasswordMutation } from '@/features/auth/authApi';
import { useGetOrgQuery, useUpdateOrgMutation } from '@/features/orgs/orgsApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type Tab = 'profile' | 'organization' | 'security';

// ── Reusable section card ─────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-canvas border border-hairline rounded-lg overflow-hidden shadow-card">
      <div className="px-6 py-4 border-b border-hairline bg-surface">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

// ── Profile tab ───────────────────────────────────────────────────────────────
function ProfileTab() {
  const dispatch    = useAppDispatch();
  const user        = useAppSelector(selectCurrentUser);
  const [updateMe, { isLoading }] = useUpdateMeMutation();

  const [form,    setForm]    = useState({ full_name: user?.full_name ?? '', phone: user?.phone ?? '' });
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(false);
    try {
      const updated = await updateMe({ full_name: form.full_name.trim(), phone: form.phone.trim() || null }).unwrap();
      dispatch(userUpdated({ full_name: updated.full_name, phone: updated.phone }));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setError((err as { data?: { error?: string } })?.data?.error ?? 'Could not save changes.');
    }
  };

  const initials = (user?.full_name ?? user?.email ?? 'U')
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="space-y-6">
      <Section title="Personal information">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-primary text-xl font-bold">{initials}</span>
          </div>
          <div>
            <p className="font-medium text-ink">{user?.full_name}</p>
            <p className="text-sm text-steel">{user?.email}</p>
            {user?.email_verified && (
              <p className="flex items-center gap-1 text-xs text-success mt-0.5">
                <CheckCircle size={12} /> Email verified
              </p>
            )}
          </div>
        </div>

        {error   && <div className="mb-4 px-4 py-3 bg-card-rose rounded-md text-sm text-danger">{error}</div>}
        {success && <div className="mb-4 px-4 py-3 bg-card-mint rounded-md text-sm text-success flex items-center gap-2"><CheckCircle size={16} /> Changes saved.</div>}

        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <Input
            label="Full name"
            placeholder="John Doe"
            value={form.full_name}
            onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
            iconLeft={<User size={16} />}
          />
          <Input
            label="Phone"
            type="tel"
            placeholder="+254 700 000 000"
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
          />
          <div>
            <label className="text-sm font-medium text-charcoal">Email</label>
            <div className="mt-1.5 px-3 py-2.5 bg-surface border border-hairline rounded-md text-sm text-steel">
              {user?.email}
              <span className="text-xs text-muted ml-2">(cannot be changed here)</span>
            </div>
          </div>
          <Button type="submit" loading={isLoading} size="md">
            <Save size={16} /> Save changes
          </Button>
        </form>
      </Section>
    </div>
  );
}

// ── Organization tab ──────────────────────────────────────────────────────────
function OrganizationTab() {
  const orgId          = useAppSelector(selectActiveOrgId);
  const myMembership   = useAppSelector(selectActiveMembership);
  const isSuperAdmin   = myMembership?.role === 'super_admin';

  const { data: org } = useGetOrgQuery(orgId ?? '', { skip: !orgId });
  const [updateOrg, { isLoading }] = useUpdateOrgMutation();

  const [name,    setName]    = useState('');
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState('');

  // Sync org name to form once loaded
  const orgName = org?.name ?? '';
  const displayName = name || orgName;

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!orgId || !name.trim() || name === orgName) return;
    setError(''); setSuccess(false);
    try {
      await updateOrg({ id: orgId, name: name.trim() }).unwrap();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setError((err as { data?: { error?: string } })?.data?.error ?? 'Could not update organization.');
    }
  };

  if (!org) return <div className="p-6 text-sm text-steel text-center">Loading…</div>;

  const planLabels: Record<string, string> = {
    free_trial:   'Free Trial',
    basic:        'Basic',
    professional: 'Professional',
    enterprise:   'Enterprise',
  };

  return (
    <div className="space-y-6">
      <Section title="Organization details">
        {error   && <div className="mb-4 px-4 py-3 bg-card-rose rounded-md text-sm text-danger">{error}</div>}
        {success && <div className="mb-4 px-4 py-3 bg-card-mint rounded-md text-sm text-success flex items-center gap-2"><CheckCircle size={16} /> Saved.</div>}

        <form onSubmit={handleSave} className="space-y-4 max-w-md">
          <Input
            label="Organization name"
            placeholder={orgName}
            value={displayName}
            onChange={e => setName(e.target.value)}
            iconLeft={<Building2 size={16} />}
            disabled={!isSuperAdmin}
          />
          {isSuperAdmin && (
            <Button type="submit" loading={isLoading} size="md" disabled={!name.trim() || name === orgName}>
              <Save size={16} /> Save name
            </Button>
          )}
        </form>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {[
            { label: 'Slug',        value: org.slug },
            { label: 'Industry',    value: org.industry ?? '—' },
            { label: 'Country',     value: org.country  ?? '—' },
            { label: 'Company email', value: org.company_email ?? '—' },
            { label: 'Phone',       value: org.company_phone ?? '—' },
            { label: 'Website',     value: org.website ?? '—' },
            { label: 'Plan',        value: planLabels[org.subscription_plan] ?? org.subscription_plan },
            { label: 'Status',      value: org.is_active ? 'Active' : 'Suspended' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs font-semibold text-steel uppercase tracking-wide mb-0.5">{label}</p>
              <p className="text-ink truncate">{value}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

// ── Security tab ──────────────────────────────────────────────────────────────
function SecurityTab() {
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [show, setShow] = useState({ current: false, next: false });
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState('');
  const [fieldErr, setFieldErr] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.current)           e.current = 'Required';
    if (form.next.length < 8)    e.next    = 'Min 8 characters';
    if (!/[A-Z]/.test(form.next))e.next    = 'Must include uppercase';
    if (!/[0-9]/.test(form.next))e.next    = 'Must include a number';
    if (form.next !== form.confirm) e.confirm = 'Passwords do not match';
    setFieldErr(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(false);
    if (!validate()) return;
    try {
      await changePassword({ current_password: form.current, new_password: form.next }).unwrap();
      setSuccess(true);
      setForm({ current: '', next: '', confirm: '' });
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: unknown) {
      setError((err as { data?: { error?: string } })?.data?.error ?? 'Could not change password.');
    }
  };

  return (
    <div className="space-y-6">
      <Section title="Change password">
        {error   && <div className="mb-4 px-4 py-3 bg-card-rose rounded-md text-sm text-danger">{error}</div>}
        {success && <div className="mb-4 px-4 py-3 bg-card-mint rounded-md text-sm text-success flex items-center gap-2"><CheckCircle size={16} /> Password changed successfully.</div>}

        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div className="relative">
            <Input
              label="Current password"
              type={show.current ? 'text' : 'password'}
              placeholder="Your current password"
              value={form.current}
              onChange={e => setForm(f => ({ ...f, current: e.target.value }))}
              error={fieldErr.current}
              iconLeft={<Lock size={16} />}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShow(s => ({ ...s, current: !s.current }))}
              className="absolute right-3 top-9 text-steel hover:text-ink"
            >
              {show.current ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="relative">
            <Input
              label="New password"
              type={show.next ? 'text' : 'password'}
              placeholder="Min 8 chars, upper + lower + number"
              value={form.next}
              onChange={e => setForm(f => ({ ...f, next: e.target.value }))}
              error={fieldErr.next}
              iconLeft={<Lock size={16} />}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShow(s => ({ ...s, next: !s.next }))}
              className="absolute right-3 top-9 text-steel hover:text-ink"
            >
              {show.next ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <Input
            label="Confirm new password"
            type="password"
            placeholder="Repeat your new password"
            value={form.confirm}
            onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
            error={fieldErr.confirm}
            iconLeft={<Lock size={16} />}
            autoComplete="new-password"
          />
          <Button type="submit" loading={isLoading} size="md">
            Change password
          </Button>
        </form>
      </Section>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function SettingsPage() {
  const [tab, setTab] = useState<Tab>('profile');

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile',      label: 'Profile',      icon: <User size={16} /> },
    { id: 'organization', label: 'Organization',  icon: <Building2 size={16} /> },
    { id: 'security',     label: 'Security',      icon: <Lock size={16} /> },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-h3 font-semibold text-ink">Settings</h1>
        <p className="text-sm text-steel mt-0.5">Manage your profile and organization preferences.</p>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-hairline mb-6">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={[
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === t.id
                ? 'text-primary border-primary'
                : 'text-steel border-transparent hover:text-ink',
            ].join(' ')}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile'      && <ProfileTab />}
      {tab === 'organization' && <OrganizationTab />}
      {tab === 'security'     && <SecurityTab />}
    </div>
  );
}
