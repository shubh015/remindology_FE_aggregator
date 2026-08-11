'use client';

import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Skeleton } from '@/components/ui/skeleton';
import { NotesTrail } from '@/features/revision-trail/components/NotesTrail';
import { useSavedNotes } from '@/features/revision-trail/hooks/use-saved-notes';
import { Milestone, Newspaper } from 'lucide-react';

export default function RevisionTrailPage() {
  const { notes, isLoading } = useSavedNotes();
  const revisedCount = notes.filter((n) => !!n.revisedAt).length;

  return (
    <div className="flex-1 flex flex-col">
      <Header title="Revision Trail" />

      <div className="flex-1 p-6 sm:p-8 max-w-2xl w-full mx-auto space-y-6">
        {!isLoading && notes.length > 0 && (
          <div
            className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center justify-between"
            style={{ animation: 'slideUp 0.3s cubic-bezier(0.22,1,0.36,1) both' }}
          >
            <div className="flex items-center gap-2">
              <Milestone className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-bold text-foreground">Your Revision Trail</p>
                <p className="text-xs text-muted-foreground">{revisedCount}/{notes.length} revised</p>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center gap-4 py-10">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        ) : notes.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center gap-4 py-16 text-center"
            style={{ animation: 'slideUp 0.4s cubic-bezier(0.22,1,0.36,1) both' }}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Milestone className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Your trail is empty</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              Save facts while reading current affairs — tap the bookmark icon next to any
              key point, prelims fact, or mains angle. They'll show up here for revision.
            </p>
            <Link
              href="/current-affairs"
              className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              <Newspaper className="h-4 w-4" />
              Browse Current Affairs
            </Link>
          </div>
        ) : (
          <NotesTrail notes={notes} />
        )}
      </div>
    </div>
  );
}
