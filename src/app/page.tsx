import Link from 'next/link';
import { ArrowRight, CheckCircle2, HelpCircle, Sparkles, Target, Zap } from 'lucide-react';
import { ProductDemo } from '@/components/landing/ProductDemo';
import { FeatureShowcase } from '@/components/landing/FeatureShowcase';
import { NewFeatureShowcase } from '@/components/landing/NewFeatureShowcase';
import { FAQAccordion } from '@/components/landing/FAQAccordion';
import { FAQS } from '@/components/landing/faq-data';
import { HeroPreview } from '@/components/landing/HeroPreview';

// ── Hero floating pill chips ──────────────────────────────────────
const SYMBOLS = [
  { s: 'Revise',   x: 6,  y: 12, sz: 0.78, dur: 7.0, del: 0.0, op: 0.22 },
  { s: 'UPSC',     x: 84, y: 17, sz: 0.88, dur: 9.0, del: 1.2, op: 0.20 },
  { s: 'MCQ',      x: 15, y: 57, sz: 1.00, dur: 8.0, del: 2.4, op: 0.22 },
  { s: 'Notes',    x: 90, y: 65, sz: 0.80, dur: 6.5, del: 3.6, op: 0.18 },
  { s: 'Focus',    x: 43, y: 6,  sz: 0.85, dur: 10,  del: 0.8, op: 0.17 },
  { s: 'JEE',      x: 72, y: 79, sz: 0.95, dur: 7.5, del: 4.2, op: 0.20 },
  { s: 'Study',    x: 27, y: 82, sz: 0.90, dur: 8.5, del: 1.8, op: 0.19 },
  { s: 'NEET',     x: 59, y: 91, sz: 0.88, dur: 7.0, del: 5.0, op: 0.17 },
  { s: 'NCERT',    x: 12, y: 31, sz: 0.78, dur: 11,  del: 2.0, op: 0.16 },
  { s: 'Quiz',     x: 75, y: 43, sz: 0.85, dur: 9.5, del: 3.0, op: 0.15 },
  { s: 'Summary',  x: 51, y: 73, sz: 0.72, dur: 8.0, del: 4.5, op: 0.18 },
  { s: 'SSC',      x: 3,  y: 71, sz: 0.95, dur: 9.0, del: 1.5, op: 0.17 },
  { s: 'Learn',    x: 89, y: 89, sz: 0.85, dur: 7.5, del: 6.0, op: 0.18 },
  { s: 'Recall',   x: 37, y: 19, sz: 0.80, dur: 10,  del: 0.5, op: 0.16 },
  { s: 'CA',       x: 22, y: 93, sz: 0.95, dur: 7.0, del: 2.8, op: 0.19 },
  { s: 'GATE',     x: 79, y: 6,  sz: 0.85, dur: 8.5, del: 5.5, op: 0.18 },
  { s: 'Topics',   x: 55, y: 39, sz: 0.78, dur: 9.5, del: 7.0, op: 0.15 },
  { s: 'Exam',     x: 2,  y: 46, sz: 1.00, dur: 8.0, del: 3.2, op: 0.19 },
  { s: 'Board',    x: 66, y: 25, sz: 0.78, dur: 9.0, del: 0.6, op: 0.16 },
  { s: 'Marks',    x: 33, y: 50, sz: 0.80, dur: 7.5, del: 4.8, op: 0.14 },
];

