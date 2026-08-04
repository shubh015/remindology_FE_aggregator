'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useMainsQuestions, useMainsSubmit, useMainsPdfSubmit, useMainsCustomPdfSubmit } from '@/features/mains/hooks/use-mains';
import { useAiLimitStore } from '@/store/use-ai-limit-store';
import { AiUsageIndicator } from '@/components/ai/AiUsageIndicator';
import { streakService } from '@/services/streak.service';
import {
  PenLine, Timer, Loader2, AlertCircle, CheckCircle2, ChevronLeft,
  Sparkles, TrendingUp, Upload, FileText, X,
  ChevronDown, ScanLine, FileUp, Plus, BarChart3, Zap, Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MainsQuestion, MainsSubmitResponse } from '@/types/features';

// ── Constants ─────────────────────────────────────────────────────

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES      = 20 * 1024 * 1024; // 20 MB per page
const MAX_PAGES      = 3;

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

type InputMode  = 'type' | 'upload';
type ListingTab = 'bank' | 'custom';

// ── Timer ─────────────────────────────────────────────────────────

function TimerDisplay({ seconds }: { seconds: number }) {
  const mins   = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs   = (seconds % 60).toString().padStart(2, '0');
  const urgent = seconds > 0 && seconds < 60;
  return (
    <div className={cn('flex items-center gap-1.5 font-mono text-sm font-bold tabular-nums', urgent ? 'text-red-600' : 'text-foreground')}>
      <Timer className={cn('h-4 w-4', urgent && 'animate-pulse')} />
      {mins}:{secs}
    </div>
  );
}

// ── Scanning animation ────────────────────────────────────────────

const SCAN_STEPS = [
  { label: 'Uploading pages' },
  { label: 'Reading handwriting' },
  { label: 'Analysing your answer' },
  { label: 'Scoring your response' },
] as const;

// Deterministic widths so they never change between renders
const LINE_WIDTHS = [82, 67, 91, 55, 78, 63, 46];

