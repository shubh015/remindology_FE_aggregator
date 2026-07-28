'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiService } from '@/services/ai.service';

export function useMCQs(contentId: string) {
  const queryClient = useQueryClient();

  const { data: mcqs, isLoading, isError } = useQuery({
    queryKey: ['mcqs', contentId],
    queryFn: () => aiService.getMCQs(contentId),
    retry: false,
  });

  const { mutate: generate, isPending: isGenerating, isError: isGenerateError, error: generateError } = useMutation({
    mutationFn: () => aiService.generateMCQs(contentId),
    onSuccess: (newData) => {
      queryClient.setQueryData(['mcqs', contentId], newData);
      queryClient.invalidateQueries({ queryKey: ['contents'] });
    },
  });

  return { mcqs, isLoading, isError, generate, isGenerating, isGenerateError, generateError };
}
