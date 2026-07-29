'use client';

import Link from 'next/link';
import { Check, Sparkles, ArrowRight } from 'lucide-react';

const BRAND_GRAD = 'linear-gradient(135deg, #7C3AED, #C026D3)';
const TEXT_DARK  = '#1A1836';
const TEXT_MID   = '#6B63A0';

interface Plan {
  name: string;
  price: string;
  period: string;
  tagline: string;
  cta: string;
  href: string;
  highlight: boolean;
  features: string[];
}

const PLANS: Plan[] = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    tagline: 'Everything you need to start turning material into revision.',
    cta: 'Start for Free',
    href: '/signup',
    highlight: false,
    features: [
      'AI summaries, notes & MCQs',
      'Up to 10 uploads per month',
      'Key topics extraction',
      'Daily challenge & streaks',
      'Personal study library',
    ],
  },
  {
    name: 'Pro',
    price: '₹149',
    period: '/ month',
    tagline: 'The full exam OS — unlimited AI for serious aspirants.',
    cta: 'Go Pro',
    href: '/signup',
    highlight: true,
    features: [
      'Everything in Free, plus:',
      'Unlimited uploads & AI generations',
      'Mains answer evaluation & scorecard',
      'Weak-zone tracker & analytics',
      'AI 30-day study plan',
      'Current affairs digest & mnemonics',
      'Priority AI processing',
    ],
  },
];

export function Pricing() {
  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">
      {PLANS.map(plan => (
        <div
          key={plan.name}
          className="relative rounded-3xl p-7 sm:p-8 flex flex-col"
          style={
            plan.highlight
              ? { background: '#09091F', border: '1px solid rgba(124,58,237,0.4)', boxShadow: '0 24px 60px rgba(124,58,237,0.25)' }
              : { background: '#FFFFFF', border: '1px solid rgba(124,58,237,0.14)', boxShadow: '0 12px 40px rgba(124,58,237,0.07)' }
          }
        >
          {plan.highlight && (
            <span
              className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full text-white whitespace-nowrap"
              style={{ background: BRAND_GRAD, boxShadow: '0 6px 20px rgba(124,58,237,0.45)' }}
            >
              <Sparkles className="h-3 w-3" />
              Coming Soon
            </span>
          )}

          <div className="mb-5">
            <p
              className="text-sm font-bold mb-2"
              style={{ color: plan.highlight ? '#C4B5FD' : '#7C3AED' }}
            >
              {plan.name}
            </p>
            <div className="flex items-end gap-1.5 mb-2">
              <span
                className="text-4xl font-extrabold tracking-tight"
                style={{ color: plan.highlight ? '#F0EEFF' : TEXT_DARK }}
              >
                {plan.price}
              </span>
              <span
                className="text-sm font-medium mb-1.5"
                style={{ color: plan.highlight ? 'rgba(196,181,253,0.6)' : TEXT_MID }}
              >
                {plan.period}
              </span>
            </div>
            <p
              className="text-[13px] leading-relaxed"
              style={{ color: plan.highlight ? 'rgba(196,181,253,0.7)' : TEXT_MID }}
            >
              {plan.tagline}
            </p>
          </div>

          <ul className="space-y-3 mb-7 flex-1">
            {plan.features.map((f, i) => {
              const isHeader = f.endsWith('plus:');
              return (
                <li key={i} className="flex items-start gap-2.5">
                  {!isHeader && (
                    <span
                      className="mt-0.5 rounded-full flex items-center justify-center shrink-0"
                      style={{ width: 18, height: 18, background: plan.highlight ? 'rgba(124,58,237,0.25)' : 'rgba(5,150,105,0.1)' }}
                    >
                      <Check
                        className="h-3 w-3"
                        strokeWidth={3}
                        style={{ color: plan.highlight ? '#C4B5FD' : '#059669' }}
                      />
                    </span>
                  )}
                  <span
                    className="text-[13px] leading-snug"
                    style={{
                      color: isHeader
                        ? (plan.highlight ? 'rgba(196,181,253,0.55)' : TEXT_MID)
                        : (plan.highlight ? 'rgba(240,238,255,0.85)' : '#4B4580'),
                      fontWeight: isHeader ? 700 : 400,
                    }}
                  >
                    {f}
                  </span>
                </li>
              );
            })}
          </ul>

          {plan.highlight ? (
            <div
              className="inline-flex items-center justify-center gap-2 font-semibold px-6 py-3.5 rounded-xl text-sm cursor-not-allowed select-none opacity-50"
              style={{ background: BRAND_GRAD, color: '#FFFFFF' }}
            >
              Coming Soon
            </div>
          ) : (
            <Link
              href={plan.href}
              className="inline-flex items-center justify-center gap-2 font-semibold px-6 py-3.5 rounded-xl text-sm transition-opacity hover:opacity-90"
              style={{ background: 'rgba(124,58,237,0.08)', color: '#7C3AED', border: '1px solid rgba(124,58,237,0.2)' }}
            >
              {plan.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
