import { apiClient } from '@/lib/api/client';
import type { WeakZone } from '@/types/features';
import type { ApiResponse } from './auth.service';

export const analyticsService = {
  async recordAttempt(mcqId: string, selectedAnswer: string, timeTakenMs: number) {
    const response = await apiClient.post<ApiResponse<{
      isCorrect: boolean;
      correctAnswer: string;
      explanation: string;
      wrongOptionExplanations?: Record<string, string>;
    }>>(`/ai-analysis/mcqs/${mcqId}/attempt`, { selectedAnswer, timeTakenMs });
    return response.data.data;
  },

  async getWeakZones(): Promise<WeakZone[]> {
    const response = await apiClient.get<ApiResponse<WeakZone[]>>('/analytics/weak-zones');
    return response.data.data || [];
  },
};

export default analyticsService;
