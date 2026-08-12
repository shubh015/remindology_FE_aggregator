import {
  Target, BookOpenCheck, ScrollText, Radar,
  CalendarRange, Landmark, Lightbulb, BookmarkCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ── Real, already-shipped features — no names, quotes or ratings ──
interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  accent: string;
}

const FEATURES: Feature[] = [
  { icon: Target, title: 'Daily Challenge', accent: '#7C3AED',
    description: 'A fresh MCQ set every day, scored instantly with streaks to keep you consistent.' },
  { icon: BookOpenCheck, title: 'Current Affairs', accent: '#0891B2',
    description: 'Daily news mapped straight to the syllabus, so you skip the newspaper juggling.' },
  { icon: ScrollText, title: 'Mains Scorecard', accent: '#059669',
    description: 'AI-graded mains answers, scored on structure, examples and conclusion.' },
  { icon: Radar, title: 'Weak-Zone Tracker', accent: '#D97706',
    description: 'Tracks your accuracy topic by topic, so you know exactly where to focus next.' },
  { icon: CalendarRange, title: '30-Day Plan', accent: '#C026D3',
    description: 'A structured daily plan for your prep, so you always know what to study today.' },
  { icon: Landmark, title: 'General Studies', accent: '#818CF8',
    description: 'Structured GS content across papers, ready to read — no scattered PDFs.' },
  { icon: Lightbulb, title: 'Mnemonics', accent: '#F43F5E',
    description: 'Memory aids for facts that are easy to read and hard to forget on exam day.' },
  { icon: BookmarkCheck, title: 'Revision Trail', accent: '#7C3AED',
    description: 'Save any note or article for spaced revision before it becomes due again.' },
];

const TEXT_DARK = '#1A1836';
const TEXT_MID  = '#6B63A0';

function Card({ f }: { f: Feature }) {
  const Icon = f.icon;
  return (
    <div
      className="rounded-2xl p-5 flex flex-col transition-transform hover:-translate-y-1"
      style={{ background: '#FFFFFF', border: '1px solid rgba(124,58,237,0.12)', boxShadow: '0 8px 28px rgba(124,58,237,0.06)' }}
    >
      <div
        className="h-10 w-10 rounded-xl flex items-center justify-center mb-4"
        style={{ background: `${f.accent}14` }}
      >
        <Icon className="h-5 w-5" style={{ color: f.accent }} />
      </div>
      <p className="text-[14px] font-bold mb-1.5" style={{ color: TEXT_DARK }}>{f.title}</p>
      <p className="text-[12.5px] leading-relaxed" style={{ color: TEXT_MID }}>{f.description}</p>
    </div>
  );
}

export function Testimonials() {
  return (
    <div className="relative max-w-5xl mx-auto px-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FEATURES.map((f) => (
          <Card key={f.title} f={f} />
        ))}
      </div>
    </div>
  );
}
