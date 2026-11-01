import Link from 'next/link';
import { CheckCircle2, ExternalLink, Trash2, RotateCcw } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { SavedNote } from '@/types/features';

const SECTION_LABELS: Record<string, string> = {
  PRELIMS_FACT: 'Prelims Fact',
  KEY_POINT: 'Key Point',
  KEY_TERM: 'Key Term',
  MAINS_ANGLE: 'Mains Angle',
  WAY_FORWARD: 'Way Forward',
};

export function NoteDetailDialog({
  note, open, onOpenChange, onMarkRevised, onRemove, isMarking, isRemoving,
}: {
  note: SavedNote | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkRevised: (id: string) => void;
  onRemove: (id: string) => void;
  isMarking?: boolean;
  isRemoving?: boolean;
}) {
  if (!note) return null;

  // Spaced repetition: a note that's due again should behave like it's never been
  // revised (re-enable the button, drop the checkmark) — "was this ever revised"
  // (revisedAt) is the wrong signal once the note can come due more than once.
  const isRevised = !note.isDue;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Badge variant="outline">
              {SECTION_LABELS[note.sourceSection] ?? note.sourceSection}
            </Badge>
            {note.gsPaperTag && <Badge variant="secondary">{note.gsPaperTag}</Badge>}
            {isRevised && (
              <span className="flex items-center gap-1 font-label text-[10px] uppercase tracking-[0.12em] text-ink">
                <CheckCircle2 className="h-3 w-3" /> Revised
              </span>
            )}
          </div>
          <DialogTitle className="text-base font-semibold leading-snug text-ink">{note.noteText}</DialogTitle>
        </DialogHeader>

        <div className="space-y-1">
          <p className="font-label text-[10.5px] uppercase tracking-[0.14em] text-ink-muted">From article</p>
          <Link
            href={`/current-affairs/${note.articleId}`}
            className="flex items-center gap-1.5 text-sm font-semibold text-ink underline decoration-rule-strong underline-offset-4 hover:decoration-ink"
          >
            {note.articleTitle}
            <ExternalLink className="h-3 w-3 shrink-0" />
          </Link>
          <p className="text-[11px] text-ink-muted">
            Saved {new Date(note.savedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            {note.nextDueAt && (
              <>
                {' · '}
                {note.isDue
                  ? <span className="ks-tag ks-tag-gold">Due for revision</span>
                  : <>Next revision due {new Date(note.nextDueAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</>}
              </>
            )}
          </p>
        </div>

        <DialogFooter className="flex-row gap-2 sm:justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRemove(note.id)}
            disabled={isRemoving}
            className="gap-1.5 text-xs font-semibold cursor-pointer text-[oklch(52%_.16_35)] hover:text-[oklch(52%_.16_35)]"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </Button>
          <Button
            size="sm"
            onClick={() => onMarkRevised(note.id)}
            disabled={isMarking || isRevised}
            className="gap-1.5 text-xs font-semibold cursor-pointer"
          >
            {isRevised
              ? <><CheckCircle2 className="h-3.5 w-3.5" />Revised</>
              : <><RotateCcw className="h-3.5 w-3.5" />Mark as revised</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
