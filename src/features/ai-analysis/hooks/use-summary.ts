'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiService } from '@/services/ai.service';

export function useSummary(contentId: string) {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['summary', contentId],
    queryFn: () => aiService.getSummary(contentId),
    retry: false,
  });

  const { mutate: generate, isPending: isGenerating, isError: isGenerateError, error: generateError } = useMutation({
    mutationFn: () => aiService.generateSummary(contentId),
    onSuccess: (newData) => {
      queryClient.setQueryData(['summary', contentId], newData);
      queryClient.invalidateQueries({ queryKey: ['contents'] });
    },
  });

  return { data, isLoading, isError, generate, isGenerating, isGenerateError, generateError };
}
