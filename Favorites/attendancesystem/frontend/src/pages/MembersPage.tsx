import { useState, type FormEvent } from 'react';
import { Users, UserPlus, Search, MoreVertical, Mail, Trash2, ShieldCheck, X } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { selectActiveOrgId, selectActiveMembership } from '@/features/auth/authSlice';
import {
  useGetMembersQuery,
  useInviteMemberMutation,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
  useGetDepartmentsQuery,
} from '@/features/orgs/orgsApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { RoleBadge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Spinner';
import type { OrgMemberRole, OrgMember } from '@/types';
import { format, parseISO } from 'date-fns';

const ROLE_OPTIONS: { value: OrgMemberRole; label: string }[] = [
  { value: 'hr_admin',             label: 'HR Admin' },
  { value: 'department_admin',     label: 'Department Admin' },
  { value: 'meeting_organizer',    label: 'Meeting Organizer' },
  { value: 'training_coordinator', label: 'Training Coordinator' },
  { value: 'auditor',              label: 'Auditor' },
  { value: 'participant',          label: 'Participant' },
];

// ── Invite modal ──────────────────────────────────────────────────────────────
function InviteModal({ orgId, onClose }: { orgId: string; onClose: () => void }) {
  const [inviteMember, { isLoading }] = useInviteMemberMutation();
  const [form, setForm] = useState({ email: '', role: 'participant' as OrgMemberRole, name: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.email.includes('@')) { setError('Enter a valid email.'); return; }
    try {
      await inviteMember({ orgId, email: form.email.trim(), role: form.role, name: form.name.trim() || undefined }).unwrap();
      setSuccess(`Invitation sent to ${form.email}`);
      setForm({ email: '', role: 'participant', name: '' });
    } catch (err: unknown) {
      const data = (err as { data?: { error?: string } })?.data;
      setError(data?.error ?? 'Could not send invitation.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-deep/40 px-4">
      <div className="w-full max-w-md bg-canvas rounded-lg shadow-mockup border border-hairline overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-hairline">
          <h2 className="text-base font-semibold text-ink">Invite a team member</h2>
          <button onClick={onClose} className="text-steel hover:text-ink p-1 rounded">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error   && <div className="px-4 py-3 bg-card-rose rounded-md text-sm text-danger">{error}</div>}
          {success && <div className="px-4 py-3 bg-card-mint rounded-md text-sm text-success">{success}</div>}
          <Input
            label="Name (optional)"
            placeholder="Jane Doe"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="Email address *"
            type="email"
            placeholder="jane@company.com"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            iconLeft={<Mail size={16} />}
          />
          <Select
            label="Role *"
            options={ROLE_OPTIONS}
            value={form.role}
            onChange={e => setForm(f => ({ ...f, role: e.target.value as OrgMemberRole }))}
          />
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" loading={isLoading}>
              Send invite
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Member row actions ────────────────────────────────────────────────────────
function MemberActions({ member, orgId, canManage }: { member: OrgMember; orgId: string; canManage: boolean }) {
  const [open, setOpen] = useState(false);
  const [updateRole] = useUpdateMemberRoleMutation();
  const [removeMember] = useRemoveMemberMutation();

  if (!canManage || member.role === 'super_admin') return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="p-1.5 text-steel hover:text-ink rounded hover:bg-surface transition-colors"
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-44 bg-canvas border border-hairline rounded-lg shadow-mockup z-20 overflow-hidden">
            <div className="py-1">
              <p className="px-3 py-1.5 text-xs font-semibold text-steel uppercase tracking-wide">Change role</p>
              {ROLE_OPTIONS.map(o => (
                <button
                  key={o.value}
                  onClick={() => {
                    updateRole({ orgId, memberId: member.id, role: o.value });
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-ink hover:bg-surface transition-colors"
                >
                  {o.label}
                </button>
              ))}
              <div className="border-t border-hairline mt-1 pt-1">
                <button
                  onClick={() => {
                    if (confirm('Remove this member from the organization?')) {
                      removeMember({ orgId, memberId: member.id });
                    }
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-danger hover:bg-card-rose transition-colors flex items-center gap-2"
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function MembersPage() {
  const orgId          = useAppSelector(selectActiveOrgId);
  const myMembership   = useAppSelector(selectActiveMembership);
  const canManage      = myMembership?.role === 'super_admin' || myMembership?.role === 'hr_admin';

  const { data: members, isLoading } = useGetMembersQuery(orgId ?? '', { skip: !orgId });
  useGetDepartmentsQuery(orgId ?? '', { skip: !orgId }); // prefetch for invite form

  const [showInvite, setShowInvite] = useState(false);
  const [search, setSearch]         = useState('');

  if (isLoading) return <PageLoader />;

  const filtered = (members ?? []).filter(m => {
    const q = search.toLowerCase();
    return (
      !q ||
      m.profile?.full_name?.toLowerCase().includes(q) ||
      m.profile?.email?.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {showInvite && orgId && (
        <InviteModal orgId={orgId} onClose={() => setShowInvite(false)} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h3 font-semibold text-ink">Members</h1>
          <p className="text-sm text-steel mt-0.5">
            {members?.length ?? 0} member{members?.length !== 1 ? 's' : ''} in your organization
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setShowInvite(true)} size="md">
            <UserPlus size={16} />
            Invite member
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="max-w-sm">
        <Input
          placeholder="Search by name, email or role…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          iconLeft={<Search size={16} />}
        />
      </div>

      {/* Table */}
      <div className="bg-canvas border border-hairline rounded-lg overflow-hidden shadow-card">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Users size={32} className="text-stone mx-auto mb-3" />
            <p className="text-sm text-steel">
              {search ? 'No members match your search.' : 'No members yet. Invite your team!'}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline bg-surface">
                <th className="text-left px-4 py-3 text-xs font-semibold text-steel uppercase tracking-wide">Member</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-steel uppercase tracking-wide hidden sm:table-cell">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-steel uppercase tracking-wide hidden md:table-cell">Designation</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-steel uppercase tracking-wide hidden lg:table-cell">Joined</th>
                {canManage && <th className="w-10 px-4 py-3" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filtered.map(m => (
                <tr key={m.id} className="hover:bg-surface transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-card-lavender flex items-center justify-center shrink-0">
                        <span className="text-primary text-xs font-semibold">
                          {(m.profile?.full_name ?? m.profile?.email ?? '?').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-ink truncate">
                          {m.profile?.full_name ?? <span className="text-steel italic">No name</span>}
                        </p>
                        <p className="text-xs text-steel truncate">{m.profile?.email}</p>
                        {/* Show role on small screens */}
                        <div className="sm:hidden mt-1">
                          <RoleBadge role={m.role} />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <RoleBadge role={m.role} />
                  </td>
                  <td className="px-4 py-3 text-steel hidden md:table-cell">
                    {m.designation ?? <span className="text-muted">—</span>}
                  </td>
                  <td className="px-4 py-3 text-steel text-xs hidden lg:table-cell">
                    {m.created_at ? format(parseISO(m.created_at), 'MMM d, yyyy') : '—'}
                  </td>
                  {canManage && (
                    <td className="px-4 py-3">
                      <MemberActions member={m} orgId={orgId!} canManage={canManage} />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* RBAC legend */}
      <div className="bg-canvas border border-hairline rounded-lg p-5">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck size={16} className="text-primary" />
          <p className="text-sm font-semibold text-ink">Role permissions</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-xs text-steel">
          {[
            { role: 'super_admin' as OrgMemberRole,          desc: 'Full control' },
            { role: 'hr_admin' as OrgMemberRole,             desc: 'Manage members & reports' },
            { role: 'department_admin' as OrgMemberRole,     desc: 'Manage a department' },
            { role: 'meeting_organizer' as OrgMemberRole,    desc: 'Create & run meetings' },
            { role: 'training_coordinator' as OrgMemberRole, desc: 'Manage training events' },
            { role: 'auditor' as OrgMemberRole,              desc: 'Read-only access' },
            { role: 'participant' as OrgMemberRole,          desc: 'Attend sessions' },
          ].map(({ role, desc }) => (
            <div key={role} className="flex items-start gap-2">
              <RoleBadge role={role} />
              <span className="leading-snug mt-0.5">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
