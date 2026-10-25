import Link from 'next/link';
import { ArrowRight, HelpCircle, Sparkles, BookOpen, Target, Zap, Scale, LayoutGrid, Tag, Mail } from 'lucide-react';
import { ProductDemo } from '@/components/landing/ProductDemo';
import { FeatureShowcase } from '@/components/landing/FeatureShowcase';
import { NewFeatureShowcase } from '@/components/landing/NewFeatureShowcase';
import { FAQAccordion } from '@/components/landing/FAQAccordion';
import { FAQS } from '@/components/landing/faq-data';
import { HeroPreview } from '@/components/landing/HeroPreview';
import { MobileNav } from '@/components/landing/MobileNav';
import { NavAuthButtons } from '@/components/landing/NavAuthButtons';
import { CoursesNavDropdown } from '@/components/landing/CoursesNavDropdown';
import { WhyRemindology } from '@/components/landing/WhyRemindology';
import { Pricing } from '@/components/landing/Pricing';
import { CurrentAffairsTeaser } from '@/components/landing/CurrentAffairsTeaser';
import { ImportantBanner } from '@/components/landing/ImportantBanner';
import { OCRCopyCheckShowcase } from '@/components/landing/OCRCopyCheckShowcase';
import { AmbientBlobs } from '@/components/landing/AmbientBlobs';
import { UPSCPrepGrid } from '@/components/landing/UPSCPrepGrid';
import { Logo } from '@/components/landing/Logo';

// ── Style shortcuts ─────────────────────────────────────────────────
// Navy & Brass: deep navy ink on warm cream, one brass accent. Names below
// are kept from the previous palette so call sites throughout this file
// don't all need to change — only what they resolve to does.
const INK = '#16233E';
const MUTED = '#5B6478';
const ACCENT = '#8A6A12';
const ACCENT_SOFT = 'rgba(138,106,18,0.08)';
const ACCENT_BORDER = 'rgba(138,106,18,0.18)';
const BRAND_GRAD = ACCENT;
const TEXT_GRAD_LT = { color: ACCENT };
const SURFACE = '#F7F4EC';
const TEXT_DARK = INK;
const TEXT_MID = MUTED;
const BORDER_D = '1px solid rgba(22,35,62,0.1)';
const SERIF = { fontFamily: 'var(--font-serif-display), Georgia, serif' };
const FOOTER_BG = INK;
const FOOTER_BORDER = 'rgba(247,244,236,0.1)';
const FOOTER_TEXT = 'rgba(247,244,236,0.65)';
const FOOTER_TEXT_DIM = 'rgba(247,244,236,0.4)';
const FOOTER_TEXT_FAINT = 'rgba(247,244,236,0.3)';

