'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { ChevronDown, GraduationCap, ArrowRight } from 'lucide-react';
import { useCourses } from '@/features/courses/hooks/use-courses';

const BORDER = '1px solid rgba(124,58,237,0.18)';

interface Props {
  /** true = dark navbar (landing/public pages) */
  dark?: boolean;
}

export function CoursesNavDropdown({ dark = true }: Props) {
  const [open, setOpen] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { data: courses } = useCourses();

  const show = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setOpen(true);
  };
  const hide = () => {
    hideTimer.current = setTimeout(() => setOpen(false), 120);
  };

  const linkColor = dark
    ? open ? 'rgba(255,255,255,0.92)' : 'rgba(240,238,255,0.65)'
    : open ? '#1A1836' : '#6B63A0';

  return (
    <div className="relative" onMouseEnter={show} onMouseLeave={hide}>
      {/* Trigger */}
      <Link
        href="/courses"
        className={[
          'flex items-center gap-1 text-sm font-medium transition-colors whitespace-nowrap',
          'px-3 py-1.5 rounded-lg',
          dark ? 'hover:text-white hover:bg-white/5' : 'hover:text-[#1A1836] hover:bg-black/5',
        ].join(' ')}
        style={{ color: linkColor }}
      >
        Courses
        <ChevronDown
          className="h-3 w-3 transition-transform duration-150"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </Link>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 w-60 rounded-2xl z-50 overflow-hidden"
          style={{
            background: 'rgba(10,9,38,0.97)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: BORDER,
            boxShadow: '0 20px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(124,58,237,0.08)',
          }}
          onMouseEnter={show}
          onMouseLeave={hide}
        >
          {/* Label */}
          <div className="px-4 py-2.5" style={{ borderBottom: BORDER }}>
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(167,139,250,0.55)' }}>
              All Courses
            </p>
          </div>

          {/* Course list */}
          <div className="py-1.5 max-h-72 overflow-y-auto">
            {courses && courses.length > 0 ? (
              courses.map((course) => {
                const accent = course.color || '#7C3AED';
                return (
                  <Link
                    key={course.id}
                    href={`/courses/${course.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-white/5"
                  >
                    <div
                      className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${accent}22`, color: accent }}
                    >
                      <GraduationCap className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-sm font-medium leading-snug" style={{ color: 'rgba(240,238,255,0.82)' }}>
                      {course.name}
                    </span>
                  </Link>
                );
              })
            ) : (
              <p className="px-4 py-3 text-sm" style={{ color: 'rgba(196,181,253,0.4)' }}>
                Loading…
              </p>
            )}
          </div>

          {/* Footer CTA */}
          <div className="px-4 py-2.5" style={{ borderTop: BORDER }}>
            <Link
              href="/courses"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between text-xs font-semibold transition-opacity hover:opacity-75"
              style={{ color: '#A78BFA' }}
            >
              View all courses
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
