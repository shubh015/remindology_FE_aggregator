'use client';

import { useQuery } from '@tanstack/react-query';
import { contentService } from '@/services/content.service';

export function useContents() {
  return useQuery({
    queryKey: ['contents'],
    queryFn: () => contentService.getAll(),
  });
}
