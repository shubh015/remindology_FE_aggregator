'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, Camera, ArrowRight } from 'lucide-react';

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

function ScanMockup() {
  return (
    <div style={{ width: '100%', maxWidth: 320 }}>
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14,
        padding: '14px 14px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Header row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 11, paddingBottom: 9,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Camera style={{ width: 12, height: 12, color: '#C4B5FD' }} />
            <span style={{
              fontSize: 10, fontWeight: 700, color: 'rgba(196,181,253,0.65)',
              letterSpacing: '0.1em', textTransform: 'uppercase' as const,
            }}>
              Mains Answer Sheet
            </span>
          </div>
          <span style={{ fontSize: 9, color: 'rgba(196,181,253,0.35)' }}>GS II · Q.4</span>
        </div>

        {/* Sweeping scan line */}
        <div style={{
          position: 'absolute',
          left: 0, right: 0,
          height: 2,
          background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.35) 20%, #A78BFA 45%, #E879F9 55%, rgba(167,139,250,0.35) 80%, transparent)',
          boxShadow: '0 0 10px 2px rgba(167,139,250,0.45)',
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
                background: 'rgba(196,181,253,0.08)',
                animation: 'rmHandwritingFade 0.4s ease forwards',
                animationDelay: `${0.3 + i * LINE_DELAY}s`,
              }} />
              {/* OCR text appears */}
              <span style={{
                fontSize: 10,
                fontFamily: "'Courier New', monospace",
                color: '#C4B5FD',
                letterSpacing: '0.02em',
                lineHeight: 1,
                position: 'relative',
                zIndex: 2,
                animation: 'rmLineReveal 0.5s ease forwards',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 10 }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#A78BFA',
            animation: 'rmPulse 1s ease-in-out infinite',
          }} />
          <span style={{
            fontSize: 9, fontWeight: 700,
            color: 'rgba(167,139,250,0.5)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
          }}>
            Scanning · OCR Active
          </span>
        </div>
      </div>

      <p style={{ textAlign: 'center' as const, marginTop: 8, fontSize: 11, color: 'rgba(196,181,253,0.38)' }}>
        Step 1 · Photograph &amp; Extract
      </p>
    </div>
  );
}

