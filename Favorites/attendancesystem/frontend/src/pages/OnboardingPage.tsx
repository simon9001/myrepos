import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { selectCurrentUser, userUpdated, activeOrgChanged } from '@/features/auth/authSlice';
import { useCreateOrgMutation, useAcceptInviteMutation } from '@/features/orgs/orgsApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { APP_NAME } from '@/config/api';
import type { OrgMembership } from '@/types';

const toSlug = (name: string) =>
  name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

type Tab = 'create' | 'join';

export function OnboardingPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user     = useAppSelector(selectCurrentUser);

  const [tab, setTab] = useState<Tab>('create');

  const [createOrg,    { isLoading: creating }] = useCreateOrgMutation();
  const [acceptInvite, { isLoading: joining  }] = useAcceptInviteMutation();

  // ── Create org ────────────────────────────────────────────────────────────
  const [orgName,     setOrgName]     = useState('');
  const [slug,        setSlug]        = useState('');
  const [createError, setCreateError] = useState('');

  const handleNameChange = (v: string) => {
    setOrgName(v);
    setSlug(toSlug(v));
  };

  const handleCreate = async () => {
    setCreateError('');
    if (!orgName.trim()) { setCreateError('Organization name is required.'); return; }
    if (!slug)           { setCreateError('A valid slug is required.'); return; }
    try {
      const org = await createOrg({ name: orgName.trim(), slug }).unwrap();
      const membership: OrgMembership = {
        id:           'pending',
        role:         'super_admin',
        designation:  null,
        organization: { id: org.id, name: org.name, logo_url: org.logo_url },
      };
      dispatch(userUpdated({ memberships: [...(user?.memberships ?? []), membership] }));
      dispatch(activeOrgChanged(org.id));
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const data = (err as { data?: { code?: string; error?: string } })?.data;
      if (data?.code === 'DUPLICATE') {
        setCreateError('That name or slug is already taken. Try a different name.');
      } else {
        setCreateError(data?.error ?? 'Could not create organization. Please try again.');
      }
    }
  };

  // ── Join with token ───────────────────────────────────────────────────────
  const [inviteToken, setInviteToken] = useState('');
  const [joinError,   setJoinError]   = useState('');

  const handleJoin = async () => {
    setJoinError('');
    if (!inviteToken.trim()) { setJoinError('Please enter your invite token.'); return; }
    try {
      const { organization, role } = await acceptInvite({ token: inviteToken.trim() }).unwrap();
      const membership: OrgMembership = {
        id:           'pending',
        role,
        designation:  null,
        organization: { id: organization.id, name: organization.name, logo_url: organization.logo_url },
      };
      dispatch(userUpdated({ memberships: [...(user?.memberships ?? []), membership] }));
      dispatch(activeOrgChanged(organization.id));
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const msg = (err as { data?: { error?: string } })?.data?.error;
      setJoinError(msg ?? 'Could not join organization. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="bg-brand-navy py-8 px-6 text-center">
        <div className="inline-flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">AT</span>
          </div>
          <span className="text-white font-semibold text-base tracking-tight">{APP_NAME}</span>
        </div>
        <p className="text-white/60 text-sm">
          Welcome{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}! One last step to get started.
        </p>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 pb-12">
        <div className="w-full max-w-md bg-canvas border border-hairline rounded-lg shadow-mockup mt-[-16px] overflow-hidden">

          {/* Tab switcher */}
          <div className="flex border-b border-hairline">
            <button
              onClick={() => setTab('create')}
              className={[
                'flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors',
                tab === 'create'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-steel hover:text-ink',
              ].join(' ')}
            >
              <Building2 size={15} />
              Create organization
            </button>
            <button
              onClick={() => setTab('join')}
              className={[
                'flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors',
                tab === 'join'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-steel hover:text-ink',
              ].join(' ')}
            >
              <Users size={15} />
              Join organization
            </button>
          </div>

          <div className="p-8">
            {tab === 'create' ? (
              <>
                <h2 className="text-h5 font-semibold text-ink mb-1">Start your organization</h2>
                <p className="text-sm text-steel mb-6">
                  You'll be the Super Admin. Invite your team once you're set up.
                </p>

                {createError && (
                  <div className="mb-4 px-4 py-3 bg-card-rose rounded-md text-sm text-danger">
                    {createError}
                  </div>
                )}

                <div className="space-y-4">
                  <Input
                    label="Organization name"
                    placeholder="e.g. ABC Company"
                    value={orgName}
                    onChange={e => handleNameChange(e.target.value)}
                    iconLeft={<Building2 size={16} />}
                  />

                  <div>
                    <Input
                      label="URL slug"
                      placeholder="abc-company"
                      value={slug}
                      onChange={e => setSlug(toSlug(e.target.value))}
                    />
                    <p className="mt-1 text-xs text-steel">
                      Used to identify your org:{' '}
                      <code className="font-mono bg-surface px-1 rounded">{slug || 'your-org'}</code>
                    </p>
                  </div>

                  <Button className="w-full mt-2" onClick={handleCreate} loading={creating}>
                    Create organization
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-h5 font-semibold text-ink mb-1">Join an organization</h2>
                <p className="text-sm text-steel mb-6">
                  If you were invited via email, click the link in that email. Or paste your invite
                  token below if you have one.
                </p>

                {joinError && (
                  <div className="mb-4 px-4 py-3 bg-card-rose rounded-md text-sm text-danger">
                    {joinError}
                  </div>
                )}

                <div className="space-y-4">
                  <Input
                    label="Invite token"
                    placeholder="Paste your invite token here"
                    value={inviteToken}
                    onChange={e => setInviteToken(e.target.value)}
                  />

                  <Button className="w-full" onClick={handleJoin} loading={joining}>
                    Join organization
                  </Button>
                </div>

                <p className="mt-6 text-xs text-steel text-center">
                  No token? Ask your organization admin to send you an invitation email.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
