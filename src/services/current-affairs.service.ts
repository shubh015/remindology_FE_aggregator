import { publicApiClient } from '@/lib/api/public-client';
import { apiClient } from '@/lib/api/client';
import type {
  CurrentAffairsArticle, EnrichedData,
  PrelimsFact, KeyTerm, PracticeQuestion,
} from '@/types/features';

export interface RelatedPYQ {
  id: string;
  content: string;
  source: string;
}
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

function asTypedArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

function normalizeEnrichedData(raw: unknown): EnrichedData | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const r = raw as Record<string, unknown>;
  return {
    whyInNews:               (r.whyInNews            as string | undefined) ?? undefined,
    historicalBackground:    (r.historicalBackground as string | undefined) ?? undefined,
    // Backend has a typo "prelisFacts" — accept both spellings
    prelimsFacts:            asTypedArray<PrelimsFact>(r.prelisFacts ?? r.prelimsFacts),
    keyTerms:                asTypedArray<KeyTerm>(r.keyTerms),
    mainsAngles:             asArray(r.mainsAngles as unknown),
    wayForward:              asArray(r.wayForward  as unknown),
    constitutionalProvisions: asArray(r.constitutionalProvisions as unknown),
    syllabusDetail:          (r.syllabusDetail as string | undefined) ?? undefined,
  };
}

// Backend may send snake_case or camelCase, and may omit array fields.
// Guarantee every field exists so the UI never hits `undefined.map`.
function normalize(raw: Raw | null | undefined): CurrentAffairsArticle {
  const r = raw ?? {};
  return {
    id:                String(r.id ?? ''),
    title:             (r.title as string) ?? '',
    sourceName:        (r.sourceName    ?? r.source_name    ?? '') as string,
    sourceUrl:         (r.sourceUrl     ?? r.source_url     ?? '') as string,
    publishedDate:     (r.publishedDate ?? r.published_date ?? '') as string,
    summary:           (r.summary as string) ?? '',
    keyFacts:          asArray(r.keyFacts     ?? r.key_facts),
    gsPaperTags:       asArray(r.gsPaperTags  ?? r.gs_paper_tags),
    topicTags:         asArray(r.topicTags    ?? r.topic_tags),
    mainsAngle:        (r.mainsAngle    ?? r.mains_angle    ?? '') as string,
    examRelevance:     (r.examRelevance ?? r.exam_relevance ?? {}) as Record<string, boolean>,
    enrichedData:      normalizeEnrichedData(r.enriched_data ?? r.enrichedData),
    practiceQuestions: asTypedArray<PracticeQuestion>(r.practice_questions ?? r.practiceQuestions),
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

  async getRecent(limit = 20, exam?: string): Promise<CurrentAffairsArticle[]> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (exam) params.set('exam', exam);
    const response = await publicApiClient.get<ApiResponse<Raw[]>>(`/current-affairs/recent?${params}`);
    return normalizeList(response.data.data);
  },

  async getByDate(date: string, exam?: string): Promise<CurrentAffairsArticle[]> {
    const params = exam ? `?exam=${exam}` : '';
    const response = await publicApiClient.get<ApiResponse<Raw[]>>(`/current-affairs/date/${date}${params}`);
    return normalizeList(response.data.data);
  },

  async getByMonth(year: number, month: number, exam?: string): Promise<CurrentAffairsArticle[]> {
    const params = exam ? `?exam=${exam}` : '';
    const response = await publicApiClient.get<ApiResponse<Raw[]>>(`/current-affairs/month/${year}/${month}${params}`);
    return normalizeList(response.data.data);
  },

  async getById(id: string, brief = false): Promise<CurrentAffairsArticle> {
    const url = brief ? `/current-affairs/${id}?view=brief` : `/current-affairs/${id}`;
    const response = await publicApiClient.get<ApiResponse<Raw>>(url);
    return normalize(response.data.data);
  },

  async search(q: string, exam?: string, limit = 20): Promise<CurrentAffairsArticle[]> {
    const params = new URLSearchParams({ q, limit: String(limit) });
    if (exam) params.set('exam', exam);
    const response = await publicApiClient.get<{ success: boolean; query: string; count: number; data: Raw[] }>(
      `/current-affairs/search?${params}`,
    );
    return normalizeList(response.data.data);
  },

  // ── Related PYQs (public) ────────────────────────────────────────

  async getRelatedPYQs(id: string): Promise<RelatedPYQ[]> {
    const response = await publicApiClient.get<ApiResponse<RelatedPYQ[]>>(
      `/current-affairs/${id}/related-pyqs`,
    );
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  // ── Admin-only (require auth) ────────────────────────────────────

  async getDrafts(): Promise<CurrentAffairsArticle[]> {
    const response = await apiClient.get<ApiResponse<Raw[]>>('/current-affairs/drafts');
    return normalizeList(response.data.data);
  },

  async publish(input: PublishArticleInput): Promise<CurrentAffairsArticle> {
    const response = await apiClient.post<ApiResponse<Raw>>('/current-affairs/publish', input);
    return normalize(response.data.data);
  },

  async publishDraft(id: string): Promise<CurrentAffairsArticle> {
    const response = await apiClient.patch<ApiResponse<Raw>>(`/current-affairs/${id}/publish`);
    return normalize(response.data.data);
  },

  async deleteById(id: string): Promise<void> {
    await apiClient.delete(`/current-affairs/${id}`);
  },

  // Publishes all drafts whose published_date matches :date
  async publishDay(date: string): Promise<{ published: number; date: string }> {
    const response = await apiClient.patch<ApiResponse<{ published: number; date: string }>>(
      `/current-affairs/publish-day/${date}`,
    );
    return response.data.data;
  },
};

export default currentAffairsService;
