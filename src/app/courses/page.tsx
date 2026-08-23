'use client';

import Link from 'next/link';
import { GraduationCap, ArrowRight, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useCourses } from '@/features/courses/hooks/use-courses';

const MIDNIGHT  = '#09091F';
const TEXT_GRAD = {
  background: 'linear-gradient(135deg, #A78BFA, #E879F9)',
  WebkitBackgroundClip: 'text' as const,
  WebkitTextFillColor: 'transparent',
};

function CourseCardSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Skeleton key={i} className="h-32 rounded-2xl" />
      ))}
    </div>
  );
}

export default function CoursesIndexPage() {
  const { data: courses, isLoading, isError } = useCourses();

  return (
    <div style={{ fontFamily: 'var(--font-poppins), system-ui, sans-serif' }}>

      {/* ── Dark hero ── */}
      <section className="relative overflow-hidden" style={{ background: MIDNIGHT }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(167,139,250,0.07) 1px, transparent 1px)', backgroundSize: '30px 30px' }}
        />
        <div
          className="absolute pointer-events-none"
          style={{ top: 0, right: '-8%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 68%)' }}
        />

        <div className="relative max-w-7xl mx-auto px-6 pt-14 pb-16">
          <div
            className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full mb-4"
            style={{ background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.35)', color: '#C4B5FD' }}
          >
            <GraduationCap className="h-3.5 w-3.5" />
            Courses
          </div>
          <h1
            className="font-extrabold tracking-tight mb-4"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', lineHeight: 1.15, color: '#F0EEFF' }}
          >
            Everything about your <span style={TEXT_GRAD}>exam</span>, in one place
          </h1>
          <p className="text-sm max-w-xl" style={{ color: 'rgba(196,181,253,0.6)' }}>
            Exam pattern, recommended booklist, key facts, year-wise question breakdown &amp; the latest notifications.
          </p>
        </div>
      </section>

      {/* ── Courses grid ── */}
      <section style={{ background: '#FFFFFF' }}>
        <div className="max-w-7xl mx-auto px-6 py-14">
          {isLoading ? (
            <CourseCardSkeleton />
          ) : isError ? (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Could not load courses. Please try again later.
            </div>
          ) : !courses || courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 p-14 text-center gap-2">
              <GraduationCap className="h-8 w-8 text-black/20" />
              <p className="text-sm font-semibold text-black/70">Courses are coming soon</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => {
                const accent = course.color || '#7C3AED';
                return (
                  <Link
                    key={course.id}
                    href={`/courses/${course.slug}`}
                    className="group rounded-2xl bg-white p-5 transition-all hover:-translate-y-0.5"
                    style={{ border: `1px solid ${accent}33`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
                  >
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center mb-3"
                      style={{ background: `${accent}15`, color: accent }}
                    >
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <p className="font-bold mb-1.5" style={{ fontSize: '1.05rem', color: '#111827' }}>
                      {course.name}
                    </p>
                    {course.shortDescription && (
                      <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-3">
                        {course.shortDescription}
                      </p>
                    )}
                    <span
                      className="inline-flex items-center gap-1 text-xs font-semibold transition-colors"
                      style={{ color: accent }}
                    >
                      View details
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
