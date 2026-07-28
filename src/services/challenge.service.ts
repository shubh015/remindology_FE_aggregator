import { apiClient } from '@/lib/api/client';
import type { DailyChallenge, ChallengeSubmitResponse } from '@/types/features';
import type { ApiResponse } from './auth.service';

export const challengeService = {
  async getToday(): Promise<DailyChallenge> {
    const response = await apiClient.get<ApiResponse<DailyChallenge>>('/daily-challenge');
    return response.data.data;
  },

  async submit(challengeId: string, answers: Record<string, string>): Promise<ChallengeSubmitResponse> {
    const response = await apiClient.post<ApiResponse<ChallengeSubmitResponse>>(
      '/daily-challenge/submit',
      { challengeId, answers }
    );
    return response.data.data;
  },
};

export default challengeService;
