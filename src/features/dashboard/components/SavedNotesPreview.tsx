'use client';

import Link from 'next/link';
import { Milestone, ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import { useSavedNotes } from '@/features/revision-trail/hooks/use-saved-notes';

export function SavedNotesPreview() {
  const { notes, isLoading } = useSavedNotes();
  const dueCount = notes.filter((n) => n.isDue).length;
  const preview = notes.slice(0, 3);

  return (
    <div className="rounded-2xl border border-border bg-card flex flex-col">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div>
          <h3 className="text-sm font-bold text-foreground">Revision Trail</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {isLoading ? 'Loading…' : notes.length === 0 ? 'No notes saved yet' : `${dueCount} due for revision`}
          </p>
        </div>
        <Link
          href="/revision-trail"
          className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline shrink-0"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="flex-1 px-5 pb-5 space-y-2">
        {!isLoading && notes.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
            <Milestone className="h-6 w-6 text-muted-foreground/40" />
            <p className="text-xs text-muted-foreground max-w-44">
              Save facts while reading current affairs to build your trail.
            </p>
          </div>
        )}

        {preview.map((note) => (
          <Link
            key={note.id}
            href="/revision-trail"
            className="flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-secondary/50 transition-colors"
          >
            {note.isDue
              ? <Circle className="h-3.5 w-3.5 text-primary/60 shrink-0 mt-0.5" />
              : <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />}
            <span className="text-xs text-foreground leading-snug line-clamp-2">{note.noteText}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
