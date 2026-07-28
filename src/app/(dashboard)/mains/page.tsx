'use client';

import { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useMainsQuestions, useMainsSubmit } from '@/features/mains/hooks/use-mains';
import { PenLine, Timer, Loader2, AlertCircle, CheckCircle2, ChevronLeft, Sparkles, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MainsQuestion, MainsSubmitResponse } from '@/types/features';

function TimerDisplay({ seconds }: { seconds: number }) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  const urgent = seconds < 60;
  return (
    <div className={cn('flex items-center gap-1.5 font-mono text-sm font-bold tabular-nums', urgent ? 'text-red-600' : 'text-foreground')}>
      <Timer className={cn('h-4 w-4', urgent && 'animate-pulse')} />
      {mins}:{secs}
    </div>
  );
}

function ScoreCard({ result, question, onBack }: { result: MainsSubmitResponse; question: MainsQuestion; onBack: () => void }) {
  const ev = result.evaluation;
  const pct = Math.round((result.score / result.outOf) * 100);
  const scoreColor = pct >= 70 ? 'text-emerald-600' : pct >= 40 ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="space-y-5">
      {/* Overall score */}
      <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Score</p>
        <p className={`text-5xl font-bold ${scoreColor}`}>
          {result.score}<span className="text-2xl text-muted-foreground">/{result.outOf}</span>
        </p>
        <p className="text-xs text-muted-foreground">{result.wordCount} words · {pct}%</p>
      </div>

      {/* Breakdown */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <p className="text-sm font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />Paragraph Breakdown
        </p>
        {(Object.entries(ev.breakdown) as [string, { score: number; feedback: string }][]).map(([key, val]) => (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              <span className="font-bold text-primary">{val.score} pts</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{val.feedback}</p>
          </div>
        ))}
      </div>

      {/* Strengths + Gaps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
          <p className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />Strengths
          </p>
          <ul className="space-y-1">
            {ev.keyStrengths.map((s, i) => <li key={i} className="text-xs text-muted-foreground">· {s}</li>)}
          </ul>
        </div>
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 space-y-2">
          <p className="text-xs font-bold text-red-700 flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" />Critical Gaps
          </p>
          <ul className="space-y-1">
            {ev.criticalGaps.map((g, i) => <li key={i} className="text-xs text-muted-foreground">· {g}</li>)}
          </ul>
        </div>
      </div>

      {/* Missing keywords */}
      {ev.missingKeywords.length > 0 && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
          <p className="text-xs font-bold text-amber-700">Missing Keywords</p>
          <div className="flex flex-wrap gap-1.5">
            {ev.missingKeywords.map((kw) => (
              <span key={kw} className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700">{kw}</span>
            ))}
          </div>
        </div>
      )}

      {/* Improved outline */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-2">
        <p className="text-xs font-bold text-primary flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />AI-Suggested Outline
        </p>
        <p className="text-xs text-foreground leading-relaxed">{ev.improvedOutline}</p>
      </div>

      <Button variant="outline" onClick={onBack} className="w-full cursor-pointer rounded-xl gap-2 font-semibold">
        <ChevronLeft className="h-4 w-4" />Try Another Question
      </Button>
    </div>
  );
}

function AnswerEditor({ question, onSubmit, isSubmitting }: {
  question: MainsQuestion;
  onSubmit: (text: string, secs: number) => void;
  isSubmitting: boolean;
}) {
  const [text, setText] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const overLimit = wordCount > question.word_limit;

  return (
    <div className="space-y-4">
      {/* Question card */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px] font-bold">{question.topic_tag}</Badge>
            <Badge variant="outline" className="text-[10px]">{question.marks} marks</Badge>
            <Badge variant="outline" className="text-[10px]">{question.word_limit} words</Badge>
          </div>
          <TimerDisplay seconds={elapsed} />
        </div>
        <p className="text-sm font-semibold text-foreground leading-snug">{question.question_text}</p>
        {question.source && (
          <p className="text-[11px] text-muted-foreground">Source: {question.source}</p>
        )}
      </div>

      {/* Answer textarea */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-muted-foreground">Your Answer</span>
          <span className={cn('font-bold', overLimit ? 'text-red-600' : 'text-muted-foreground')}>
            {wordCount}/{question.word_limit} words
          </span>
        </div>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Write your ${question.marks}-mark answer here… (${question.word_limit} words)`}
          className="min-h-[280px] text-sm leading-[1.8] resize-none"
        />
      </div>

      <Button
        onClick={() => onSubmit(text, elapsed)}
        disabled={isSubmitting || wordCount < 30}
        className="w-full cursor-pointer font-semibold text-sm h-11 rounded-xl gap-2"
      >
        {isSubmitting
          ? <><Loader2 className="h-4 w-4 animate-spin" />Evaluating…</>
          : <><Sparkles className="h-4 w-4" />Submit for AI Evaluation</>}
      </Button>
    </div>
  );
}

export default function MainsPage() {
  const { data: questions, isLoading, isError } = useMainsQuestions();
  const { mutate: submit, isPending: isSubmitting, data: result, isSuccess } = useMainsSubmit();
  const [selected, setSelected] = useState<MainsQuestion | null>(null);

  const handleSubmit = (answerText: string, timeTakenSecs: number) => {
    if (!selected) return;
    submit({ questionId: selected.id, answerText, timeTakenSecs });
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Answer Writing"
        action={selected && !isSuccess ? (
          <button onClick={() => setSelected(null)} className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer">
            <ChevronLeft className="h-3.5 w-3.5" />Back
          </button>
        ) : undefined}
      />

      <div className="flex-1 p-6 sm:p-8 max-w-3xl w-full mx-auto space-y-5">

        {isSuccess && result && selected ? (
          <ScoreCard result={result} question={selected} onBack={() => setSelected(null)} />
        ) : selected ? (
          <AnswerEditor question={selected} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        ) : (
          <>
            <div className="flex items-center gap-2">
              <PenLine className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">Practice Questions</p>
              <span className="text-xs text-muted-foreground">— select a question to start timed writing</span>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
              </div>
            ) : isError ? (
              <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Failed to load questions. Please try again.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {questions?.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => setSelected(q)}
                    className="w-full text-left rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all p-5 group cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-[10px] font-bold">{q.topic_tag}</Badge>
                          <Badge variant="outline" className="text-[10px]">{q.marks} marks · {q.word_limit} words</Badge>
                          {q.source && <span className="text-[10px] text-muted-foreground">{q.source}</span>}
                        </div>
                        <p className="text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">
                          {q.question_text}
                        </p>
                      </div>
                      <ChevronLeft className="h-4 w-4 text-muted-foreground rotate-180 shrink-0 mt-1 group-hover:text-primary transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
