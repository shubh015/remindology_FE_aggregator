'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, AlertCircle, GraduationCap, BookOpen, Bell, ExternalLink, List, Plus, Minus,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useCourse } from '@/features/courses/hooks/use-courses';

const MIDNIGHT  = '#09091F';
const TEXT_BODY  = '#1F2937';
const TEXT_MUTED = '#6B7280';

function SectionHeading({ children, color }: { children: string; color: string }) {
  return (
    <h2 style={{
      fontSize: '0.68rem', fontWeight: 900, letterSpacing: '0.13em',
      textTransform: 'uppercase', color,
      borderBottom: `2px solid ${color}22`, paddingBottom: '0.45rem',
    }}>
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
    <div className="max-w-4xl mx-auto px-6 py-14 space-y-4">
      <Skeleton className="h-8 w-2/3 rounded" />
      <Skeleton className="h-4 w-full rounded" />
      <Skeleton className="h-4 w-5/6 rounded" />
      <Skeleton className="h-40 w-full rounded-2xl mt-6" />
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
      <div style={{ fontFamily: 'var(--font-poppins), system-ui, sans-serif' }}>
        <section style={{ background: MIDNIGHT }}>
          <CourseSkeleton />
        </section>
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div style={{ fontFamily: 'var(--font-poppins), system-ui, sans-serif' }}>
        <section style={{ background: '#FFFFFF', minHeight: '60vh' }}>
          <div className="max-w-3xl mx-auto px-6 py-20 flex flex-col items-center gap-4 text-center">
            <AlertCircle className="h-12 w-12" style={{ color: '#DC2626', opacity: 0.5 }} />
            <p className="text-lg font-semibold" style={{ color: '#1A1836' }}>Course not found</p>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl text-white"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #C026D3)' }}
            >
              <ArrowLeft className="h-4 w-4" />Back to Courses
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const accent = course.color || '#7C3AED';
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
    <div style={{ fontFamily: 'var(--font-poppins), system-ui, sans-serif' }}>

      {/* ── Dark hero ── */}
      <section className="relative overflow-hidden" style={{ background: MIDNIGHT }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(167,139,250,0.07) 1px, transparent 1px)', backgroundSize: '30px 30px' }}
        />
        <div
          className="absolute pointer-events-none"
          style={{ top: 0, right: '-10%', width: 440, height: 440, borderRadius: '50%', background: `radial-gradient(circle, ${accent}28 0%, transparent 68%)` }}
        />

        <div className="relative max-w-6xl mx-auto px-6 pt-10 pb-14">
          <div className="flex items-center gap-2 text-xs mb-6" style={{ color: 'rgba(196,181,253,0.5)' }}>
            <Link href="/courses" className="hover:text-white transition-colors flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              Courses
            </Link>
          </div>

          <div
            className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full mb-4"
            style={{ background: `${accent}22`, border: `1px solid ${accent}55`, color: accent }}
          >
            <GraduationCap className="h-3.5 w-3.5" />
            Course
          </div>

          <h1
            className="font-extrabold tracking-tight mb-4"
            style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)', lineHeight: 1.15, color: '#F0EEFF' }}
          >
            {course.name}
          </h1>

          {course.shortDescription && (
            <p className="text-sm max-w-2xl" style={{ color: 'rgba(196,181,253,0.65)' }}>
              {course.shortDescription}
            </p>
          )}
        </div>
      </section>

      {/* ── Content ── */}
      <section style={{ background: '#FFFFFF' }}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-[1fr_240px] gap-12 items-start">

            <article className="space-y-10">

              {/* Notifications — time-sensitive, shown first */}
              {(course.notifications?.length ?? 0) > 0 && (
                <section className="space-y-3">
                  <div
                    className="rounded-2xl p-4 space-y-2.5"
                    style={{ background: `${accent}08`, border: `1px solid ${accent}25` }}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest" style={{ color: accent }}>
                      <Bell className="h-3.5 w-3.5" />
                      Notifications
                    </div>
                    <div className="space-y-2">
                      {course.notifications!.map((n) => (
                        <a
                          key={n.id}
                          href={n.linkUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 text-sm font-semibold hover:underline"
                          style={{ color: TEXT_BODY }}
                        >
                          <ExternalLink className="h-3.5 w-3.5 shrink-0" style={{ color: accent }} />
                          {n.title}
                          {n.notificationDate && (
                            <span className="text-xs font-normal" style={{ color: TEXT_MUTED }}>
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
                <p style={{ fontSize: '0.9375rem', lineHeight: 1.85, color: TEXT_MUTED }}>
                  Details for this course are being prepared — check back soon.
                </p>
              ) : (
                <>
                  {course.overview && (
                    <section id="overview" className="space-y-3.5">
                      <SectionHeading color={accent}>Overview</SectionHeading>
                      <p style={{ fontSize: '0.9625rem', lineHeight: 1.9, color: TEXT_BODY, fontWeight: 450 }}>
                        {course.overview}
                      </p>
                    </section>
                  )}

                  {(course.examPattern?.length ?? 0) > 0 && (
                    <section id="exam-pattern" className="space-y-3.5">
                      <SectionHeading color={accent}>Exam Pattern</SectionHeading>
                      <div className="space-y-3">
                        {course.examPattern!.map((stage, i) => (
                          <div key={i} className="flex items-start gap-3 rounded-xl border border-black/5 p-4" style={{ background: '#FAFAFA' }}>
                            <div
                              className="h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0"
                              style={{ background: `${accent}15`, color: accent }}
                            >
                              {i + 1}
                            </div>
                            <div>
                              <p className="font-bold text-sm mb-1" style={{ color: TEXT_BODY }}>{stage.stage}</p>
                              <p className="text-sm leading-relaxed" style={{ color: TEXT_MUTED }}>{stage.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {(course.booklist?.length ?? 0) > 0 && (
                    <section id="booklist" className="space-y-3.5">
                      <SectionHeading color={accent}>Booklist</SectionHeading>
                      <div className="space-y-5">
                        {course.booklist!.map((group, gi) => (
                          <div key={gi}>
                            <p className="text-sm font-bold mb-2" style={{ color: accent }}>{group.subject}</p>
                            <ul className="space-y-2" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                              {group.books.map((book, bi) => (
                                <li key={bi} className="flex items-start gap-2.5">
                                  <BookOpen className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: TEXT_MUTED, opacity: 0.6 }} />
                                  <span style={{ fontSize: '0.9rem', color: TEXT_BODY }}>
                                    {book.title}
                                    {book.author && <span style={{ color: TEXT_MUTED }}> — {book.author}</span>}
                                    {book.note && <span className="italic" style={{ color: TEXT_MUTED }}> ({book.note})</span>}
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
                    <section id="exam-info" className="space-y-3.5">
                      <SectionHeading color={accent}>Exam Information</SectionHeading>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {course.examInfo!.map((fact, i) => (
                          <div key={i} className="rounded-xl border border-black/5 p-3.5" style={{ background: '#FAFAFA' }}>
                            <p className="text-[11px] font-bold uppercase tracking-wide mb-1" style={{ color: TEXT_MUTED }}>
                              {fact.label}
                            </p>
                            <p className="text-sm font-semibold" style={{ color: TEXT_BODY }}>{fact.value}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {sortedYears.length > 0 && (
                    <section id="year-wise-breakdown" className="space-y-3.5">
                      <SectionHeading color={accent}>Year-wise Question Breakdown</SectionHeading>
                      <div className="space-y-3">
                        {sortedYears.map((y) => {
                          const expanded = isYearExpanded(y.year);
                          return (
                            <div key={y.year} className="rounded-xl border border-black/5 overflow-hidden">
                              <button
                                type="button"
                                onClick={() => toggleYear(y.year)}
                                className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left cursor-pointer"
                                style={{ background: `${accent}0A` }}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <p className="font-bold text-sm shrink-0" style={{ color: accent }}>{y.year}</p>
                                  {y.notes && <p className="text-xs truncate" style={{ color: TEXT_MUTED }}>{y.notes}</p>}
                                </div>
                                <span
                                  className="h-5 w-5 rounded-full flex items-center justify-center shrink-0"
                                  style={{ background: `${accent}15`, color: accent }}
                                >
                                  {expanded ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                                </span>
                              </button>
                              {expanded && y.breakdown.length > 0 && (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                                        <th className="text-left font-semibold px-4 py-2" style={{ color: TEXT_MUTED }}>Subject</th>
                                        <th className="text-right font-semibold px-4 py-2" style={{ color: TEXT_MUTED }}>Questions</th>
                                        <th className="text-right font-semibold px-4 py-2" style={{ color: TEXT_MUTED }}>Marks</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {y.breakdown.map((row, ri) => (
                                        <tr key={ri} style={{ borderBottom: ri < y.breakdown.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
                                          <td className="px-4 py-2" style={{ color: TEXT_BODY }}>{row.subject}</td>
                                          <td className="px-4 py-2 text-right" style={{ color: TEXT_BODY }}>{row.questions}</td>
                                          <td className="px-4 py-2 text-right" style={{ color: TEXT_BODY }}>{row.marks ?? '—'}</td>
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
              <div
                className="rounded-2xl p-5 relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${accent}CC, ${accent})` }}
              >
                <div
                  className="absolute top-0 right-0 w-28 h-28 pointer-events-none"
                  style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '50%', transform: 'translate(30%, -30%)' }}
                />
                <div className="relative">
                  <p className="text-white font-bold text-sm mb-1">Ready to prepare for {course.name}?</p>
                  <p className="text-xs mb-4 leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    Get current affairs, general studies notes &amp; MCQs — free with Remindology.
                  </p>
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
                    style={{ background: '#FFFFFF', color: accent }}
                  >
                    Try for Free<ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </article>

            {/* ── Sidebar: table of contents ── */}
            {toc.length > 0 && (
              <aside className="hidden lg:block sticky top-24 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest" style={{ color: TEXT_MUTED }}>
                  <List className="h-3.5 w-3.5" />
                  On this page
                </div>
                <nav className="space-y-1">
                  {toc.map((item) => {
                    const active = item.id === activeId;
                    return (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className="block pl-3 pr-2.5 py-1.5 rounded-r-lg text-sm transition-all"
                        style={active
                          ? {
                              background: `linear-gradient(90deg, ${accent}18, ${accent}03)`,
                              borderLeft: `2px solid ${accent}`,
                              color: accent,
                              fontWeight: 700,
                            }
                          : {
                              background: 'transparent',
                              borderLeft: `2px solid ${accent}15`,
                              color: TEXT_MUTED,
                              fontWeight: 400,
                            }}
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
