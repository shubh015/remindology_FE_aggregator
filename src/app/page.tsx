import Link from 'next/link';
import { ArrowRight, Mail } from 'lucide-react';
import { ProductDemo } from '@/components/landing/ProductDemo';
import { FeatureShowcase } from '@/components/landing/FeatureShowcase';
import { NewFeatureShowcase } from '@/components/landing/NewFeatureShowcase';
import { FAQAccordion } from '@/components/landing/FAQAccordion';
import { FAQS } from '@/components/landing/faq-data';
import { HeroPreview } from '@/components/landing/HeroPreview';
import { PublicHeader } from '@/components/landing/PublicHeader';
import { WhyRemindology } from '@/components/landing/WhyRemindology';
import { Pricing } from '@/components/landing/Pricing';
import { CurrentAffairsTeaser } from '@/components/landing/CurrentAffairsTeaser';
import { ImportantBanner } from '@/components/landing/ImportantBanner';
import { OCRCopyCheckShowcase } from '@/components/landing/OCRCopyCheckShowcase';
import { UPSCPrepGrid } from '@/components/landing/UPSCPrepGrid';
import { Logo } from '@/components/landing/Logo';

// Minimal monochrome theme: near-black ink on neutral paper with one gold
// accent used sparingly. All tokens and utility classes (.eyebrow,
// .section-title, .btn-ink, .card-quiet, ...) live under `.theme-mono` in
// globals.css.

function SectionHeader({
  eyebrow,
  title,
  muted,
  lead,
  center = false,
}: {
  eyebrow: string;
  title: string;
  muted?: string;
  lead?: React.ReactNode;
  center?: boolean;
}) {
  return (
    <div className={`grid gap-4 mb-12 sm:mb-14 ${center ? 'justify-items-center text-center' : ''}`}>
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="section-title max-w-[18ch]">
        {title}
        {muted && (
          <>
            {' '}
            <span className="text-ink-muted">{muted}</span>
          </>
        )}
      </h2>
      {lead && <p className="section-lead">{lead}</p>}
    </div>
  );
}