// ── Style shortcuts ───────────────────────────────────────────────
const BRAND_GRAD   = 'linear-gradient(135deg, #7C3AED, #C026D3)';
const TEXT_GRAD    = { background: 'linear-gradient(135deg, #A78BFA, #E879F9)', WebkitBackgroundClip: 'text' as const, WebkitTextFillColor: 'transparent' };
const TEXT_GRAD_LT = { background: 'linear-gradient(135deg, #7C3AED, #C026D3)', WebkitBackgroundClip: 'text' as const, WebkitTextFillColor: 'transparent' };
const MIDNIGHT     = '#09091F';
const SURFACE      = '#F5F4FF';
const TEXT_DARK    = '#1A1836';
const TEXT_MID     = '#6B63A0';
const TEXT_MUTED_D = 'rgba(196,181,253,0.65)';
const BORDER_D     = '1px solid rgba(124,58,237,0.2)';

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
    <div style={{ fontFamily: 'var(--font-poppins), system-ui, sans-serif', color: TEXT_DARK }}>

      {/* ════════════════════════════════════════════════════════
          ANNOUNCEMENT BAR + NAVBAR
      ════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50">

        {/* Announcement bar */}
        <div
          className="flex items-center justify-center gap-3 py-2 px-6 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(76,29,149,0.97), rgba(134,25,143,0.97))', backdropFilter: 'blur(8px)' }}
        >
          <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.88)' }}>
            <span className="hidden sm:inline">
              ✦ Now supports UPSC CSE, SSC, all NCERT boards &amp; 10+ more exams
            </span>
            <span className="sm:hidden">✦ 10+ exams — UPSC, SSC &amp; more</span>
          </p>
          <Link
            href="/signup"
            className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full transition-opacity hover:opacity-75"
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.22)', color: '#FFFFFF' }}
          >
            Try Free →
          </Link>
        </div>

        {/* Main nav */}
        <div style={{ background: 'rgba(9,9,31,0.9)', backdropFilter: 'blur(16px)', borderBottom: BORDER_D }}>
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <div
                className="h-8 w-8 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg"
                style={{ background: BRAND_GRAD }}
              >
                R
              </div>
              <span className="font-bold text-[17px]" style={TEXT_GRAD}>Remindology</span>
            </Link>

            <nav className="hidden md:flex items-center gap-7">
              {[['Features', '#features'], ['How it Works', '#how-it-works'], ['FAQ', '#faq']].map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  className="text-sm font-medium transition-colors hover:text-white"
                  style={{ color: 'rgba(240,238,255,0.58)' }}
                >
                  {label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium transition-colors hover:text-white px-3 py-1.5 rounded-lg"
                style={{ color: 'rgba(240,238,255,0.58)' }}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
                style={{ background: BRAND_GRAD, boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}
              >
                Get Started
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════
          HERO  ·  midnight + dot grid + floating pill chips
      ════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-40 pb-0" style={{ background: MIDNIGHT }}>

        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(167,139,250,0.13) 1px, transparent 1px)', backgroundSize: '36px 36px' }}
        />

        {/* Radial glows */}
        <div
          className="absolute pointer-events-none"
          style={{ top: '-10%', right: '-5%', width: 560, height: 560, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.28) 0%, transparent 68%)' }}
        />
        <div
          className="absolute pointer-events-none"
          style={{ bottom: '8%', left: '-8%', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(192,38,211,0.18) 0%, transparent 68%)' }}
        />

        {/* Floating pill chips */}
        {SYMBOLS.map((sym, i) => (
          <span
            key={i}
            className="float-sym absolute pointer-events-none select-none"
            style={{
              left: `${sym.x}%`,
              top: `${sym.y}%`,
              fontSize: `${sym.sz * 0.8}rem`,
              fontWeight: 700,
              letterSpacing: '0.02em',
              padding: '3px 9px',
              borderRadius: '9999px',
              background: `rgba(124,58,237,${sym.op * 0.48})`,
              border: `1px solid rgba(167,139,250,${sym.op * 1.15})`,
              color: `rgba(196,181,253,${Math.min(sym.op + 0.1, 0.40)})`,
              animationDuration: `${sym.dur}s`,
              animationDelay: `${sym.del}s`,
            }}
          >
            {sym.s}
          </span>
        ))}

        {/* Hero copy */}
        <div className="relative max-w-4xl mx-auto px-6 text-center">

          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full mb-8"
            style={{ background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.38)', color: '#C4B5FD' }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI Study Tool · Every Exam · Every Student
          </div>

          <h1
            className="font-extrabold tracking-tight mb-6"
            style={{ fontSize: 'clamp(2.8rem, 6.5vw, 4.2rem)', lineHeight: 1.04, color: '#F0EEFF' }}
          >
            Learn Anything.{' '}
            <span style={TEXT_GRAD}>Remember Everything.</span>
          </h1>

          <p
            className="mx-auto mb-10"
            style={{ maxWidth: 530, color: 'rgba(240,238,255,0.62)', fontSize: '1.05rem', lineHeight: 1.75 }}
          >
            Paste any chapter, article, or notes — Remindology instantly builds
            your complete study kit: summaries, revision notes, and exam-ready MCQs.
            For every board, every exam, every student.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 text-white font-semibold px-7 py-3.5 rounded-xl text-base hover:opacity-90 transition-opacity"
              style={{ background: BRAND_GRAD, boxShadow: '0 8px 32px rgba(124,58,237,0.45)' }}
            >
              Start for Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 font-semibold px-7 py-3.5 rounded-xl text-base transition-colors hover:bg-white/5"
              style={{ border: '1px solid rgba(167,139,250,0.28)', color: '#C4B5FD' }}
            >
              See How it Works
            </a>
          </div>

          {/* Trust chips */}
          <div
            className="flex flex-wrap justify-center gap-5 mb-14"
            style={{ color: 'rgba(196,181,253,0.65)', fontSize: '0.82rem' }}
          >
            {['No credit card required', 'Free to start', 'Works for any exam or board'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: '#34D399' }} />
                {t}
              </span>
            ))}
          </div>

          {/* ── Animated hero preview ────────────────────────────────── */}
          <div className="max-w-2xl mx-auto mb-16">
            <HeroPreview />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          PRODUCT DEMO  ·  animated, cycling subjects
      ════════════════════════════════════════════════════════ */}
      <section className="py-24" style={{ background: SURFACE }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full mb-4"
              style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)', color: '#7C3AED' }}
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
          FEATURE SHOWCASE  ·  interactive dashboard tour
      ════════════════════════════════════════════════════════ */}
      <section id="features" className="py-24" style={{ background: '#FFFFFF' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full mb-4"
              style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)', color: '#7C3AED' }}
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
      <section id="new-features" className="py-24" style={{ background: SURFACE }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full mb-4"
              style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)', color: '#7C3AED' }}
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
              style={{ background: BRAND_GRAD, color: '#FFFFFF', boxShadow: '0 6px 24px rgba(124,58,237,0.3)' }}
            >
              Try all 8 features free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          HOW IT WORKS  ·  back to midnight
      ════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="relative py-24 overflow-hidden" style={{ background: MIDNIGHT }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(167,139,250,0.08) 1px, transparent 1px)', backgroundSize: '36px 36px' }}
        />
        <div
          className="absolute pointer-events-none"
          style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 700, height: 400, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%)' }}
        />

        <div className="relative max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full mb-4"
              style={{ background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.35)', color: '#C4B5FD' }}
            >
              <Target className="h-3.5 w-3.5" />
              How It Works
            </div>
            <h2
              className="font-bold tracking-tight mb-3"
              style={{ fontSize: '2.2rem', color: '#F0EEFF', lineHeight: 1.15 }}
            >
              Three steps.{' '}
              <span style={TEXT_GRAD}>Zero friction.</span>
            </h2>
            <p style={{ color: TEXT_MUTED_D, maxWidth: 380, margin: '0 auto', fontSize: '0.9rem', lineHeight: 1.75 }}>
              No onboarding checklist. No configuration. You study — Remindology handles the rest.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { n: '01', title: 'Paste your material',     desc: 'Drop in any chapter, article, or notes. Text from any subject and any exam.' },
              { n: '02', title: 'AI builds your study kit', desc: 'Summaries, revision notes, MCQs, and key topics — all in under 10 seconds.' },
              { n: '03', title: 'Study and revise',         desc: 'Everything is saved in your dashboard. Search and revisit any time before your exam.' },
            ].map(step => (
              <div
                key={step.n}
                className="p-7 rounded-2xl"
                style={{ background: 'rgba(124,58,237,0.07)', border: BORDER_D }}
              >
                <span
                  className="block font-extrabold mb-4"
                  style={{ fontSize: '3rem', lineHeight: 1, ...TEXT_GRAD }}
                >
                  {step.n}
                </span>
                <h3 className="font-semibold mb-2" style={{ color: '#F0EEFF', fontSize: '1rem' }}>
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: TEXT_MUTED_D }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          STATS STRIP
      ════════════════════════════════════════════════════════ */}
      <section style={{ background: SURFACE, borderBottom: '1px solid rgba(124,58,237,0.1)' }}>
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { v: '1000+', l: 'Notes Generated' },
              { v: '5000+', l: 'Materials Analysed' },
              { v: '10+',     l: 'Exams Supported' },
              { v: '5 hrs',   l: 'Saved per Week' },
            ].map(s => (
              <div key={s.l}>
                <div className="text-3xl font-extrabold" style={TEXT_GRAD_LT}>{s.v}</div>
                <div className="text-xs font-medium mt-1.5" style={{ color: TEXT_MID }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FAQ  ·  structured data for Google rich snippets
      ════════════════════════════════════════════════════════ */}
      <section id="faq" className="py-24" style={{ background: '#FFFFFF' }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />

        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full mb-4"
              style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)', color: '#7C3AED' }}
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
      <section className="py-20" style={{ background: SURFACE }}>
        <div className="max-w-4xl mx-auto px-6">
          <div
            className="relative overflow-hidden rounded-3xl p-12 text-center"
            style={{ background: 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 40%, #C026D3 100%)' }}
          >
            <div
              className="absolute pointer-events-none"
              style={{ top: 0, right: 0, width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', transform: 'translate(30%, -30%)' }}
            />
            <div
              className="absolute pointer-events-none"
              style={{ bottom: 0, left: 0, width: 260, height: 260, borderRadius: '50%', background: 'rgba(0,0,0,0.08)', transform: 'translate(-30%, 30%)' }}
            />
            <div className="relative">
              <p
                className="text-[11px] font-bold uppercase tracking-widest mb-3"
                style={{ color: 'rgba(255,255,255,0.55)' }}
              >
                Students across India are already using it
              </p>
              <h2
                className="font-extrabold mb-4"
                style={{ fontSize: '2.6rem', color: '#FFFFFF', lineHeight: 1.08 }}
              >
                Ready to study smarter?
              </h2>
              <p
                className="mb-8 mx-auto"
                style={{ color: 'rgba(255,255,255,0.72)', maxWidth: 400, lineHeight: 1.75, fontSize: '0.95rem' }}
              >
                Upload your first piece of study material and get a summary,
                revision notes, and MCQs — in seconds, for free.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 font-bold px-8 py-4 rounded-xl hover:opacity-95 transition-opacity text-base"
                style={{ background: '#FFFFFF', color: '#7C3AED', boxShadow: '0 12px 40px rgba(0,0,0,0.2)' }}
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
      <footer style={{ background: MIDNIGHT, borderTop: BORDER_D }}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2.5 mb-4">
                <div
                  className="h-8 w-8 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg"
                  style={{ background: BRAND_GRAD }}
                >
                  R
                </div>
                <span className="font-bold text-[17px]" style={TEXT_GRAD}>Remindology</span>
              </Link>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'rgba(196,181,253,0.5)', maxWidth: 280 }}
              >
                AI-powered study tool for every student. Upload, learn, remember.
              </p>
            </div>

            <div>
              <h4
                className="text-[11px] font-bold uppercase tracking-widest mb-4"
                style={{ color: 'rgba(196,181,253,0.38)' }}
              >
                Product
              </h4>
              <ul className="space-y-2.5">
                {[['Features', '#features'], ['How it Works', '#how-it-works'], ['FAQ', '#faq'], ['Sign Up', '/signup'], ['Sign In', '/login']].map(([l, h]) => (
                  <li key={l}>
                    <a
                      href={h}
                      className="text-sm transition-colors hover:text-white"
                      style={{ color: 'rgba(196,181,253,0.52)' }}
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
                style={{ color: 'rgba(196,181,253,0.38)' }}
              >
                Legal
              </h4>
              <ul className="space-y-2.5">
                {['Privacy Policy', 'Terms of Service'].map(item => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm transition-colors hover:text-white"
                      style={{ color: 'rgba(196,181,253,0.52)' }}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div
            className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
            style={{ borderTop: '1px solid rgba(124,58,237,0.12)' }}
          >
            <p className="text-xs" style={{ color: 'rgba(196,181,253,0.32)' }}>
              © 2026 Remindology. All rights reserved.
            </p>
            <p className="text-xs" style={{ color: 'rgba(196,181,253,0.32)' }}>
              Made for students across India 🇮🇳
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
