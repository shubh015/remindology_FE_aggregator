import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { challengeService } from '@/services/challenge.service';
import type { ChallengeSubmitResponse } from '@/types/features';

export function useDailyChallenge() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['daily-challenge'],
    queryFn: () => challengeService.getToday(),
    retry: false,
  });

  const {
    mutate: submit,
    isPending: isSubmitting,
    data: result,
    isError: isSubmitError,
    error: submitError,
    isSuccess: isSubmitted,
  } = useMutation({
    mutationFn: ({ challengeId, answers }: { challengeId: string; answers: Record<string, string> }) =>
      challengeService.submit(challengeId, answers),
    onSuccess: (res: ChallengeSubmitResponse) => {
      queryClient.setQueryData(['daily-challenge'], (old: any) =>
        old ? { ...old, alreadyCompleted: true, score: res.score } : old
      );
    },
  });

  return { challenge: data, isLoading, isError, error, submit, isSubmitting, result, isSubmitError, submitError, isSubmitted };
}