const SOCIALS = [
  { label: 'X (Twitter)', path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
  { label: 'Instagram', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
  { label: 'LinkedIn', path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
];

const FOOTER_COLUMNS: { title: string; links: [string, string][] }[] = [
  { title: 'Product', links: [['Features', '#features'], ['Current Affairs', '#current-affairs'], ['Pricing', '#pricing'], ['FAQ', '#faq']] },
  { title: 'Company', links: [['About', '#'], ['Blog', '#'], ['Privacy Policy', '/privacy'], ['Terms of Service', '/terms']] },
  { title: 'Get Started', links: [['Sign Up Free', '/signup'], ['Sign In', '/login']] },
];

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
    <div className="theme-mono relative min-h-screen">

      {/* Floating "important update" card, shown only when an admin has flagged an article */}
      <ImportantBanner />

      {/* ═══ ANNOUNCEMENT (scrolls away) + FLOATING NAV ══════════ */}
      <div className="bg-ink text-paper">
        <div className="ks-container flex items-center justify-center gap-3 h-9 text-center">
          <p className="text-[13px] text-paper/80 m-0">
            <span className="hidden sm:inline">
              Built for UPSC CSE, SSC &amp; State PSCs. K-12, JEE &amp; NEET on the roadmap.
            </span>
            <span className="sm:hidden">UPSC, SSC &amp; State PSC. More coming.</span>
          </p>
          <Link
            href="/signup"
            className="shrink-0 text-[13px] font-medium text-paper underline underline-offset-[3px] decoration-paper/40 hover:decoration-gold transition-colors"
          >
            Try free →
          </Link>
        </div>
      </div>

      <PublicHeader />

      <main>
        {/* ═══ HERO ═══════════════════════════════════════════════ */}
        <section className="ks-section" style={{ paddingBottom: 48 }}>
          <div className="ks-container">
            <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] gap-14 lg:gap-16 items-center">

              <div className="grid gap-7 max-w-[620px] justify-items-center text-center lg:justify-items-start lg:text-left mx-auto lg:mx-0">
                <span className="eyebrow">
                  <span className="eyebrow-dot" aria-hidden="true" />
                  AI study OS · UPSC · SSC · State PSC
                </span>

                <h1 className="display-title max-w-[9em]">
                  Your personal learning intelligence.
                </h1>

                <p className="m-0 max-w-[52ch] text-ink-soft" style={{ fontWeight: 300, lineHeight: 1.6 }}>
                  Upload any chapter and get instant summaries, revision notes, MCQs and answer
                  evaluation. Coaching-level prep, without the fees.
                </p>

                <div className="flex flex-col sm:flex-row gap-3.5 w-full sm:w-auto">
                  <Link href="/signup" className="btn-ink">
                    Get started free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a href="#features" className="btn-outline">
                    See how it works
                  </a>
                </div>

                <dl className="grid grid-cols-3 gap-8 pt-6 mt-1 border-t border-rule w-full max-w-md">
                  {[
                    { v: '14', l: 'AI study tools' },
                    { v: '4', l: 'GS papers' },
                    { v: 'Free', l: 'To start' },
                  ].map(s => (
                    <div key={s.l} className="grid gap-1.5">
                      <dt className="order-2 font-label text-[11px] uppercase tracking-[0.12em] text-ink-muted">{s.l}</dt>
                      <dd className="order-1 m-0 font-display font-light text-[2.25rem] leading-none text-ink">{s.v}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="w-full min-w-0 max-w-[520px] mx-auto lg:mx-0 lg:justify-self-end">
                <HeroPreview />
              </div>
            </div>

            {/* Proof strip: three quiet columns divided by rules */}
            <div className="grid sm:grid-cols-3 mt-20 border-y border-rule divide-y sm:divide-y-0 sm:divide-x divide-rule">
              <div className="py-6 sm:pr-8 grid gap-1">
                <span className="card-title">Start for free</span>
                <span className="text-sm text-ink-muted">No credit card. First study kit in seconds.</span>
                <Link href="/signup" className="ks-link text-sm font-medium mt-2 justify-self-start">
                  Create an account →
                </Link>
              </div>
              <div className="py-6 sm:px-8 grid gap-1">
                <span className="card-title">14 AI study tools</span>
                <span className="text-sm text-ink-muted">One upload does it all: notes, MCQs, topics and more.</span>
              </div>
              <div className="py-6 sm:pl-8 grid gap-1">
                <span className="card-title">General Studies &amp; Current Affairs</span>
                <span className="text-sm text-ink-muted">Free to read, updated daily.</span>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ PRODUCT DEMO ═══════════════════════════════════════ */}
        <section className="ks-section">
          <div className="ks-container">
            <SectionHeader
              eyebrow="See it in action"
              title="Paste material."
              muted="Get study tools."
              lead="No formatting required. No prompt engineering. Select an exam type below and watch it work."
            />
            <ProductDemo />
          </div>
        </section>

        {/* ═══ CURRENT AFFAIRS TEASER (renders its own section) ═══ */}
        <CurrentAffairsTeaser />

        {/* ═══ FEATURE SHOWCASE ═══════════════════════════════════ */}
        <section id="features" className="ks-section">
          <div className="ks-container">
            <SectionHeader
              eyebrow="What's inside"
              title="Six tools."
              muted="One upload."
              lead="Everything a student needs to turn passive reading into active exam prep, rotating below automatically."
            />
            <FeatureShowcase />
          </div>
        </section>

        {/* ═══ NEW FEATURES ═══════════════════════════════════════ */}
        <section id="new-features" className="ks-section">
          <div className="ks-container">
            <SectionHeader
              eyebrow="Just shipped · 8 new features"
              title="Beyond notes."
              muted="A full exam OS."
              lead="Eight new tools, from a daily streak challenge to a 30-day AI study plan. Click any feature to see a live preview."
            />
            <NewFeatureShowcase />
            <div className="mt-12">
              <Link href="/signup" className="btn-ink">
                Try all 8 features free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ═══ OCR COPY CHECK ═════════════════════════════════════ */}
        <section className="ks-section">
          <div className="ks-container">
            <SectionHeader
              eyebrow="Just shipped · Answer writing"
              title="Stop copying."
              muted="Start thinking."
              lead="The UPSC examiner rewards original analysis, not textbook regurgitation. Our OCR copy check catches it before they do."
            />
            <OCRCopyCheckShowcase />
          </div>
        </section>

        {/* ═══ HOW IT WORKS ═══════════════════════════════════════ */}
        <section id="how-it-works" className="ks-section">
          <div className="ks-container">
            <SectionHeader
              eyebrow="How it works"
              title="Three steps."
              muted="Zero friction."
              lead="No onboarding checklist. No configuration. You study, and Remindology handles the rest."
            />
            <ol className="grid md:grid-cols-3 gap-x-10 gap-y-10 list-none p-0 m-0">
              {[
                { n: '01', title: 'Paste your material', desc: 'Drop in any chapter, article, or notes. Text from any subject and any exam.' },
                { n: '02', title: 'AI builds your study kit', desc: 'Summaries, revision notes, MCQs, and key topics, all in under 10 seconds.' },
                { n: '03', title: 'Study and revise', desc: 'Everything is saved in your dashboard. Search and revisit any time before your exam.' },
              ].map(step => (
                <li key={step.n} className="grid gap-3 pt-6 border-t border-ink">
                  <span className="font-label text-[11px] tracking-[0.14em] text-ink-muted">{step.n}</span>
                  <h3 className="card-title m-0">{step.title}</h3>
                  <p className="m-0 text-[15px] text-ink-muted" style={{ lineHeight: 1.7 }}>{step.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ═══ WHY REMINDOLOGY ════════════════════════════════════ */}
        <section id="why" className="ks-section">
          <div className="ks-container">
            <SectionHeader
              eyebrow="Why Remindology"
              title="The grind, or"
              muted="the shortcut."
              lead="The same prep, minus the hours of manual work. Here's exactly what changes when AI does the heavy lifting."
            />
            <div className="max-w-4xl">
              <WhyRemindology />
            </div>
          </div>
        </section>

        {/* ═══ STATS STRIP ════════════════════════════════════════ */}
        <section className="bg-paper-deep border-y border-rule">
          <div className="ks-container py-14">
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-10">
              {[
                { v: '10 sec', l: 'From material to full study kit' },
                { v: '5+ hrs', l: 'Saved every week' },
                { v: '14', l: 'AI-powered study tools' },
                { v: '3', l: 'Exam families supported' },
              ].map(s => (
                <div key={s.l} className="grid gap-2">
                  <dt className="order-2 text-sm text-ink-muted leading-snug">{s.l}</dt>
                  <dd className="order-1 m-0 font-display font-extralight text-[3.25rem] leading-none text-ink">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ═══ UPSC PREP HUB ══════════════════════════════════════ */}
        <section id="testimonials" className="ks-section">
          <div className="ks-container">
            <SectionHeader
              eyebrow="UPSC prep hub"
              title="Everything you need for"
              muted="UPSC preparation."
              lead="A curated collection of resources, study kits, and tools designed to optimise your syllabus coverage."
            />
          </div>
          <UPSCPrepGrid />
        </section>

        {/* ═══ PRICING ════════════════════════════════════════════ */}
        <section id="pricing" className="ks-section">
          <div className="ks-container">
            <SectionHeader
              eyebrow="Pricing"
              title="Start free."
              muted="Upgrade when ready."
              lead="No credit card to begin. Cancel anytime. Pick the plan that matches how serious your prep is."
            />
            <Pricing />
            <p className="font-label text-[11px] uppercase tracking-[0.12em] text-ink-muted mt-10">
              Prices in INR · GST included where applicable · Founder pricing, locked in for early users
            </p>
          </div>
        </section>

        {/* ═══ FAQ ════════════════════════════════════════════════ */}
        <section id="faq" className="ks-section">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
          />
          <div className="ks-container grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] gap-x-16">
            <SectionHeader
              eyebrow="FAQ"
              title="Common questions,"
              muted="clear answers."
              lead="Everything you need to know about Remindology and how it works for your exam preparation."
            />
            <FAQAccordion />
          </div>
        </section>

        {/* ═══ CTA ════════════════════════════════════════════════ */}
        <section className="ks-section">
          <div className="ks-container">
            <div className="grid justify-items-center text-center gap-6 py-6">
              <span className="eyebrow">
                <span className="eyebrow-dot" aria-hidden="true" />
                Students across India are already using it
              </span>
              <h2 className="display-title max-w-[12em]">Ready to study smarter?</h2>
              <p className="section-lead max-w-[46ch] text-ink-muted">
                Upload your first piece of study material and get a summary, revision notes,
                and MCQs in seconds, for free.
              </p>
              <Link href="/signup" className="btn-ink mt-2">
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ═══ FOOTER ═════════════════════════════════════════════ */}
      <footer className="bg-paper-deep border-t border-rule">
        <div className="ks-container py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 mb-14">
            <div className="sm:col-span-2 lg:col-span-2 grid gap-5 content-start">
              <Link href="/" className="inline-flex" aria-label="Remindology home">
                <Logo size={28} />
              </Link>
              <p className="text-sm text-ink-muted max-w-[300px] m-0" style={{ lineHeight: 1.7 }}>
                The AI study OS for competitive exams. Paste any material and get summaries,
                notes, MCQs, and a full prep toolkit in seconds.
              </p>
              <div className="flex items-center gap-2">
                {SOCIALS.map(({ label, path }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="h-9 w-9 rounded-md flex items-center justify-center border border-rule-strong text-ink-muted transition-colors hover:text-ink hover:border-ink"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                      <path d={path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {FOOTER_COLUMNS.map(col => (
              <div key={col.title}>
                <h4 className="eyebrow mb-5">{col.title}</h4>
                <ul className="grid gap-3 list-none p-0 m-0">
                  {col.links.map(([l, h]) => (
                    <li key={l}>
                      <a href={h} className="nav-link text-sm!">{l}</a>
                    </li>
                  ))}
                  {col.title === 'Get Started' && (
                    <li>
                      <a href="mailto:remindology2026@gmail.com" className="nav-link text-sm! inline-flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="break-all sm:break-normal">remindology2026@gmail.com</span>
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-rule flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="font-label text-[11px] uppercase tracking-[0.12em] text-ink-muted m-0">
              © 2026 Remindology. All rights reserved.
            </p>
            <p className="font-label text-[11px] uppercase tracking-[0.12em] text-ink-muted m-0">
              Made for students across India
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
