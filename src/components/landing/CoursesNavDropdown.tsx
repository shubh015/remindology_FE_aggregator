'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { ChevronDown, GraduationCap, ArrowRight } from 'lucide-react';
import { useCourses } from '@/features/courses/hooks/use-courses';

const BORDER = '1px solid rgba(22,35,62,0.1)';

export function CoursesNavDropdown() {
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
        className="flex items-center gap-1 text-sm font-medium transition-colors whitespace-nowrap px-3 py-1.5 rounded-lg hover:text-foreground hover:bg-black/3"
        style={{ color: open ? '#16233E' : '#5B6478' }}
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
          className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 w-60 rounded-2xl z-50 overflow-hidden bg-white"
          style={{
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: BORDER,
            boxShadow: '0 20px 48px rgba(22,35,62,0.12), 0 0 0 1px rgba(22,35,62,0.04)',
          }}
          onMouseEnter={show}
          onMouseLeave={hide}
        >
          {/* Label */}
          <div className="px-4 py-2.5" style={{ borderBottom: BORDER }}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              All Courses
            </p>
          </div>

          {/* Course list */}
          <div className="py-1.5 max-h-72 overflow-y-auto">
            {courses && courses.length > 0 ? (
              courses.map((course) => {
                const accent = course.color || '#8A6A12';
                return (
                  <Link
                    key={course.id}
                    href={`/courses/${course.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-black/3"
                  >
                    <div
                      className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${accent}22`, color: accent }}
                    >
                      <GraduationCap className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-sm font-medium leading-snug text-foreground">
                      {course.name}
                    </span>
                  </Link>
                );
              })
            ) : (
              <p className="px-4 py-3 text-sm text-muted-foreground">
                Loading…
              </p>
            )}
          </div>

          {/* Footer CTA */}
          <div className="px-4 py-2.5" style={{ borderTop: BORDER }}>
            <Link
              href="/courses"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between text-xs font-semibold transition-opacity hover:opacity-75 text-primary"
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
