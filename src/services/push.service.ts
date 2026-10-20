import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from './auth.service';

export const pushService = {
  async getVapidPublicKey(): Promise<string> {
    const response = await apiClient.get<ApiResponse<{ publicKey: string }>>('/push/vapid-public-key');
    return response.data.data.publicKey;
  },

  async subscribe(subscription: PushSubscriptionJSON): Promise<void> {
    await apiClient.post('/push/subscribe', subscription);
  },

  async unsubscribe(endpoint: string): Promise<void> {
    await apiClient.post('/push/unsubscribe', { endpoint });
  },
};

export default pushService;
