'use client';

import { useState, useEffect, type CSSProperties, type ReactNode } from 'react';
import Link from 'next/link';
import { ShieldCheck, Camera, ArrowRight, Check } from 'lucide-react';

type Phase = 'scanning' | 'analyzing' | 'result';

const PHASE_DURATIONS: Record<Phase, number> = {
  scanning: 3400,
  analyzing: 2200,
  result: 4200,
};
const PHASE_ORDER: Phase[] = ['scanning', 'analyzing', 'result'];

const OCR_LINES = [
  'The Directive Principles of State Policy',
  'are contained in Part IV of the Constitution.',
  'They are non-justiciable in nature, meaning',
  'courts cannot enforce them directly.',
  'However, they guide the State in framing',
  'laws and policies for social welfare.',
];

// Scan line travels ~18px per line (gap 7 + height 18) = 25px; 6 lines + header ≈ 230px total
// Animation duration 3.4s, so sweep = 3.4 * (25/230) ≈ 0.37s per line → delay per line ≈ 0.4s
const LINE_DELAY = 0.42; // seconds between each OCR line appearing

// ── Sub-components ─────────────────────────────────────────────────

const INK = 'var(--color-ink)';
const MUTED = 'var(--color-ink-muted)';
const FAINT = 'var(--color-ink-faint)';
const RULE = 'var(--color-rule)';
const RULE_STRONG = 'var(--color-rule-strong)';
const LABEL_FONT = 'var(--font-label)';
const VERMILION = 'oklch(52% .16 35)';

const panelStyle: CSSProperties = {
  background: 'var(--color-paper)',
  border: `1px solid ${RULE}`,
  borderRadius: 8,
};

const labelStyle: CSSProperties = {
  fontFamily: LABEL_FONT,
  fontSize: 10,
  fontWeight: 500,
  color: MUTED,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
};

function StepCaption({ children }: { children: ReactNode }) {
  return (
    <p style={{ ...labelStyle, textAlign: 'center', marginTop: 10, color: FAINT }}>
      {children}
    </p>
  );
}

