import { Menu, Bell } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';

interface NavbarProps {
  onMenuClick: () => void;
  title?:      string;
}

export function Navbar({ onMenuClick, title }: NavbarProps) {
  const user = useAppSelector(selectCurrentUser);

  return (
    <header className="h-14 bg-canvas border-b border-hairline flex items-center gap-4 px-4 shrink-0 sticky top-0 z-10">
      {/* Hamburger (mobile) */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-md text-steel hover:text-ink hover:bg-surface transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Page title */}
      {title && (
        <h1 className="text-sm font-semibold text-ink hidden sm:block">{title}</h1>
      )}

      <div className="flex-1" />

      {/* Right side */}
      <div className="flex items-center gap-2">
        <button className="relative p-2 rounded-md text-steel hover:text-ink hover:bg-surface transition-colors">
          <Bell size={18} />
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-hairline">
          <div className="w-7 h-7 rounded-full bg-primary/80 flex items-center justify-center">
            <span className="text-white text-xs font-semibold">
              {user?.full_name?.charAt(0).toUpperCase() ?? 'U'}
            </span>
          </div>
          <span className="text-sm font-medium text-ink hidden sm:block truncate max-w-32">
            {user?.full_name}
          </span>
        </div>
      </div>
    </header>
  );
}
