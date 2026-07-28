import { useQuery, useMutation } from '@tanstack/react-query';
import { mainsService } from '@/services/mains.service';

export function useMainsQuestions(params?: { examType?: string; topicTag?: string }) {
  return useQuery({
    queryKey: ['mains-questions', params],
    queryFn: () => mainsService.getQuestions(params),
    staleTime: 10 * 60 * 1000,
    retry: false,
  });
}

export function useMainsSubmit() {
  return useMutation({
    mutationFn: ({ questionId, answerText, timeTakenSecs }: { questionId: string; answerText: string; timeTakenSecs: number }) =>
      mainsService.submitAnswer(questionId, answerText, timeTakenSecs),
  });
}

export function useMyMainsAnswers() {
  return useQuery({
    queryKey: ['mains-my-answers'],
    queryFn: () => mainsService.getMyAnswers(),
    retry: false,
  });
}
