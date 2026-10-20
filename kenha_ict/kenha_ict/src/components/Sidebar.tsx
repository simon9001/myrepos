'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
  FileKey,
  FileText,
  BarChart3,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  Sun,
  Moon,
  Shield,
  ClipboardList,
  Printer,
  Menu,
  X,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    id: 'group-main',
    label: 'Main',
    items: [
      {
        id: 'nav-overview',
        label: 'Overview',
        href: '/',
        icon: <LayoutDashboard size={16} />,
      },
    ],
  },
  {
    id: 'group-inventory',
    label: 'Inventory',
    items: [
      {
        id: 'nav-licenses',
        label: 'Licenses & Assets',
        href: '/licenses-assets',
        icon: <FileKey size={16} />,
        badge: 4,
      },
      {
        id: 'nav-contracts',
        label: 'Contracts & Suppliers',
        href: '/contracts-suppliers',
        icon: <FileText size={16} />,
        badge: 2,
      },
      {
        id: 'nav-ict-assets',
        label: 'ICT Assets & Issuance',
        href: '/ict-assets',
        icon: <Printer size={16} />,
      },
    ],
  },
  {
    id: 'group-analytics',
    label: 'Analytics',
    items: [
      {
        id: 'nav-budget',
        label: 'Budget & Analytics',
        href: '/budget-analytics',
        icon: <BarChart3 size={16} />,
      },
      {
        id: 'nav-reporting',
        label: 'Reporting',
        href: '/reporting',
        icon: <ClipboardList size={16} />,
      },
    ],
  },
  {
    id: 'group-admin',
    label: 'Administration',
    items: [
      {
        id: 'nav-admin',
        label: 'Admin Dashboard',
        href: '/admin',
        icon: <Shield size={16} />,
      },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const bottomItems = [
    { id: 'nav-notif', icon: <Bell size={15} />, label: 'Notifications', href: '/notifications', badge: 3 },
    { id: 'nav-settings', icon: <Settings size={15} />, label: 'Settings', href: '/settings' },
    { id: 'nav-help', icon: <HelpCircle size={15} />, label: 'Help & Docs', href: '/help-docs' },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-full z-40 flex flex-col sidebar-transition ${
        collapsed ? 'w-14' : 'w-56'
      }`}
      style={{ backgroundColor: 'var(--card)', borderRight: '1px solid var(--border)' }}
    >
      {/* Logo */}
      <div
        className={`flex items-center h-14 px-3 flex-shrink-0 ${collapsed ? 'justify-center' : 'gap-3'}`}
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex-shrink-0">
          <Image
            src="/assets/images/image-1786473508280.png"
            alt="KeNHA Logo"
            width={collapsed ? 28 : 32}
            height={collapsed ? 28 : 32}
            className="object-contain"
          />
        </div>
        {!collapsed && (
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[13px] font-semibold leading-tight truncate" style={{ color: 'var(--foreground)' }}>KeNHA ICT</span>
            <span className="text-[10px] leading-tight truncate tracking-wide" style={{ color: 'var(--muted-foreground)' }}>ICT & Contracts</span>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={onToggle}
            className="flex-shrink-0 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <X size={14} />
          </button>
        )}
        {collapsed && (
          <button
            onClick={onToggle}
            className="absolute -right-3 top-4 w-6 h-6 rounded-full border flex items-center justify-center shadow-sm"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
          >
            <Menu size={11} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        {navGroups.map((group) => (
          <div key={group.id} className="mb-5">
            {!collapsed && (
              <p className="px-4 mb-1.5 text-[9px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--muted-foreground)' }}>
                {group.label}
              </p>
            )}
            <ul className="space-y-0.5 px-2">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={`nav-item flex items-center rounded-md h-8 px-2.5 gap-2.5 relative group ${
                        active ? 'nav-active' : ''
                      } ${collapsed ? 'justify-center' : ''}`}
                      style={!active ? { color: 'var(--muted-foreground)' } : {}}
                    >
                      <span className={`flex-shrink-0 ${active ? 'text-blue-700 dark:text-blue-400' : ''}`} style={!active ? { color: 'var(--muted-foreground)' } : {}}>
                        {item.icon}
                      </span>
                      {!collapsed && (
                        <span className="text-[13px] truncate flex-1">{item.label}</span>
                      )}
                      {!collapsed && item.badge !== undefined && item.badge > 0 && (
                        <span className="flex-shrink-0 text-[9px] font-semibold bg-amber-100 text-amber-700 rounded-full px-1.5 py-0.5 leading-none dark:bg-amber-900/30 dark:text-amber-400">
                          {item.badge}
                        </span>
                      )}
                      {collapsed && item.badge !== undefined && item.badge > 0 && (
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400" />
                      )}
                      {collapsed && (
                        <span className="absolute left-full ml-2 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 shadow-lg">
                          {item.label}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="py-2 px-2 flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
        <ul className="space-y-0.5">
          {bottomItems.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`nav-item w-full flex items-center rounded-md h-8 px-2.5 gap-2.5 relative group ${active ? 'nav-active' : ''}`}
                  style={!active ? { color: 'var(--muted-foreground)' } : {}}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!collapsed && <span className="text-[13px] truncate flex-1 text-left">{item.label}</span>}
                  {!collapsed && item.badge && (
                    <span className="text-[9px] font-semibold bg-red-100 text-red-600 rounded-full px-1.5 leading-none py-0.5 dark:bg-red-900/30 dark:text-red-400">
                      {item.badge}
                    </span>
                  )}
                  {collapsed && item.badge && (
                    <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-red-400" />
                  )}
                  {collapsed && (
                    <span className="absolute left-full ml-2 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 shadow-lg">
                      {item.label}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Theme toggle */}
        <div className="mt-1 px-1">
          <button
            onClick={toggleTheme}
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            className="nav-item w-full flex items-center rounded-md h-8 px-2.5 gap-2.5"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <span className="flex-shrink-0">
              {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
            </span>
            {!collapsed && (
              <span className="text-[13px] truncate flex-1 text-left">
                {theme === 'light' ? 'Dark mode' : 'Light mode'}
              </span>
            )}
          </button>
        </div>

        {/* User */}
        <div
          className={`mt-2 pt-2 flex items-center gap-2 px-1 ${collapsed ? 'justify-center' : ''}`}
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 dark:bg-blue-900/30 dark:border-blue-800">
            <span className="text-[9px] font-semibold text-blue-700 dark:text-blue-400">OK</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold truncate" style={{ color: 'var(--foreground)' }}>Omondi Otieno</p>
              <p className="text-[10px] truncate" style={{ color: 'var(--muted-foreground)' }}>ICT Manager</p>
            </div>
          )}
          {!collapsed && (
            <button className="flex-shrink-0 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" style={{ color: 'var(--muted-foreground)' }}>
              <LogOut size={13} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}