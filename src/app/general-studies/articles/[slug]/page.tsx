'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, Clock, AlertCircle, List, HelpCircle,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useGSArticle, useGSSubjects, useGSCategories,
} from '@/features/general-studies/hooks/use-general-studies';
import { sanitizeHtml } from '@/lib/sanitize-html';

// ── Design tokens (matching current-affairs public pages) ─────────

const MIDNIGHT   = '#09091F';
const BORDER_D    = '1px solid rgba(124,58,237,0.2)';
const ACCENT      = '#7C3AED';
const TEXT_BODY   = '#1F2937';
const TEXT_MUTED  = '#6B7280';

const GS_CONFIG: Record<string, { color: string; label: string }> = {
  GS1: { color: '#7C3AED', label: 'GS1 · Indian Heritage & Society' },
  GS2: { color: '#0891B2', label: 'GS2 · Polity & International' },
  GS3: { color: '#059669', label: 'GS3 · Economy & Environment' },
  GS4: { color: '#DC2626', label: 'GS4 · Ethics & Integrity' },
};

function stripHtml(text: string): string {
  return text.includes('<') ? text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : text;
}

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

function slugify(heading: string): string {
  return heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function ArticleSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-14 space-y-4">
      <Skeleton className="h-8 w-2/3 rounded" />
      <Skeleton className="h-4 w-full rounded" />
      <Skeleton className="h-4 w-5/6 rounded" />
      <Skeleton className="h-40 w-full rounded-2xl mt-6" />
    </div>
  );
}

