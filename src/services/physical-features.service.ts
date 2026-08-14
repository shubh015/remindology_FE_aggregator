import { publicApiClient } from '@/lib/api/public-client';
import type { ApiResponse } from './auth.service';
import type { PhysicalFeature } from '@/types/features';

export const physicalFeaturesService = {
  async getAll(filters?: { category?: string; subject?: string }): Promise<PhysicalFeature[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.set('category', filters.category);
    if (filters?.subject) params.set('subject', filters.subject);
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await publicApiClient.get<ApiResponse<PhysicalFeature[]>>(`/physical-features${query}`);
    return Array.isArray(response.data.data) ? response.data.data : [];
  },
};

export default physicalFeaturesService;
