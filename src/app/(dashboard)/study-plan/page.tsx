'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useStudyPlan } from '@/features/study-plan/hooks/use-study-plan';
import { CalendarDays, Sparkles, Loader2, AlertCircle, BookOpen, Zap, PenLine, Newspaper, FlaskConical } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StudyActivity, StudyPlanDay } from '@/types/features';

// ── Activity config ───────────────────────────────────────────────

const ACTIVITY_CONFIG: Record<StudyActivity, { icon: React.ElementType; label: string }> = {
  flashcards:      { icon: Zap,          label: 'Flashcards' },
  mcq_practice:    { icon: BookOpen,     label: 'MCQ Practice' },
  answer_writing:  { icon: PenLine,      label: 'Answer Writing' },
  current_affairs: { icon: Newspaper,    label: 'Current Affairs' },
  mock_test:       { icon: FlaskConical, label: 'Mock Test' },
};

const TODAY_DAY = 1;

// ── Helpers ───────────────────────────────────────────────────────

function getApiMessage(err: unknown): string {
  const e = err as { response?: { data?: { message?: string } }; message?: string };
  return e?.response?.data?.message || e?.message || '';
}

// ── DayCard ───────────────────────────────────────────────────────

function DayCard({ day, isToday, isMockDay }: { day: StudyPlanDay; isToday: boolean; isMockDay: boolean }) {
  const act = ACTIVITY_CONFIG[day.activity];
  const Icon = act.icon;

  return (
    <div className={cn(
      'ks-card is-interactive !block p-4',
      isToday && 'is-active',
      isMockDay && !isToday && '!border-rule-strong',
    )}>
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <span className={cn('font-label text-[11px] uppercase tracking-[0.14em] tabular-nums', isToday ? 'text-ink' : 'text-ink-muted')}>
            Day {day.day}
          </span>
          {isToday && <span className="ks-tag ks-tag-gold">Today</span>}
          {isMockDay && <span className="ks-tag ks-tag-ink">Mock Test</span>}
        </div>
        <span className="ks-tag ks-tag-outline flex items-center gap-1">
          <Icon className="h-3 w-3" />{act.label}
        </span>
      </div>

      <p className="text-sm font-semibold text-ink leading-snug mb-1">{day.primaryTopic}</p>
      <p className="text-xs text-ink-muted mb-2.5">Revision: {day.revisionTopic}</p>

      {day.tip && (
        <p className="text-xs text-ink-muted italic leading-relaxed border-t border-rule pt-2">
          💡 {day.tip}
        </p>
      )}
    </div>
  );
}

// ── ExamDatePrompt ────────────────────────────────────────────────

