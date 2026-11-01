'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, AlertCircle, GraduationCap, BookOpen, Bell, ExternalLink, List, Plus, Minus,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useCourse } from '@/features/courses/hooks/use-courses';

function SectionHeading({ children }: { children: string }) {
  return (
    <h2 className="doc-h2 pb-3 border-b border-rule">
      {children}
    </h2>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function CourseSkeleton() {
  return (
    <div className="ks-container py-14 space-y-4">
      <Skeleton className="h-8 w-2/3 rounded" />
      <Skeleton className="h-4 w-full rounded" />
      <Skeleton className="h-4 w-5/6 rounded" />
      <Skeleton className="h-40 w-full rounded-[3px] mt-6" />
    </div>
  );
}

export function CourseDetailClient() {
  const { slug } = useParams<{ slug: string }>();
  const { data: course, isLoading, isError } = useCourse(slug);

  // Hooks must run in the same order every render, so all of them (including
  // ones that only make sense once `course` has loaded) live above the
  // isLoading/isError early returns below.
  const toc = useMemo(() => ([
    course?.overview && { label: 'Overview', id: 'overview' },
    !!course?.examPattern?.length && { label: 'Exam Pattern', id: 'exam-pattern' },
    !!course?.booklist?.length && { label: 'Booklist', id: 'booklist' },
    !!course?.examInfo?.length && { label: 'Exam Information', id: 'exam-info' },
    !!course?.yearWiseBreakdown?.length && { label: 'Year-wise Breakdown', id: 'year-wise-breakdown' },
  ].filter(Boolean) as { label: string; id: string }[]), [course]);

  const [activeId, setActiveId] = useState('');
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());

  // Scroll-spy: highlight whichever section's heading is currently near the top of the viewport.
  useEffect(() => {
    if (toc.length === 0) return;
    const elements = toc
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => !!el);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '-15% 0px -65% 0px', threshold: 0 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [toc]);

  if (isLoading) {
    return (
      <div>
        <section className="bg-paper">
          <CourseSkeleton />
        </section>
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div>
        <section className="bg-paper min-h-[60vh]">
          <div className="ks-container py-20 flex flex-col items-center gap-4 text-center">
            <AlertCircle className="h-10 w-10 text-[oklch(52%_.16_35)]" />
            <p className="doc-h3">Course not found</p>
            <Link href="/courses" className="btn-ink">
              <ArrowLeft className="h-4 w-4" />Back to Courses
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const hasContent = !!course.overview || !!course.examPattern?.length || !!course.booklist?.length
    || !!course.examInfo?.length || !!course.yearWiseBreakdown?.length;

  // Most recent year first; open by default until the reader explicitly collapses/expands one.
  const sortedYears = [...(course.yearWiseBreakdown ?? [])].sort((a, b) => b.year - a.year);
  const latestYear = sortedYears[0]?.year;
  const isYearExpanded = (year: number) =>
    (expandedYears.size === 0 ? year === latestYear : expandedYears.has(year));
  const toggleYear = (year: number) => {
    setExpandedYears((prev) => {
      const next = prev.size === 0 && latestYear !== undefined ? new Set([latestYear]) : new Set(prev);
      if (next.has(year)) next.delete(year); else next.add(year);
      return next;
    });
  };

  return (
    <div>

      {/* ── Hero ── */}
      <section className="bg-paper border-b border-rule">
        <div className="ks-container pt-10 pb-12">
          <div className="flex items-center gap-2 mb-6">
            <Link href="/courses" className="nav-link text-sm! inline-flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              Courses
            </Link>
          </div>

          <span className="eyebrow mb-4 inline-flex items-center gap-2">
            <GraduationCap className="h-3.5 w-3.5" />
            Course
          </span>

          <h1 className="doc-title mb-4">
            {course.name}
          </h1>

          {course.shortDescription && (
            <p className="doc-lede max-w-2xl text-ink-muted">
              {course.shortDescription}
            </p>
          )}
        </div>
      </section>

      {/* ── Content ── */}
      <section className="bg-paper">
        <div className="ks-container py-12">
          <div className="grid lg:grid-cols-[1fr_240px] gap-12 items-start">

            <article className="space-y-12 min-w-0">

              {/* Notifications — time-sensitive, shown first */}
              {(course.notifications?.length ?? 0) > 0 && (
                <section className="space-y-3">
                  <div className="rounded-[3px] p-4 space-y-3 bg-paper-raised border border-rule">
                    <div className="flex items-center gap-2">
                      <span className="ks-tag ks-tag-gold inline-flex items-center gap-1.5">
                        <Bell className="h-3 w-3" />
                        Notifications
                      </span>
                    </div>
                    <div className="space-y-2">
                      {course.notifications!.map((n) => (
                        <a
                          key={n.id}
                          href={n.linkUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 text-sm font-medium text-ink hover:underline underline-offset-4"
                        >
                          <ExternalLink className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
                          {n.title}
                          {n.notificationDate && (
                            <span className="font-label text-[11px] uppercase tracking-[0.1em] text-ink-muted">
                              — {formatDate(n.notificationDate)}
                            </span>
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {!hasContent ? (
                <p className="doc-note">
                  Details for this course are being prepared — check back soon.
                </p>
              ) : (
                <>
                  {course.overview && (
                    <section id="overview" className="space-y-4 scroll-mt-24">
                      <SectionHeading>Overview</SectionHeading>
                      <div className="doc-prose">
                        <p>{course.overview}</p>
                      </div>
                    </section>
                  )}

                  {(course.examPattern?.length ?? 0) > 0 && (
                    <section id="exam-pattern" className="space-y-4 scroll-mt-24">
                      <SectionHeading>Exam Pattern</SectionHeading>
                      <div className="border-t border-rule">
                        {course.examPattern!.map((stage, i) => (
                          <div key={i} className="flex items-start gap-4 py-4 border-b border-rule">
                            <span className="font-label text-[11px] tracking-[0.1em] text-ink-muted shrink-0 pt-0.5 tabular-nums">
                              {String(i + 1).padStart(2, '0')}
                            </span>
                            <div>
                              <p className="doc-h3 mb-1!">{stage.stage}</p>
                              <p className="text-sm leading-relaxed text-ink-muted">{stage.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {(course.booklist?.length ?? 0) > 0 && (
                    <section id="booklist" className="space-y-4 scroll-mt-24">
                      <SectionHeading>Booklist</SectionHeading>
                      <div className="space-y-6">
                        {course.booklist!.map((group, gi) => (
                          <div key={gi}>
                            <p className="font-label text-[11px] uppercase tracking-[0.14em] text-ink-muted mb-3">{group.subject}</p>
                            <ul className="space-y-2.5" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                              {group.books.map((book, bi) => (
                                <li key={bi} className="flex items-start gap-2.5">
                                  <BookOpen className="h-3.5 w-3.5 shrink-0 mt-1 text-ink-muted" />
                                  <span className="text-[0.95rem] text-ink">
                                    {book.title}
                                    {book.author && <span className="text-ink-muted"> — {book.author}</span>}
                                    {book.note && <span className="italic text-ink-muted"> ({book.note})</span>}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {(course.examInfo?.length ?? 0) > 0 && (
                    <section id="exam-info" className="space-y-4 scroll-mt-24">
                      <SectionHeading>Exam Information</SectionHeading>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {course.examInfo!.map((fact, i) => (
                          <div key={i} className="ks-card">
                            <div className="ks-card-body">
                              <span className="ks-card-meta">{fact.label}</span>
                              <p className="ks-card-title">{fact.value}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {sortedYears.length > 0 && (
                    <section id="year-wise-breakdown" className="space-y-4 scroll-mt-24">
                      <SectionHeading>Year-wise Question Breakdown</SectionHeading>
                      <div className="space-y-3">
                        {sortedYears.map((y) => {
                          const expanded = isYearExpanded(y.year);
                          return (
                            <div key={y.year} className="rounded-[3px] border border-rule bg-paper-raised overflow-hidden">
                              <button
                                type="button"
                                onClick={() => toggleYear(y.year)}
                                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left cursor-pointer transition-colors duration-150 ease-ks hover:bg-paper-deep"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <p className="font-semibold text-sm shrink-0 text-ink tabular-nums">{y.year}</p>
                                  {y.notes && <p className="text-xs truncate text-ink-muted">{y.notes}</p>}
                                </div>
                                <span className="h-6 w-6 rounded-[3px] border border-rule flex items-center justify-center shrink-0 text-ink">
                                  {expanded ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                                </span>
                              </button>
                              {expanded && y.breakdown.length > 0 && (
                                <div className="overflow-x-auto border-t border-rule">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b border-rule-strong">
                                        <th className="text-left font-label font-medium text-[11px] uppercase tracking-[0.14em] px-4 py-2.5 text-ink-muted">Subject</th>
                                        <th className="text-right font-label font-medium text-[11px] uppercase tracking-[0.14em] px-4 py-2.5 text-ink-muted">Questions</th>
                                        <th className="text-right font-label font-medium text-[11px] uppercase tracking-[0.14em] px-4 py-2.5 text-ink-muted">Marks</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {y.breakdown.map((row, ri) => (
                                        <tr key={ri} className={ri < y.breakdown.length - 1 ? 'border-b border-rule' : ''}>
                                          <td className="px-4 py-2.5 text-ink">{row.subject}</td>
                                          <td className="px-4 py-2.5 text-right text-ink tabular-nums">{row.questions}</td>
                                          <td className="px-4 py-2.5 text-right text-ink tabular-nums">{row.marks ?? '—'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  )}
                </>
              )}

              {/* Closing CTA */}
              <div className="rounded-[3px] p-6 bg-paper-deep border border-rule">
                <p className="doc-h3">Ready to prepare for {course.name}?</p>
                <p className="text-sm mb-5 leading-relaxed text-ink-muted">
                  Get current affairs, general studies notes &amp; MCQs — free with Remindology.
                </p>
                <Link href="/signup" className="btn-ink btn-sm inline-flex items-center gap-1.5">
                  Try for Free<ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>

            {/* ── Sidebar: table of contents ── */}
            {toc.length > 0 && (
              <aside className="hidden lg:block sticky top-24 space-y-2">
                <p className="doc-nav-label inline-flex items-center gap-2">
                  <List className="h-3.5 w-3.5" />
                  On this page
                </p>
                <nav className="grid">
                  {toc.map((item) => {
                    const active = item.id === activeId;
                    return (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className={`doc-nav-link${active ? ' is-active' : ''}`}
                      >
                        {item.label}
                      </a>
                    );
                  })}
                </nav>
              </aside>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
