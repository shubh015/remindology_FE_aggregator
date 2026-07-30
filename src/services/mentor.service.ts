import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from './auth.service';

export interface MentorResponse {
  answer: string;
  relatedTopics?: string[];
  examRelevance?: string;
}

export interface HistoryEntry {
  role: 'user' | 'assistant';
  content: string;
}

export const mentorService = {
  async ask(
    question: string,
    examContext?: string,
    history: HistoryEntry[] = [],
  ): Promise<MentorResponse> {
    const response = await apiClient.post<ApiResponse<MentorResponse>>('/ai/mentor', {
      question,
      examContext: examContext ?? 'UPSC CSE',
      history,
    });
    return response.data.data;
  },
};
