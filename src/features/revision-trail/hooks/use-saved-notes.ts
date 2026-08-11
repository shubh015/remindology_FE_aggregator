'use client';

import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { savedNotesService } from '@/services/saved-notes.service';
import type { SaveNoteInput } from '@/services/saved-notes.service';
import type { SavedNote, NoteSection } from '@/types/features';
import { useAuthStore } from '@/store/use-auth-store';

function noteKey(articleId: string, sourceSection: NoteSection, noteText: string): string {
  return `${articleId}::${sourceSection}::${noteText}`;
}

export function useSavedNotes() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['saved-notes'],
    queryFn: () => savedNotesService.list(),
    enabled: isAuthenticated,
    retry: false,
  });

  const notes = data ?? [];

  const notesByKey = useMemo(() => {
    const map = new Map<string, SavedNote>();
    for (const note of notes) {
      map.set(noteKey(note.articleId, note.sourceSection, note.noteText), note);
    }
    return map;
  }, [notes]);

  const findSavedId = (articleId: string, sourceSection: NoteSection, noteText: string): string | undefined =>
    notesByKey.get(noteKey(articleId, sourceSection, noteText))?.id;

  const { mutate: saveNote, isPending: isSaving } = useMutation({
    mutationFn: (input: SaveNoteInput) => savedNotesService.save(input),
    onSuccess: (saved) => {
      queryClient.setQueryData(['saved-notes'], (old: SavedNote[] | undefined) =>
        old ? [saved, ...old] : [saved]);
    },
  });

  const { mutate: unsaveNote, isPending: isUnsaving } = useMutation({
    mutationFn: (id: string) => savedNotesService.unsave(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(['saved-notes'], (old: SavedNote[] | undefined) =>
        old ? old.filter((n) => n.id !== id) : old);
    },
  });

  const { mutate: markRevised, isPending: isMarkingRevised } = useMutation({
    mutationFn: (id: string) => savedNotesService.markRevised(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(['saved-notes'], (old: SavedNote[] | undefined) =>
        old ? old.map((n) => (n.id === updated.id ? updated : n)) : old);
    },
  });

  return {
    notes, isLoading, isError, error,
    findSavedId,
    saveNote, isSaving,
    unsaveNote, isUnsaving,
    markRevised, isMarkingRevised,
  };
}
