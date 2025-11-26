import { useQuery } from '@tanstack/react-query';
import { getLink } from '@/lib/api/links';
import { ShortLink } from '@/types/link';

export function useLink(slug: string) {
  return useQuery<ShortLink>({
    queryKey: ['links', slug],
    queryFn: () => getLink(slug),
    enabled: !!slug,
  });
}

