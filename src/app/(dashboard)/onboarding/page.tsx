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
  emoji: string;
}

const EXAMS: ExamMeta[] = [
  { key: 'UPSC_CSE',   label: TARGET_EXAM_LABELS.UPSC_CSE,   subtitle: 'Prelims · Mains · Interview',         emoji: '🏛️' },
  { key: 'STATE_PSC',  label: TARGET_EXAM_LABELS.STATE_PSC,  subtitle: 'State Public Service Commission',     emoji: '🗺️' },
  { key: 'SSC_CGL',    label: TARGET_EXAM_LABELS.SSC_CGL,    subtitle: 'Combined Graduate Level',             emoji: '📋' },
  { key: 'SSC_CHSL',   label: TARGET_EXAM_LABELS.SSC_CHSL,   subtitle: 'Combined Higher Secondary Level',     emoji: '📄' },
  { key: 'IBPS_PO',    label: TARGET_EXAM_LABELS.IBPS_PO,    subtitle: 'Probationary Officer',                emoji: '🏦' },
  { key: 'IBPS_CLERK', label: TARGET_EXAM_LABELS.IBPS_CLERK, subtitle: 'Clerical Cadre',                      emoji: '🏦' },
  { key: 'RRB_NTPC',   label: TARGET_EXAM_LABELS.RRB_NTPC,   subtitle: 'Non-Technical Popular Categories',   emoji: '🚂' },
  { key: 'NDA_CDS',    label: TARGET_EXAM_LABELS.NDA_CDS,    subtitle: 'National Defence / Combined Defence', emoji: '⚔️' },
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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-paper">
      <div className="w-full max-w-2xl">

        {/* Progress */}
        <div className="h-1 w-full bg-paper-gray rounded-full overflow-hidden mb-10" aria-hidden="true">
          <div
            className="h-full bg-ink transition-[width] duration-200 ease-ks"
            style={{ width: selected ? '100%' : '50%' }}
          />
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-[3px] border border-rule bg-paper-deep mb-5 mx-auto">
            <Sparkles className="h-5 w-5 text-ink" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink mb-2">
            {user?.name ? `Welcome, ${user.name.split(' ')[0]}! 👋` : 'Welcome! 👋'}
          </h1>
          <p className="text-sm text-ink-muted">
            Which exam are you preparing for? We&apos;ll personalise your content accordingly.
          </p>
        </div>

        {/* ── Step 1: Exam grid ── */}
        <p className="font-label text-[11px] uppercase tracking-[0.14em] text-ink-muted mb-3">Target exam</p>
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
                className={`ks-card is-interactive text-left p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink cursor-pointer ${isSelected ? 'is-active' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl leading-none mt-0.5 select-none">{exam.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm leading-tight text-ink">
                        {exam.label}
                      </p>
                      {isSelected && (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-ink" />
                      )}
                    </div>
                    <p className="text-[11px] mt-0.5 text-ink-muted">
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
            <div className="ks-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <CalendarDays className="h-4 w-4 text-ink" />
                <p className="text-sm font-semibold text-ink">
                  When is your exam?
                  <span className="ml-1 font-label text-[11px] font-normal uppercase tracking-[0.14em] text-ink-muted">
                    optional
                  </span>
                </p>
              </div>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                min={TODAY}
                className={`w-full rounded-[3px] px-4 py-2.5 text-sm font-medium bg-paper border focus:outline-none focus:border-ink transition-colors duration-150 ease-ks ${examDate ? 'border-rule-strong text-ink' : 'border-rule text-ink-muted'}`}
              />
            </div>

            {/* Optional subject — UPSC only */}
            {selected === 'UPSC_CSE' && (
              <div className="ks-card p-4 animate-in fade-in duration-150">
                <div className="flex items-center gap-2 mb-3">
                  <BookMarked className="h-4 w-4 text-ink" />
                  <p className="text-sm font-semibold text-ink">
                    Optional subject
                    <span className="ml-1 text-[11px] font-normal text-ink-muted">
                      e.g. History, Geography
                    </span>
                  </p>
                </div>
                <input
                  type="text"
                  value={optionalSubject}
                  onChange={(e) => setOptionalSubject(e.target.value)}
                  placeholder="e.g. History, Geography, Anthropology…"
                  className={`w-full rounded-[3px] px-4 py-2.5 text-sm font-medium bg-paper border text-ink placeholder:text-ink-muted focus:outline-none focus:border-ink transition-colors duration-150 ease-ks ${optionalSubject ? 'border-rule-strong' : 'border-rule'}`}
                />
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-center text-sm mb-4 text-[oklch(52%_.16_35)]">
            {error}
          </p>
        )}

        {/* Continue button */}
        <button
          onClick={handleConfirm}
          disabled={!selected || saving}
          className="btn-ink w-full flex items-center justify-center gap-2 py-3.5 rounded-[3px] font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
