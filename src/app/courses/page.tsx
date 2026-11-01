'use client';

import Link from 'next/link';
import { GraduationCap, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useCourses } from '@/features/courses/hooks/use-courses';

function CourseCardSkeleton() {
  return (
    <div className="ks-card-grid">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Skeleton key={i} className="h-64 rounded-[2px]" />
      ))}
    </div>
  );
}

export default function CoursesIndexPage() {
  const { data: courses, isLoading, isError } = useCourses();

  return (
    <div>

      {/* ── Hero ── */}
      <section className="bg-paper border-b border-rule">
        <div className="ks-container pt-14 pb-14">
          <span className="eyebrow mb-4 inline-flex items-center gap-2">
            <GraduationCap className="h-3.5 w-3.5" />
            Courses
          </span>
          <h1 className="doc-title mb-4">Everything about your exam, in one place</h1>
          <p className="doc-lede max-w-xl text-ink-muted">
            Exam pattern, recommended booklist, key facts, year-wise question breakdown &amp; the latest notifications.
          </p>
        </div>
      </section>

      {/* ── Courses grid ── */}
      <section className="bg-paper">
        <div className="ks-container py-14">
          {isLoading ? (
            <CourseCardSkeleton />
          ) : isError ? (
            <div className="flex items-center gap-2 rounded-[3px] bg-paper-raised border border-rule p-4 text-sm text-[oklch(52%_.16_35)]">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Could not load courses. Please try again later.
            </div>
          ) : !courses || courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[3px] border border-dashed border-rule-strong p-14 text-center gap-2">
              <GraduationCap className="h-8 w-8 text-ink-muted" />
              <p className="text-sm font-semibold text-ink-muted">Courses are coming soon</p>
            </div>
          ) : (
            <div className="ks-card-grid">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.slug}`}
                  className="ks-card"
                >
                  <div className="ks-card-visual h-[120px]! flex items-center justify-center">
                    <span className="font-display font-light text-6xl text-ink leading-none" aria-hidden="true">
                      {course.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="ks-card-body">
                    <h3 className="ks-card-title">{course.name}</h3>
                    {course.shortDescription && (
                      <p className="ks-card-desc line-clamp-2">{course.shortDescription}</p>
                    )}
                    <span className="ks-card-link">View details</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
