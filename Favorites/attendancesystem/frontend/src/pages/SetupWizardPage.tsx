import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, CheckCircle2, ChevronRight, Plus, Trash2, Loader2 } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { selectCurrentUser, selectActiveOrgId, selectActiveMembership } from '@/features/auth/authSlice';
import { useUpdateOrgMutation } from '@/features/orgs/orgsApi';
import { useCreateDepartmentMutation, useInviteMemberMutation } from '@/features/orgs/orgsApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { APP_NAME } from '@/config/api';
import type { OrgMemberRole } from '@/types';

const STEPS = ['Company', 'Departments', 'Invite Team', 'Done'];

const ROLE_OPTIONS: { value: OrgMemberRole; label: string }[] = [
  { value: 'hr_admin',             label: 'HR Admin' },
  { value: 'department_admin',     label: 'Department Admin' },
  { value: 'meeting_organizer',    label: 'Meeting Organizer' },
  { value: 'training_coordinator', label: 'Training Coordinator' },
  { value: 'auditor',              label: 'Auditor' },
  { value: 'participant',          label: 'Participant' },
];

export function SetupWizardPage() {
  const navigate          = useNavigate();
  const user              = useAppSelector(selectCurrentUser);
  const activeOrgId       = useAppSelector(selectActiveOrgId);
  const activeMembership  = useAppSelector(selectActiveMembership);

  const [step,   setStep]   = useState(1);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const orgName   = activeMembership?.organization.name ?? '';
  const firstName = user?.full_name?.split(' ')[0] ?? 'there';

  // API mutations
  const [updateOrg]    = useUpdateOrgMutation();
  const [createDept]   = useCreateDepartmentMutation();
  const [inviteMember] = useInviteMemberMutation();

  // ── Step 1: Company profile ───────────────────────────────────────────────
  const [companyName, setCompanyName] = useState(orgName);

  const handleStep1 = async (skip = false) => {
    setSaving(true); setError('');
    try {
      if (!skip && activeOrgId && companyName.trim() && companyName !== orgName) {
        await updateOrg({ id: activeOrgId, name: companyName.trim() }).unwrap();
      }
      setStep(2);
    } catch { setStep(2); }
    setSaving(false);
  };

  // ── Step 2: Departments ───────────────────────────────────────────────────
  const [depts, setDepts] = useState([{ name: '' }, { name: '' }]);

  const addDept    = () => setDepts(d => [...d, { name: '' }]);
  const removeDept = (i: number) => setDepts(d => d.filter((_, idx) => idx !== i));
  const setDeptName = (i: number, v: string) =>
    setDepts(d => d.map((dept, idx) => idx === i ? { name: v } : dept));

  const handleStep2 = async (skip = false) => {
    setSaving(true); setError('');
    if (!skip && activeOrgId) {
      const valid = depts.filter(d => d.name.trim());
      await Promise.allSettled(
        valid.map(d => createDept({ orgId: activeOrgId, name: d.name.trim() }))
      );
    }
    setSaving(false);
    setStep(3);
  };

  // ── Step 3: Invite team ───────────────────────────────────────────────────
  const [invites, setInvites] = useState([
    { email: '', role: 'participant' as OrgMemberRole },
  ]);

  const addInvite    = () => setInvites(i => [...i, { email: '', role: 'participant' as OrgMemberRole }]);
  const removeInvite = (i: number) => setInvites(inv => inv.filter((_, idx) => idx !== i));
  const setInviteField = (i: number, field: 'email' | 'role', v: string) =>
    setInvites(inv => inv.map((item, idx) =>
      idx === i ? { ...item, [field]: v } : item,
    ));

  const handleStep3 = async (skip = false) => {
    setSaving(true); setError('');
    if (!skip && activeOrgId) {
      const valid = invites.filter(i => i.email.includes('@'));
      const results = await Promise.allSettled(
        valid.map(i => inviteMember({ orgId: activeOrgId, email: i.email, role: i.role }))
      );
      const failed = results.filter(r => r.status === 'rejected').length;
      if (failed > 0 && valid.length > 0) {
        setError(`${failed} invitation(s) could not be sent. The rest were sent successfully.`);
      }
    }
    setSaving(false);
    setStep(4);
  };

  // ── Finish wizard ─────────────────────────────────────────────────────────
  const finishWizard = () => {
    if (activeOrgId) localStorage.setItem(`at_setup_${activeOrgId}`, 'done');
    navigate('/', { replace: true });
  };

  // ── Progress bar ──────────────────────────────────────────────────────────
  const Progress = () => (
    <div className="px-8 pt-6 pb-4">
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const done    = step > n;
          const current = step === n;
          return (
            <div key={n} className="flex items-center gap-2 flex-1 last:flex-none">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className={[
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0',
                  done    ? 'bg-success text-white' :
                  current ? 'bg-primary text-white' :
                            'bg-hairline text-steel',
                ].join(' ')}>
                  {done ? <CheckCircle2 size={14} /> : n}
                </div>
                <span className={[
                  'text-xs font-medium hidden sm:block truncate',
                  current ? 'text-ink' : 'text-steel',
                ].join(' ')}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={['flex-1 h-px', done ? 'bg-success' : 'bg-hairline'].join(' ')} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── Shared nav ────────────────────────────────────────────────────────────
  const Nav = ({
    onContinue, onSkip, continueLabel = 'Continue', skipLabel = 'Skip for now',
  }: {
    onContinue: () => void;
    onSkip?: () => void;
    continueLabel?: string;
    skipLabel?: string;
  }) => (
    <div className="flex items-center justify-between pt-6 border-t border-hairline mt-6">
      {onSkip ? (
        <button
          type="button"
          onClick={onSkip}
          className="text-sm text-steel hover:text-ink"
          disabled={saving}
        >
          {skipLabel}
        </button>
      ) : <span />}
      <Button onClick={onContinue} loading={saving} size="md">
        {continueLabel}
        <ChevronRight size={16} />
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <div className="bg-brand-navy py-6 px-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">AT</span>
            </div>
            <span className="text-white font-semibold text-base">{APP_NAME}</span>
          </div>
          <p className="text-white/60 text-sm hidden sm:block">Setting up your workspace…</p>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-2xl bg-canvas border border-hairline rounded-lg shadow-mockup overflow-hidden">
          <Progress />

          {/* Step content */}
          <div className="px-8 pb-8">

            {/* ── Step 1: Company profile ─────────────────────────── */}
            {step === 1 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-card-lavender flex items-center justify-center">
                    <Building2 size={20} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="text-h5 font-semibold text-ink">Company profile</h2>
                    <p className="text-sm text-steel">Confirm your organization name.</p>
                  </div>
                </div>

                <Input
                  label="Organization name"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="ABC Company"
                  iconLeft={<Building2 size={16} />}
                />
                <p className="text-xs text-steel mt-2">
                  You can upload your logo and customize branding later in Settings.
                </p>

                <Nav
                  onContinue={() => handleStep1(false)}
                  onSkip={() => handleStep1(true)}
                />
              </div>
            )}

            {/* ── Step 2: Departments ─────────────────────────────── */}
            {step === 2 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-card-peach flex items-center justify-center">
                    <Building2 size={20} className="text-brand-orange-deep" />
                  </div>
                  <div>
                    <h2 className="text-h5 font-semibold text-ink">Create departments</h2>
                    <p className="text-sm text-steel">Add your organization's departments. You can add more later.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {depts.map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input
                        placeholder={`e.g. ${['ICT', 'Finance', 'HR', 'Procurement', 'Sales'][i] ?? 'Department name'}`}
                        value={d.name}
                        onChange={e => setDeptName(i, e.target.value)}
                        className="flex-1"
                      />
                      {depts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDept(i)}
                          className="p-2 text-steel hover:text-danger transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addDept}
                  className="mt-3 flex items-center gap-1.5 text-sm text-[#0075de] hover:underline"
                >
                  <Plus size={14} /> Add another department
                </button>

                <Nav
                  onContinue={() => handleStep2(false)}
                  onSkip={() => handleStep2(true)}
                />
              </div>
            )}

            {/* ── Step 3: Invite team ─────────────────────────────── */}
            {step === 3 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-card-mint flex items-center justify-center">
                    <Users size={20} className="text-success" />
                  </div>
                  <div>
                    <h2 className="text-h5 font-semibold text-ink">Invite your team</h2>
                    <p className="text-sm text-steel">They'll receive an email to create their accounts.</p>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 px-4 py-3 bg-card-rose rounded-md text-sm text-danger">{error}</div>
                )}

                <div className="space-y-3">
                  {invites.map((inv, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="flex-1">
                        <Input
                          placeholder="colleague@company.com"
                          type="email"
                          value={inv.email}
                          onChange={e => setInviteField(i, 'email', e.target.value)}
                        />
                      </div>
                      <div className="w-44">
                        <Select
                          options={ROLE_OPTIONS}
                          value={inv.role}
                          onChange={e => setInviteField(i, 'role', e.target.value as OrgMemberRole)}
                        />
                      </div>
                      {invites.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeInvite(i)}
                          className="mt-3 p-1.5 text-steel hover:text-danger"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addInvite}
                  className="mt-3 flex items-center gap-1.5 text-sm text-[#0075de] hover:underline"
                >
                  <Plus size={14} /> Add another member
                </button>

                <Nav
                  onContinue={() => handleStep3(false)}
                  onSkip={() => handleStep3(true)}
                  continueLabel="Send invitations"
                />
              </div>
            )}

            {/* ── Step 4: Done ────────────────────────────────────── */}
            {step === 4 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-card-mint flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-success" />
                </div>
                <h2 className="text-h4 font-semibold text-ink mb-2">
                  You're all set, {firstName}!
                </h2>
                <p className="text-sm text-steel mb-8 max-w-sm mx-auto">
                  Your workspace is ready. Start by creating your first meeting or training session.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8 text-left">
                  {[
                    { icon: '📅', label: 'Create Meeting',    action: () => { finishWizard(); } },
                    { icon: '👥', label: 'Invite More Users', action: () => { finishWizard(); } },
                    { icon: '📊', label: 'View Dashboard',    action: finishWizard },
                  ].map(item => (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className="flex flex-col items-center gap-2 p-4 rounded-lg border border-hairline hover:border-primary hover:bg-surface transition-all text-center"
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <span className="text-xs font-medium text-ink">{item.label}</span>
                    </button>
                  ))}
                </div>

                <Button onClick={finishWizard} className="w-full sm:w-auto px-12" size="md">
                  Go to dashboard
                </Button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
