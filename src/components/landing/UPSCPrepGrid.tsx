'use client';

import Link from 'next/link';
import { Megaphone, Lightbulb, Bell, BookOpen, PenTool, FileText, ArrowRight } from 'lucide-react';

const CARDS = [
  {
    title: 'Current Affairs',
    description: 'Monthly magazines and PIB summaries curated for UPSC relevance and answer writing',
    icon: Megaphone,
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.08)',
    href: '/current-affairs',
  },
  {
    title: 'Study Material',
    description: 'Syllabus, standard books, PYQs, and government schemes for structured preparation',
    icon: Lightbulb,
    color: '#84CC16',
    bg: 'rgba(132, 204, 22, 0.08)',
    href: '/signup',
  },
  {
    title: 'Updates',
    description: 'Official notifications, exam updates, and answer keys explained clearly and timely',
    icon: Bell,
    color: '#3B82F6',
    bg: 'rgba(59, 130, 246, 0.08)',
    href: '/signup',
  },
  {
    title: 'General Studies',
    description: 'History, polity, economy, environment, and core GS subjects explained systematically',
    icon: BookOpen,
    color: '#8B5CF6',
    bg: 'rgba(139, 92, 246, 0.08)',
    href: '/general-studies',
  },
  {
    title: 'UPSC Preparation',
    description: 'Proven strategies, techniques, and mains answer writing guidance from toppers\' insights',
    icon: PenTool,
    color: '#EC4899',
    bg: 'rgba(236, 72, 153, 0.08)',
    href: '/signup',
  },
  {
    title: 'Blogs',
    description: 'Insights, opinions, and practical UPSC preparation advice from aspirants and mentors',
    icon: FileText,
    color: '#10B981',
    bg: 'rgba(16, 185, 129, 0.08)',
    href: '/signup',
  },
];

const TEXT_DARK = '#1A1836';
const TEXT_MID = '#6B63A0';

export function UPSCPrepGrid() {
  return (
    <div className="relative max-w-5xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="group rounded-3xl p-6 bg-white border border-slate-100/80 shadow-[0_4px_20px_rgba(124,58,237,0.02)] transition-all duration-500 ease-in-out hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(124,58,237,0.06)] hover:border-[#7C3AED]/20 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-4 w-full">
                  {/* Icon container */}
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: card.bg }}
                  >
                    <Icon className="h-5 w-5" style={{ color: card.color }} />
                  </div>
                  {/* Title pill container */}
                  <div className="flex-1 flex items-center justify-between px-4 py-2 rounded-2xl bg-[#F3F4F6]/50 border border-slate-100/50 group-hover:bg-[#F3F4F6] transition-colors duration-500 ease-in-out">
                    <span className="text-[13px] font-bold" style={{ color: TEXT_DARK }}>{card.title}</span>
                    <ArrowRight className="h-4 w-4 text-[#6B63A0] transition-transform duration-500 group-hover:translate-x-0.5" />
                  </div>
                </div>
                {/* Description */}
                <p className="text-[12.5px] leading-relaxed px-1" style={{ color: TEXT_MID }}>
                  {card.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
