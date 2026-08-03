import { apiClient } from '@/lib/api/client';

export const streakService = {
  recordActivity(): Promise<void> {
    return apiClient.post('/user/streak/activity').then(() => undefined);
  },
};
