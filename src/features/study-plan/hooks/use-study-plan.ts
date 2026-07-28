import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studyPlanService } from '@/services/study-plan.service';

export function useStudyPlan() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['study-plan'],
    queryFn: () => studyPlanService.get(),
    retry: false,
  });

  const {
    mutate: generate,
    isPending: isGenerating,
    isError: isGenerateError,
    error: generateError,
    reset: resetGenerate,
  } = useMutation({
    mutationFn: (examDate?: string) => studyPlanService.generate(examDate),
    onSuccess: (newPlan) => {
      queryClient.setQueryData(['study-plan'], newPlan);
    },
  });

  return {
    plan: data,
    isLoading,
    isError,
    error,
    generate,
    isGenerating,
    isGenerateError,
    generateError,
    resetGenerate,
  };
}