function ScanMockup() {
  return (
    <div style={{ width: '100%', maxWidth: 320 }}>
      <div style={{
        ...panelStyle,
        padding: '14px 14px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Header row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 11, paddingBottom: 9,
          borderBottom: `1px solid ${RULE}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Camera style={{ width: 12, height: 12, color: INK }} />
            <span style={labelStyle}>
              Mains Answer Sheet
            </span>
          </div>
          <span style={{ fontFamily: LABEL_FONT, fontSize: 9, color: FAINT }}>GS II · Q.4</span>
        </div>

        {/* Sweeping scan line */}
        <div style={{
          position: 'absolute',
          left: 0, right: 0,
          height: 1,
          background: INK,
          opacity: 0.6,
          animation: 'rmOcrSweep 3.4s ease-in-out forwards',
          top: 0,
          zIndex: 10,
        }} />

        {/* OCR text lines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {OCR_LINES.map((line, i) => (
            <div key={i} style={{
              height: 16,
              display: 'flex', alignItems: 'center',
              position: 'relative',
            }}>
              {/* Placeholder handwriting bar (visible before scan reaches this line) */}
              <div style={{
                position: 'absolute', inset: 0,
                borderRadius: 3,
                background: 'var(--color-paper-gray)',
                animation: 'rmHandwritingFade 0.4s ease forwards',
                animationDelay: `${0.3 + i * LINE_DELAY}s`,
              }} />
              {/* OCR text appears */}
              <span style={{
                fontSize: 10,
                fontFamily: LABEL_FONT,
                color: INK,
                letterSpacing: '0.01em',
                lineHeight: 1,
                position: 'relative',
                zIndex: 2,
                animation: 'rmLineReveal 0.2s ease-out forwards',
                animationDelay: `${0.3 + i * LINE_DELAY}s`,
                opacity: 0,
                whiteSpace: 'nowrap' as const,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              }}>
                {line}
              </span>
            </div>
          ))}
        </div>

        {/* OCR active indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--color-gold)',
            animation: 'rmPulse 1s ease-in-out infinite',
          }} />
          <span style={{ ...labelStyle, fontSize: 9 }}>
            Scanning · OCR Active
          </span>
        </div>
      </div>

      <StepCaption>Step 1 · Photograph &amp; Extract</StepCaption>
    </div>
  );
}

function AnalyzeMockup() {
  return (
    <div style={{ width: '100%', maxWidth: 320, textAlign: 'center' as const }}>
      <div style={{
        ...panelStyle,
        padding: '28px 20px',
      }}>
        {/* Animated dots */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginBottom: 18 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 7, height: 7, borderRadius: '50%',
              background: INK,
              animation: 'rmDotBlink 1.3s ease-in-out infinite',
              animationDelay: `${i * 0.22}s`,
            }} />
          ))}
        </div>

        <p style={{ fontSize: 14, fontWeight: 600, color: INK, marginBottom: 5 }}>
          Analyzing your answer…
        </p>
        <p style={{ fontSize: 12, color: MUTED, marginBottom: 18, lineHeight: 1.5 }}>
          Cross-referencing 2M+ academic sources
        </p>

        {/* Progress bar */}
        <div style={{ background: 'var(--color-paper-gray)', borderRadius: 999, height: 4, overflow: 'hidden', marginBottom: 6 }}>
          <div style={{
            height: '100%',
            background: INK,
            borderRadius: 999,
            animation: 'rmProgressFill 2.2s ease-out forwards',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: LABEL_FONT, fontSize: 9, color: FAINT }}>0 sources</span>
          <span style={{ fontFamily: LABEL_FONT, fontSize: 9, color: FAINT }}>2,147,483 sources</span>
        </div>

        {/* Checking items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 16 }}>
          {[
            { label: 'NCERT extracts', done: true },
            { label: 'Answer key templates', done: true },
            { label: 'Student submissions', done: false },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{
                width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                background: item.done ? INK : 'var(--color-paper-raised)',
                border: `1px solid ${item.done ? INK : RULE_STRONG}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {item.done && <Check style={{ width: 9, height: 9, color: 'var(--color-paper)' }} strokeWidth={3} />}
                {!item.done && <div style={{ width: 5, height: 5, borderRadius: '50%', background: INK, animation: 'rmPulse 0.8s ease-in-out infinite' }} />}
              </div>
              <span style={{ fontSize: 11, color: item.done ? INK : MUTED }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <StepCaption>Step 2 · Cross-reference</StepCaption>
    </div>
  );
}

function ResultMockup() {
  const score = 82;
  const radius = 40;
  const circumference = 2 * Math.PI * radius; // ≈ 251
  const offset = circumference * (1 - score / 100);   // ≈ 45

  return (
    <div style={{ width: '100%', maxWidth: 320 }}>
      <div style={{
        ...panelStyle,
        background: 'var(--color-paper-raised)',
        padding: '18px 16px',
      }}>
        {/* Score row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          {/* SVG arc */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <svg width={96} height={96} viewBox="0 0 96 96" style={{ display: 'block' }}>
              {/* Track */}
              <circle
                cx={48} cy={48} r={radius}
                fill="none"
                stroke="var(--color-paper-gray)"
                strokeWidth={6}
              />
              {/* Score arc */}
              <circle
                cx={48} cy={48} r={radius}
                fill="none"
                stroke="var(--color-gold)"
                strokeWidth={6}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                transform="rotate(-90 48 48)"
                style={{
                  animation: `rmScoreArc 1.2s ease-out forwards`,
                  // from: circumference (empty) to: offset (82% filled)
                }}
              />
            </svg>
            {/* Center content */}
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 2,
            }}>
              <ShieldCheck style={{
                width: 16, height: 16, color: INK,
                animation: 'rmShieldIn 0.2s ease-out forwards',
              }} />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 300, color: INK, lineHeight: 1 }}>
                {score}%
              </span>
            </div>
          </div>

          {/* Verdict text */}
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: INK, marginBottom: 4 }}>
              Mostly Original ✓
            </p>
            <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.55 }}>
              2 paragraphs need<br />more original analysis.
            </p>
          </div>
        </div>

        {/* Paragraph breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: 'Introduction', pct: 95 },
            { label: 'Core argument', pct: 32 },
            { label: 'Conclusion', pct: 91 },
          ].map((row, i) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 11, color: MUTED }}>{row.label}</span>
                <span style={{ fontFamily: LABEL_FONT, fontSize: 10, fontWeight: 500, color: row.pct > 60 ? INK : VERMILION }}>{row.pct}% original</span>
              </div>
              <div style={{ background: 'var(--color-paper-gray)', borderRadius: 999, height: 3, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 999,
                  background: row.pct > 60 ? INK : VERMILION,
                  width: `${row.pct}%`,
                  transformOrigin: 'left center',
                  animation: 'rmBarGrow 0.6s ease-out forwards',
                  animationDelay: `${i * 0.15}s`,
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <StepCaption>Step 3 · Originality Report</StepCaption>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────

export function OCRCopyCheckShowcase() {
  const [phase, setPhase] = useState<Phase>('scanning');
  const [cycleKey, setCycleKey] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      const idx = PHASE_ORDER.indexOf(phase);
      const next = (idx + 1) % PHASE_ORDER.length;
      if (next === 0) setCycleKey(k => k + 1);
      setPhase(PHASE_ORDER[next]);
    }, PHASE_DURATIONS[phase]);
    return () => clearTimeout(t);
  }, [phase]);

  const phaseLabel: Record<Phase, string> = {
    scanning: 'Scanning',
    analyzing: 'Analyzing',
    result: 'Result',
  };

  return (
    <>
      {/* Keyframe definitions — injected once per mount */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes rmOcrSweep {
          0%   { top: 0px;           opacity: 1; }
          92%  { top: calc(100% - 1px); opacity: 1; }
          100% { top: calc(100% - 1px); opacity: 0; }
        }
        @keyframes rmHandwritingFade {
          to { opacity: 0; }
        }
        @keyframes rmLineReveal {
          from { opacity: 0; transform: translateY(2px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes rmProgressFill {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes rmScoreArc {
          from { stroke-dashoffset: 251; }
          to   { stroke-dashoffset: 45; }
        }
        @keyframes rmShieldIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes rmDotBlink {
          0%, 80%, 100% { opacity: 0.2; }
          40%            { opacity: 1; }
        }
        @keyframes rmBarGrow {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes rmPulse {
          0%, 100% { opacity: 0.35; }
          50%       { opacity: 1; }
        }
      `}} />

      <div className="card-quiet overflow-hidden relative">
        <div className="grid md:grid-cols-2 gap-0">

          {/* Left: animated mockup */}
          <div
            className="flex items-center justify-center p-8 bg-paper-deep border-b border-rule md:border-b-0 md:border-r"
            style={{ minHeight: 380 }}
          >
            {phase === 'scanning'  && <ScanMockup key={`scan-${cycleKey}`} />}
            {phase === 'analyzing' && <AnalyzeMockup key={`analyze-${cycleKey}`} />}
            {phase === 'result'    && <ResultMockup key={`result-${cycleKey}`} />}
          </div>

          {/* Right: copy */}
          <div className="p-8 flex flex-col justify-center">

            {/* Badge */}
            <span className="chip mb-5 self-start gap-1.5 font-label text-[11px] uppercase tracking-[0.12em] text-ink-muted">
              <ShieldCheck className="h-3.5 w-3.5 text-ink" />
              New · OCR Answer Check
            </span>

            <h3 className="font-display font-light text-ink mb-3 leading-[1.05] text-[clamp(1.9rem,3.4vw,2.6rem)]">
              Write it by hand.{' '}
              <span className="text-ink-muted">
                Know it&apos;s yours.
              </span>
            </h3>

            <p className="text-ink-muted text-[15px] leading-[1.7] mb-6 max-w-[360px]">
              Photograph your handwritten answer. Our OCR engine reads every line,
              cross-checks it against 2M+ sources, and tells you exactly which
              paragraphs need more original thinking — before the examiner does.
            </p>

            {/* Feature bullets */}
            <ul className="flex flex-col gap-2.5 mb-7 list-none p-0">
              {[
                'Instant OCR — reads your handwriting in seconds',
                'Paragraph-level originality scoring',
                'Specific rewrite suggestions from AI',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 mt-0.5 shrink-0 text-ink" strokeWidth={2} />
                  <span className="text-sm text-ink-soft leading-normal">
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            {/* Phase indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 22 }}>
              {PHASE_ORDER.map(p => (
                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: p === phase ? 20 : 6,
                    height: 4,
                    borderRadius: 999,
                    background: p === phase ? 'var(--color-gold)' : RULE_STRONG,
                    transition: 'width 0.2s ease-out, background 0.2s ease-out',
                  }} />
                  {p === phase && (
                    <span style={{ ...labelStyle, color: INK }}>
                      {phaseLabel[p]}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <Link href="/signup" className="btn-ink self-start">
              Try Answer Check Free
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
