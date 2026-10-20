import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

// Derive a page title from the current pathname —
// avoids useMatches which requires createBrowserRouter (data router).
function usePageTitle(): string | undefined {
  const { pathname } = useLocation();
  if (pathname === '/')                        return 'Dashboard';
  if (pathname === '/meetings')                return 'Meetings';
  if (/^\/meetings\/[^/]+$/.test(pathname))    return 'Meeting detail';
  if (pathname === '/members')                 return 'Members';
  if (pathname === '/training')                return 'Training';
  if (pathname === '/templates')               return 'Templates';
  if (pathname === '/qr')                      return 'QR Codes';
  if (pathname === '/documents')               return 'Documents';
  if (pathname.startsWith('/settings'))        return 'Settings';
  return undefined;
}

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const title = usePageTitle();

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          title={title}
        />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
