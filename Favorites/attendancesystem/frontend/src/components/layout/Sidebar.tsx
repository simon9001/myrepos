import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, GraduationCap, Users,
  FileText, QrCode, FolderOpen, Settings, LogOut,
  Building2, ChevronDown, X,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { logout, selectCurrentUser, selectActiveOrgId, activeOrgChanged } from '@/features/auth/authSlice';
import { useLogoutMutation } from '@/features/auth/authApi';
import { APP_NAME } from '@/config/api';
import { useState } from 'react';

interface NavItem {
  label:    string;
  to:       string;
  icon:     React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard',     to: '/',         icon: <LayoutDashboard size={18} /> },
  { label: 'Meetings',      to: '/meetings',  icon: <CalendarDays size={18} /> },
  { label: 'Training',      to: '/training',  icon: <GraduationCap size={18} /> },
  { label: 'Members',       to: '/members',   icon: <Users size={18} /> },
  { label: 'Templates',     to: '/templates', icon: <FileText size={18} /> },
  { label: 'QR Codes',      to: '/qr',        icon: <QrCode size={18} /> },
  { label: 'Documents',     to: '/documents', icon: <FolderOpen size={18} /> },
];

interface SidebarProps {
  open:    boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const dispatch   = useAppDispatch();
  const navigate   = useNavigate();
  const user       = useAppSelector(selectCurrentUser);
  const activeOrg  = useAppSelector(selectActiveOrgId);
  const [logoutApi] = useLogoutMutation();
  const [orgOpen, setOrgOpen] = useState(false);

  const memberships   = user?.memberships ?? [];
  const activeMembership = memberships.find(m => m.organization.id === activeOrg);

  const handleLogout = async () => {
    await logoutApi({}).catch(() => { /* ignore */ });
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-ink-deep/40 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={[
          'fixed top-0 left-0 h-full w-60 bg-brand-navy flex flex-col z-30',
          'transition-transform duration-200',
          open ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0 lg:static lg:z-auto',
        ].join(' ')}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">AT</span>
            </div>
            <span className="text-white font-semibold text-sm tracking-tight">{APP_NAME}</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-white/60 hover:text-white p-1 rounded"
          >
            <X size={16} />
          </button>
        </div>

        {/* Org switcher */}
        {memberships.length > 0 && (
          <div className="px-3 py-3 border-b border-white/10 shrink-0">
            <button
              onClick={() => setOrgOpen(o => !o)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-white/80 hover:bg-white/10 text-sm transition-colors"
            >
              <Building2 size={15} className="shrink-0 text-white/50" />
              <span className="flex-1 truncate text-left">
                {activeMembership?.organization.name ?? 'Select org…'}
              </span>
              <ChevronDown size={13} className={`shrink-0 transition-transform ${orgOpen ? 'rotate-180' : ''}`} />
            </button>

            {orgOpen && memberships.length > 1 && (
              <div className="mt-1 space-y-0.5">
                {memberships.map(m => (
                  <button
                    key={m.id}
                    onClick={() => {
                      dispatch(activeOrgChanged(m.organization.id));
                      setOrgOpen(false);
                    }}
                    className={[
                      'w-full text-left px-3 py-1.5 rounded text-xs transition-colors truncate',
                      m.organization.id === activeOrg
                        ? 'bg-primary/80 text-white'
                        : 'text-white/60 hover:bg-white/10 hover:text-white',
                    ].join(' ')}
                  >
                    {m.organization.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/80 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10',
                ].join(' ')
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom: settings + user */}
        <div className="px-3 py-4 border-t border-white/10 space-y-0.5 shrink-0">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive ? 'bg-primary/80 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'
              }`
            }
          >
            <Settings size={18} />
            Settings
          </NavLink>

          <div className="flex items-center gap-3 px-3 py-2 mt-1">
            <div className="w-7 h-7 rounded-full bg-primary/60 flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-semibold">
                {user?.full_name?.charAt(0).toUpperCase() ?? 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{user?.full_name}</p>
              <p className="text-white/50 text-xs truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="text-white/50 hover:text-white transition-colors p-1 rounded"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
