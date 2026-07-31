import { publicApiClient } from '@/lib/api/public-client';
import { apiClient } from '@/lib/api/client';
import type { CurrentAffairsArticle } from '@/types/features';
import type { ApiResponse } from './auth.service';

export interface PublishArticleInput {
  title: string;
  content: string;
  publishedDate?: string;
  gsPaperTags?: string[];
  topicTags?: string[];
  mainsAngle?: string;
  sourceName?: string;
  sourceUrl?: string;
}

type Raw = Record<string, unknown>;

function asArray(v: unknown): string[] {
  return Array.isArray(v) ? (v as string[]) : [];
}

// Backend may send snake_case or camelCase, and may omit array fields.
// Guarantee every field exists so the UI never hits `undefined.map`.
function normalize(raw: Raw | null | undefined): CurrentAffairsArticle {
  const r = raw ?? {};
  return {
    id:            String(r.id ?? ''),
    title:         (r.title as string) ?? '',
    sourceName:    (r.sourceName    ?? r.source_name    ?? '') as string,
    sourceUrl:     (r.sourceUrl     ?? r.source_url     ?? '') as string,
    publishedDate: (r.publishedDate ?? r.published_date ?? '') as string,
    summary:       (r.summary as string) ?? '',
    keyFacts:      asArray(r.keyFacts     ?? r.key_facts),
    gsPaperTags:   asArray(r.gsPaperTags  ?? r.gs_paper_tags),
    topicTags:     asArray(r.topicTags    ?? r.topic_tags),
    mainsAngle:    (r.mainsAngle    ?? r.mains_angle    ?? '') as string,
    examRelevance: (r.examRelevance ?? r.exam_relevance ?? {}) as Record<string, boolean>,
  };
}

function normalizeList(raw: unknown): CurrentAffairsArticle[] {
  return Array.isArray(raw) ? raw.map((a) => normalize(a as Raw)) : [];
}

export const currentAffairsService = {
  async getToday(): Promise<CurrentAffairsArticle[]> {
    const response = await publicApiClient.get<ApiResponse<Raw[]>>('/current-affairs/today');
    return normalizeList(response.data.data);
  },

  async getRecent(limit = 20): Promise<CurrentAffairsArticle[]> {
    const response = await publicApiClient.get<ApiResponse<Raw[]>>(`/current-affairs/recent?limit=${limit}`);
    return normalizeList(response.data.data);
  },

  async getByDate(date: string): Promise<CurrentAffairsArticle[]> {
    const response = await publicApiClient.get<ApiResponse<Raw[]>>(`/current-affairs/date/${date}`);
    return normalizeList(response.data.data);
  },

  async getByMonth(year: number, month: number): Promise<CurrentAffairsArticle[]> {
    const response = await publicApiClient.get<ApiResponse<Raw[]>>(`/current-affairs/month/${year}/${month}`);
    return normalizeList(response.data.data);
  },

  async getById(id: string): Promise<CurrentAffairsArticle> {
    const response = await publicApiClient.get<ApiResponse<Raw>>(`/current-affairs/${id}`);
    return normalize(response.data.data);
  },

  // ── Admin-only (require auth) ────────────────────────────────────

  async publish(input: PublishArticleInput): Promise<CurrentAffairsArticle> {
    const response = await apiClient.post<ApiResponse<Raw>>('/current-affairs/publish', input);
    return normalize(response.data.data);
  },

  async deleteById(id: string): Promise<void> {
    await apiClient.delete(`/current-affairs/${id}`);
  },
};

export default currentAffairsService;