function ExamDatePrompt({ onSubmit, isGenerating }: { onSubmit: (date: string) => void; isGenerating: boolean }) {
  const [date, setDate] = useState('');
  return (
    <div className="flex flex-col items-center justify-center rounded-[2px] border border-rule-strong bg-paper-raised p-10 text-center gap-4 mt-2">
      <div className="flex h-12 w-12 items-center justify-center rounded-[3px] border border-rule bg-paper-deep text-gold-deep">
        <CalendarDays className="h-7 w-7" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-ink mb-1.5">Set your exam date to continue</h3>
        <p className="text-sm text-ink-muted max-w-xs leading-relaxed">
          Your profile doesn&apos;t have an exam date yet. Add one below and we&apos;ll generate a personalised 30-day plan.
        </p>
      </div>
      <div className="flex w-full max-w-xs gap-3">
        <DatePicker
          value={date}
          onChange={setDate}
          min={new Date().toISOString().split('T')[0]}
          placeholder="Pick your exam date"
          className="flex-1"
        />
        <Button
          onClick={() => { if (date) onSubmit(date); }}
          disabled={!date || isGenerating}
          className="cursor-pointer font-semibold gap-2 whitespace-nowrap"
        >
          {isGenerating ? <><Loader2 className="h-4 w-4 animate-spin" />Generating…</> : <><Sparkles className="h-4 w-4" />Generate</>}
        </Button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────

export default function StudyPlanPage() {
  const { plan, isLoading, isError, error, generate, isGenerating, isGenerateError, generateError, resetGenerate } = useStudyPlan();

  // Treat "no plan found" as empty state, not a hard error
  const queryMsg       = getApiMessage(error);
  const isPlanNotFound = isError && queryMsg.toLowerCase().includes('no study plan found');
  const isRealError    = isError && !isPlanNotFound;

  // Detect "exam_date not set" from generate mutation
  const genMsg            = getApiMessage(generateError);
  const isExamDateMissing = isGenerateError && genMsg.toLowerCase().includes('exam_date not set');

  const handleGenerate = (examDate?: string) => {
    resetGenerate();
    generate(examDate);
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Study Plan"
        action={
          plan && (
            <Button
              onClick={() => handleGenerate()}
              disabled={isGenerating}
              size="sm"
              className="cursor-pointer h-9 text-sm font-semibold gap-2 rounded-[3px]"
            >
              {isGenerating
                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Generating…</>
                : <><Sparkles className="h-3.5 w-3.5" />Regenerate</>}
            </Button>
          )
        }
      />

      <div className="flex-1 p-6 sm:p-8 max-w-4xl w-full mx-auto space-y-5">

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full rounded-[2px]" />
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-28 w-full rounded-[2px]" />)}
          </div>

        ) : isRealError ? (
          <div className="flex flex-col items-center justify-center rounded-[2px] border border-rule bg-paper-raised p-10 gap-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-[3px] border border-rule bg-paper-deep text-[oklch(52%_.16_35)]">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-ink mb-1">Failed to load study plan</h3>
              <p className="text-sm text-ink-muted max-w-xs">{queryMsg || 'An unexpected error occurred.'}</p>
            </div>
            <Button onClick={() => handleGenerate()} disabled={isGenerating} variant="outline" className="cursor-pointer gap-2">
              <Sparkles className="h-4 w-4" />Try Again
            </Button>
          </div>

        ) : !plan || isPlanNotFound ? (
          /* ── No plan exists yet ── */
          isExamDateMissing ? (
            <ExamDatePrompt onSubmit={handleGenerate} isGenerating={isGenerating} />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-[2px] border border-dashed border-rule-strong p-14 text-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-[3px] border border-rule bg-paper-deep text-ink">
                <CalendarDays className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-ink mb-1.5">No study plan yet</h3>
                <p className="text-sm text-ink-muted max-w-xs leading-relaxed">
                  Generate a personalised 30-day plan based on your exam date and weak topics.
                </p>
              </div>

              {/* Non-exam-date generate errors */}
              {isGenerateError && !isExamDateMissing && (
                <div className="flex items-start gap-2 rounded-[2px] bg-paper-raised border border-rule p-3 text-xs text-[oklch(52%_.16_35)] max-w-xs text-left">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{genMsg || 'Failed to generate. Please try again.'}</span>
                </div>
              )}

              <Button
                onClick={() => handleGenerate()}
                disabled={isGenerating}
                className="cursor-pointer font-semibold gap-2 rounded-[3px] px-6"
              >
                {isGenerating
                  ? <><Loader2 className="h-4 w-4 animate-spin" />Generating…</>
                  : <><Sparkles className="h-4 w-4" />Generate My Plan</>}
              </Button>
            </div>
          )

        ) : (
          /* ── Plan loaded ── */
          <>
            {/* Regenerate error */}
            {isGenerateError && isExamDateMissing && (
              <ExamDatePrompt onSubmit={handleGenerate} isGenerating={isGenerating} />
            )}
            {isGenerateError && !isExamDateMissing && (
              <div className="flex items-center gap-2 rounded-[2px] bg-paper-raised border border-rule p-3.5 text-sm text-[oklch(52%_.16_35)]">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{genMsg || 'Regeneration failed. Please try again.'}</span>
              </div>
            )}

            {/* Plan summary banner */}
            <div className="ks-card p-4 !flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[3px] border border-rule bg-paper-deep text-ink">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">30-Day Study Plan · {plan.examType}</p>
                  <p className="text-xs text-ink-muted tabular-nums">
                    {plan.daysRemaining} days to exam · {plan.weakTopicsCount} weak topics addressed
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="font-label text-[11px] tabular-nums">
                Exam: {new Date(plan.examDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </Badge>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-2 text-xs text-ink-muted">
              {Object.entries(ACTIVITY_CONFIG).map(([key, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <span key={key} className="ks-tag ks-tag-outline flex items-center gap-1">
                    <Icon className="h-3 w-3" />{cfg.label}
                  </span>
                );
              })}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(plan.plan ?? []).map((day) => (
                <DayCard
                  key={day.day}
                  day={day}
                  isToday={day.day === TODAY_DAY}
                  isMockDay={day.day % 7 === 0}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
