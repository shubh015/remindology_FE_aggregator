import { useQuery } from '@tanstack/react-query';
import { currentAffairsService } from '@/services/current-affairs.service';

export function useTodaysCurrentAffairs() {
  return useQuery({
    queryKey: ['current-affairs', 'today'],
    queryFn: () => currentAffairsService.getToday(),
    staleTime: 30 * 60 * 1000,
    retry: false,
  });
}

export function useRecentCurrentAffairs(limit = 20) {
  return useQuery({
    queryKey: ['current-affairs', 'recent', limit],
    queryFn: () => currentAffairsService.getRecent(limit),
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