export default function GSArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading, isError } = useGSArticle(slug);
  const { data: subjects } = useGSSubjects();

  const subject = subjects?.find((s) => s.id === article?.subjectId);
  const { data: categories } = useGSCategories(subject?.slug ?? '');
  const category = categories?.find((c) => c.id === article?.categoryId);

  if (isLoading) {
    return (
      <div style={{ fontFamily: 'var(--font-poppins), system-ui, sans-serif' }}>
        <section style={{ background: MIDNIGHT }}>
          <ArticleSkeleton />
        </section>
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div style={{ fontFamily: 'var(--font-poppins), system-ui, sans-serif' }}>
        <section style={{ background: '#FFFFFF', minHeight: '60vh' }}>
          <div className="max-w-3xl mx-auto px-6 py-20 flex flex-col items-center gap-4 text-center">
            <AlertCircle className="h-12 w-12" style={{ color: '#DC2626', opacity: 0.5 }} />
            <p className="text-lg font-semibold" style={{ color: '#1A1836' }}>Article not found</p>
            <Link
              href="/general-studies"
              className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl text-white"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #C026D3)' }}
            >
              <ArrowLeft className="h-4 w-4" />Back to General Studies
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const toc = article.sections.map((s) => ({ heading: s.heading, id: slugify(s.heading) }));
  const publishedDate = new Date(article.publishedAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div style={{ fontFamily: 'var(--font-poppins), system-ui, sans-serif' }}>

      <style>{`
        @keyframes gs-fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .gs-article { animation: gs-fade-in 0.45s ease both; animation-delay: 0.08s; }
        .gs-sidebar { animation: gs-fade-in 0.45s ease both; animation-delay: 0.18s; }
      `}</style>

      {/* ── Dark hero ── */}
      <section className="relative overflow-hidden" style={{ background: MIDNIGHT }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(167,139,250,0.07) 1px, transparent 1px)', backgroundSize: '30px 30px' }}
        />
        <div
          className="absolute pointer-events-none"
          style={{ top: 0, right: '-10%', width: 440, height: 440, borderRadius: '50%', background: `radial-gradient(circle, ${ACCENT}28 0%, transparent 68%)` }}
        />

        <div className="relative max-w-6xl mx-auto px-6 pt-10 pb-14">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs mb-6 flex-wrap" style={{ color: 'rgba(196,181,253,0.5)' }}>
            <Link href="/general-studies" className="hover:text-white transition-colors flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              General Studies
            </Link>
            {subject && (
              <>
                <span>/</span>
                <Link href={`/general-studies/${subject.slug}`} className="hover:text-white transition-colors">
                  {subject.name}
                </Link>
              </>
            )}
            {category && subject && (
              <>
                <span>/</span>
                <Link href={`/general-studies/${subject.slug}/${category.slug}`} className="hover:text-white transition-colors">
                  {category.name}
                </Link>
              </>
            )}
          </div>

          {/* GS tags */}
          <div className="flex flex-wrap gap-2 mb-5">
            {article.gsPaperTags.map((tag) => {
              const cfg = GS_CONFIG[tag];
              return cfg ? (
                <span
                  key={tag}
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: `${cfg.color}22`, color: cfg.color, border: `1px solid ${cfg.color}44` }}
                >
                  {tag} · {cfg.label.split('· ')[1]}
                </span>
              ) : null;
            })}
          </div>

          <h1
            className="font-extrabold tracking-tight mb-5"
            style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)', lineHeight: 1.15, color: '#F0EEFF' }}
          >
            {article.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-xs" style={{ color: 'rgba(196,181,253,0.55)' }}>
            <span>{publishedDate}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />{article.readTimeMins} min read
            </span>
          </div>
        </div>
      </section>

      {/* ── Content ── */}
      <section style={{ background: '#FFFFFF' }}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-[1fr_240px] gap-12 items-start">

            {/* ── Main article ── */}
            <article className="gs-article space-y-10">

              {/* Summary */}
              <section className="space-y-3.5">
                <SectionHeading color={ACCENT}>Summary</SectionHeading>
                <p style={{ fontSize: '0.9625rem', lineHeight: 1.9, color: TEXT_BODY, fontWeight: 450 }}>
                  {stripHtml(article.summary)}
                </p>
              </section>

              {/* Key Points */}
              {article.keyPoints.length > 0 && (
                <section className="space-y-3.5">
                  <SectionHeading color={ACCENT}>Key Points</SectionHeading>
                  <ul className="space-y-3.5" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {article.keyPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span
                          className="rounded-full shrink-0"
                          style={{ width: 6, height: 6, marginTop: '0.55rem', background: ACCENT, opacity: 0.65 }}
                        />
                        <span style={{ fontSize: '0.9375rem', lineHeight: 1.85, color: TEXT_BODY }}>{stripHtml(point)}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* AI-picked sections — generic loop, never switch on heading text */}
              {article.sections.map((s) => (
                <section key={s.heading} id={slugify(s.heading)} className="space-y-3.5">
                  <SectionHeading color={ACCENT}>{s.heading}</SectionHeading>
                  {s.content.includes('<') ? (
                    <div
                      className="rich-editor-content"
                      style={{ fontSize: '0.9375rem', lineHeight: 1.88, color: TEXT_BODY }}
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(s.content) }}
                    />
                  ) : (
                    <p style={{ fontSize: '0.9375rem', lineHeight: 1.88, color: TEXT_BODY }}>{s.content}</p>
                  )}
                </section>
              ))}

              {/* Mains Angle Questions */}
              {article.mainsAngles.length > 0 && (
                <section className="space-y-3.5">
                  <SectionHeading color={ACCENT}>Mains Angle Questions</SectionHeading>
                  <ol className="space-y-2.5" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {article.mainsAngles.map((angle, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span
                          className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0"
                          style={{ background: `${ACCENT}12`, color: ACCENT, marginTop: 2 }}
                        >
                          {i + 1}
                        </span>
                        <span style={{ fontSize: '0.9rem', lineHeight: 1.85, color: TEXT_BODY }}>{angle}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {/* FAQs */}
              {article.faqs.length > 0 && (
                <section className="space-y-3.5">
                  <SectionHeading color={ACCENT}>Frequently Asked Questions</SectionHeading>
                  <div className="space-y-4">
                    {article.faqs.map((faq, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <HelpCircle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: ACCENT, opacity: 0.6 }} />
                        <div>
                          <p className="font-bold mb-1" style={{ fontSize: '0.9rem', color: '#111827' }}>
                            {faq.question}
                          </p>
                          <p style={{ fontSize: '0.875rem', lineHeight: 1.8, color: TEXT_MUTED }}>
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Topic tags */}
              {article.topicTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2" style={{ borderTop: `1px solid ${ACCENT}12` }}>
                  {article.topicTags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                      style={{ background: `${ACCENT}0A`, color: TEXT_MUTED, border: `1px solid ${ACCENT}18` }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Closing CTA */}
              <div
                className="rounded-2xl p-5 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 100%)' }}
              >
                <div
                  className="absolute top-0 right-0 w-28 h-28 pointer-events-none"
                  style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '50%', transform: 'translate(30%, -30%)' }}
                />
                <div className="relative">
                  <p className="text-white font-bold text-sm mb-1">Practice with MCQs</p>
                  <p className="text-xs mb-4 leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    Turn this topic into revision notes, MCQs &amp; daily challenges — free with Remindology.
                  </p>
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
                    style={{ background: '#FFFFFF', color: '#7C3AED' }}
                  >
                    Try for Free<ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </article>

            {/* ── Sidebar: table of contents ── */}
            {toc.length > 0 && (
              <aside className="gs-sidebar hidden lg:block sticky top-24 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest" style={{ color: TEXT_MUTED }}>
                  <List className="h-3.5 w-3.5" />
                  On this page
                </div>
                <nav className="space-y-2" style={{ borderLeft: `2px solid ${ACCENT}15` }}>
                  {toc.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="block pl-3 text-sm transition-colors hover:text-[#7C3AED]"
                      style={{ color: TEXT_MUTED }}
                    >
                      {item.heading}
                    </a>
                  ))}
                </nav>
              </aside>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
