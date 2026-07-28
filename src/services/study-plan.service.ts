import { apiClient } from '@/lib/api/client';
import type { StudyPlan, StudyPlanDay } from '@/types/features';
import type { ApiResponse } from './auth.service';

// Backend may use `days` instead of `plan` for the array field — normalise both.
function normalize(raw: Record<string, unknown> | null | undefined): StudyPlan | null {
  if (!raw) return null;
  const days = (raw.plan ?? raw.days ?? []) as StudyPlanDay[];
  return {
    examDate:       (raw.examDate as string)       ?? '',
    daysRemaining:  (raw.daysRemaining as number)  ?? 0,
    examType:       (raw.examType as string)        ?? '',
    weakTopicsCount:(raw.weakTopicsCount as number) ?? 0,
    plan: Array.isArray(days) ? days : [],
  };
}

export const studyPlanService = {
  async generate(examDate?: string): Promise<StudyPlan> {
    const response = await apiClient.post<ApiResponse<Record<string, unknown>>>(
      '/study-plan/generate',
      examDate ? { examDate } : {}
    );
    return normalize(response.data.data) as StudyPlan;
  },

  async get(): Promise<StudyPlan | null> {
    const response = await apiClient.get<ApiResponse<Record<string, unknown> | null>>('/study-plan');
    return normalize(response.data.data);
  },
};

export default studyPlanService;
