import Link from 'next/link';
import { ArrowRight, HelpCircle, Sparkles, Star, Target, Zap, Scale, MessageSquareQuote, Tag, Mail } from 'lucide-react';
import { ProductDemo } from '@/components/landing/ProductDemo';
import { FeatureShowcase } from '@/components/landing/FeatureShowcase';
import { NewFeatureShowcase } from '@/components/landing/NewFeatureShowcase';
import { FAQAccordion } from '@/components/landing/FAQAccordion';
import { FAQS } from '@/components/landing/faq-data';
import { HeroPreview } from '@/components/landing/HeroPreview';
import { MobileNav } from '@/components/landing/MobileNav';
import { NavAuthButtons } from '@/components/landing/NavAuthButtons';
import { WhyRemindology } from '@/components/landing/WhyRemindology';
import { Testimonials } from '@/components/landing/Testimonials';
import { Pricing } from '@/components/landing/Pricing';
import { CurrentAffairsTeaser } from '@/components/landing/CurrentAffairsTeaser';
import { OCRCopyCheckShowcase } from '@/components/landing/OCRCopyCheckShowcase';

// ── Style shortcuts ───────────────────────────────────────────────
const BRAND_GRAD = 'linear-gradient(135deg, #7C3AED, #C026D3)';
const TEXT_GRAD = { background: 'linear-gradient(135deg, #A78BFA, #E879F9)', WebkitBackgroundClip: 'text' as const, WebkitTextFillColor: 'transparent' };
const TEXT_GRAD_LT = { background: 'linear-gradient(135deg, #7C3AED, #C026D3)', WebkitBackgroundClip: 'text' as const, WebkitTextFillColor: 'transparent' };
const MIDNIGHT = '#09091F';
const SURFACE = '#F5F4FF';
const TEXT_DARK = '#1A1836';
const TEXT_MID = '#6B63A0';
const TEXT_MUTED_D = 'rgba(196,181,253,0.65)';
const BORDER_D = '1px solid rgba(124,58,237,0.2)';

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
              ✦ Built for UPSC CSE, SSC &amp; State PSCs — K-12, JEE &amp; NEET on the roadmap
            </span>
            <span className="sm:hidden">✦ UPSC, SSC &amp; State PSC · More coming</span>
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
              {[['Features', '#features'], ['Current Affairs', '#current-affairs'], ['Pricing', '#pricing'], ['FAQ', '#faq']].map(([label, href]) => (
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

            {/* Desktop auth buttons — auth-aware */}
            <NavAuthButtons dark />

            {/* Mobile hamburger menu */}
            <MobileNav />
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════
          HERO  ·  split layout: preview left | copy right
      ════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ background: MIDNIGHT }}>

        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(167,139,250,0.13) 1px, transparent 1px)', backgroundSize: '36px 36px' }}
        />
        {/* Radial glows */}
        <div
          className="absolute pointer-events-none"
          style={{ top: '-15%', right: '-6%', width: 580, height: 580, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.26) 0%, transparent 68%)' }}
        />
        <div
          className="absolute pointer-events-none"
          style={{ bottom: '0', left: '-8%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(192,38,211,0.15) 0%, transparent 68%)' }}
        />

        <div className="relative max-w-6xl mx-auto px-6 pt-20 sm:pt-28">

          {/* ── Main split: preview left | copy right ── */}
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 xl:gap-14 items-center pb-12">

            {/* LEFT: animated product preview */}
            <div className="order-2 lg:order-1">
              <HeroPreview />
            </div>

            {/* RIGHT: value copy + CTA + inline proof */}
            <div className="order-1 lg:order-2 flex flex-col gap-5 text-left">

              {/* Live badge */}
              <div
                className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full self-start"
                style={{ background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.38)', color: '#C4B5FD' }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#34D399' }} />
                  <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: '#34D399' }} />
                </span>
                AI Study OS · UPSC · SSC · State PSC
              </div>

              {/* Headline */}
              <h1
                className="font-extrabold tracking-tight"
                style={{ fontSize: 'clamp(2rem, 4.4vw, 3rem)', lineHeight: 1.13, color: '#F0EEFF' }}
              >
                <span style={TEXT_GRAD}>Your Personal<br />
                  Learning Intelligence.<br /></span>
              </h1>

              {/* Subtext */}
              <p style={{ color: 'rgba(240,238,255,0.62)', fontSize: '0.97rem', lineHeight: 1.78, maxWidth: 420 }}>
                Upload any chapter — get instant summaries, revision notes, MCQs &amp; answer evaluation.
                Coaching-level prep, without the fees.
              </p>

              {/* CTA buttons */}
              <div className="flex items-center gap-4 flex-wrap">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
                  style={{ background: BRAND_GRAD, boxShadow: '0 6px 24px rgba(124,58,237,0.4)', fontSize: '0.95rem' }}
                >
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center gap-1 font-semibold transition-colors hover:text-white"
                  style={{ color: 'rgba(196,181,253,0.68)', fontSize: '0.9rem' }}
                >
                  See how it works ↓
                </a>
              </div>

              {/* Proof row: avatars + stars + divider + quick stats */}
              <div className="flex items-center gap-5 flex-wrap pt-1">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2.5">
                    {[
                      { i: 'AR', c: '#7C3AED' },
                      { i: 'KM', c: '#0891B2' },
                      { i: 'PS', c: '#059669' },
                      { i: 'RV', c: '#D97706' },
                    ].map(a => (
                      <div
                        key={a.i}
                        className="h-7 w-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                        style={{ background: `linear-gradient(135deg, ${a.c}, ${a.c}CC)`, border: '2px solid #09091F' }}
                      >
                        {a.i}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-0.5 mb-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3" style={{ color: '#F59E0B', fill: '#F59E0B' }} />
                      ))}
                    </div>
                    <p className="text-[11px]" style={{ color: 'rgba(196,181,253,0.55)' }}>Loved by 500+ aspirants</p>
                  </div>
                </div>

                <div className="h-8 w-px hidden sm:block" style={{ background: 'rgba(124,58,237,0.22)' }} />

                <div className="flex gap-5">
                  <div>
                    <p className="text-base font-extrabold leading-none text-white">14</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'rgba(196,181,253,0.5)' }}>AI tools</p>
                  </div>
                  <div>
                    <p className="text-base font-extrabold leading-none text-white">5+</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'rgba(196,181,253,0.5)' }}>hrs/week saved</p>
                  </div>
                  <div>
                    <p className="text-base font-extrabold leading-none" style={TEXT_GRAD}>Free</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'rgba(196,181,253,0.5)' }}>to get started</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Bottom proof strip: 3 cards in a row ── */}
          <div className="grid sm:grid-cols-3 gap-4 pb-12">

            {/* Amber CTA card */}
            <div
              className="relative overflow-hidden rounded-2xl px-6 py-5"
              style={{ background: 'linear-gradient(135deg, #FCD34D, #F59E0B)' }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'repeating-conic-gradient(from 0deg at 72% 50%, rgba(255,255,255,0.25) 0deg 6deg, transparent 6deg 13deg)',
                  maskImage: 'radial-gradient(circle at 72% 50%, black, transparent 68%)',
                  WebkitMaskImage: 'radial-gradient(circle at 72% 50%, black, transparent 68%)',
                }}
              />
              <div className="relative">
                <p className="text-sm font-extrabold mb-0.5" style={{ color: '#422006' }}>
                  Start for <span className="italic">FREE</span>
                </p>
                <p className="text-[11px] font-medium mb-3" style={{ color: 'rgba(66,32,6,0.7)' }}>
                  No credit card · First study kit in seconds
                </p>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-1.5 text-white font-bold text-xs px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
                  style={{ background: '#1A1836' }}
                >
                  Get Started <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Emerald stat card */}
            <div
              className="relative overflow-hidden rounded-2xl px-6 py-5 flex flex-col items-center justify-center text-center"
              style={{ background: 'linear-gradient(135deg, #065F46, #0F766E)' }}
            >
              <div className="flex items-center gap-2.5 mb-1" style={{ color: 'rgba(255,255,255,0.8)' }}>
                <Sparkles className="h-4 w-4" />
                <span className="text-3xl font-extrabold text-white">14</span>
                <Sparkles className="h-4 w-4" />
              </div>
              <p className="text-sm font-bold text-white">AI study tools</p>
              <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>one upload does it all</p>
            </div>

            {/* Social proof card */}
            <div
              className="rounded-2xl px-6 py-5"
              style={{ background: 'rgba(255,255,255,0.04)', border: BORDER_D }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="flex -space-x-2.5">
                  {[
                    { i: 'AR', c: '#7C3AED' },
                    { i: 'KM', c: '#0891B2' },
                    { i: 'PS', c: '#059669' },
                    { i: 'RV', c: '#D97706' },
                  ].map(a => (
                    <div
                      key={a.i}
                      className="h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ background: `linear-gradient(135deg, ${a.c}, ${a.c}CC)`, border: '2px solid #09091F' }}
                    >
                      {a.i}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5" style={{ color: '#F59E0B', fill: '#F59E0B' }} />
                  ))}
                </div>
              </div>
              <p className="text-sm font-bold" style={{ color: '#F0EEFF' }}>Loved by aspirants across India</p>
              <p className="text-[11px] mt-0.5" style={{ color: 'rgba(196,181,253,0.55)' }}>
                Preparing for UPSC, SSC &amp; State PSC
              </p>
            </div>
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
          OCR COPY CHECK  ·  answer writing feature spotlight
      ════════════════════════════════════════════════════════ */}
      <section className="relative py-24 overflow-hidden" style={{ background: MIDNIGHT }}>
        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(167,139,250,0.07) 1px, transparent 1px)', backgroundSize: '36px 36px' }}
        />
        <div className="relative max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full mb-4"
              style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#34D399' }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#34D399' }} />
                <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: '#34D399' }} />
              </span>
              Just Shipped · Answer Writing
            </div>
            <h2
              className="font-bold tracking-tight mb-3"
              style={{ fontSize: '2.2rem', color: '#F0EEFF', lineHeight: 1.15 }}
            >
              Stop copying.{' '}
              <span style={TEXT_GRAD}>Start thinking.</span>
            </h2>
            <p style={{ color: TEXT_MUTED_D, maxWidth: 440, margin: '0 auto', fontSize: '0.9rem', lineHeight: 1.75 }}>
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
              { n: '01', title: 'Paste your material', desc: 'Drop in any chapter, article, or notes. Text from any subject and any exam.' },
              { n: '02', title: 'AI builds your study kit', desc: 'Summaries, revision notes, MCQs, and key topics — all in under 10 seconds.' },
              { n: '03', title: 'Study and revise', desc: 'Everything is saved in your dashboard. Search and revisit any time before your exam.' },
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
          WHY REMINDOLOGY  ·  comparison table
      ════════════════════════════════════════════════════════ */}
      <section id="why" className="py-24" style={{ background: '#FFFFFF' }}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full mb-4"
              style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)', color: '#7C3AED' }}
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
      <section style={{ background: SURFACE, borderTop: '1px solid rgba(124,58,237,0.1)', borderBottom: '1px solid rgba(124,58,237,0.1)' }}>
        <div className="max-w-5xl mx-auto px-6 py-12">
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
          CURRENT AFFAIRS TEASER  ·  public, no auth needed
      ════════════════════════════════════════════════════════ */}
      <CurrentAffairsTeaser />

      {/* ════════════════════════════════════════════════════════
          TESTIMONIALS  ·  dual marquee
      ════════════════════════════════════════════════════════ */}
      <section id="testimonials" className="py-24 overflow-hidden" style={{ background: '#FFFFFF' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full mb-4"
              style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)', color: '#7C3AED' }}
            >
              <MessageSquareQuote className="h-3.5 w-3.5" />
              Loved by Aspirants
            </div>
            <h2
              className="font-bold tracking-tight mb-3"
              style={{ fontSize: '2.2rem', color: TEXT_DARK, lineHeight: 1.15 }}
            >
              Students are{' '}
              <span style={TEXT_GRAD_LT}>studying smarter.</span>
            </h2>
            <p style={{ color: TEXT_MID, maxWidth: 420, margin: '0 auto', lineHeight: 1.75, fontSize: '0.9rem' }}>
              Real aspirants preparing for UPSC, SSC &amp; State PSCs — here&apos;s what changed for them.
            </p>
          </div>
        </div>

        {/* Full-bleed marquee */}
        <Testimonials />
      </section>

      {/* ════════════════════════════════════════════════════════
          PRICING
      ════════════════════════════════════════════════════════ */}
      <section id="pricing" className="py-24" style={{ background: SURFACE }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full mb-4"
              style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)', color: '#7C3AED' }}
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
            className="relative overflow-hidden rounded-3xl p-8 sm:p-12 text-center"
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
                style={{ fontSize: 'clamp(1.8rem, 5vw, 2.6rem)', color: '#FFFFFF', lineHeight: 1.08 }}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-10">
            <div className="sm:col-span-2 lg:col-span-2">
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
                className="text-sm leading-relaxed mb-5"
                style={{ color: 'rgba(196,181,253,0.5)', maxWidth: 280 }}
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
                    style={{ background: 'rgba(124,58,237,0.1)', border: BORDER_D, color: 'rgba(196,181,253,0.7)' }}
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
                style={{ color: 'rgba(196,181,253,0.38)' }}
              >
                Product
              </h4>
              <ul className="space-y-2.5">
                {[['Features', '#features'], ['Current Affairs', '#current-affairs'], ['Pricing', '#pricing'], ['FAQ', '#faq']].map(([l, h]) => (
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
                Company
              </h4>
              <ul className="space-y-2.5">
                {[['About', '#'], ['Blog', '#'], ['Privacy Policy', '/privacy'], ['Terms of Service', '/terms']].map(([l, h]) => (
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
                Get Started
              </h4>
              <ul className="space-y-2.5 mb-4">
                {[['Sign Up Free', '/signup'], ['Sign In', '/login']].map(([l, h]) => (
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
              <a
                href="mailto:remindology2026@gmail.com"
                className="inline-flex items-center gap-2 text-sm transition-colors hover:text-white"
                style={{ color: 'rgba(196,181,253,0.52)' }}
              >
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="break-all sm:break-normal">remindology2026@gmail.com</span>
              </a>
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
