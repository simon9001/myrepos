'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile unless open */}
      <div className={`
        fixed lg:relative z-40 h-full transition-transform duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((p) => !p)} />
      </div>

      {/* Main content */}
      <main
        className={`flex-1 overflow-y-auto scrollbar-thin transition-all duration-300 ${
          collapsed ? 'lg:ml-14' : 'lg:ml-56'
        } ml-0`}
      >
        {/* Mobile top bar */}
        <div
          className="lg:hidden flex items-center gap-3 px-4 h-12 border-b sticky top-0 z-20"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-md"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <Menu size={18} />
          </button>
          <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>KeNHA ICT</span>
        </div>

        <div className="min-h-full px-4 sm:px-6 lg:px-8 xl:px-10 py-5 lg:py-7 max-w-screen-2xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}