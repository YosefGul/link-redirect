import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateLink } from '@/lib/api/links';
import { UpdateLinkRequest, ShortLink } from '@/types/link';

export function useUpdateLink(slug: string) {
  const queryClient = useQueryClient();

  return useMutation<ShortLink, Error, UpdateLinkRequest>({
    mutationFn: (data) => updateLink(slug, data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['links'] });
      queryClient.invalidateQueries({ queryKey: ['links', slug] });
      queryClient.invalidateQueries({ queryKey: ['links', slug, 'stats'] });
    },
  });
}

