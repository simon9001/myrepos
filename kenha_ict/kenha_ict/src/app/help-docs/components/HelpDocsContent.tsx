'use client';

import React, { useState } from 'react';
import { Search, BookOpen, FileText, Video, ChevronRight, HelpCircle, MessageCircle, Mail, Phone } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


interface Article {
  id: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  type: 'guide' | 'video' | 'faq';
}

const articles: Article[] = [
  { id: 'a1', title: 'Getting Started with the ICT Dashboard', description: 'A complete walkthrough of the dashboard features, navigation, and key sections.', category: 'Getting Started', readTime: '5 min read', type: 'guide' },
  { id: 'a2', title: 'Managing Software Licenses', description: 'How to view, filter, and track software license expiry dates and renewal status.', category: 'Licenses', readTime: '4 min read', type: 'guide' },
  { id: 'a3', title: 'Understanding License Status Badges', description: 'What Active, Expiring Soon, and Expired badges mean and how to act on them.', category: 'Licenses', readTime: '2 min read', type: 'faq' },
  { id: 'a4', title: 'Tracking Supplier Contracts', description: 'How to view contract details, supplier contacts, and contract period information.', category: 'Contracts', readTime: '3 min read', type: 'guide' },
  { id: 'a5', title: 'Budget & Analytics Overview', description: 'Understanding budget allocation, utilization percentages, and fiscal year comparisons.', category: 'Budget', readTime: '6 min read', type: 'guide' },
  { id: 'a6', title: 'Exporting Data Reports', description: 'How to export license, contract, and budget data for reporting purposes.', category: 'Reports', readTime: '2 min read', type: 'faq' },
  { id: 'a7', title: 'Setting Up Renewal Notifications', description: 'Configure alerts for upcoming license and contract renewals.', category: 'Notifications', readTime: '3 min read', type: 'guide' },
  { id: 'a8', title: 'Dashboard Navigation Tutorial', description: 'Video walkthrough of the main dashboard sections and how to use them effectively.', category: 'Getting Started', readTime: '8 min video', type: 'video' },
  { id: 'a9', title: 'How to Filter and Search Assets', description: 'Using search, category filters, and status filters to find specific ICT assets.', category: 'Licenses', readTime: '2 min read', type: 'faq' },
  { id: 'a10', title: 'Understanding the Budget Pie Chart', description: 'How to read the budget allocation chart and drill into department-level spend.', category: 'Budget', readTime: '3 min read', type: 'faq' },
];

const categories = ['All', 'Getting Started', 'Licenses', 'Contracts', 'Budget', 'Reports', 'Notifications'];

const typeIcon: Record<Article['type'], React.ElementType> = {
  guide: BookOpen,
  video: Video,
  faq: HelpCircle,
};

const typeLabel: Record<Article['type'], string> = {
  guide: 'Guide',
  video: 'Video',
  faq: 'FAQ',
};

export default function HelpDocsContent() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = articles.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'All' || a.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-1" style={{ color: 'var(--muted-foreground)' }}>Support</p>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>Help & Documentation</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
          Guides, FAQs and tutorials for the KeNHA ICT dashboard
        </p>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-lg">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
        <input
          type="text"
          placeholder="Search documentation…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none transition-all"
          style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
        />
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1.5">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all border"
            style={activeCategory === cat
              ? { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderColor: 'var(--primary)' }
              : { backgroundColor: 'var(--card)', color: 'var(--muted-foreground)', borderColor: 'var(--border)' }
            }
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Articles grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <FileText size={32} className="mb-3" style={{ color: 'var(--border)' }} />
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No articles match your search</p>
          </div>
        ) : (
          filtered.map((article) => {
            const Icon = typeIcon[article.type];
            return (
              <div
                key={article.id}
                className="group card-elevated rounded-lg p-4 cursor-pointer transition-all card-hover"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>
                    <Icon size={11} />
                    {typeLabel[article.type]}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                    {article.category}
                  </span>
                </div>
                <h3 className="text-sm font-semibold mb-1 transition-colors" style={{ color: 'var(--foreground)' }}>
                  {article.title}
                </h3>
                <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--muted-foreground)' }}>
                  {article.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{article.readTime}</span>
                  <ChevronRight size={13} style={{ color: 'var(--border)' }} />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Contact support */}
      <div className="rounded-lg p-5 border" style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Still need help?</h3>
        <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>Contact the ICT helpdesk for direct support.</p>
        <div className="flex flex-wrap gap-3">
          <a
            href="mailto:ict@kenha.co.ke"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-xs border transition-all"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          >
            <Mail size={13} /> ict@kenha.co.ke
          </a>
          <a
            href="tel:+254200009000"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-xs border transition-all"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          >
            <Phone size={13} /> +254 20 000 9000
          </a>
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-md text-xs border transition-all"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          >
            <MessageCircle size={13} /> Live Chat
          </button>
        </div>
      </div>
    </div>
  );
}
