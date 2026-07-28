import { apiClient } from '@/lib/api/client';
import { Content } from '@/types/content';
import { ApiResponse } from './auth.service';

export const contentService = {
  async create(data: { title: string; raw_text: string }): Promise<Content> {
    const payload = {
      title: data.title,
      sourceType: 'note',
      rawText: data.raw_text,
    };
    const response = await apiClient.post<ApiResponse<Content>>('/contents', payload);
    return response.data.data;
  },

  async getAll(): Promise<Content[]> {
    const response = await apiClient.get<ApiResponse<Content[]>>('/contents');
    return response.data.data;
  },

  async getById(id: string): Promise<Content> {
    const response = await apiClient.get<ApiResponse<Content>>(`/contents/${id}`);
    return response.data.data;
  },
};

export default contentService;
