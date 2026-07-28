'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQS } from './faq-data';

const TEXT_DARK = '#1A1836';
const TEXT_MID  = '#6B63A0';

export function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="space-y-3">
        {FAQS.map((faq, i) => (
          <div
            key={i}
            className="rounded-2xl overflow-hidden"
            style={{
              border: open === i
                ? '1px solid rgba(124,58,237,0.3)'
                : '1px solid rgba(124,58,237,0.1)',
              background: open === i ? 'rgba(124,58,237,0.04)' : '#FFFFFF',
              transition: 'border-color 0.2s, background 0.2s',
            }}
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
              style={{ cursor: 'pointer', background: 'transparent', border: 'none' }}
            >
              <span
                className="text-sm font-semibold leading-snug"
                style={{ color: open === i ? '#7C3AED' : TEXT_DARK, transition: 'color 0.2s' }}
              >
                {faq.q}
              </span>
              <ChevronDown
                className="shrink-0 h-4 w-4"
                style={{
                  color: open === i ? '#7C3AED' : '#9D95C4',
                  transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.25s ease, color 0.2s',
                }}
              />
            </button>

            {open === i && (
              <div
                className="px-6 pb-5"
                style={{ borderTop: '1px solid rgba(124,58,237,0.08)' }}
              >
                <p
                  className="text-sm leading-relaxed pt-4"
                  style={{ color: TEXT_MID }}
                >
                  {faq.a}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
