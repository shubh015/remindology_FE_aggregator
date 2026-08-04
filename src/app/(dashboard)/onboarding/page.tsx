'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/use-auth-store';
import { authService } from '@/services/auth.service';
import { TARGET_EXAM_LABELS, type TargetExam } from '@/types/auth';
import { Loader2, CheckCircle2, Sparkles, ArrowRight, CalendarDays, BookMarked } from 'lucide-react';

// ── Exam metadata ──────────────────────────────────────────────────

interface ExamMeta {
  key: TargetExam;
  label: string;
  subtitle: string;
  color: string;
  bg: string;
  emoji: string;
}

const EXAMS: ExamMeta[] = [
  { key: 'UPSC_CSE',   label: TARGET_EXAM_LABELS.UPSC_CSE,   subtitle: 'Prelims · Mains · Interview',         color: '#7C3AED', bg: 'rgba(124,58,237,0.1)',  emoji: '🏛️' },
  { key: 'STATE_PSC',  label: TARGET_EXAM_LABELS.STATE_PSC,  subtitle: 'State Public Service Commission',     color: '#7C3AED', bg: 'rgba(124,58,237,0.1)',  emoji: '🗺️' },
  { key: 'SSC_CGL',    label: TARGET_EXAM_LABELS.SSC_CGL,    subtitle: 'Combined Graduate Level',             color: '#0891B2', bg: 'rgba(8,145,178,0.1)',   emoji: '📋' },
  { key: 'SSC_CHSL',   label: TARGET_EXAM_LABELS.SSC_CHSL,   subtitle: 'Combined Higher Secondary Level',     color: '#0891B2', bg: 'rgba(8,145,178,0.1)',   emoji: '📄' },
  { key: 'IBPS_PO',    label: TARGET_EXAM_LABELS.IBPS_PO,    subtitle: 'Probationary Officer',                color: '#059669', bg: 'rgba(5,150,105,0.1)',   emoji: '🏦' },
  { key: 'IBPS_CLERK', label: TARGET_EXAM_LABELS.IBPS_CLERK, subtitle: 'Clerical Cadre',                      color: '#059669', bg: 'rgba(5,150,105,0.1)',   emoji: '🏦' },
  { key: 'RRB_NTPC',   label: TARGET_EXAM_LABELS.RRB_NTPC,   subtitle: 'Non-Technical Popular Categories',   color: '#D97706', bg: 'rgba(217,119,6,0.1)',   emoji: '🚂' },
  { key: 'NDA_CDS',    label: TARGET_EXAM_LABELS.NDA_CDS,    subtitle: 'National Defence / Combined Defence', color: '#DC2626', bg: 'rgba(220,38,38,0.1)',   emoji: '⚔️' },
];

const TODAY = new Date().toISOString().split('T')[0];