export default function LandingPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <div
      style={{
        fontFamily: 'var(--font-poppins), system-ui, sans-serif',
        color: TEXT_DARK,
        background: SURFACE,
        position: 'relative',
      }}
    >

      {/* Floating "important update" card — only renders when an admin has flagged an article */}
      <ImportantBanner />

      {/* ════════════════════════════════════════════════════════
          ANNOUNCEMENT BAR + NAVBAR
      ════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50">

        {/* Announcement bar */}
        <div
          className="flex items-center justify-center gap-3 py-2 px-6 text-center"
          style={{ background: ACCENT }}
        >
          <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.92)' }}>
            <span className="hidden sm:inline">
              ✦ Built for UPSC CSE, SSC &amp; State PSCs — K-12, JEE &amp; NEET on the roadmap
            </span>
            <span className="sm:hidden">✦ UPSC, SSC &amp; State PSC · More coming</span>
          </p>
          <Link
            href="/signup"
            className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full transition-opacity hover:opacity-75"
            style={{ background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.3)', color: '#FFFFFF' }}
          >
            Try Free →
          </Link>
        </div>

        {/* Main nav */}
        <div style={{ background: 'rgba(247,244,236,0.92)', backdropFilter: 'blur(16px)', borderBottom: BORDER_D }}>
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
            <Link href="/">
              <Logo size={32} />
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {[['Home', '/'], ['Current Affairs', '#current-affairs'], ['General Studies', '/general-studies']].map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  className="text-sm font-medium transition-colors hover:text-[#16233E] px-3 py-1.5 rounded-lg hover:bg-black/3 whitespace-nowrap"
                  style={{ color: 'rgba(22,35,62,0.65)' }}
                >
                  {label}
                </a>
              ))}
              <CoursesNavDropdown />
              {[['Features', '#features'], ['Pricing', '#pricing']].map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  className="text-sm font-medium transition-colors hover:text-[#16233E] px-3 py-1.5 rounded-lg hover:bg-black/3 whitespace-nowrap"
                  style={{ color: 'rgba(22,35,62,0.65)' }}
                >
                  {label}
                </a>
              ))}
            </nav>

            {/* Desktop auth buttons — auth-aware */}
            <NavAuthButtons />

            {/* Mobile hamburger menu */}
            <MobileNav />
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════
          HERO  ·  split layout: preview left | copy right
      ════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ background: 'transparent' }}>

        {/* Quiet accent wash, flat editorial — no competing glows */}
        <div
          className="absolute pointer-events-none"
          style={{ top: '-15%', right: '-6%', width: 580, height: 580, borderRadius: '50%', background: 'radial-gradient(circle, rgba(138,106,18,0.05) 0%, transparent 68%)' }}
        />

        <div className="relative max-w-7xl mx-auto px-6 pt-20 sm:pt-28">

          {/* ── Main split: preview left | copy right ── */}
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 xl:gap-14 items-center pb-12">

            {/* LEFT: animated product preview */}
            <div className="order-2 lg:order-1">
              <HeroPreview />
            </div>

            {/* RIGHT: value copy + CTA + inline proof */}
            <div className="order-1 lg:order-2 flex flex-col gap-5 text-left">

              {/* Eyebrow — a certification-stamp mark, not a generic rounded pill */}
              <div
                className="inline-flex items-center gap-2.5 text-[11px] font-bold px-3.5 py-1.5 self-start uppercase"
                style={{ border: `1px solid ${ACCENT}`, color: ACCENT, letterSpacing: '0.12em' }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-brand-pop shrink-0" />
                AI Study OS — UPSC · SSC · State PSC
              </div>

              {/* Headline — serif, two-tier scale, one brass-underlined word for emphasis */}
              <h1 className="tracking-tight" style={SERIF}>
                <span
                  className="block font-medium not-italic"
                  style={{ fontSize: 'clamp(1.05rem, 2.1vw, 1.3rem)', lineHeight: 1.3, color: TEXT_MID, marginBottom: '0.25em', fontFamily: 'var(--font-poppins), system-ui, sans-serif' }}
                >
                  Your personal
                </span>
                <span
                  className="block font-semibold"
                  style={{ fontSize: 'clamp(2.4rem, 5.6vw, 3.7rem)', lineHeight: 1.08, color: TEXT_DARK, letterSpacing: '-0.01em' }}
                >
                  Learning{' '}
                  <span className="relative inline-block">
                    Intelligence
                    <svg
                      className="absolute left-0 w-full"
                      style={{ bottom: '-0.08em', height: '0.12em' }}
                      viewBox="0 0 100 6" preserveAspectRatio="none" aria-hidden="true"
                    >
                      <path d="M0,4 Q50,0 100,4" stroke={ACCENT} strokeWidth="5" fill="none" strokeLinecap="round" />
                    </svg>
                  </span>.
                </span>
              </h1>

              {/* Subtext */}
              <p style={{ color: TEXT_MID, fontSize: '0.97rem', lineHeight: 1.78, maxWidth: 420 }}>
                Upload any chapter — get instant summaries, revision notes, MCQs &amp; answer evaluation.
                Coaching-level prep, without the fees.
              </p>

              {/* CTA buttons */}
              <div className="flex items-center gap-4 flex-wrap">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
                  style={{ background: BRAND_GRAD, boxShadow: '0 6px 24px rgba(138,106,18,0.25)', fontSize: '0.95rem' }}
                >
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center gap-1 font-semibold transition-colors hover:opacity-70"
                  style={{ color: TEXT_MID, fontSize: '0.9rem' }}
                >
                  See how it works ↓
                </a>
              </div>

              {/* Quick stats — real, verifiable numbers only; set in the serif like a document's figures */}
              <div className="flex gap-7 pt-2" style={{ borderTop: BORDER_D, marginTop: '0.25rem' }}>
                <div className="pt-3">
                  <p className="leading-none" style={{ ...SERIF, fontSize: '1.3rem', fontWeight: 600, color: TEXT_DARK }}>14</p>
                  <p className="text-[10.5px] mt-1 uppercase tracking-wide" style={{ color: TEXT_MID }}>AI study tools</p>
                </div>
                <div className="pt-3">
                  <p className="leading-none" style={{ ...SERIF, fontSize: '1.3rem', fontWeight: 600, color: TEXT_DARK }}>4</p>
                  <p className="text-[10.5px] mt-1 uppercase tracking-wide" style={{ color: TEXT_MID }}>GS papers covered</p>
                </div>
                <div className="pt-3">
                  <p className="leading-none text-brand-pop" style={{ ...SERIF, fontSize: '1.3rem', fontWeight: 600 }}>Free</p>
                  <p className="text-[10.5px] mt-1 uppercase tracking-wide" style={{ color: TEXT_MID }}>to get started</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Bottom proof strip: 3 flat cards, accent used once per card ── */}
          <div className="grid sm:grid-cols-3 gap-4 pb-12">

            {/* Free CTA card */}
            <div
              className="relative overflow-hidden rounded-2xl px-6 py-5"
              style={{ background: '#FFFFFF', border: BORDER_D }}
            >
              <p className="text-sm font-extrabold mb-0.5" style={{ color: INK }}>
                Start for <span className="italic">FREE</span>
              </p>
              <p className="text-[11px] font-medium mb-3" style={{ color: MUTED }}>
                No credit card · First study kit in seconds
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 text-white font-bold text-xs px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
                style={{ background: ACCENT }}
              >
                Get Started <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* AI tools stat card */}
            <div
              className="relative overflow-hidden rounded-2xl px-6 py-5 flex flex-col items-center justify-center text-center"
              style={{ background: '#FFFFFF', border: BORDER_D }}
            >
              <div className="flex items-center gap-2.5 mb-1" style={{ color: ACCENT }}>
                <Sparkles className="h-4 w-4" />
                <span className="text-3xl font-extrabold" style={{ color: ACCENT }}>14</span>
                <Sparkles className="h-4 w-4" />
              </div>
              <p className="text-sm font-bold" style={{ color: INK }}>AI study tools</p>
              <p className="text-[11px] mt-0.5" style={{ color: MUTED }}>one upload does it all</p>
            </div>

            {/* General Studies + Current Affairs — factual value card */}
            <div
              className="relative overflow-hidden rounded-2xl px-6 py-5 flex flex-col items-center justify-center text-center"
              style={{ background: '#FFFFFF', border: BORDER_D }}
            >
              <div className="flex items-center gap-2.5 mb-1" style={{ color: INK }}>
                <BookOpen className="h-4 w-4" />
                <span className="text-sm font-extrabold" style={{ color: INK }}>General Studies</span>
                <BookOpen className="h-4 w-4" />
              </div>
              <p className="text-sm font-bold" style={{ color: INK }}>&amp; Current Affairs</p>
              <p className="text-[11px] mt-0.5" style={{ color: MUTED }}>free to read, updated daily</p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          PRODUCT DEMO  ·  animated, cycling subjects
      ════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-24" style={{ background: 'transparent' }}>
        <AmbientBlobs palette="sky" />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full mb-4"
              style={{ background: ACCENT_SOFT, border: `1px solid ${ACCENT_BORDER}`, color: ACCENT }}
            >
              <Zap className="h-3.5 w-3.5" />
              See It In Action
            </div>
            <h2
              className="font-bold tracking-tight mb-3"
              style={{ fontSize: '2.2rem', lineHeight: 1.15, color: TEXT_DARK }}
            >
              Paste material.{' '}
              <span style={TEXT_GRAD_LT}>Get study tools.</span>
            </h2>
            <p style={{ color: TEXT_MID, maxWidth: 440, margin: '0 auto', lineHeight: 1.75, fontSize: '0.9rem' }}>
              No formatting required. No prompt engineering.
              Select an exam type below and watch it work.
            </p>
          </div>

          <ProductDemo />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          CURRENT AFFAIRS TEASER  ·  public, no auth needed
      ════════════════════════════════════════════════════════ */}
      <CurrentAffairsTeaser />

      {/* ════════════════════════════════════════════════════════
          FEATURE SHOWCASE  ·  interactive dashboard tour
      ════════════════════════════════════════════════════════ */}
      <section id="features" className="relative overflow-hidden py-24" style={{ background: 'transparent' }}>
        <AmbientBlobs palette="violet" />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full mb-4"
              style={{ background: ACCENT_SOFT, border: `1px solid ${ACCENT_BORDER}`, color: ACCENT }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              What&apos;s Inside
            </div>
            <h2
              className="font-bold tracking-tight mb-3"
              style={{ fontSize: '2.2rem', color: TEXT_DARK }}
            >
              Six tools.{' '}
              <span style={TEXT_GRAD_LT}>One upload.</span>
            </h2>
            <p style={{ color: TEXT_MID, maxWidth: 400, margin: '0 auto', lineHeight: 1.75, fontSize: '0.9rem' }}>
              Everything a student needs to turn passive reading into active exam prep —
              rotating below automatically.
            </p>
          </div>

          <FeatureShowcase />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          NEW FEATURES  ·  8 new AI-powered capabilities
      ════════════════════════════════════════════════════════ */}
      <section id="new-features" className="relative overflow-hidden py-24" style={{ background: 'transparent' }}>
        <AmbientBlobs palette="amber" />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full mb-4"
              style={{ background: ACCENT_SOFT, border: `1px solid ${ACCENT_BORDER}`, color: ACCENT }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Just Shipped · 8 New Features
            </div>
            <h2
              className="font-bold tracking-tight mb-3"
              style={{ fontSize: '2.2rem', color: TEXT_DARK, lineHeight: 1.15 }}
            >
              Beyond notes.{' '}
              <span style={TEXT_GRAD_LT}>Full exam OS.</span>
            </h2>
            <p style={{ color: TEXT_MID, maxWidth: 440, margin: '0 auto', fontSize: '0.9rem', lineHeight: 1.75 }}>
              We just shipped 8 new tools — from a daily streak challenge to a 30-day AI study plan.
              Click any feature to see a live preview.
            </p>
          </div>

          <NewFeatureShowcase />

          <div className="text-center mt-10">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 font-semibold px-7 py-3.5 rounded-xl text-sm transition-opacity hover:opacity-90"
              style={{ background: BRAND_GRAD, color: '#FFFFFF', boxShadow: '0 6px 24px rgba(138,106,18,0.3)' }}
            >
              Try all 8 features free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          OCR COPY CHECK  ·  answer writing feature spotlight
      ════════════════════════════════════════════════════════ */}
      <section className="relative py-24 overflow-hidden" style={{ background: 'transparent' }}>
        <AmbientBlobs palette="emerald" />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full mb-4"
              style={{ background: ACCENT_SOFT, border: `1px solid ${ACCENT_BORDER}`, color: ACCENT }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: ACCENT }} />
                <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: ACCENT }} />
              </span>
              Just Shipped · Answer Writing
            </div>
            <h2
              className="font-bold tracking-tight mb-3"
              style={{ fontSize: '2.2rem', color: TEXT_DARK, lineHeight: 1.15 }}
            >
              Stop copying.{' '}
              <span style={TEXT_GRAD_LT}>Start thinking.</span>
            </h2>
            <p style={{ color: TEXT_MID, maxWidth: 440, margin: '0 auto', fontSize: '0.9rem', lineHeight: 1.75 }}>
              The UPSC examiner rewards original analysis — not textbook regurgitation.
              Our OCR copy check catches it before they do.
            </p>
          </div>

          <OCRCopyCheckShowcase />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          HOW IT WORKS  ·  back to midnight
      ════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="relative py-24 overflow-hidden" style={{ background: 'transparent' }}>
        <AmbientBlobs palette="rose" />

        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full mb-4"
              style={{ background: ACCENT_SOFT, border: `1px solid ${ACCENT_BORDER}`, color: ACCENT }}
            >
              <Target className="h-3.5 w-3.5" />
              How It Works
            </div>
            <h2
              className="font-bold tracking-tight mb-3"
              style={{ fontSize: '2.2rem', color: TEXT_DARK, lineHeight: 1.15 }}
            >
              Three steps.{' '}
              <span style={TEXT_GRAD_LT}>Zero friction.</span>
            </h2>
            <p style={{ color: TEXT_MID, maxWidth: 380, margin: '0 auto', fontSize: '0.9rem', lineHeight: 1.75 }}>
              No onboarding checklist. No configuration. You study — Remindology handles the rest.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { n: '01', title: 'Paste your material', desc: 'Drop in any chapter, article, or notes. Text from any subject and any exam.' },
              { n: '02', title: 'AI builds your study kit', desc: 'Summaries, revision notes, MCQs, and key topics — all in under 10 seconds.' },
              { n: '03', title: 'Study and revise', desc: 'Everything is saved in your dashboard. Search and revisit any time before your exam.' },
            ].map(step => (
              <div
                key={step.n}
                className="p-7 rounded-2xl"
                style={{ background: '#FFFFFF', border: BORDER_D, boxShadow: '0 8px 28px rgba(22,35,62,0.04)' }}
              >
                <span
                  className="block font-extrabold mb-4"
                  style={{ fontSize: '3rem', lineHeight: 1, ...TEXT_GRAD_LT }}
                >
                  {step.n}
                </span>
                <h3 className="font-semibold mb-2" style={{ color: TEXT_DARK, fontSize: '1rem' }}>
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: TEXT_MID }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          WHY REMINDOLOGY  ·  comparison table
      ════════════════════════════════════════════════════════ */}
      <section id="why" className="relative overflow-hidden py-24" style={{ background: 'transparent' }}>
        <AmbientBlobs palette="sky" />
        <div className="relative max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full mb-4"
              style={{ background: ACCENT_SOFT, border: `1px solid ${ACCENT_BORDER}`, color: ACCENT }}
            >
              <Scale className="h-3.5 w-3.5" />
              Why Remindology
            </div>
            <h2
              className="font-bold tracking-tight mb-3"
              style={{ fontSize: '2.2rem', color: TEXT_DARK, lineHeight: 1.15 }}
            >
              The grind, or{' '}
              <span style={TEXT_GRAD_LT}>the shortcut.</span>
            </h2>
            <p style={{ color: TEXT_MID, maxWidth: 430, margin: '0 auto', lineHeight: 1.75, fontSize: '0.9rem' }}>
              The same prep, minus the hours of manual work. Here&apos;s exactly what changes when AI does the heavy lifting.
            </p>
          </div>

          <WhyRemindology />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          STATS STRIP  ·  outcome-focused metrics
      ════════════════════════════════════════════════════════ */}
      <section style={{ background: '#FFFFFF', borderTop: BORDER_D, borderBottom: BORDER_D }}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { v: '10 sec', l: 'From material to full study kit' },
              { v: '5+ hrs', l: 'Saved every week' },
              { v: '14', l: 'AI-powered study tools' },
              { v: '3', l: 'Exam families supported' },
            ].map(s => (
              <div key={s.l}>
                <div className="text-3xl font-extrabold" style={TEXT_GRAD_LT}>{s.v}</div>
                <div className="text-xs font-medium mt-1.5 leading-snug" style={{ color: TEXT_MID }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FEATURE HIGHLIGHTS
      ════════════════════════════════════════════════════════ */}
      <section id="testimonials" className="relative overflow-hidden py-24" style={{ background: 'transparent' }}>
        <AmbientBlobs palette="amber" />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full mb-4"
              style={{ background: ACCENT_SOFT, border: `1px solid ${ACCENT_BORDER}`, color: ACCENT }}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              UPSC Prep Hub
            </div>
            <h2
              className="font-bold tracking-tight mb-3"
              style={{ fontSize: '2.2rem', color: TEXT_DARK, lineHeight: 1.15 }}
            >
              Everything you need for your{' '}
              <span style={TEXT_GRAD_LT}>UPSC Preparation.</span>
            </h2>
            <p style={{ color: TEXT_MID, maxWidth: 420, margin: '0 auto', lineHeight: 1.75, fontSize: '0.9rem' }}>
              A curated collection of resources, study kits, and tools designed to optimize your syllabus coverage.
            </p>
          </div>
        </div>

        <UPSCPrepGrid />
      </section>

      {/* ════════════════════════════════════════════════════════
          PRICING
      ════════════════════════════════════════════════════════ */}
      <section id="pricing" className="relative overflow-hidden py-24" style={{ background: 'transparent' }}>
        <AmbientBlobs palette="violet" />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full mb-4"
              style={{ background: ACCENT_SOFT, border: `1px solid ${ACCENT_BORDER}`, color: ACCENT }}
            >
              <Tag className="h-3.5 w-3.5" />
              Simple Pricing
            </div>
            <h2
              className="font-bold tracking-tight mb-3"
              style={{ fontSize: '2.2rem', color: TEXT_DARK, lineHeight: 1.15 }}
            >
              Start free.{' '}
              <span style={TEXT_GRAD_LT}>Upgrade when ready.</span>
            </h2>
            <p style={{ color: TEXT_MID, maxWidth: 420, margin: '0 auto', lineHeight: 1.75, fontSize: '0.9rem' }}>
              No credit card to begin. Cancel anytime. Pick the plan that matches how serious your prep is.
            </p>
          </div>

          <Pricing />

          <p className="text-center text-xs mt-8" style={{ color: TEXT_MID }}>
            Prices in INR · GST included where applicable · Founder pricing, locked in for early users.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FAQ  ·  structured data for Google rich snippets
      ════════════════════════════════════════════════════════ */}
      <section id="faq" className="relative overflow-hidden py-24" style={{ background: 'transparent' }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        <AmbientBlobs palette="emerald" />

        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full mb-4"
              style={{ background: ACCENT_SOFT, border: `1px solid ${ACCENT_BORDER}`, color: ACCENT }}
            >
              <HelpCircle className="h-3.5 w-3.5" />
              FAQ
            </div>
            <h2
              className="font-bold tracking-tight mb-3"
              style={{ fontSize: '2.2rem', color: TEXT_DARK, lineHeight: 1.15 }}
            >
              Common questions,{' '}
              <span style={TEXT_GRAD_LT}>clear answers.</span>
            </h2>
            <p style={{ color: TEXT_MID, maxWidth: 430, margin: '0 auto', lineHeight: 1.75, fontSize: '0.9rem' }}>
              Everything you need to know about Remindology and how it works for your exam preparation.
            </p>
          </div>

          <FAQAccordion />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          CTA BANNER
      ════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-20" style={{ background: 'transparent' }}>
        <AmbientBlobs palette="rose" />
        <div className="relative max-w-4xl mx-auto px-6">
          <div
            className="relative overflow-hidden rounded-3xl p-8 sm:p-12 text-center"
            style={{ background: ACCENT }}
          >
            <div className="relative">
              <p
                className="text-[11px] font-bold uppercase tracking-widest mb-3"
                style={{ color: 'rgba(255,255,255,0.6)' }}
              >
                Students across India are already using it
              </p>
              <h2
                className="font-bold mb-4"
                style={{ ...SERIF, fontSize: 'clamp(1.8rem, 5vw, 2.6rem)', color: '#FFFFFF', lineHeight: 1.1 }}
              >
                Ready to study smarter?
              </h2>
              <p
                className="mb-8 mx-auto"
                style={{ color: 'rgba(255,255,255,0.78)', maxWidth: 400, lineHeight: 1.75, fontSize: '0.95rem' }}
              >
                Upload your first piece of study material and get a summary,
                revision notes, and MCQs — in seconds, for free.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 font-bold px-8 py-4 rounded-xl hover:opacity-95 transition-opacity text-base"
                style={{ background: '#FFFFFF', color: ACCENT, boxShadow: '0 12px 40px rgba(22,35,62,0.2)' }}
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════════════ */}
      <footer style={{ background: FOOTER_BG, borderTop: `1px solid ${FOOTER_BORDER}` }}>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-10">
            <div className="sm:col-span-2 lg:col-span-2">
              <Link href="/" className="mb-4 inline-flex">
                <Logo size={32} />
              </Link>
              <p
                className="text-sm leading-relaxed mb-5"
                style={{ color: FOOTER_TEXT_DIM, maxWidth: 280 }}
              >
                The AI study OS for competitive exams. Paste any material — get summaries,
                notes, MCQs, and a full prep toolkit in seconds.
              </p>
              <div className="flex items-center gap-2.5">
                {[
                  { label: 'X (Twitter)', path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
                  { label: 'Instagram', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
                  { label: 'LinkedIn', path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
                ].map(({ label, path }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="h-9 w-9 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                    style={{ background: 'rgba(247,244,236,0.06)', border: `1px solid ${FOOTER_BORDER}`, color: FOOTER_TEXT }}
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                      <path d={path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4
                className="text-[11px] font-bold uppercase tracking-widest mb-4"
                style={{ color: FOOTER_TEXT_FAINT }}
              >
                Product
              </h4>
              <ul className="space-y-2.5">
                {[['Features', '#features'], ['Current Affairs', '#current-affairs'], ['Pricing', '#pricing'], ['FAQ', '#faq']].map(([l, h]) => (
                  <li key={l}>
                    <a
                      href={h}
                      className="text-sm transition-colors hover:text-white"
                      style={{ color: FOOTER_TEXT }}
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4
                className="text-[11px] font-bold uppercase tracking-widest mb-4"
                style={{ color: FOOTER_TEXT_FAINT }}
              >
                Company
              </h4>
              <ul className="space-y-2.5">
                {[['About', '#'], ['Blog', '#'], ['Privacy Policy', '/privacy'], ['Terms of Service', '/terms']].map(([l, h]) => (
                  <li key={l}>
                    <a
                      href={h}
                      className="text-sm transition-colors hover:text-white"
                      style={{ color: FOOTER_TEXT }}
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4
                className="text-[11px] font-bold uppercase tracking-widest mb-4"
                style={{ color: FOOTER_TEXT_FAINT }}
              >
                Get Started
              </h4>
              <ul className="space-y-2.5 mb-4">
                {[['Sign Up Free', '/signup'], ['Sign In', '/login']].map(([l, h]) => (
                  <li key={l}>
                    <a
                      href={h}
                      className="text-sm transition-colors hover:text-white"
                      style={{ color: FOOTER_TEXT }}
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
              <a
                href="mailto:remindology2026@gmail.com"
                className="inline-flex items-center gap-2 text-sm transition-colors hover:text-white"
                style={{ color: FOOTER_TEXT }}
              >
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="break-all sm:break-normal">remindology2026@gmail.com</span>
              </a>
            </div>
          </div>

          <div
            className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
            style={{ borderTop: `1px solid ${FOOTER_BORDER}` }}
          >
            <p className="text-xs" style={{ color: FOOTER_TEXT_FAINT }}>
              © 2026 Remindology. All rights reserved.
            </p>
            <p className="text-xs" style={{ color: FOOTER_TEXT_FAINT }}>
              Made for students across India 🇮🇳
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
