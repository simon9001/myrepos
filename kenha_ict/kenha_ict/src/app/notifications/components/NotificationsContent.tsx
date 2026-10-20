'use client';

import React, { useState } from 'react';
import { Bell, CheckCheck, AlertTriangle, Info, CheckCircle2, XCircle, Clock, Trash2 } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


type NotifType = 'warning' | 'info' | 'success' | 'error';

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const initialNotifications: Notification[] = [
  { id: 'n1', type: 'warning', title: 'License Expiring Soon', message: 'Kaspersky Endpoint Security expires in 18 days. Initiate renewal to avoid service interruption.', time: '2 hours ago', read: false },
  { id: 'n2', type: 'error', title: 'License Expired', message: 'Domain and SSL Certificates (KENIC) expired 10 days ago. Immediate renewal required.', time: '1 day ago', read: false },
  { id: 'n3', type: 'warning', title: 'Contract Ending', message: 'Fortinet Firewall Subscription contract ends in 25 days. Contact Business Machines Ltd.', time: '1 day ago', read: false },
  { id: 'n4', type: 'info', title: 'Budget Threshold Reached', message: 'Software subscriptions budget line has reached 91% utilization for FY2025/26.', time: '3 days ago', read: true },
  { id: 'n5', type: 'success', title: 'Contract Renewed', message: 'Microsoft 365 E3 (500 users) has been successfully renewed through Techno Brain.', time: '5 days ago', read: true },
  { id: 'n6', type: 'info', title: 'New Supplier Added', message: 'CoolAir Engineering has been added as a data center cooling maintenance contractor.', time: '1 week ago', read: true },
  { id: 'n7', type: 'success', title: 'Budget Report Ready', message: 'FY2025/26 Q2 budget utilization report has been generated and is ready for review.', time: '1 week ago', read: true },
  { id: 'n8', type: 'warning', title: 'ArcGIS Enterprise Expiring', message: 'ArcGIS Enterprise license expires in 9 days. Contact ESRI Eastern Africa immediately.', time: '2 weeks ago', read: true },
];

const typeConfig: Record<NotifType, { icon: React.ElementType; iconColor: string; bgVar: string; borderVar: string }> = {
  warning: { icon: AlertTriangle, iconColor: 'var(--warning)', bgVar: 'var(--warning-bg)', borderVar: 'rgba(180,83,9,0.25)' },
  error: { icon: XCircle, iconColor: 'var(--danger)', bgVar: 'var(--danger-bg)', borderVar: 'rgba(185,28,28,0.25)' },
  info: { icon: Info, iconColor: 'var(--info)', bgVar: 'var(--info-bg)', borderVar: 'rgba(29,78,216,0.25)' },
  success: { icon: CheckCircle2, iconColor: 'var(--positive)', bgVar: 'var(--positive-bg)', borderVar: 'rgba(21,128,61,0.25)' },
};

type FilterTab = 'all' | 'unread' | 'warning' | 'info';

export default function NotificationsContent() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.read;
    if (activeTab === 'warning') return n.type === 'warning' || n.type === 'error';
    if (activeTab === 'info') return n.type === 'info' || n.type === 'success';
    return true;
  });

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  const dismiss = (id: string) => setNotifications((prev) => prev.filter((n) => n.id !== id));

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: `Unread (${unreadCount})` },
    { key: 'warning', label: 'Alerts' },
    { key: 'info', label: 'Updates' },
  ];

  return (
    <div className="space-y-5 fade-in max-w-3xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-1" style={{ color: 'var(--muted-foreground)' }}>System</p>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>Notifications</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            License renewals, contract alerts and system updates
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs transition-all flex-shrink-0"
            style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)', backgroundColor: 'var(--card)' }}
          >
            <CheckCheck size={12} />
            Mark all read
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-md p-1 w-fit flex-wrap" style={{ backgroundColor: 'var(--muted)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="px-3 py-1.5 rounded text-xs font-medium transition-all duration-150"
            style={activeTab === tab.key
              ? { backgroundColor: 'var(--card)', color: 'var(--foreground)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
              : { color: 'var(--muted-foreground)' }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bell size={32} className="mb-3" style={{ color: 'var(--border)' }} />
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No notifications in this category</p>
          </div>
        ) : (
          filtered.map((notif) => {
            const cfg = typeConfig[notif.type];
            const Icon = cfg.icon;
            return (
              <div
                key={notif.id}
                className="relative flex gap-3 p-4 rounded-lg border transition-all"
                style={!notif.read
                  ? { backgroundColor: cfg.bgVar, borderColor: cfg.borderVar }
                  : { backgroundColor: 'var(--card)', borderColor: 'var(--border)' }
                }
              >
                {!notif.read && (
                  <span className="absolute top-4 right-4 w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
                )}
                <div className="flex-shrink-0 mt-0.5" style={{ color: cfg.iconColor }}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold" style={{ color: notif.read ? 'var(--muted-foreground)' : 'var(--foreground)' }}>
                      {notif.title}
                    </p>
                  </div>
                  <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{notif.message}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
                      <Clock size={10} /> {notif.time}
                    </span>
                    {!notif.read && (
                      <button
                        onClick={() => markRead(notif.id)}
                        className="text-[10px] hover:underline"
                        style={{ color: 'var(--primary)' }}
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => dismiss(notif.id)}
                  className="absolute top-3 right-3 p-1 transition-colors"
                  style={{ color: 'var(--border)' }}
                  title="Dismiss"
                  onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.color = 'var(--danger)'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.color = 'var(--border)'}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