// ── Page ──────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const { user, updateUser, setNeedsOnboarding } = useAuthStore();

  const [selected,       setSelected]       = useState<TargetExam | null>(null);
  const [examDate,       setExamDate]       = useState('');
  const [optionalSubject, setOptionalSubject] = useState('');
  const [saving,         setSaving]         = useState(false);
  const [error,          setError]          = useState<string | null>(null);

  const selectedMeta = selected ? EXAMS.find((e) => e.key === selected) : null;

  const handleConfirm = async () => {
    if (!selected) return;
    setSaving(true);
    setError(null);
    try {
      const payload: Parameters<typeof authService.updateProfile>[0] = {
        targetExam: selected,
      };
      if (examDate)                              payload.examDate        = examDate;
      if (selected === 'UPSC_CSE' && optionalSubject.trim()) {
        payload.optionalSubject = optionalSubject.trim();
      }

      const updated = await authService.updateProfile(payload);
      updateUser(updated);
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
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden"
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
          top: '10%', left: '50%', transform: 'translateX(-50%)',
          width: 700, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.16) 0%, transparent 65%)',
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
            {user?.name ? `Welcome, ${user.name.split(' ')[0]}! 👋` : 'Welcome! 👋'}
          </h1>
          <p style={{ color: 'rgba(196,181,253,0.65)', fontSize: '0.9rem' }}>
            Which exam are you preparing for? We&apos;ll personalise your content accordingly.
          </p>
        </div>

        {/* ── Step 1: Exam grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {EXAMS.map((exam) => {
            const isSelected = selected === exam.key;
            return (
              <button
                key={exam.key}
                onClick={() => {
                  setSelected(exam.key);
                  if (exam.key !== 'UPSC_CSE') setOptionalSubject('');
                }}
                className="text-left rounded-2xl p-4 transition-all duration-150 focus:outline-none cursor-pointer"
                style={{
                  background: isSelected ? exam.bg : 'rgba(255,255,255,0.03)',
                  border: `2px solid ${isSelected ? exam.color : 'rgba(255,255,255,0.08)'}`,
                  boxShadow: isSelected ? `0 0 0 3px ${exam.color}22` : 'none',
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl leading-none mt-0.5 select-none">{exam.emoji}</span>
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

        {/* ── Step 2: Extra fields (fade in after exam selected) ── */}
        {selected && (
          <div className="space-y-4 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-200">

            {/* Exam date */}
            <div
              className="rounded-2xl p-4"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <CalendarDays className="h-4 w-4" style={{ color: '#A78BFA' }} />
                <p className="text-sm font-semibold" style={{ color: '#E5E7EB' }}>
                  When is your exam?
                  <span className="ml-1 text-[11px] font-normal" style={{ color: 'rgba(196,181,253,0.45)' }}>
                    optional
                  </span>
                </p>
              </div>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                min={TODAY}
                className="w-full rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none scheme-dark"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: examDate
                    ? `1.5px solid ${selectedMeta?.color ?? '#7C3AED'}66`
                    : '1.5px solid rgba(255,255,255,0.1)',
                  color: examDate ? '#F0EEFF' : 'rgba(196,181,253,0.4)',
                }}
              />
            </div>

            {/* Optional subject — UPSC only */}
            {selected === 'UPSC_CSE' && (
              <div
                className="rounded-2xl p-4 animate-in fade-in duration-150"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <BookMarked className="h-4 w-4" style={{ color: '#A78BFA' }} />
                  <p className="text-sm font-semibold" style={{ color: '#E5E7EB' }}>
                    Optional subject
                    <span className="ml-1 text-[11px] font-normal" style={{ color: 'rgba(196,181,253,0.45)' }}>
                      e.g. History, Geography
                    </span>
                  </p>
                </div>
                <input
                  type="text"
                  value={optionalSubject}
                  onChange={(e) => setOptionalSubject(e.target.value)}
                  placeholder="e.g. History, Geography, Anthropology…"
                  className="w-full rounded-xl px-4 py-2.5 text-sm font-medium placeholder:opacity-30 focus:outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: optionalSubject
                      ? '1.5px solid rgba(124,58,237,0.5)'
                      : '1.5px solid rgba(255,255,255,0.1)',
                    color: '#F0EEFF',
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-center text-sm mb-4" style={{ color: '#F87171' }}>
            {error}
          </p>
        )}

        {/* Continue button */}
        <button
          onClick={handleConfirm}
          disabled={!selected || saving}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          style={{
            background: selected
              ? `linear-gradient(135deg, ${selectedMeta?.color ?? '#7C3AED'}, #C026D3)`
              : 'rgba(124,58,237,0.3)',
            color: '#FFFFFF',
            boxShadow: selected ? '0 4px 20px rgba(124,58,237,0.3)' : 'none',
          }}
        >
          {saving ? (
            <><Loader2 className="h-4 w-4 animate-spin" />Saving…</>
          ) : (
            <>Continue <ArrowRight className="h-4 w-4" /></>
          )}
        </button>
      </div>
    </div>
  );
}
