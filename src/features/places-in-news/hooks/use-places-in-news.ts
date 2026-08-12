import { useQuery } from '@tanstack/react-query';
import { placesInNewsService } from '@/services/places-in-news.service';

export function usePlacesInNewsList(from: string, to: string) {
  return useQuery({
    queryKey: ['places-in-news', 'list', from, to],
    queryFn: () => placesInNewsService.getList(from, to),
    staleTime: 5 * 60 * 1000,
    retry: false,
    enabled: !!from && !!to,
  });
}

export function usePlacesInNewsMap(from: string, to: string) {
  return useQuery({
    queryKey: ['places-in-news', 'map', from, to],
    queryFn: () => placesInNewsService.getMap(from, to),
    staleTime: 5 * 60 * 1000,
    retry: false,
    enabled: !!from && !!to,
  });
}
