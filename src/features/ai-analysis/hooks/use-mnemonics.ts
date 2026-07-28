import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiService } from '@/services/ai.service';

export function useMnemonics(contentId: string) {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['mnemonics', contentId],
    queryFn: () => aiService.getMnemonics(contentId),
    retry: false,
  });

  const { mutate: generate, isPending: isGenerating, isError: isGenerateError, error: generateError } = useMutation({
    mutationFn: () => aiService.generateMnemonics(contentId),
    onSuccess: (newData) => {
      queryClient.setQueryData(['mnemonics', contentId], newData);
    },
  });

  return { mnemonics: data, isLoading, isError, generate, isGenerating, isGenerateError, generateError };
}
