import { apiClient } from '@/lib/api/client';
import type { MainsQuestion, MainsSubmitResponse, MyMainsAnswer } from '@/types/features';
import type { ApiResponse } from './auth.service';

export const mainsService = {
  async getQuestions(params?: { examType?: string; topicTag?: string }): Promise<MainsQuestion[]> {
    const query = new URLSearchParams();
    if (params?.examType) query.set('examType', params.examType);
    if (params?.topicTag) query.set('topicTag', params.topicTag);
    const response = await apiClient.get<ApiResponse<MainsQuestion[]>>(
      `/mains/questions${query.toString() ? `?${query}` : ''}`
    );
    return response.data.data || [];
  },

  async submitAnswer(questionId: string, answerText: string, timeTakenSecs: number): Promise<MainsSubmitResponse> {
    const response = await apiClient.post<ApiResponse<MainsSubmitResponse>>(
      `/mains/questions/${questionId}/submit`,
      { answerText, timeTakenSecs }
    );
    return response.data.data;
  },

  async getMyAnswers(): Promise<MyMainsAnswer[]> {
    const response = await apiClient.get<ApiResponse<MyMainsAnswer[]>>('/mains/my-answers');
    return response.data.data || [];
  },
};

export default mainsService;
