'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { ChevronDown, GraduationCap, ArrowRight } from 'lucide-react';
import { useCourses } from '@/features/courses/hooks/use-courses';


// `variant` is accepted for backwards compatibility; only the monochrome style exists now.
export function CoursesNavDropdown(props: { variant?: 'default' | 'mono' } = {}) {
  void props;
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

  return (
    <div className="relative" onMouseEnter={show} onMouseLeave={hide}>
      {/* Trigger */}
      <Link
        href="/courses"
        className={`nav-link flex items-center gap-1 whitespace-nowrap ${open ? 'text-ink!' : ''}`}
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
          className={'absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 rounded-[4px] z-50 overflow-hidden bg-paper-raised border border-rule shadow-lift-2'}
          onMouseEnter={show}
          onMouseLeave={hide}
        >
          {/* Label */}
          <div className={'px-4 py-3 border-b border-rule'}>
            <p className={'eyebrow'}>
              All Courses
            </p>
          </div>

          {/* Course list */}
          <div className="py-1.5 max-h-72 overflow-y-auto">
            {courses && courses.length > 0 ? (
              courses.map((course) => {
                return (
                  <Link
                    key={course.id}
                    href={`/courses/${course.slug}`}
                    onClick={() => setOpen(false)}
                    className={'flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-paper-deep'}
                  >
                    <div
                      className={'h-7 w-7 rounded-md flex items-center justify-center shrink-0 border border-rule bg-paper-deep text-ink'}
                    >
                      <GraduationCap className="h-3.5 w-3.5" />
                    </div>
                    <span className={'text-sm leading-snug text-ink'}>
                      {course.name}
                    </span>
                  </Link>
                );
              })
            ) : (
              <p className={'px-4 py-3 text-sm text-ink-muted'}>
                Loading…
              </p>
            )}
          </div>

          {/* Footer CTA */}
          <div className={'px-4 py-3 border-t border-rule'}>
            <Link
              href="/courses"
              onClick={() => setOpen(false)}
              className={'flex items-center justify-between text-[13px] font-semibold text-ink transition-opacity hover:opacity-70'}
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
