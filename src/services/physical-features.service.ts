import { publicApiClient } from '@/lib/api/public-client';
import type { ApiResponse } from './auth.service';
import type { PhysicalFeature, PhysicalFeatureType } from '@/types/features';

export const physicalFeaturesService = {
  async getAll(type?: PhysicalFeatureType): Promise<PhysicalFeature[]> {
    const query = type ? `?type=${type}` : '';
    const response = await publicApiClient.get<ApiResponse<PhysicalFeature[]>>(`/physical-features${query}`);
    return Array.isArray(response.data.data) ? response.data.data : [];
  },
};

export default physicalFeaturesService;
