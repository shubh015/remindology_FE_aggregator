import type { Content } from '@/types/content';

// ── Subject detection ────────────────────────────────────────────────────────

export type SubjectKey =
  | 'GS1' | 'GS2' | 'GS3' | 'GS4'
  | 'Current Affairs' | 'Essay' | 'CSAT' | 'General';

export interface SubjectMeta {
  label: string;
  color: string;       // Tailwind bg class
  textColor: string;   // Tailwind text class
  pattern: RegExp;
}

export const SUBJECT_META: Record<SubjectKey, SubjectMeta> = {
  GS1:             { label: 'GS Paper I',       color: 'bg-violet-500',  textColor: 'text-violet-600',  pattern: /gs[\s-]?1\b|gs[\s-]?paper[\s-]?1|history|geography|society|culture|art\b/i },
  GS2:             { label: 'GS Paper II',      color: 'bg-blue-500',    textColor: 'text-blue-600',    pattern: /gs[\s-]?2\b|gs[\s-]?paper[\s-]?2|polity|governance|constitution|\bir\b|international/i },
  GS3:             { label: 'GS Paper III',     color: 'bg-emerald-500', textColor: 'text-emerald-600', pattern: /gs[\s-]?3\b|gs[\s-]?paper[\s-]?3|econom|environment|science|technology/i },
  GS4:             { label: 'GS Paper IV',      color: 'bg-amber-500',   textColor: 'text-amber-600',   pattern: /gs[\s-]?4\b|gs[\s-]?paper[\s-]?4|ethics|integrity|aptitude/i },
  'Current Affairs': { label: 'Current Affairs', color: 'bg-rose-500',   textColor: 'text-rose-600',    pattern: /current affairs|editorial|daily|weekly\s+wrap|news/i },
  Essay:           { label: 'Essay',            color: 'bg-indigo-500',  textColor: 'text-indigo-600',  pattern: /essay/i },
  CSAT:            { label: 'CSAT',             color: 'bg-teal-500',    textColor: 'text-teal-600',    pattern: /csat|comprehension/i },
  General:         { label: 'General',          color: 'bg-slate-400',   textColor: 'text-slate-500',   pattern: /$^/ },
};

export const SUBJECT_ORDER: SubjectKey[] = [
  'GS1', 'GS2', 'GS3', 'GS4', 'Current Affairs', 'Essay', 'CSAT', 'General',
];

export function detectSubject(title: string): SubjectKey {
  for (const key of SUBJECT_ORDER) {
    if (key === 'General') continue;
    if (SUBJECT_META[key].pattern.test(title)) return key;
  }
  return 'General';
}

// ── Stats computation ────────────────────────────────────────────────────────

export interface ContentStats {
  total: number;
  completed: number;
  processing: number;
  failed: number;
  completionRate: number;
  recentCount: number;           // uploads in last 7 days
  subjectCounts: Record<SubjectKey, number>;
}

export function computeContentStats(contents: Content[]): ContentStats {
  const total = contents.length;
  const completed  = contents.filter((c) => c.status === 'COMPLETED').length;
  const processing = contents.filter((c) => c.status === 'PROCESSING' || c.status === 'PENDING').length;
  const failed     = contents.filter((c) => c.status === 'FAILED').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentCount = contents.filter((c) => new Date(c.created_at) >= since).length;

  const subjectCounts = Object.fromEntries(
    SUBJECT_ORDER.map((k) => [k, 0])
  ) as Record<SubjectKey, number>;

  for (const c of contents) {
    subjectCounts[detectSubject(c.title)]++;
  }

  return { total, completed, processing, failed, completionRate, recentCount, subjectCounts };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Returns subjects that have at least one material, sorted by count desc. */
export function activeSubjects(
  subjectCounts: Record<SubjectKey, number>
): Array<{ key: SubjectKey; count: number; meta: SubjectMeta }> {
  return SUBJECT_ORDER
    .filter((k) => subjectCounts[k] > 0)
    .map((k) => ({ key: k, count: subjectCounts[k], meta: SUBJECT_META[k] }))
    .sort((a, b) => b.count - a.count);
}
