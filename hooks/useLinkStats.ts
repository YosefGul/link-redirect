import { useQuery } from '@tanstack/react-query';
import { getLinkStats } from '@/lib/api/links';
import { LinkStats } from '@/types/link';

export function useLinkStats(slug: string) {
  return useQuery<LinkStats>({
    queryKey: ['links', slug, 'stats'],
    queryFn: () => getLinkStats(slug),
    enabled: !!slug,
  });
}