function ScanningAnimation({ pageCount }: { pageCount: number }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 1400),
      setTimeout(() => setStep(2), 3800),
      setTimeout(() => setStep(3), 7200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="rounded-2xl border border-primary/20 bg-card overflow-hidden">
      {/* CSS keyframes scoped to this component */}
      <style>{`
        @keyframes rm-scan {
          0%   { transform: translateY(0px);   opacity: 1; }
          46%  { transform: translateY(118px); opacity: 1; }
          50%  { transform: translateY(118px); opacity: 0; }
          52%  { transform: translateY(0px);   opacity: 0; }
          56%  { opacity: 1; }
          100% { transform: translateY(118px); opacity: 1; }
        }
        @keyframes rm-line-pulse {
          0%, 100% { opacity: 0.2; }
          50%       { opacity: 0.6; }
        }
      `}</style>

      {/* Document mockup */}
      <div className="relative mx-5 mt-5 rounded-2xl bg-background border border-border overflow-hidden" style={{ height: 148 }}>
        {/* Fake handwriting lines */}
        <div className="p-4 space-y-2.5">
          {LINE_WIDTHS.map((w, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full bg-border"
              style={{
                width: `${w}%`,
                animation: `rm-line-pulse 2.2s ease-in-out ${i * 0.28}s infinite`,
              }}
            />
          ))}
        </div>

        {/* Scan line glow */}
        <div
          style={{
            position: 'absolute',
            left: 12, right: 12, height: 2, borderRadius: 1,
            background: 'linear-gradient(to right, transparent 0%, rgba(124,58,237,0.9) 25%, rgba(192,38,211,1) 50%, rgba(124,58,237,0.9) 75%, transparent 100%)',
            boxShadow: '0 0 14px 5px rgba(124,58,237,0.3)',
            animation: 'rm-scan 2.6s ease-in-out infinite',
          }}
        />

        {/* Badge */}
        <div
          className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[10px] font-bold rounded-full px-2 py-0.5"
          style={{ background: 'rgba(124,58,237,0.1)', color: 'rgba(124,58,237,0.8)', border: '1px solid rgba(124,58,237,0.2)' }}
        >
          <ScanLine className="h-2.5 w-2.5" />
          {pageCount} {pageCount === 1 ? 'page' : 'pages'}
        </div>
      </div>

      {/* Step list */}
      <div className="px-5 pt-4 pb-5 space-y-3">
        {SCAN_STEPS.map(({ label }, i) => {
          const done   = i < step;
          const active = i === step;
          const future = i > step;
          return (
            <div key={i} className={cn('flex items-center gap-3 transition-opacity duration-500', future && 'opacity-30')}>
              <div className={cn(
                'h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-all duration-300',
                done   && 'bg-emerald-500 text-white',
                active && 'bg-primary text-white',
                future && 'bg-secondary text-muted-foreground',
              )}>
                {done   && <CheckCircle2 className="h-3.5 w-3.5" />}
                {active && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {future && <span>{i + 1}</span>}
              </div>
              <span className={cn(
                'text-sm flex-1 transition-all duration-300',
                done   && 'text-muted-foreground line-through decoration-muted-foreground/40',
                active && 'text-foreground font-semibold',
                future && 'text-muted-foreground',
              )}>
                {label}
                {active && i === 1 && pageCount > 1 && (
                  <span className="text-muted-foreground font-normal ml-1">({pageCount} pages)</span>
                )}
              </span>
              {active && (
                <span className="text-[11px] text-primary/70 font-medium animate-pulse shrink-0">
                  processing…
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Score card ────────────────────────────────────────────────────

function ScoreCard({ result, onBack }: {
  result: MainsSubmitResponse;
  onBack: () => void;
}) {
  const [showExtracted, setShowExtracted] = useState(false);
  const ev  = result.evaluation;
  const pct = Math.round((result.score / result.outOf) * 100);
  const scoreColor = pct >= 70 ? 'text-emerald-600' : pct >= 40 ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="space-y-5">

      {/* OCR extracted text */}
      {result.extractedText && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <button
            type="button"
            onClick={() => setShowExtracted((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/50 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ScanLine className="h-4 w-4 text-primary" />
              What AI read from your answer
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                Verify OCR
              </span>
            </span>
            <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform duration-200', showExtracted && 'rotate-180')} />
          </button>
          {showExtracted && (
            <div className="px-5 pb-5 border-t border-border">
              <p className="text-[11px] text-muted-foreground mt-3 mb-2">
                Text AI extracted from your handwritten answer. If something looks off, your handwriting may not have been read correctly.
              </p>
              <div className="rounded-xl bg-secondary/50 border border-border p-4 max-h-64 overflow-y-auto">
                <p className="text-xs leading-relaxed text-foreground whitespace-pre-wrap font-mono">
                  {result.extractedText}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Score */}
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

// ── Multi-file upload zone ─────────────────────────────────────────

function MultiFileZone({
  files, previewUrls, onPickMore, onRemove,
  isDragOver, onDragOver, onDragLeave, onDrop,
  disabled,
}: {
  files: File[];
  previewUrls: (string | null)[];
  onPickMore: () => void;
  onRemove: (i: number) => void;
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  disabled: boolean;
}) {
  if (files.length === 0) {
    return (
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={onPickMore}
        className={cn(
          'rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 select-none',
          isDragOver
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : 'border-border bg-secondary/20 hover:border-primary/50 hover:bg-primary/2',
          disabled && 'pointer-events-none opacity-50',
        )}
      >
        <div className="flex flex-col items-center justify-center gap-3 py-12 px-6 text-center">
          <div className={cn(
            'h-16 w-16 rounded-2xl flex items-center justify-center transition-colors',
            isDragOver ? 'bg-primary/15' : 'bg-secondary',
          )}>
            <Upload className={cn('h-7 w-7 transition-colors', isDragOver ? 'text-primary' : 'text-muted-foreground')} />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              {isDragOver ? 'Drop your pages here' : 'Drag & drop or click to upload'}
            </p>
            <p className="text-xs text-muted-foreground">PDF, JPG, PNG, WEBP · Max 20 MB per page · Up to 3 pages</p>
          </div>
          <p className="text-[11px] text-muted-foreground/70 max-w-xs leading-relaxed">
            Photograph each page of your answer clearly before uploading
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className="space-y-2"
    >
      {/* Page cards */}
      {files.map((f, i) => (
        <div
          key={i}
          className={cn(
            'flex items-center gap-3 p-3.5 rounded-2xl border border-border bg-card transition-opacity',
            disabled && 'opacity-60',
          )}
        >
          {/* Thumbnail */}
          <div className="h-12 w-12 rounded-xl overflow-hidden shrink-0 bg-secondary flex items-center justify-center">
            {previewUrls[i] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrls[i]!} alt={`Page ${i + 1}`} className="h-full w-full object-cover" />
            ) : (
              <FileText className="h-5 w-5 text-red-500" />
            )}
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0"
                style={{ background: 'rgba(124,58,237,0.1)', color: '#7C3AED' }}
              >
                Page {i + 1}
              </span>
              <p className="text-xs font-semibold text-foreground truncate">{f.name}</p>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {formatBytes(f.size)}
              <span className="mx-1">·</span>
              {f.type === 'application/pdf' ? 'PDF' : 'Image'}
            </p>
          </div>
          {/* Remove */}
          {!disabled && (
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="shrink-0 h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ))}

      {/* Add more / max badge */}
      {files.length < MAX_PAGES && !disabled ? (
        <button
          type="button"
          onClick={onPickMore}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border border-dashed border-border hover:border-primary/40 bg-secondary/10 hover:bg-primary/2 transition-all cursor-pointer"
        >
          <div className="h-7 w-7 rounded-lg bg-secondary flex items-center justify-center shrink-0">
            <Plus className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            Add page {files.length + 1}
            <span className="text-muted-foreground/60 font-normal ml-1.5">({MAX_PAGES - files.length} more allowed)</span>
          </span>
        </button>
      ) : files.length === MAX_PAGES ? (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <span className="text-xs font-semibold text-emerald-700">All 3 pages added</span>
        </div>
      ) : null}
    </div>
  );
}

// ── Answer editor ─────────────────────────────────────────────────

function AnswerEditor({ question, onTextSubmit, onPdfSubmit, isSubmittingText, isSubmittingPdf, pdfError, retrySecondsLeft = 0, initialMode = 'type', isAiLimitReached = false }: {
  question: MainsQuestion;
  onTextSubmit: (text: string, secs: number) => void;
  onPdfSubmit: (files: File[], secs: number) => void;
  isSubmittingText: boolean;
  isSubmittingPdf: boolean;
  pdfError?: string | null;
  retrySecondsLeft?: number;
  initialMode?: InputMode;
  isAiLimitReached?: boolean;
}) {
  type PageEntry = { file: File; url: string | null };

  const [mode,      setMode]      = useState<InputMode>(initialMode);
  const [text,      setText]      = useState('');
  const [elapsed,   setElapsed]   = useState(0);
  const [pages,     setPages]     = useState<PageEntry[]>([]);
  const [fileError, setFileError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const startRef     = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Timer — initialise startRef inside the effect to avoid impure render call
  useEffect(() => {
    startRef.current = Date.now();
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const isSubmitting = isSubmittingText || isSubmittingPdf;

  // Derived from pages
  const files       = pages.map((p) => p.file);
  const previewUrls = pages.map((p) => p.url);

  const addFile = useCallback((f: File) => {
    setFileError('');
    if (pages.length >= MAX_PAGES) {
      setFileError(`Maximum ${MAX_PAGES} pages allowed.`);
      return;
    }
    if (!ACCEPTED_TYPES.includes(f.type)) {
      setFileError('Unsupported format. Please upload a PDF, JPG, PNG, or WEBP.');
      return;
    }
    if (f.size > MAX_BYTES) {
      setFileError(`"${f.name}" is too large. Maximum 20 MB per page.`);
      return;
    }
    const url = f.type.startsWith('image/') ? URL.createObjectURL(f) : null;
    setPages((prev) => [...prev, { file: f, url }]);
  }, [pages.length]);

  const removeFile = (index: number) => {
    setPages((prev) => {
      const entry = prev[index];
      if (entry?.url) URL.revokeObjectURL(entry.url);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files ?? []).forEach(addFile);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const overLimit = wordCount > question.word_limit;

  return (
    <div className="space-y-4">

      {/* Question card */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
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

      {/* Mode toggle */}
      <div className="flex gap-1 p-1 rounded-2xl bg-secondary/60 border border-border w-fit">
        {([
          { id: 'type'   as InputMode, label: 'Type Answer',       Icon: PenLine },
          { id: 'upload' as InputMode, label: 'Upload Handwritten', Icon: FileUp  },
        ]).map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => { setMode(id); setFileError(''); }}
            disabled={isSubmitting}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-50',
              mode === id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ── TYPE MODE ── */}
      {mode === 'type' && (
        <div className="space-y-4">
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
              className="min-h-70 text-sm leading-[1.8] resize-none"
              disabled={isSubmitting}
            />
          </div>
          <Button
            onClick={() => onTextSubmit(text, elapsed)}
            disabled={isSubmitting || wordCount < 30 || isAiLimitReached}
            className="w-full cursor-pointer font-semibold text-sm h-11 rounded-xl gap-2"
          >
            {isSubmittingText
              ? <><Loader2 className="h-4 w-4 animate-spin" />Evaluating…</>
              : <><Sparkles className="h-4 w-4" />Submit for AI Evaluation</>}
          </Button>
          {isAiLimitReached && (
            <p className="text-center text-[11px] text-muted-foreground">Daily AI limit reached · Resets at midnight</p>
          )}
        </div>
      )}

      {/* ── UPLOAD MODE ── */}
      {mode === 'upload' && (
        <div className="space-y-4">

          {/* Scanning animation (replaces uploader while processing) */}
          {isSubmittingPdf ? (
            <ScanningAnimation pageCount={files.length || 1} />
          ) : (
            <>
              <MultiFileZone
                files={files}
                previewUrls={previewUrls}
                onPickMore={() => fileInputRef.current?.click()}
                onRemove={removeFile}
                isDragOver={isDragOver}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  Array.from(e.dataTransfer.files).forEach(addFile);
                }}
                disabled={isSubmitting}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                multiple
                className="sr-only"
                onChange={handleInputChange}
              />

              {/* Tips — only when nothing uploaded yet */}
              {files.length === 0 && (
                <div className="rounded-xl bg-amber-500/5 border border-amber-500/15 p-4 space-y-2">
                  <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wide">Tips for best OCR accuracy</p>
                  <ul className="space-y-1.5">
                    {[
                      'Write clearly — block or printed letters read better than cursive',
                      'Use a dark pen on white unlined paper for maximum contrast',
                      'Good lighting matters — avoid shadows, use natural or bright light',
                      'Each page is a separate image; photograph them individually',
                    ].map((tip) => (
                      <li key={tip} className="text-[11px] text-amber-800/70 flex items-start gap-1.5">
                        <span className="mt-0.5 shrink-0">·</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {/* Validation error */}
          {fileError && (
            <div className="flex items-center gap-2 rounded-xl bg-destructive/8 border border-destructive/20 px-4 py-3 text-xs text-destructive font-medium">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {fileError}
            </div>
          )}

          {/* API / scanning failure */}
          {!isSubmittingPdf && pdfError && (
            <div className="rounded-2xl border border-destructive/25 bg-destructive/5 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                <p className="text-sm font-semibold text-destructive">Upload failed</p>
              </div>
              <p className="text-xs text-destructive/80 leading-relaxed pl-6">{pdfError}</p>
              {retrySecondsLeft > 0 ? (
                <div className="pl-6 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Auto-retry available in</span>
                    <span className="font-bold tabular-nums text-destructive">
                      0:{String(retrySecondsLeft).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-destructive/15 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-destructive/50 transition-all duration-1000 ease-linear"
                      style={{ width: `${(retrySecondsLeft / 60) * 100}%` }}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground pl-6">Your pages are still attached — try submitting again.</p>
              )}
            </div>
          )}

          {/* Submit */}
          {!isSubmittingPdf && (
            <>
              <Button
                onClick={() => files.length > 0 && retrySecondsLeft === 0 && !isAiLimitReached && onPdfSubmit(files, elapsed)}
                disabled={isSubmitting || files.length === 0 || retrySecondsLeft > 0 || isAiLimitReached}
                className="w-full cursor-pointer font-semibold text-sm h-11 rounded-xl gap-2"
              >
                {retrySecondsLeft > 0 ? (
                  <>
                    <Timer className="h-4 w-4" />
                    Retry in 0:{String(retrySecondsLeft).padStart(2, '0')}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Submit {files.length > 0 ? `${files.length} page${files.length > 1 ? 's' : ''}` : 'answer'} for AI Evaluation
                  </>
                )}
              </Button>
              {isAiLimitReached && (
                <p className="text-center text-[11px] text-muted-foreground">Daily AI limit reached · Resets at midnight</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Custom question form (Upload My Answer tab) ───────────────────

function CustomQuestionForm({ onStart }: { onStart: (q: MainsQuestion) => void }) {
  const [questionText, setQuestionText] = useState('');
  const [marks,        setMarks]        = useState(15);
  const [wordLimit,    setWordLimit]    = useState(250);

  const handleStart = () => {
    if (!questionText.trim()) return;
    onStart({
      id:            '__custom__',
      question_text: questionText.trim(),
      marks,
      word_limit:    wordLimit,
      topic_tag:     'Custom',
      source:        '',
    });
  };

  return (
    <div className="space-y-5">
      {/* Info header */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/15">
        <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
          <FileUp className="h-4.5 w-4.5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">Upload handwritten answer for any question</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            Works with questions from coaching material, test series, past papers, or anything you write yourself. Upload up to 3 pages.
          </p>
        </div>
      </div>

      {/* Question text */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Your Question <span className="text-destructive">*</span>
        </label>
        <Textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Paste your question here — from test series, coaching notes, newspaper, or previous year papers…"
          rows={4}
          className="resize-none text-sm"
        />
      </div>

      {/* Marks + Word limit */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Marks</label>
          <Input
            type="number"
            value={marks}
            onChange={(e) => setMarks(Math.max(5, Math.min(25, Number(e.target.value))))}
            min={5} max={25} step={5}
            className="text-center font-semibold"
          />
          <p className="text-[10px] text-muted-foreground text-center">5 – 25 marks</p>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Word Limit</label>
          <Input
            type="number"
            value={wordLimit}
            onChange={(e) => setWordLimit(Math.max(100, Math.min(600, Number(e.target.value))))}
            min={100} max={600} step={50}
            className="text-center font-semibold"
          />
          <p className="text-[10px] text-muted-foreground text-center">100 – 600 words</p>
        </div>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={handleStart}
        disabled={!questionText.trim()}
        className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, #7C3AED, #C026D3)',
          boxShadow: questionText.trim() ? '0 4px 20px rgba(124,58,237,0.3)' : 'none',
        }}
      >
        <FileUp className="h-4 w-4" />
        Proceed to Upload
      </button>
    </div>
  );
}

// ── Mains limit modal ─────────────────────────────────────────────

function MainsLimitModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm space-y-5 p-6">

        {/* Icon + close */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)' }}>
            <Lock className="h-5 w-5" style={{ color: '#7C3AED' }} />
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer mt-0.5">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Copy */}
        <div className="space-y-1.5">
          <p className="text-base font-bold text-foreground leading-snug">
            You&apos;ve used your free evaluation
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The free tier includes 1 mains evaluation. Upgrade to Pro for unlimited AI-scored answer evaluations, detailed feedback, and more.
          </p>
        </div>

        {/* Usage indicator */}
        <div className="rounded-xl bg-secondary/60 border border-border p-3 flex items-center gap-3">
          <div className="flex-1">
            <div className="flex justify-between text-xs font-semibold text-foreground mb-1.5">
              <span>Evaluations used</span>
              <span>1 / 1</span>
            </div>
            <div className="h-1.5 rounded-full bg-border overflow-hidden">
              <div className="h-full rounded-full bg-red-500 w-full" />
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-2 pt-1">
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #C026D3)' }}
          >
            <Zap className="h-4 w-4" />
            Upgrade to Pro
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────

export default function MainsPage() {
  const { data: questions, isLoading, isError } = useMainsQuestions();
  const textMutation      = useMainsSubmit();
  const pdfMutation       = useMainsPdfSubmit();
  const customPdfMutation = useMainsCustomPdfSubmit();
  const aiRemaining       = useAiLimitStore((s) => s.remaining);

  const [selected,          setSelected]         = useState<MainsQuestion | null>(null);
  const [isCustomQuestion,  setIsCustomQuestion]  = useState(false);
  const [listingTab,        setListingTab]        = useState<ListingTab>('bank');
  const [retrySecondsLeft,  setRetrySecondsLeft]  = useState(0);
  const [showMainsLimit,    setShowMainsLimit]    = useState(false);

  const isSuccess = textMutation.isSuccess || pdfMutation.isSuccess || customPdfMutation.isSuccess;
  const result    = textMutation.data ?? pdfMutation.data ?? customPdfMutation.data;

  const rawPdfError = pdfMutation.error ?? customPdfMutation.error;
  const pdfError = rawPdfError
    ? ((rawPdfError as { response?: { data?: { message?: string } } }).response?.data?.message ?? (rawPdfError as Error).message ?? 'Something went wrong. Please try again.')
    : null;

  // Countdown tick — decrements via setTimeout (async), not synchronous setState in effect
  useEffect(() => {
    if (retrySecondsLeft <= 0) return;
    const id = setTimeout(() => setRetrySecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [retrySecondsLeft]);

  // Record streak activity after a successful answer submission
  useEffect(() => {
    if (isSuccess) {
      streakService.recordActivity().catch(() => undefined);
    }
  }, [isSuccess]);

  const handleSubmitError = (error: unknown) => {
    const data = (error as { response?: { data?: { code?: string; message?: string } } }).response?.data;
    if (data?.code === 'AI_DAILY_LIMIT_REACHED') return;
    if (data?.code === 'MAINS_LIMIT_REACHED') { setShowMainsLimit(true); return; }
    const msg = data?.message ?? '';
    if (/limit|minute/i.test(msg)) setRetrySecondsLeft(60);
  };

  const handlePdfError = handleSubmitError;

  const handleTextSubmit = (answerText: string, timeTakenSecs: number) => {
    if (!selected) return;
    textMutation.mutate({ questionId: selected.id, answerText, timeTakenSecs }, { onError: handleSubmitError });
  };

  const handlePdfSubmit = (files: File[], timeTakenSecs: number) => {
    if (!selected) return;
    if (isCustomQuestion) {
      customPdfMutation.mutate({
        questionText: selected.question_text,
        files,
        timeTakenSecs,
        marks:     selected.marks,
        wordLimit: selected.word_limit,
      }, { onError: handlePdfError });
    } else {
      pdfMutation.mutate({ questionId: selected.id, files, timeTakenSecs }, { onError: handlePdfError });
    }
  };

  const handleBack = () => {
    textMutation.reset();
    pdfMutation.reset();
    customPdfMutation.reset();
    setSelected(null);
    setIsCustomQuestion(false);
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Answer Writing"
        action={selected && !isSuccess ? (
          <button onClick={handleBack} className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer">
            <ChevronLeft className="h-3.5 w-3.5" />Back
          </button>
        ) : (
          <Link
            href="/mains/analytics"
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Progress
          </Link>
        )}
      />

      <div className="flex-1 p-6 sm:p-8 max-w-3xl w-full mx-auto space-y-5">

        {isSuccess && result && selected ? (
          <ScoreCard result={result} onBack={handleBack} />

        ) : selected ? (
          <>
            <div className="flex justify-end">
              <AiUsageIndicator />
            </div>
            <AnswerEditor
              question={selected}
              onTextSubmit={handleTextSubmit}
              onPdfSubmit={handlePdfSubmit}
              isSubmittingText={textMutation.isPending}
              isSubmittingPdf={pdfMutation.isPending || customPdfMutation.isPending}
              pdfError={pdfError}
              retrySecondsLeft={retrySecondsLeft}
              initialMode={isCustomQuestion ? 'upload' : 'type'}
              isAiLimitReached={aiRemaining === 0}
            />
          </>

        ) : (
          <>
            {/* ── Tab bar ── */}
            <div className="flex gap-1 p-1 rounded-2xl bg-secondary/60 border border-border">
              {([
                { id: 'bank'   as ListingTab, label: 'Question Bank',    Icon: PenLine },
                { id: 'custom' as ListingTab, label: 'Upload My Answer',  Icon: FileUp  },
              ]).map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setListingTab(id)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer',
                    listingTab === id
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* ── Question bank tab ── */}
            {listingTab === 'bank' && (
              <>
                <p className="text-xs text-muted-foreground px-1">
                  Select a question to start timed writing. Use the <strong>Upload My Answer</strong> tab to submit a handwritten answer for your own question.
                </p>

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
                        onClick={() => { setSelected(q); setIsCustomQuestion(false); }}
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

            {/* ── Upload my answer tab ── */}
            {listingTab === 'custom' && (
              <CustomQuestionForm
                onStart={(q) => { setSelected(q); setIsCustomQuestion(true); }}
              />
            )}
          </>
        )}
      </div>

      <MainsLimitModal open={showMainsLimit} onClose={() => setShowMainsLimit(false)} />
    </div>
  );
}
