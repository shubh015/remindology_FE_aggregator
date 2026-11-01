'use client';

import Link from 'next/link';
import { Check, Sparkles, ArrowRight } from 'lucide-react';

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
          className={`card-quiet relative p-7 sm:p-8 flex flex-col ${plan.highlight ? 'border-ink' : ''}`}
          // .card-quiet is unlayered CSS and outranks the border-ink utility, so pin the featured border inline.
          style={plan.highlight ? { borderColor: 'var(--color-ink)' } : undefined}
        >
          {plan.highlight && (
            <span className="chip absolute -top-[13px] left-1/2 -translate-x-1/2 font-label text-[11px] uppercase tracking-[0.12em] text-ink">
              <Sparkles className="h-3 w-3" />
              Coming Soon
            </span>
          )}

          <div className="mb-6">
            <p className="font-label text-[11px] uppercase tracking-[0.12em] text-ink-muted mb-3">
              {plan.name}
            </p>
            <div className="flex items-end gap-2 mb-3">
              <span className="font-display font-light text-5xl leading-none text-ink">
                {plan.price}
              </span>
              <span className="text-sm text-ink-muted mb-1">
                {plan.period}
              </span>
            </div>
            <p className="text-[14px] leading-relaxed text-ink-muted">
              {plan.tagline}
            </p>
          </div>

          <ul className="space-y-3 mb-8 flex-1 border-t border-rule pt-6">
            {plan.features.map((f, i) => {
              const isHeader = f.endsWith('plus:');
              return (
                <li key={i} className="flex items-start gap-2.5">
                  {!isHeader && (
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-ink" strokeWidth={2} />
                  )}
                  <span
                    className={`text-[14px] leading-snug ${isHeader ? 'font-medium text-ink-muted' : 'text-ink-soft'}`}
                  >
                    {f}
                  </span>
                </li>
              );
            })}
          </ul>

          {plan.highlight ? (
            <div
              className="btn-ink w-full justify-center cursor-not-allowed select-none opacity-50"
              aria-disabled="true"
            >
              Coming Soon
            </div>
          ) : (
            <Link href={plan.href} className="btn-outline w-full justify-center">
              {plan.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
