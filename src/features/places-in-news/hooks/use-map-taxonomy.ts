import { useQuery } from '@tanstack/react-query';
import { mapTaxonomyService } from '@/services/map-taxonomy.service';

// Subjects/categories barely change — cached for a long time, same as physical features.
export function useMapSubjects() {
  return useQuery({
    queryKey: ['map-subjects'],
    queryFn: () => mapTaxonomyService.getSubjects(),
    staleTime: 60 * 60 * 1000,
    retry: false,
  });
}

export function useMapCategories(subjectSlug: string) {
  return useQuery({
    queryKey: ['map-subjects', subjectSlug, 'categories'],
    queryFn: () => mapTaxonomyService.getCategories(subjectSlug),
    staleTime: 60 * 60 * 1000,
    retry: false,
    enabled: !!subjectSlug,
  });
}
