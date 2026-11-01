'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQS } from './faq-data';

export function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="max-w-3xl mx-auto border-b border-rule">
      {FAQS.map((faq, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="border-t border-rule">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-6 py-5 text-left cursor-pointer bg-transparent border-0"
            >
              <span className="text-[17px] font-medium leading-snug text-ink">
                {faq.q}
              </span>
              <ChevronDown
                className={`shrink-0 h-4 w-4 text-ink-muted transition-transform duration-200 ease-out ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                aria-hidden="true"
              />
            </button>

            {isOpen && (
              <div className="pb-6 pr-10">
                <p className="text-[15px] leading-[1.7] text-ink-muted">
                  {faq.a}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
