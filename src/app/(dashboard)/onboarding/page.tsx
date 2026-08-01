'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/use-auth-store';
import { authService } from '@/services/auth.service';
import { TARGET_EXAM_LABELS, type TargetExam } from '@/types/auth';
import { markOnboardingComplete } from '@/lib/onboarding';
import { Loader2, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

// ── Exam metadata ──────────────────────────────────────────────────

interface ExamMeta {
  key: TargetExam;
  label: string;
  subtitle: string;
  color: string;
  bg: string;
  border: string;
  emoji: string;
}

const EXAMS: ExamMeta[] = [
  {
    key: 'UPSC_CSE',
    label: TARGET_EXAM_LABELS.UPSC_CSE,
    subtitle: 'Prelims · Mains · Interview',
    color: '#7C3AED',
    bg: 'rgba(124,58,237,0.07)',
    border: 'rgba(124,58,237,0.22)',
    emoji: '🏛️',
  },
  {
    key: 'SSC_CGL',
    label: TARGET_EXAM_LABELS.SSC_CGL,
    subtitle: 'Combined Graduate Level',
    color: '#0891B2',
    bg: 'rgba(8,145,178,0.07)',
    border: 'rgba(8,145,178,0.22)',
    emoji: '📋',
  },
  {
    key: 'SSC_CHSL',
    label: TARGET_EXAM_LABELS.SSC_CHSL,
    subtitle: 'Combined Higher Secondary Level',
    color: '#0891B2',
    bg: 'rgba(8,145,178,0.07)',
    border: 'rgba(8,145,178,0.22)',
    emoji: '📄',
  },
  {
    key: 'IBPS_PO',
    label: TARGET_EXAM_LABELS.IBPS_PO,
    subtitle: 'Probationary Officer',
    color: '#059669',
    bg: 'rgba(5,150,105,0.07)',
    border: 'rgba(5,150,105,0.22)',
    emoji: '🏦',
  },
  {
    key: 'IBPS_CLERK',
    label: TARGET_EXAM_LABELS.IBPS_CLERK,
    subtitle: 'Clerical Cadre',
    color: '#059669',
    bg: 'rgba(5,150,105,0.07)',
    border: 'rgba(5,150,105,0.22)',
    emoji: '🏦',
  },
  {
    key: 'RRB_NTPC',
    label: TARGET_EXAM_LABELS.RRB_NTPC,
    subtitle: 'Non-Technical Popular Categories',
    color: '#D97706',
    bg: 'rgba(217,119,6,0.07)',
    border: 'rgba(217,119,6,0.22)',
    emoji: '🚂',
  },
  {
    key: 'NDA_CDS',
    label: TARGET_EXAM_LABELS.NDA_CDS,
    subtitle: 'National Defence / Combined Defence',
    color: '#DC2626',
    bg: 'rgba(220,38,38,0.07)',
    border: 'rgba(220,38,38,0.22)',
    emoji: '⚔️',
  },
  {
    key: 'STATE_PSC',
    label: TARGET_EXAM_LABELS.STATE_PSC,
    subtitle: 'State Public Service Commission',
    color: '#7C3AED',
    bg: 'rgba(124,58,237,0.07)',
    border: 'rgba(124,58,237,0.22)',
    emoji: '🗺️',
  },
];

// ── Page ──────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const { user, updateUser, setNeedsOnboarding } = useAuthStore();
  const [selected, setSelected] = useState<TargetExam | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!selected) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await authService.updateProfile({ targetExam: selected });
      updateUser(updated);
      if (user?.id) markOnboardingComplete(user.id);
      setNeedsOnboarding(false);
      router.replace('/dashboard');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e.response?.data?.message ?? 'Could not save your preference. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: '#09091F' }}
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(167,139,250,0.09) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      {/* Glow orb */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '15%', left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 65%)',
        }}
      />

      <div className="relative w-full max-w-2xl">

        {/* Header */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center h-14 w-14 rounded-2xl mb-5 mx-auto"
            style={{ background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.35)' }}
          >
            <Sparkles className="h-6 w-6" style={{ color: '#A78BFA' }} />
          </div>
          <h1
            className="font-extrabold tracking-tight mb-2"
            style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: '#F0EEFF' }}
          >
            Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 👋
          </h1>
          <p style={{ color: 'rgba(196,181,253,0.65)', fontSize: '0.95rem' }}>
            Which exam are you preparing for? We&apos;ll personalise your content accordingly.
          </p>
        </div>

        {/* Exam grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {EXAMS.map((exam) => {
            const isLive     = exam.key === 'UPSC_CSE' || exam.key === 'STATE_PSC';
            const isSelected = selected === exam.key;
            return (
              <button
                key={exam.key}
                onClick={() => isLive && setSelected(exam.key)}
                disabled={!isLive}
                className="text-left rounded-2xl p-4 transition-all duration-150 focus:outline-none"
                style={{
                  cursor: isLive ? 'pointer' : 'not-allowed',
                  opacity: isLive ? 1 : 0.45,
                  background: isSelected ? exam.bg : 'rgba(255,255,255,0.03)',
                  border: `2px solid ${isSelected ? exam.color : 'rgba(255,255,255,0.08)'}`,
                  boxShadow: isSelected ? `0 0 0 3px ${exam.color}22` : 'none',
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl leading-none mt-0.5">{exam.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className="font-bold text-sm leading-tight"
                        style={{ color: isSelected ? exam.color : '#E5E7EB' }}
                      >
                        {exam.label}
                      </p>
                      {isSelected && (
                        <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: exam.color }} />
                      )}
                      {!isLive && (
                        <span
                          className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-full shrink-0"
                          style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.1)' }}
                        >
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <p
                      className="text-[11px] mt-0.5"
                      style={{ color: isSelected ? exam.color + 'BB' : 'rgba(156,163,175,0.7)' }}
                    >
                      {exam.subtitle}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <p className="text-center text-sm mb-4" style={{ color: '#F87171' }}>
            {error}
          </p>
        )}

        {/* Confirm button */}
        <button
          onClick={handleConfirm}
          disabled={!selected || saving}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: selected
              ? `linear-gradient(135deg, ${EXAMS.find((e) => e.key === selected)?.color ?? '#7C3AED'}, #C026D3)`
              : 'rgba(124,58,237,0.3)',
            color: '#FFFFFF',
          }}
        >
          {saving ? (
            <><Loader2 className="h-4 w-4 animate-spin" />Saving…</>
          ) : (
            <>
              Let&apos;s Go
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        {/* Skip */}
        <div className="text-center mt-4">
          <button
            onClick={() => {
              if (user?.id) markOnboardingComplete(user.id);
              setNeedsOnboarding(false);
              router.replace('/dashboard');
            }}
            className="text-xs cursor-pointer hover:underline"
            style={{ color: 'rgba(196,181,253,0.4)' }}
          >
            Skip for now — I&apos;ll set this later in Profile
          </button>
        </div>
      </div>
    </div>
  );
}
