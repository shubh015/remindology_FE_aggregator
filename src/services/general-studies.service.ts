import { publicApiClient } from '@/lib/api/public-client';
import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from './auth.service';
import type {
  GSSubject, GSCategory, GSArticle, GSCreateArticleInput, GSUpdateArticleInput,
} from '@/types/features';

export const generalStudiesService = {
  async getSubjects(): Promise<GSSubject[]> {
    const response = await publicApiClient.get<ApiResponse<GSSubject[]>>('/general-studies/subjects');
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  async getCategories(subjectSlug: string): Promise<GSCategory[]> {
    const response = await publicApiClient.get<ApiResponse<GSCategory[]>>(
      `/general-studies/subjects/${subjectSlug}/categories`,
    );
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  async getArticles(subjectSlug: string, categorySlug: string): Promise<GSArticle[]> {
    const response = await publicApiClient.get<ApiResponse<GSArticle[]>>(
      `/general-studies/subjects/${subjectSlug}/categories/${categorySlug}/articles`,
    );
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  // For subjects with no categories at all (Ethics, Art & Culture, ...) — articles
  // attach directly to the subject instead of going through a category.
  async getArticlesBySubject(subjectSlug: string): Promise<GSArticle[]> {
    const response = await publicApiClient.get<ApiResponse<GSArticle[]>>(
      `/general-studies/subjects/${subjectSlug}/articles`,
    );
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  async getArticleBySlug(slug: string): Promise<GSArticle> {
    const response = await publicApiClient.get<ApiResponse<GSArticle>>(`/general-studies/articles/${slug}`);
    return response.data.data;
  },

  async search(q: string): Promise<GSArticle[]> {
    const response = await publicApiClient.get<{ success: boolean; query: string; count: number; data: GSArticle[] }>(
      `/general-studies/articles/search?q=${encodeURIComponent(q)}`,
    );
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  // ── Admin-only (require auth) ────────────────────────────────────

  async getDrafts(): Promise<GSArticle[]> {
    const response = await apiClient.get<ApiResponse<GSArticle[]>>('/general-studies/articles/drafts');
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  async createArticle(input: GSCreateArticleInput): Promise<GSArticle> {
    const response = await apiClient.post<ApiResponse<GSArticle>>('/general-studies/articles', input);
    return response.data.data;
  },

  async updateArticle(id: string, input: GSUpdateArticleInput): Promise<GSArticle> {
    const response = await apiClient.patch<ApiResponse<GSArticle>>(`/general-studies/articles/${id}`, input);
    return response.data.data;
  },

  async publishArticle(id: string): Promise<GSArticle> {
    const response = await apiClient.patch<ApiResponse<GSArticle>>(`/general-studies/articles/${id}/publish`);
    return response.data.data;
  },

  async deleteArticle(id: string): Promise<void> {
    await apiClient.delete(`/general-studies/articles/${id}`);
  },

  async createCategory(subjectSlug: string, name: string): Promise<GSCategory> {
    const response = await apiClient.post<ApiResponse<GSCategory>>(
      `/general-studies/subjects/${subjectSlug}/categories`,
      { name },
    );
    return response.data.data;
  },
};

export default generalStudiesService;
