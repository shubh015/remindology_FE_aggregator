'use client';

import Link from 'next/link';
import { Milestone, ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import { useSavedNotes } from '@/features/revision-trail/hooks/use-saved-notes';

export function SavedNotesPreview() {
  const { notes, isLoading } = useSavedNotes();
  const dueCount = notes.filter((n) => n.isDue).length;
  const preview = notes.slice(0, 3);

  return (
    <div className="ks-card flex flex-col">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-ink">Revision Trail</h3>
          <p className="font-label text-[10px] uppercase tracking-[0.12em] text-ink-muted mt-0.5">
            {isLoading ? 'Loading…' : notes.length === 0 ? 'No notes saved yet' : `${dueCount} due for revision`}
          </p>
        </div>
        <Link
          href="/revision-trail"
          className="flex items-center gap-1 font-label text-[11px] text-ink underline decoration-rule-strong underline-offset-4 hover:decoration-ink shrink-0"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="flex-1 px-5 pb-5 space-y-2">
        {!isLoading && notes.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
            <Milestone className="h-6 w-6 text-ink-faint" />
            <p className="text-xs text-ink-muted max-w-44">
              Save facts while reading current affairs to build your trail.
            </p>
          </div>
        )}

        {preview.map((note) => (
          <Link
            key={note.id}
            href="/revision-trail"
            className="flex items-start gap-2 rounded-[2px] px-2 py-1.5 hover:bg-paper-deep transition-colors"
          >
            {note.isDue
              ? <Circle className="h-3.5 w-3.5 text-gold-deep shrink-0 mt-0.5" />
              : <CheckCircle2 className="h-3.5 w-3.5 text-ink shrink-0 mt-0.5" />}
            <span className="text-xs text-ink-soft leading-snug line-clamp-2">{note.noteText}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
