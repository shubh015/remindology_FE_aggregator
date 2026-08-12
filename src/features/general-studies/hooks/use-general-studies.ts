import { useQuery } from '@tanstack/react-query';
import { generalStudiesService } from '@/services/general-studies.service';

export function useGSSubjects() {
  return useQuery({
    queryKey: ['general-studies', 'subjects'],
    queryFn: () => generalStudiesService.getSubjects(),
    staleTime: 60 * 60 * 1000,
    retry: false,
  });
}

export function useGSCategories(subjectSlug: string) {
  return useQuery({
    queryKey: ['general-studies', 'categories', subjectSlug],
    queryFn: () => generalStudiesService.getCategories(subjectSlug),
    staleTime: 60 * 60 * 1000,
    retry: false,
    enabled: !!subjectSlug,
  });
}

export function useGSCategoryArticles(subjectSlug: string, categorySlug: string) {
  return useQuery({
    queryKey: ['general-studies', 'articles', subjectSlug, categorySlug],
    queryFn: () => generalStudiesService.getArticles(subjectSlug, categorySlug),
    staleTime: 30 * 60 * 1000,
    retry: false,
    enabled: !!subjectSlug && !!categorySlug,
  });
}

// For subjects with no categories — lists articles attached directly to the subject.
export function useGSSubjectArticles(subjectSlug: string, enabled = true) {
  return useQuery({
    queryKey: ['general-studies', 'subject-articles', subjectSlug],
    queryFn: () => generalStudiesService.getArticlesBySubject(subjectSlug),
    staleTime: 30 * 60 * 1000,
    retry: false,
    enabled: !!subjectSlug && enabled,
  });
}

export function useGSArticle(slug: string) {
  return useQuery({
    queryKey: ['general-studies', 'article', slug],
    queryFn: () => generalStudiesService.getArticleBySlug(slug),
    staleTime: 30 * 60 * 1000,
    retry: false,
    enabled: !!slug,
  });
}

export function useGSSearch(q: string) {
  return useQuery({
    queryKey: ['general-studies', 'search', q],
    queryFn: () => generalStudiesService.search(q),
    staleTime: 5 * 60 * 1000,
    retry: false,
    enabled: q.trim().length > 0,
  });
}
