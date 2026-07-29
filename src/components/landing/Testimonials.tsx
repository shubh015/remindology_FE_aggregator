'use client';

import { useState } from 'react';
import { Star, Quote } from 'lucide-react';

// ── Aspirant testimonials ─────────────────────────────────────────
interface Testimonial {
  name: string;
  exam: string;
  quote: string;
  accent: string;
}

const TESTIMONIALS: Testimonial[] = [
  { name: 'Ananya R.', exam: 'UPSC CSE Aspirant', accent: '#7C3AED',
    quote: 'I paste a whole editorial and get notes + MCQs before my chai is done. It cut my note-making time in half.' },
  { name: 'Kunal M.', exam: 'SSC CGL 2025', accent: '#0891B2',
    quote: 'The daily challenge got me to study every single morning. 40-day streak and my prelims accuracy is way up.' },
  { name: 'Priya S.', exam: 'State PSC (MPPSC)', accent: '#059669',
    quote: 'The mains scorecard is brutal in the best way. It shows exactly where my answers lose marks — intro, examples, conclusion.' },
  { name: 'Rohit V.', exam: 'UPSC CSE Aspirant', accent: '#D97706',
    quote: 'Weak-zone tracker was an eye-opener. I thought I was strong in Polity — turns out Governance was killing my score.' },
  { name: 'Sneha K.', exam: 'SSC CHSL', accent: '#C026D3',
    quote: 'Current affairs already tagged to the syllabus saves me an hour daily. No more juggling three newspapers.' },
  { name: 'Aditya P.', exam: 'State PSC (BPSC)', accent: '#818CF8',
    quote: 'The mnemonics are genuinely clever. Facts I kept forgetting now actually stick before the exam.' },
  { name: 'Meera J.', exam: 'UPSC CSE Aspirant', accent: '#F43F5E',
    quote: 'The 30-day plan gave my prep a structure I never had. I open the app and I just know what to do today.' },
  { name: 'Vikram T.', exam: 'SSC CGL 2025', accent: '#7C3AED',
    quote: 'Detective mode explains WHY each wrong option is wrong. That single feature fixed my silly mistakes.' },
];

const TEXT_DARK = '#1A1836';
const TEXT_MID  = '#6B63A0';

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2);
}

function Card({ t }: { t: Testimonial }) {
  return (
    <div
      className="shrink-0 w-[300px] sm:w-[340px] rounded-2xl p-5 flex flex-col"
      style={{ background: '#FFFFFF', border: '1px solid rgba(124,58,237,0.12)', boxShadow: '0 8px 28px rgba(124,58,237,0.06)' }}
    >
      <div className="flex items-center gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5" style={{ color: '#F59E0B', fill: '#F59E0B' }} />
        ))}
        <Quote className="h-4 w-4 ml-auto" style={{ color: 'rgba(124,58,237,0.25)' }} />
      </div>
      <p className="text-[13px] leading-relaxed flex-1" style={{ color: '#4B4580' }}>
        “{t.quote}”
      </p>
      <div className="flex items-center gap-3 mt-4 pt-4" style={{ borderTop: '1px solid rgba(124,58,237,0.08)' }}>
        <div
          className="h-9 w-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
          style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.accent}CC)` }}
        >
          {initials(t.name)}
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-bold truncate" style={{ color: TEXT_DARK }}>{t.name}</p>
          <p className="text-[11px] truncate" style={{ color: TEXT_MID }}>{t.exam}</p>
        </div>
      </div>
    </div>
  );
}

function Row({ items, reverse }: { items: Testimonial[]; reverse?: boolean }) {
  const [paused, setPaused] = useState(false);
  // Duplicate so the -50% marquee loop is seamless
  const doubled = [...items, ...items];
  return (
    <div
      className="overflow-hidden"
      style={{
        maskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="marquee-track flex gap-4 w-max"
        style={{
          animationDuration: '48s',
          animationDirection: reverse ? 'reverse' : 'normal',
          animationPlayState: paused ? 'paused' : 'running',
        }}
      >
        {doubled.map((t, i) => (
          <Card key={i} t={t} />
        ))}
      </div>
    </div>
  );
}

export function Testimonials() {
  const half = Math.ceil(TESTIMONIALS.length / 2);
  return (
    <div className="space-y-4">
      <Row items={TESTIMONIALS.slice(0, half)} />
      <Row items={TESTIMONIALS.slice(half)} reverse />
    </div>
  );
}
