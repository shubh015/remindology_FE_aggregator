import { useQuery } from '@tanstack/react-query';
import { physicalFeaturesService } from '@/services/physical-features.service';

// Static reference geography — fetched once and cached for a long time (it barely changes).
export function usePhysicalFeatures() {
  return useQuery({
    queryKey: ['physical-features', 'all'],
    queryFn: () => physicalFeaturesService.getAll(),
    staleTime: 60 * 60 * 1000,
    retry: false,
  });
}
