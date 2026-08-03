import { apiClient } from '@/lib/api/client';
import type { MainsQuestion, MainsSubmitResponse, MainsEvaluation, MyMainsAnswer, MainsAnalytics } from '@/types/features';
import type { ApiResponse } from './auth.service';

// Shape returned by POST /mains/submit-pdf (custom question, no questionId)
interface CustomPdfResponse {
  extractedText: string;
  wordCount: number;
  timeTakenSecs: number;
  evaluation: MainsEvaluation;
}

export const mainsService = {
  async getQuestions(params?: { examType?: string; topicTag?: string }): Promise<MainsQuestion[]> {
    const query = new URLSearchParams();
    if (params?.examType) query.set('examType', params.examType);
    if (params?.topicTag) query.set('topicTag', params.topicTag);
    const response = await apiClient.get<ApiResponse<MainsQuestion[]>>(
      `/mains/questions${query.toString() ? `?${query}` : ''}`
    );
    return response.data.data || [];
  },

  async submitAnswer(questionId: string, answerText: string, timeTakenSecs: number): Promise<MainsSubmitResponse> {
    const response = await apiClient.post<ApiResponse<MainsSubmitResponse>>(
      `/mains/questions/${questionId}/submit`,
      { answerText, timeTakenSecs }
    );
    return response.data.data;
  },

  async submitCustomHandwrittenAnswer(
    questionText: string,
    files: File[],
    timeTakenSecs: number,
    marks?: number,
    wordLimit?: number,
  ): Promise<MainsSubmitResponse> {
    const formData = new FormData();
    files.forEach((f) => formData.append('file', f));
    formData.append('questionText', questionText);
    formData.append('timeTakenSecs', String(timeTakenSecs));
    if (marks)     formData.append('marks',     String(marks));
    if (wordLimit) formData.append('wordLimit',  String(wordLimit));
    const response = await apiClient.post<ApiResponse<CustomPdfResponse>>(
      '/mains/submit-pdf',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    const d = response.data.data;
    // Normalize to MainsSubmitResponse — backend returns score inside evaluation.totalScore
    return {
      score:        d.evaluation.totalScore,
      outOf:        marks ?? 15,
      wordCount:    d.wordCount,
      evaluation:   { ...d.evaluation, missingKeywords: d.evaluation.missingKeywords ?? [] },
      extractedText: d.extractedText,
    };
  },

  async submitHandwrittenAnswer(questionId: string, files: File[], timeTakenSecs: number): Promise<MainsSubmitResponse> {
    const formData = new FormData();
    files.forEach((f) => formData.append('file', f));
    formData.append('timeTakenSecs', String(timeTakenSecs));
    const response = await apiClient.post<ApiResponse<MainsSubmitResponse>>(
      `/mains/questions/${questionId}/submit-pdf`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data.data;
  },

  async getMyAnswers(limit = 20, offset = 0): Promise<MyMainsAnswer[]> {
    const response = await apiClient.get<ApiResponse<MyMainsAnswer[]>>(
      `/mains/my-answers?limit=${limit}&offset=${offset}`,
    );
    return response.data.data || [];
  },

  async getAnalytics(): Promise<MainsAnalytics> {
    const response = await apiClient.get<ApiResponse<MainsAnalytics>>('/mains/analytics');
    return response.data.data;
  },
};

export default mainsService;
