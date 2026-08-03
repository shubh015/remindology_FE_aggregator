'use client';

import { useRevisionNotes } from '@/features/ai-analysis/hooks/use-revision-notes';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Sparkles, Loader2, AlertCircle, Download, Brain } from 'lucide-react';
import type { ContentTabProps } from '@/types/props';
import type { RevisionNote } from '@/types/content';
import { useAiLimitStore } from '@/store/use-ai-limit-store';

// ── Accent palette (cycles per note, matches the mind-map screenshot's gradient lines) ──

const ACCENTS = [
  { bar: 'bg-linear-to-r from-amber-400 via-lime-400 to-emerald-500', badge: 'bg-amber-500',  dot: '#f59e0b' },
  { bar: 'bg-linear-to-r from-violet-400 via-purple-500 to-indigo-500', badge: 'bg-violet-500', dot: '#8b5cf6' },
  { bar: 'bg-linear-to-r from-rose-400 via-pink-500 to-fuchsia-500',   badge: 'bg-rose-500',   dot: '#f43f5e' },
  { bar: 'bg-linear-to-r from-sky-400 via-blue-500 to-indigo-500',      badge: 'bg-sky-500',    dot: '#0ea5e9' },
  { bar: 'bg-linear-to-r from-orange-400 via-amber-400 to-yellow-400',  badge: 'bg-orange-500', dot: '#f97316' },
  { bar: 'bg-linear-to-r from-teal-400 via-cyan-400 to-sky-500',        badge: 'bg-teal-500',   dot: '#14b8a6' },
] as const;

// ── PDF export ────────────────────────────────────────────────────────────────

