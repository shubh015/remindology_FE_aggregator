'use client';

import Link from 'next/link';
import { Megaphone, Lightbulb, Bell, BookOpen, PenTool, FileText, ArrowRight } from 'lucide-react';

const CARDS = [
  {
    title: 'Current Affairs',
    description: 'Monthly magazines and PIB summaries curated for UPSC relevance and answer writing',
    icon: Megaphone,
    href: '/current-affairs',
  },
  {
    title: 'Study Material',
    description: 'Syllabus, standard books, PYQs, and government schemes for structured preparation',
    icon: Lightbulb,
    href: '/signup',
  },
  {
    title: 'Updates',
    description: 'Official notifications, exam updates, and answer keys explained clearly and timely',
    icon: Bell,
    href: '/signup',
  },
  {
    title: 'General Studies',
    description: 'History, polity, economy, environment, and core GS subjects explained systematically',
    icon: BookOpen,
    href: '/general-studies',
  },
  {
    title: 'UPSC Preparation',
    description: 'Proven strategies, techniques, and mains answer writing guidance from toppers\' insights',
    icon: PenTool,
    href: '/signup',
  },
  {
    title: 'Blogs',
    description: 'Insights, opinions, and practical UPSC preparation advice from aspirants and mentors',
    icon: FileText,
    href: '/signup',
  },
];

export function UPSCPrepGrid() {
  return (
    <div className="ks-container relative">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="card-quiet is-interactive group p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-4 w-full">
                  {/* Icon tile */}
                  <div className="h-8 w-8 rounded-md border border-rule bg-paper-deep flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-ink" strokeWidth={1.75} />
                  </div>
                  {/* Title */}
                  <div className="flex-1 flex items-center justify-between">
                    <span className="card-title">{card.title}</span>
                    <ArrowRight className="h-4 w-4 text-ink-faint transition-[transform,color] duration-200 ease-out group-hover:translate-x-0.5 group-hover:text-ink" />
                  </div>
                </div>
                {/* Description */}
                <p className="text-[14px] leading-relaxed text-ink-muted">
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
