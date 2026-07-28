'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiService } from '@/services/ai.service';

export function useTopics(contentId: string) {
  const queryClient = useQueryClient();

  const { data: topics, isLoading, isError } = useQuery({
    queryKey: ['topics', contentId],
    queryFn: () => aiService.getTopics(contentId),
    retry: false,
  });

  const { mutate: generate, isPending: isGenerating, isError: isGenerateError, error: generateError } = useMutation({
    mutationFn: () => aiService.generateTopics(contentId),
    onSuccess: (newData) => {
      queryClient.setQueryData(['topics', contentId], newData);
      queryClient.invalidateQueries({ queryKey: ['contents'] });
    },
  });

  return { topics, isLoading, isError, generate, isGenerating, isGenerateError, generateError };
}
