import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics.service';

export function useWeakZones() {
  return useQuery({
    queryKey: ['weak-zones'],
    queryFn: () => analyticsService.getWeakZones(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
