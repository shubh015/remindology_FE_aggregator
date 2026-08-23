import { useQuery } from '@tanstack/react-query';
import { courseService } from '@/services/course.service';

export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: () => courseService.getCourses(),
    staleTime: 30 * 60 * 1000,
    retry: false,
  });
}

export function useCourse(slug: string) {
  return useQuery({
    queryKey: ['courses', slug],
    queryFn: () => courseService.getCourseBySlug(slug),
    staleTime: 10 * 60 * 1000,
    retry: false,
    enabled: !!slug,
  });
}
