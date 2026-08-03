import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { currentAffairsService } from '@/services/current-affairs.service';
import type { CurrentAffairsArticle } from '@/types/features';

export function useTodaysCurrentAffairs() {
  return useQuery({
    queryKey: ['current-affairs', 'today'],
    queryFn: () => currentAffairsService.getToday(),
    staleTime: 30 * 60 * 1000,
    retry: false,
  });
}

export function useRecentCurrentAffairs(limit = 30, exam?: string) {
  return useQuery({
    queryKey: ['current-affairs', 'recent', limit, exam ?? null],
    queryFn: () => currentAffairsService.getRecent(limit, exam),
    staleTime: 10 * 60 * 1000,
    retry: false,
  });
}

export function useCurrentAffairsByDate(date: string) {
  return useQuery({
    queryKey: ['current-affairs', 'date', date],
    queryFn: () => currentAffairsService.getByDate(date),
    staleTime: 60 * 60 * 1000,
    retry: false,
  });
}

export function useCurrentAffairsByMonth(year: number, month: number, exam?: string) {
  return useQuery({
    queryKey: ['current-affairs', 'month', year, month, exam ?? null],
    queryFn: () => currentAffairsService.getByMonth(year, month, exam),
    staleTime: 60 * 60 * 1000,
    retry: false,
  });
}

export function useCurrentAffairsSearch(query: string, exam?: string) {
  return useQuery({
    queryKey: ['current-affairs', 'search', query, exam ?? null],
    queryFn: () => currentAffairsService.search(query, exam),
    enabled: query.length >= 2,
    staleTime: 60_000,
    retry: false,
  });
}

// Client-side filter helper
export function useFilteredArticles(
  articles: CurrentAffairsArticle[] | undefined,
  paper: string,
  subject: string,
) {
  return useMemo(() => {
    if (!articles) return [];
    return articles.filter((a) => {
      const paperMatch  = !paper  || a.gsPaperTags.includes(paper);
      const subjectMatch = !subject || a.topicTags.some((t) => t.toLowerCase().includes(subject.toLowerCase()));
      return paperMatch && subjectMatch;
    });
  }, [articles, paper, subject]);
}
