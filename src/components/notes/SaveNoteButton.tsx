'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/use-auth-store';
import { useSavedNotes } from '@/features/revision-trail/hooks/use-saved-notes';
import type { NoteSection } from '@/types/features';

export function SaveNoteButton({
  articleId, articleTitle, noteText, sourceSection, gsPaperTag, className,
}: {
  articleId: string;
  articleTitle: string;
  noteText: string;
  sourceSection: NoteSection;
  gsPaperTag?: string;
  className?: string;
}) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { findSavedId, saveNote, unsaveNote, isSaving, isUnsaving } = useSavedNotes();
  const [justToggled, setJustToggled] = useState(false);

  const savedId = findSavedId(articleId, sourceSection, noteText);
  const isSaved = !!savedId;
  const busy = isSaving || isUnsaving;

  const handleClick = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (busy) return;
    setJustToggled(true);
    if (isSaved && savedId) {
      unsaveNote(savedId);
    } else {
      saveNote({ articleId, articleTitle, noteText, sourceSection, gsPaperTag });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-label={isSaved ? 'Remove from revision trail' : 'Save for revision'}
      title={isSaved ? 'Saved — click to remove' : 'Save for revision'}
      className={cn(
        'shrink-0 flex items-center justify-center h-6 w-6 rounded-md transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
        isSaved ? 'text-primary hover:text-primary/70' : 'text-muted-foreground/50 hover:text-primary',
        className,
      )}
      style={justToggled ? { animation: 'checkPop 0.35s cubic-bezier(0.34,1.56,0.64,1)' } : undefined}
      onAnimationEnd={() => setJustToggled(false)}
    >
      <Bookmark className="h-4 w-4" fill={isSaved ? 'currentColor' : 'none'} />
    </button>
  );
}
