import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from './auth.service';
import type { SavedNote, NoteSection } from '@/types/features';

export interface SaveNoteInput {
  articleId: string;
  articleTitle: string;
  noteText: string;
  sourceSection: NoteSection;
  gsPaperTag?: string;
}

export const savedNotesService = {
  async list(): Promise<SavedNote[]> {
    const response = await apiClient.get<ApiResponse<SavedNote[]>>('/saved-notes');
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  async save(input: SaveNoteInput): Promise<SavedNote> {
    const response = await apiClient.post<ApiResponse<SavedNote>>('/saved-notes', input);
    return response.data.data;
  },

  async unsave(id: string): Promise<void> {
    await apiClient.delete(`/saved-notes/${id}`);
  },

  async markRevised(id: string): Promise<SavedNote> {
    const response = await apiClient.patch<ApiResponse<SavedNote>>(`/saved-notes/${id}/revise`);
    return response.data.data;
  },
};

export default savedNotesService;
