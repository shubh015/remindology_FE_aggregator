'use client';

import { useRevisionNotes } from '@/features/ai-analysis/hooks/use-revision-notes';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Sparkles, Loader2, AlertCircle, Download, Brain } from 'lucide-react';
import type { ContentTabProps } from '@/types/props';
import type { RevisionNote } from '@/types/content';
import { useAiLimitStore } from '@/store/use-ai-limit-store';

// ── PDF export ────────────────────────────────────────────────────────────────

function downloadAsPDF(notes: RevisionNote[], docTitle = 'Revision Notes') {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${docTitle} — Revision Notes</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Albert Sans', 'Segoe UI', Arial, sans-serif; font-size: 13.5px; line-height: 1.85; color: #222222; padding: 52px 64px; max-width: 760px; margin: 0 auto; }
    header { padding-bottom: 20px; margin-bottom: 40px; border-bottom: 1px solid #222222; }
    header h1 { font-size: 22px; font-weight: 600; color: #111111; letter-spacing: -0.3px; }
    header p { font-size: 11.5px; color: #6b6b6b; margin-top: 5px; }
    .note { margin-bottom: 32px; page-break-inside: avoid; }
    .note-title { font-size: 14.5px; font-weight: 600; color: #111111; margin-bottom: 6px; display: flex; align-items: baseline; gap: 8px; }
    .note-num { font-size: 11px; font-weight: 600; color: #6b6b6b; font-family: monospace; min-width: 20px; }
    .note-divider { height: 1px; background: #e3e3e3; margin-bottom: 10px; }
    .note-content { font-size: 13px; color: #333333; line-height: 1.9; white-space: pre-wrap; padding-left: 28px; }
    footer { margin-top: 52px; padding-top: 14px; border-top: 1px solid #e3e3e3; font-size: 10.5px; color: #8a8a8a; display: flex; justify-content: space-between; }
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
  return (
    <div className="relative">
      {/* Branch connector stub pointing toward the spine */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 h-px w-4 bg-rule-strong ${
          side === 'left' ? 'right-[-16px]' : 'left-[-16px]'
        }`}
      />

      {/* Note card */}
      <div className="ks-card is-interactive">

        <div className="p-4">
          {/* Number badge + title */}
          <div className="flex items-start gap-2.5 mb-2.5">
            <span
              className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-ink text-paper font-label text-[10px] font-semibold tabular-nums"
            >
              {index + 1}
            </span>
            <h4 className="text-[13px] font-semibold text-ink leading-snug">
              {note.title}
            </h4>
          </div>

          {/* Content */}
          <p className="text-[13px] text-ink-soft leading-[1.75] whitespace-pre-wrap pl-[30px]">
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
        <Skeleton className="h-10 w-44" />
      </div>
      {/* Two-column skeleton */}
      <div className="grid grid-cols-2 gap-x-10 gap-y-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="ks-card">
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
      <div className="flex min-h-[280px] flex-col items-center justify-center rounded-[2px] border border-dashed border-rule-strong p-8 text-center bg-paper-raised mt-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-[3px] border border-rule bg-paper-deep text-ink mb-4">
          <Brain className="h-5 w-5" />
        </div>
        <h3 className="text-base font-semibold text-ink mb-1.5">No revision notes yet</h3>
        <p className="text-sm text-ink-muted max-w-xs mb-6 leading-relaxed">
          Generate concise, high-yield notes summarising key arguments, frameworks, and exam-relevant points.
        </p>
        {isGenerateError && (
          <div className="mb-4 flex items-start gap-2 rounded-[2px] bg-[oklch(52%_.16_35/.06)] p-3 text-sm text-[oklch(52%_.16_35)] border border-[oklch(52%_.16_35/.25)] max-w-xs text-left">
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
          className="cursor-pointer text-sm font-semibold gap-2 px-5"
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
          <p className="font-label text-[11px] text-ink-muted mt-2">Daily AI limit reached · Resets at midnight</p>
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
          <Brain className="h-4 w-4 text-ink" />
          <span className="text-sm font-semibold text-ink">Mind Map</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer text-sm font-medium gap-2 h-9 px-4"
          onClick={() => downloadAsPDF(notes)}
        >
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>

      {/* Hub node */}
      <div className="flex justify-center">
        <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-[2px] border border-ink bg-paper-raised">
          <BookOpen className="h-4 w-4 text-ink" />
          <span className="text-sm font-semibold text-ink tabular-nums">
            {notes.length} Key Note{notes.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ── Desktop: two-column mind map with a central spine ── */}
      <div className="hidden sm:block">
        <div className="relative">
          {/* Spine */}
          <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-px bg-rule-strong" />

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
          return (
            <div
              key={note.id}
              className="ks-card"
            >
              <div className="p-4">
                <div className="flex items-start gap-2.5 mb-2.5">
                  <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-ink text-paper font-label text-[10px] font-semibold tabular-nums">
                    {idx + 1}
                  </span>
                  <h4 className="text-[13px] font-semibold text-ink leading-snug">{note.title}</h4>
                </div>
                <p className="text-[13px] text-ink-soft leading-[1.75] whitespace-pre-wrap pl-[30px]">{note.content}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RevisionNotesTab;