function downloadAsPDF(notes: RevisionNote[], docTitle = 'Revision Notes') {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${docTitle} — Revision Notes</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13.5px; line-height: 1.85; color: #1a1a2e; padding: 52px 64px; max-width: 760px; margin: 0 auto; }
    header { padding-bottom: 20px; margin-bottom: 40px; border-bottom: 2px solid #7c3aed; }
    header h1 { font-size: 22px; font-weight: 700; color: #7c3aed; letter-spacing: -0.3px; }
    header p { font-size: 11.5px; color: #999; margin-top: 5px; }
    .note { margin-bottom: 32px; page-break-inside: avoid; }
    .note-title { font-size: 14.5px; font-weight: 700; color: #1a1a2e; margin-bottom: 6px; display: flex; align-items: baseline; gap: 8px; }
    .note-num { font-size: 11px; font-weight: 700; color: #7c3aed; min-width: 20px; }
    .note-divider { height: 1px; background: #ede8fb; margin-bottom: 10px; }
    .note-content { font-size: 13px; color: #3d3d5c; line-height: 1.9; white-space: pre-wrap; padding-left: 28px; }
    footer { margin-top: 52px; padding-top: 14px; border-top: 1px solid #ede8fb; font-size: 10.5px; color: #bbb; display: flex; justify-content: space-between; }
    @media print { body { padding: 32px 44px; } }
  </style>
</head>
<body>
  <header>
    <h1>${docTitle} — Revision Notes</h1>
    <p>Remindology &nbsp;·&nbsp; ${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })} &nbsp;·&nbsp; ${notes.length} notes</p>
  </header>
  ${notes.map((note, i) => `
  <div class="note">
    <div class="note-title">
      <span class="note-num">${i + 1}.</span>
      ${note.title}
    </div>
    <div class="note-divider"></div>
    <div class="note-content">${note.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
  </div>`).join('')}
  <footer>
    <span>Remindology — AI-Powered UPSC Learning Platform</span>
    <span>${notes.length} revision notes</span>
  </footer>
  <script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (win) win.onafterprint = () => URL.revokeObjectURL(url);
}

// ── Mind map node ─────────────────────────────────────────────────────────────

function MindNode({
  note,
  index,
  side,
}: {
  note: RevisionNote;
  index: number;
  side: 'left' | 'right';
}) {
  const accent = ACCENTS[index % ACCENTS.length];

  return (
    <div className="relative">
      {/* Branch connector stub pointing toward the spine */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 h-[2px] w-4 bg-border ${
          side === 'left' ? 'right-[-16px]' : 'left-[-16px]'
        }`}
      />

      {/* Note card */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200">
        {/* Colored accent bar */}
        <div className={`h-[3px] w-full ${accent.bar}`} />

        <div className="p-4">
          {/* Number badge + title */}
          <div className="flex items-start gap-2.5 mb-2.5">
            <span
              className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full ${accent.badge} text-white text-[10px] font-bold shadow-sm`}
            >
              {index + 1}
            </span>
            <h4 className="text-[13px] font-semibold text-foreground leading-snug">
              {note.title}
            </h4>
          </div>

          {/* Content */}
          <p className="text-xs text-muted-foreground leading-[1.9] whitespace-pre-wrap pl-[30px]">
            {note.content}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function MindMapSkeleton() {
  return (
    <div className="py-4 space-y-6">
      {/* Hub skeleton */}
      <div className="flex justify-center">
        <Skeleton className="h-10 w-44 rounded-2xl" />
      </div>
      {/* Two-column skeleton */}
      <div className="grid grid-cols-2 gap-x-10 gap-y-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-border overflow-hidden">
            <Skeleton className="h-[3px] w-full" />
            <div className="p-4 space-y-2.5">
              <div className="flex items-center gap-2">
                <Skeleton className="h-[22px] w-[22px] rounded-full shrink-0" />
                <Skeleton className="h-3.5 w-3/5" />
              </div>
              <div className="pl-8 space-y-1.5">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function RevisionNotesTab({ contentId }: ContentTabProps) {
  const { notes, isLoading, generate, isGenerating, isGenerateError, generateError } =
    useRevisionNotes(contentId);
  const isAiLimitReached = useAiLimitStore((s) => s.remaining === 0);

  if (isLoading) return <MindMapSkeleton />;

  if (!Array.isArray(notes) || notes.length === 0) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center bg-card mt-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
          <Brain className="h-5 w-5" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1.5">No revision notes yet</h3>
        <p className="text-sm text-muted-foreground max-w-xs mb-6 leading-relaxed">
          Generate concise, high-yield notes summarising key arguments, frameworks, and exam-relevant points.
        </p>
        {isGenerateError && (
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20 max-w-xs text-left">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              {(generateError as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                generateError?.message ||
                'Failed to generate revision notes.'}
            </span>
          </div>
        )}
        <Button
          onClick={() => generate()}
          disabled={isGenerating || isAiLimitReached}
          className="cursor-pointer text-sm font-semibold gap-2 rounded-xl px-5"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating Notes…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Revision Notes
            </>
          )}
        </Button>
        {isAiLimitReached && (
          <p className="text-[11px] text-muted-foreground mt-2">Daily AI limit reached · Resets at midnight</p>
        )}
      </div>
    );
  }

  const leftNotes  = notes.map((n, i) => ({ note: n, i })).filter(({ i }) => i % 2 === 0);
  const rightNotes = notes.map((n, i) => ({ note: n, i })).filter(({ i }) => i % 2 !== 0);

  return (
    <div className="space-y-5 py-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Mind Map</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer text-sm font-medium gap-2 rounded-xl h-9 px-4"
          onClick={() => downloadAsPDF(notes)}
        >
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>

      {/* Hub node */}
      <div className="flex justify-center">
        <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl border border-primary/30 bg-primary/6 shadow-sm shadow-primary/10">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary">
            <BookOpen className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-semibold text-primary">
            {notes.length} Key Note{notes.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ── Desktop: two-column mind map with gradient spine ── */}
      <div className="hidden sm:block">
        <div className="relative">
          {/* Gradient spine */}
          <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-[2px] bg-linear-to-b from-amber-400/70 via-lime-400/70 to-emerald-500/70 rounded-full" />

          <div className="grid grid-cols-2 gap-x-10">
            {/* Left column */}
            <div className="space-y-5 pr-4">
              {leftNotes.map(({ note, i }) => (
                <MindNode key={note.id} note={note} index={i} side="left" />
              ))}
            </div>

            {/* Right column */}
            <div className="space-y-5 pl-4">
              {/* Offset right column so notes interleave visually */}
              {rightNotes.length > 0 && <div className="h-12" />}
              {rightNotes.map(({ note, i }) => (
                <MindNode key={note.id} note={note} index={i} side="right" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile: single column in order ── */}
      <div className="sm:hidden space-y-4">
        {notes.map((note, idx) => {
          const accent = ACCENTS[idx % ACCENTS.length];
          return (
            <div
              key={note.id}
              className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm"
            >
              <div className={`h-[3px] w-full ${accent.bar}`} />
              <div className="p-4">
                <div className="flex items-start gap-2.5 mb-2.5">
                  <span className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full ${accent.badge} text-white text-[10px] font-bold shadow-sm`}>
                    {idx + 1}
                  </span>
                  <h4 className="text-[13px] font-semibold text-foreground leading-snug">{note.title}</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-[1.9] whitespace-pre-wrap pl-[30px]">{note.content}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RevisionNotesTab;