function AnalyzeMockup() {
  return (
    <div style={{ width: '100%', maxWidth: 320, textAlign: 'center' as const }}>
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(124,58,237,0.2)',
        borderRadius: 14,
        padding: '28px 20px',
      }}>
        {/* Animated dots */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginBottom: 18 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 9, height: 9, borderRadius: '50%',
              background: '#A78BFA',
              animation: 'rmDotBlink 1.3s ease-in-out infinite',
              animationDelay: `${i * 0.22}s`,
            }} />
          ))}
        </div>

        <p style={{ fontSize: 13, fontWeight: 700, color: '#F0EEFF', marginBottom: 5 }}>
          Analyzing your answer…
        </p>
        <p style={{ fontSize: 11, color: 'rgba(196,181,253,0.5)', marginBottom: 18, lineHeight: 1.5 }}>
          Cross-referencing 2M+ academic sources
        </p>

        {/* Progress bar */}
        <div style={{ background: 'rgba(124,58,237,0.12)', borderRadius: 999, height: 5, overflow: 'hidden', marginBottom: 6 }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, #7C3AED, #C026D3)',
            borderRadius: 999,
            animation: 'rmProgressFill 2.2s ease-out forwards',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 9, color: 'rgba(196,181,253,0.35)' }}>0 sources</span>
          <span style={{ fontSize: 9, color: 'rgba(196,181,253,0.35)' }}>2,147,483 sources</span>
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
                background: item.done ? 'rgba(52,211,153,0.15)' : 'rgba(124,58,237,0.1)',
                border: `1px solid ${item.done ? 'rgba(52,211,153,0.35)' : 'rgba(124,58,237,0.2)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {item.done && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#34D399' }} />}
                {!item.done && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#7C3AED', animation: 'rmPulse 0.8s ease-in-out infinite' }} />}
              </div>
              <span style={{ fontSize: 10, color: item.done ? 'rgba(196,181,253,0.65)' : 'rgba(196,181,253,0.4)' }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p style={{ textAlign: 'center' as const, marginTop: 8, fontSize: 11, color: 'rgba(196,181,253,0.38)' }}>
        Step 2 · Cross-reference
      </p>
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
        background: 'rgba(16,185,129,0.04)',
        border: '1px solid rgba(16,185,129,0.25)',
        borderRadius: 14,
        padding: '18px 16px',
        animation: 'rmPulseGreen 2.5s ease-in-out infinite',
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
                stroke="rgba(16,185,129,0.1)"
                strokeWidth={8}
              />
              {/* Score arc */}
              <circle
                cx={48} cy={48} r={radius}
                fill="none"
                stroke="#34D399"
                strokeWidth={8}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                transform="rotate(-90 48 48)"
                style={{
                  animation: `rmScoreArc 1.6s ease-out forwards`,
                  // from: circumference (empty) to: offset (82% filled)
                }}
              />
            </svg>
            {/* Center content */}
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 1,
            }}>
              <ShieldCheck style={{
                width: 18, height: 18, color: '#34D399',
                animation: 'rmShieldIn 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards',
              }} />
              <span style={{ fontSize: 16, fontWeight: 800, color: '#34D399', lineHeight: 1 }}>
                {score}%
              </span>
            </div>
          </div>

          {/* Verdict text */}
          <div>
            <p style={{ fontSize: 13, fontWeight: 800, color: '#F0EEFF', marginBottom: 4 }}>
              Mostly Original ✓
            </p>
            <p style={{ fontSize: 11, color: 'rgba(196,181,253,0.58)', lineHeight: 1.55 }}>
              2 paragraphs need<br />more original analysis.
            </p>
          </div>
        </div>

        {/* Paragraph breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: 'Introduction', pct: 95, color: '#34D399' },
            { label: 'Core argument', pct: 32, color: '#F59E0B' },
            { label: 'Conclusion', pct: 91, color: '#34D399' },
          ].map((row, i) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 10, color: 'rgba(196,181,253,0.55)' }}>{row.label}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: row.color }}>{row.pct}% original</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 999, height: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 999,
                  background: row.pct > 60 ? '#34D399' : '#F59E0B',
                  width: `${row.pct}%`,
                  transformOrigin: 'left center',
                  animation: 'rmBarGrow 1s ease forwards',
                  animationDelay: `${i * 0.15}s`,
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <p style={{ textAlign: 'center' as const, marginTop: 8, fontSize: 11, color: 'rgba(196,181,253,0.38)' }}>
        Step 3 · Originality Report
      </p>
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
          92%  { top: calc(100% - 2px); opacity: 1; }
          100% { top: calc(100% - 2px); opacity: 0; }
        }
        @keyframes rmHandwritingFade {
          to { opacity: 0; }
        }
        @keyframes rmLineReveal {
          from { opacity: 0; transform: translateY(4px); }
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
          0%   { transform: scale(0.4) rotate(-12deg); opacity: 0; }
          65%  { transform: scale(1.12) rotate(3deg);  opacity: 1; }
          100% { transform: scale(1) rotate(0);        opacity: 1; }
        }
        @keyframes rmPulseGreen {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
          50%       { box-shadow: 0 0 0 8px rgba(16,185,129,0.08); }
        }
        @keyframes rmDotBlink {
          0%, 80%, 100% { opacity: 0.18; transform: scale(0.75); }
          40%            { opacity: 1;   transform: scale(1.2); }
        }
        @keyframes rmBarGrow {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes rmPulse {
          0%, 100% { opacity: 0.5; transform: scale(0.9); }
          50%       { opacity: 1;   transform: scale(1.15); }
        }
      `}} />

      <div
        className="rounded-3xl overflow-hidden"
        style={{
          background: '#0D0D2B',
          border: '1px solid rgba(124,58,237,0.18)',
          position: 'relative',
        }}
      >
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: '50%', left: '35%',
          transform: 'translate(-50%, -50%)',
          width: 560, height: 360, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(52,211,153,0.06) 0%, rgba(124,58,237,0.08) 45%, transparent 72%)',
          pointerEvents: 'none',
        }} />

        <div className="grid md:grid-cols-2 gap-0">

          {/* Left: animated mockup */}
          <div
            className="flex items-center justify-center p-8"
            style={{
              borderRight: '1px solid rgba(124,58,237,0.1)',
              minHeight: 380,
            }}
          >
            {phase === 'scanning'  && <ScanMockup key={`scan-${cycleKey}`} />}
            {phase === 'analyzing' && <AnalyzeMockup key={`analyze-${cycleKey}`} />}
            {phase === 'result'    && <ResultMockup key={`result-${cycleKey}`} />}
          </div>

          {/* Right: copy */}
          <div className="p-8 flex flex-col justify-center">

            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 11, fontWeight: 700,
              padding: '5px 12px', borderRadius: 999,
              marginBottom: 16, alignSelf: 'flex-start' as const,
              background: 'rgba(52,211,153,0.1)',
              border: '1px solid rgba(52,211,153,0.25)',
              color: '#34D399',
            }}>
              <ShieldCheck style={{ width: 13, height: 13 }} />
              New · OCR Answer Check
            </div>

            <h3 style={{
              fontSize: 'clamp(1.25rem, 2.4vw, 1.7rem)',
              fontWeight: 800,
              lineHeight: 1.2,
              color: '#F0EEFF',
              marginBottom: 12,
            }}>
              Write it by hand.{' '}
              <span style={{
                background: 'linear-gradient(135deg, #34D399, #059669)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Know it&apos;s yours.
              </span>
            </h3>

            <p style={{
              color: 'rgba(196,181,253,0.62)',
              fontSize: '0.88rem',
              lineHeight: 1.8,
              marginBottom: 22,
              maxWidth: 340,
            }}>
              Photograph your handwritten answer. Our OCR engine reads every line,
              cross-checks it against 2M+ sources, and tells you exactly which
              paragraphs need more original thinking — before the examiner does.
            </p>

            {/* Feature bullets */}
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 26, listStyle: 'none', padding: 0 }}>
              {[
                'Instant OCR — reads your handwriting in seconds',
                'Paragraph-level originality scoring',
                'Specific rewrite suggestions from AI',
              ].map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                    background: 'rgba(52,211,153,0.12)',
                    border: '1px solid rgba(52,211,153,0.28)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#34D399' }} />
                  </div>
                  <span style={{ fontSize: 13, color: 'rgba(196,181,253,0.72)', lineHeight: 1.5 }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            {/* Phase indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
              {PHASE_ORDER.map(p => (
                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{
                    width: p === phase ? 20 : 6,
                    height: 6,
                    borderRadius: 999,
                    background: p === phase ? '#34D399' : 'rgba(255,255,255,0.1)',
                    transition: 'width 0.3s ease, background 0.3s ease',
                  }} />
                  {p === phase && (
                    <span style={{ fontSize: 10, color: '#34D399', fontWeight: 600 }}>
                      {phaseLabel[p]}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <Link
              href="/signup"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                fontSize: 13, fontWeight: 700,
                padding: '11px 20px', borderRadius: 12,
                alignSelf: 'flex-start' as const,
                background: 'linear-gradient(135deg, #059669, #34D399)',
                color: '#FFFFFF',
                textDecoration: 'none',
                boxShadow: '0 4px 20px rgba(16,185,129,0.28)',
                transition: 'opacity 0.15s ease',
              }}
            >
              Try Answer Check Free
              <ArrowRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
