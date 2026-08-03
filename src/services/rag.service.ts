import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from './auth.service';

export interface IngestTextInput {
  source: string;
  rawText: string;
  subject?: string;
  reingest?: boolean;
}

export interface IngestResult {
  source: string;
  chunksAdded: number;
  pages: number;
  extractedChars?: number;
}

export interface SourceStatus {
  source: string;
  chunkCount: number;
}

const LONG_TIMEOUT = 180_000; // 3 min — OCR + embedding can take 60+ s

export const ragService = {
  async ingestText(input: IngestTextInput): Promise<IngestResult> {
    const response = await apiClient.post<ApiResponse<IngestResult>>(
      '/knowledge/ingest',
      input,
      { timeout: LONG_TIMEOUT },
    );
    return response.data.data;
  },

  async ingestPdf(
    formData: FormData,
    onUploadProgress: (pct: number) => void,
  ): Promise<IngestResult> {
    const response = await apiClient.post<ApiResponse<IngestResult>>(
      '/knowledge/ingest-pdf',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: LONG_TIMEOUT,
        onUploadProgress: (evt: { loaded: number; total?: number }) => {
          if (evt.total) onUploadProgress(Math.round((evt.loaded / evt.total) * 100));
        },
      },
    );
    return response.data.data;
  },

  async getSourceStatus(source: string): Promise<SourceStatus> {
    const response = await apiClient.get<ApiResponse<SourceStatus>>(
      `/knowledge/${source}/status`,
    );
    return response.data.data;
  },

  async deleteSource(source: string): Promise<void> {
    await apiClient.delete(`/knowledge/${source}`);
  },
};

export default ragService;
