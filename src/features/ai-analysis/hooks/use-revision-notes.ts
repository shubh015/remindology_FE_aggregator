'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiService } from '@/services/ai.service';

export function useRevisionNotes(contentId: string) {
  const queryClient = useQueryClient();

  const { data: notes, isLoading, isError } = useQuery({
    queryKey: ['revision-notes', contentId],
    queryFn: () => aiService.getRevisionNotes(contentId),
    retry: false,
  });

  const { mutate: generate, isPending: isGenerating, isError: isGenerateError, error: generateError } = useMutation({
    mutationFn: () => aiService.generateRevisionNotes(contentId),
    onSuccess: (newData) => {
      queryClient.setQueryData(['revision-notes', contentId], newData);
      queryClient.invalidateQueries({ queryKey: ['contents'] });
    },
  });

  return { notes, isLoading, isError, generate, isGenerating, isGenerateError, generateError };
}
