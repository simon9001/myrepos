import { useEffect, useState, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, User, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  selectCurrentUser,
  selectAccessToken,
  userUpdated,
  activeOrgChanged,
  credentialsSet,
} from '@/features/auth/authSlice';
import {
  useGetInviteDetailsQuery,
  useCompleteInviteMutation,
} from '@/features/auth/authApi';
import { useAcceptInviteMutation } from '@/features/orgs/orgsApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { APP_NAME } from '@/config/api';
import type { OrgMembership } from '@/types';

// ── New user form (not logged in) ─────────────────────────────────────────────

function NewUserForm({
  token, email, orgName,
}: { token: string; email: string; orgName: string }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [completeInvite, { isLoading }] = useCompleteInviteMutation();

  const [form, setForm] = useState({ first_name: '', last_name: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.first_name.trim()) e.first_name = 'Required';
    if (!form.last_name.trim())  e.last_name  = 'Required';
    if (form.password.length < 8)     e.password = 'Min 8 characters';
    if (!/[A-Z]/.test(form.password)) e.password = 'Must include uppercase';
    if (!/[0-9]/.test(form.password)) e.password = 'Must include a number';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    try {
      const result = await completeInvite({
        token,
        first_name: form.first_name.trim(),
        last_name:  form.last_name.trim(),
        password:   form.password,
      }).unwrap();

      dispatch(credentialsSet({
        user:          result.user,
        access_token:  result.access_token,
        refresh_token: result.refresh_token,
      }));
      // ProtectedRoute will redirect to onboarding/dashboard after org memberships load
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const data = (err as { data?: { error?: string; code?: string } })?.data;
      if (data?.code === 'ALREADY_EXISTS') {
        setError('An account with this email already exists. Please log in instead.');
      } else {
        setError(data?.error ?? 'Something went wrong. Please try again.');
      }
    }
  };

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <div className="w-full max-w-md bg-canvas border border-hairline rounded-lg shadow-mockup overflow-hidden">
      {/* Invite banner */}
      <div className="bg-card-lavender border-b border-hairline px-6 py-5">
        <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
          You've been invited to join
        </p>
        <h2 className="text-h5 font-semibold text-ink">{orgName}</h2>
        <p className="text-sm text-steel mt-0.5">{email}</p>
      </div>

      <div className="px-8 py-6">
        <h3 className="text-base font-semibold text-ink mb-1">Create your account</h3>
        <p className="text-sm text-steel mb-6">Set your name and a password to get started.</p>

        {error && (
          <div className="mb-4 px-4 py-3 bg-card-rose rounded-md text-sm text-danger">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First name *"
              placeholder="John"
              value={form.first_name}
              onChange={set('first_name')}
              error={fieldErrors.first_name}
              iconLeft={<User size={16} />}
            />
            <Input
              label="Last name *"
              placeholder="Doe"
              value={form.last_name}
              onChange={set('last_name')}
              error={fieldErrors.last_name}
            />
          </div>
          <div className="px-4 py-2.5 bg-surface border border-hairline rounded-md text-sm text-steel">
            {email}
            <span className="text-xs text-muted ml-2">(from invitation)</span>
          </div>
          <Input
            label="Password *"
            type="password"
            placeholder="Min 8 chars, upper + lower + number"
            value={form.password}
            onChange={set('password')}
            error={fieldErrors.password}
            iconLeft={<Lock size={16} />}
            autoComplete="new-password"
          />
          <Input
            label="Confirm password *"
            type="password"
            placeholder="Repeat your password"
            value={form.confirm}
            onChange={set('confirm')}
            error={fieldErrors.confirm}
            iconLeft={<Lock size={16} />}
            autoComplete="new-password"
          />
          <Button type="submit" className="w-full mt-2" loading={isLoading} size="md">
            Create account &amp; join {orgName}
          </Button>
        </form>
      </div>
    </div>
  );
}

// ── Main JoinPage ─────────────────────────────────────────────────────────────

export function JoinPage() {
  const { token } = useParams<{ token: string }>();
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();

  const accessToken = useAppSelector(selectAccessToken);
  const user        = useAppSelector(selectCurrentUser);

  const isLoggedIn  = Boolean(accessToken);

  // Fetch invite context (public — org name + email)
  const { data: invite, isLoading: loadingInvite, error: inviteError } =
    useGetInviteDetailsQuery(token ?? '', { skip: !token });

  // For logged-in users: auto-accept
  const [acceptInvite, { isLoading: accepting }] = useAcceptInviteMutation();
  const [accepted,  setAccepted]  = useState(false);
  const [acceptErr, setAcceptErr] = useState('');

  useEffect(() => {
    if (!isLoggedIn || !token || !invite) return;

    acceptInvite({ token })
      .unwrap()
      .then(({ organization, role }) => {
        const membership: OrgMembership = {
          id:           'pending',
          role,
          designation:  null,
          organization: { id: organization.id, name: organization.name, logo_url: organization.logo_url },
        };
        dispatch(userUpdated({ memberships: [...(user?.memberships ?? []), membership] }));
        dispatch(activeOrgChanged(organization.id));
        setAccepted(true);
        setTimeout(() => navigate('/', { replace: true }), 2000);
      })
      .catch((err: unknown) => {
        const msg = (err as { data?: { error?: string } })?.data?.error;
        setAcceptErr(msg ?? 'Could not join organization.');
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, token, invite]);

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <div className="bg-brand-navy py-8 px-6 text-center">
        <div className="inline-flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">AT</span>
          </div>
          <span className="text-white font-semibold text-base">{APP_NAME}</span>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-8">

        {/* Loading invite details */}
        {loadingInvite && (
          <div className="flex items-center gap-2 text-steel mt-16">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Loading invitation…</span>
          </div>
        )}

        {/* Invalid / expired token */}
        {inviteError && (
          <div className="w-full max-w-sm bg-canvas border border-hairline rounded-lg shadow-mockup p-8 text-center mt-8">
            <XCircle size={40} className="text-danger mx-auto mb-4" />
            <h2 className="text-h5 font-semibold text-ink mb-2">Invite not valid</h2>
            <p className="text-sm text-steel mb-6">
              {(inviteError as { data?: { error?: string } })?.data?.error ??
                'This invite link has expired or is invalid.'}
            </p>
            <Button onClick={() => navigate('/login', { replace: true })} className="w-full">
              Go to login
            </Button>
          </div>
        )}

        {/* Logged-in user: auto-accept state */}
        {invite && isLoggedIn && (
          <div className="w-full max-w-sm bg-canvas border border-hairline rounded-lg shadow-mockup p-8 text-center mt-8">
            {accepting && (
              <>
                <Loader2 size={40} className="text-primary mx-auto mb-4 animate-spin" />
                <h2 className="text-h5 font-semibold text-ink mb-2">Joining {invite.org_name}…</h2>
                <p className="text-sm text-steel">Just a moment.</p>
              </>
            )}
            {accepted && (
              <>
                <CheckCircle size={40} className="text-success mx-auto mb-4" />
                <h2 className="text-h5 font-semibold text-ink mb-2">You're in!</h2>
                <p className="text-sm text-steel">
                  Welcome to <strong>{invite.org_name}</strong>. Redirecting to dashboard…
                </p>
              </>
            )}
            {acceptErr && (
              <>
                <XCircle size={40} className="text-danger mx-auto mb-4" />
                <h2 className="text-h5 font-semibold text-ink mb-2">Could not join</h2>
                <p className="text-sm text-steel mb-6">{acceptErr}</p>
                <Button onClick={() => navigate('/', { replace: true })} className="w-full">
                  Go to dashboard
                </Button>
              </>
            )}
          </div>
        )}

        {/* New user: show account creation form */}
        {invite && !isLoggedIn && (
          <div className="w-full max-w-md mt-4">
            <NewUserForm
              token={token!}
              email={invite.email ?? ''}
              orgName={invite.org_name}
            />
          </div>
        )}

      </div>
    </div>
  );
}
