import { publicApiClient } from '@/lib/api/public-client';
import type { ApiResponse } from './auth.service';
import type { MapSubject, MapCategory } from '@/types/features';

export const mapTaxonomyService = {
  async getSubjects(): Promise<MapSubject[]> {
    const response = await publicApiClient.get<ApiResponse<MapSubject[]>>('/map-subjects');
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  async getCategories(subjectSlug: string): Promise<MapCategory[]> {
    const response = await publicApiClient.get<ApiResponse<MapCategory[]>>(
      `/map-subjects/${subjectSlug}/categories`,
    );
    return Array.isArray(response.data.data) ? response.data.data : [];
  },
};

export default mapTaxonomyService;
