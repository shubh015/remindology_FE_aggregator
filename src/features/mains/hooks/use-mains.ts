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

export function useMainsPdfSubmit() {
  return useMutation({
    mutationFn: ({ questionId, files, timeTakenSecs }: { questionId: string; files: File[]; timeTakenSecs: number }) =>
      mainsService.submitHandwrittenAnswer(questionId, files, timeTakenSecs),
  });
}

export function useMainsCustomPdfSubmit() {
  return useMutation({
    mutationFn: ({ questionText, files, timeTakenSecs, marks, wordLimit }: {
      questionText: string;
      files: File[];
      timeTakenSecs: number;
      marks?: number;
      wordLimit?: number;
    }) => mainsService.submitCustomHandwrittenAnswer(questionText, files, timeTakenSecs, marks, wordLimit),
  });
}

export function useMyMainsAnswers() {
  return useQuery({
    queryKey: ['mains-my-answers'],
    queryFn: () => mainsService.getMyAnswers(),
    retry: false,
  });
}
