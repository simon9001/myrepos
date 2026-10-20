'use client';

import React, { useState } from 'react';
import { Sun, Moon, Bell, Shield, User, Palette, ChevronRight, Check } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import Icon from '@/components/ui/AppIcon';


type SettingsSection = 'appearance' | 'notifications' | 'account' | 'security';

const sections: { key: SettingsSection; label: string; icon: React.ElementType; desc: string }[] = [
  { key: 'appearance', label: 'Appearance', icon: Palette, desc: 'Theme, display preferences' },
  { key: 'notifications', label: 'Notifications', icon: Bell, desc: 'Alerts and reminders' },
  { key: 'account', label: 'Account', icon: User, desc: 'Profile and preferences' },
  { key: 'security', label: 'Security', icon: Shield, desc: 'Password and access' },
];

function ToggleSwitch({ checked, onChange }: { checked?: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none"
      style={{ backgroundColor: checked ? 'var(--primary)' : 'var(--border)' }}
    >
      <span
        className="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200"
        style={{ transform: checked ? 'translateX(18px)' : 'translateX(2px)' }}
      />
    </button>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card-elevated rounded-lg overflow-hidden">
      <div className="px-5 py-3.5 border-b" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
      <div className="min-w-0">
        <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{label}</p>
        {description && <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

export default function SettingsContent() {
  const { theme, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState<SettingsSection>('appearance');

  const [notifSettings, setNotifSettings] = useState({
    licenseExpiry: true,
    contractRenewal: true,
    budgetAlerts: true,
    weeklyDigest: false,
    emailNotifs: true,
  });

  const [accountSettings, setAccountSettings] = useState({
    name: 'Omondi Otieno',
    email: 'o.otieno@kenha.co.ke',
    role: 'ICT Manager',
    department: 'ICT Department',
  });

  const toggleNotif = (key: keyof typeof notifSettings) => {
    setNotifSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const themeOptions: { key: 'light' | 'dark'; label: string; icon: React.ElementType }[] = [
    { key: 'light', label: 'Light', icon: Sun },
    { key: 'dark', label: 'Dark', icon: Moon },
  ];

  return (
    <div className="space-y-5 fade-in">
      {/* Header */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-1" style={{ color: 'var(--muted-foreground)' }}>System</p>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>Settings</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
          Manage your dashboard preferences and account settings
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Sidebar nav */}
        <div className="lg:w-52 flex-shrink-0">
          <div className="card-elevated rounded-lg overflow-hidden">
            {sections.map((s) => {
              const Icon = s.icon;
              const active = activeSection === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => setActiveSection(s.key)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b last:border-0"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: active ? 'var(--info-bg)' : 'transparent',
                    color: active ? 'var(--info)' : 'var(--muted-foreground)',
                  }}
                >
                  <Icon size={15} style={{ color: active ? 'var(--primary)' : 'var(--muted-foreground)' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold" style={{ color: active ? 'var(--info)' : 'var(--foreground)' }}>{s.label}</p>
                    <p className="text-[10px] truncate" style={{ color: 'var(--muted-foreground)' }}>{s.desc}</p>
                  </div>
                  {active && <ChevronRight size={12} style={{ color: 'var(--primary)' }} className="flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-4">
          {activeSection === 'appearance' && (
            <>
              <SectionCard title="Theme">
                <SettingRow label="Color theme" description="Choose how the dashboard looks">
                  <div className="flex items-center gap-2 flex-wrap">
                    {themeOptions.map((opt) => {
                      const Icon = opt.icon;
                      const active = theme === opt.key;
                      return (
                        <button
                          key={opt.key}
                          onClick={toggleTheme}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-all"
                          style={active
                            ? { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderColor: 'var(--primary)' }
                            : { backgroundColor: 'var(--card)', color: 'var(--muted-foreground)', borderColor: 'var(--border)' }
                          }
                        >
                          <Icon size={12} />
                          {opt.label}
                          {active && <Check size={10} />}
                        </button>
                      );
                    })}
                  </div>
                </SettingRow>
              </SectionCard>

              <SectionCard title="Display">
                <SettingRow label="Compact sidebar" description="Collapse sidebar to icon-only mode by default">
                  <ToggleSwitch onChange={() => {}} />
                </SettingRow>
                <SettingRow label="Show badge counts" description="Display unread counts on navigation items">
                  <ToggleSwitch checked onChange={() => {}} />
                </SettingRow>
              </SectionCard>
            </>
          )}

          {activeSection === 'notifications' && (
            <>
              <SectionCard title="License & Contract Alerts">
                <SettingRow label="License expiry alerts" description="Notify when licenses are expiring within 30 days">
                  <ToggleSwitch checked={notifSettings.licenseExpiry} onChange={() => toggleNotif('licenseExpiry')} />
                </SettingRow>
                <SettingRow label="Contract renewal reminders" description="Notify when contracts are approaching end date">
                  <ToggleSwitch checked={notifSettings.contractRenewal} onChange={() => toggleNotif('contractRenewal')} />
                </SettingRow>
                <SettingRow label="Budget threshold alerts" description="Notify when budget utilization exceeds 85%">
                  <ToggleSwitch checked={notifSettings.budgetAlerts} onChange={() => toggleNotif('budgetAlerts')} />
                </SettingRow>
              </SectionCard>

              <SectionCard title="Delivery">
                <SettingRow label="Email notifications" description="Send alerts to your registered email address">
                  <ToggleSwitch checked={notifSettings.emailNotifs} onChange={() => toggleNotif('emailNotifs')} />
                </SettingRow>
                <SettingRow label="Weekly digest" description="Receive a weekly summary of upcoming renewals">
                  <ToggleSwitch checked={notifSettings.weeklyDigest} onChange={() => toggleNotif('weeklyDigest')} />
                </SettingRow>
              </SectionCard>
            </>
          )}

          {activeSection === 'account' && (
            <SectionCard title="Profile Information">
              {[
                { label: 'Full name', key: 'name' as const },
                { label: 'Email address', key: 'email' as const },
                { label: 'Role', key: 'role' as const },
                { label: 'Department', key: 'department' as const },
              ].map((field) => (
                <SettingRow key={field.key} label={field.label}>
                  <input
                    type="text"
                    value={accountSettings[field.key]}
                    onChange={(e) => setAccountSettings((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-full sm:w-64 px-3 py-1.5 rounded-md text-xs outline-none transition-all"
                    style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
                  />
                </SettingRow>
              ))}
              <div className="px-5 py-4">
                <button
                  className="px-4 py-2 text-white text-xs font-semibold rounded-md transition-colors"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  Save changes
                </button>
              </div>
            </SectionCard>
          )}

          {activeSection === 'security' && (
            <>
              <SectionCard title="Password">
                <SettingRow label="Change password" description="Update your account password">
                  <button
                    className="px-3 py-1.5 border rounded-md text-xs transition-all"
                    style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)', backgroundColor: 'var(--card)' }}
                  >
                    Update
                  </button>
                </SettingRow>
              </SectionCard>

              <SectionCard title="Session">
                <SettingRow label="Active sessions" description="Manage where you are signed in">
                  <button
                    className="px-3 py-1.5 border rounded-md text-xs transition-all"
                    style={{ borderColor: 'var(--border)', color: 'var(--danger)', backgroundColor: 'var(--card)' }}
                  >
                    Sign out all
                  </button>
                </SettingRow>
                <SettingRow label="Two-factor authentication" description="Add an extra layer of security">
                  <ToggleSwitch onChange={() => {}} />
                </SettingRow>
              </SectionCard>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
