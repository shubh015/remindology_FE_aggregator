'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buildTrailLayout } from '../utils/trail-layout';
import { NoteDetailDialog } from './NoteDetailDialog';
import { useSavedNotes } from '../hooks/use-saved-notes';
import type { SavedNote } from '@/types/features';

const CANVAS_WIDTH = 320;

export function NotesTrail({ notes }: { notes: SavedNote[] }) {
  const { markRevised, unsaveNote, isMarkingRevised, isUnsaving } = useSavedNotes();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const layout = useMemo(
    () => buildTrailLayout(notes.map((n) => n.id), CANVAS_WIDTH),
    [notes],
  );

  const selectedNote = notes.find((n) => n.id === selectedId) ?? null;

  return (
    <div className="flex justify-center">
      <div className="relative" style={{ width: layout.width, minHeight: layout.height }}>
        <svg
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          width={layout.width}
          height={layout.height}
          className="absolute inset-0 overflow-visible"
        >
          <path
            d={layout.pathD}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={2.5}
            strokeDasharray="6 6"
            strokeLinecap="round"
          />
        </svg>

        {layout.positions.map((pos, i) => {
          const note = notes[i];
          if (!note) return null;
          // Spaced repetition: pins should pulse again once they come back due,
          // not stay a static checkmark forever after the first revision.
          const isRevised = !note.isDue;

          return (
            <button
              key={pos.id}
              type="button"
              onClick={() => setSelectedId(note.id)}
              className="absolute flex flex-col items-center gap-1.5 cursor-pointer group"
              style={{ left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)' }}
            >
              <span className="relative flex items-center justify-center">
                {!isRevised && (
                  <span
                    className="absolute h-9 w-9 rounded-full bg-primary/40"
                    style={{ animation: 'pulseRing 2.2s ease-out infinite' }}
                  />
                )}
                <span
                  className={cn(
                    'relative flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold shadow-sm transition-transform group-hover:scale-110',
                    isRevised
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-600'
                      : 'bg-primary text-primary-foreground border-primary',
                  )}
                >
                  {isRevised ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </span>
              </span>
              <span className="max-w-24 truncate text-[11px] font-medium text-muted-foreground text-center">
                {note.noteText}
              </span>
            </button>
          );
        })}
      </div>

      <NoteDetailDialog
        note={selectedNote}
        open={!!selectedId}
        onOpenChange={(open) => !open && setSelectedId(null)}
        onMarkRevised={(id) => markRevised(id)}
        onRemove={(id) => { unsaveNote(id); setSelectedId(null); }}
        isMarking={isMarkingRevised}
        isRemoving={isUnsaving}
      />
    </div>
  );
}
