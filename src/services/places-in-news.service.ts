import { publicApiClient } from '@/lib/api/public-client';
import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from './auth.service';
import type {
  PlaceInNews, PlaceInNewsCreateInput, PlaceInNewsUpdateInput, PlaceInNewsMapPoint,
} from '@/types/features';

export const placesInNewsService = {
  // ── Reads — public, no auth needed ──────────────────────────────
  async getList(from: string, to: string): Promise<PlaceInNews[]> {
    const response = await publicApiClient.get<ApiResponse<PlaceInNews[]>>(
      `/places-in-news?from=${from}&to=${to}`,
    );
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  async getMap(from: string, to: string): Promise<PlaceInNewsMapPoint[]> {
    const response = await publicApiClient.get<ApiResponse<PlaceInNewsMapPoint[]>>(
      `/places-in-news/map?from=${from}&to=${to}`,
    );
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  // ── Writes — admin-only ──────────────────────────────────────────
  async create(input: PlaceInNewsCreateInput): Promise<PlaceInNews> {
    const response = await apiClient.post<ApiResponse<PlaceInNews>>('/places-in-news', input);
    return response.data.data;
  },

  async update(id: string, input: PlaceInNewsUpdateInput): Promise<PlaceInNews> {
    const response = await apiClient.patch<ApiResponse<PlaceInNews>>(`/places-in-news/${id}`, input);
    return response.data.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/places-in-news/${id}`);
  },
};

export default placesInNewsService;
