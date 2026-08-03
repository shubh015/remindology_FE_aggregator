import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from './auth.service';

export interface AiUsageData {
  used: number;
  remaining: number;
  limit: number;
  resetsAt: string;
}

export const aiUsageService = {
  async getUsage(): Promise<AiUsageData> {
    const response = await apiClient.get<ApiResponse<AiUsageData>>('/user/ai-usage');
    return response.data.data;
  },
};
