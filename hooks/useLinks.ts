import { useQuery } from '@tanstack/react-query';
import { getLinks } from '@/lib/api/links';
import { ShortLink } from '@/types/link';

export function useLinks() {
  return useQuery<ShortLink[]>({
    queryKey: ['links'],
    queryFn: getLinks,
  });
}

