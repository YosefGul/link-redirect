import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createLink } from '@/lib/api/links';
import { CreateLinkRequest, ShortLink } from '@/types/link';

export function useCreateLink() {
  const queryClient = useQueryClient();

  return useMutation<ShortLink, Error, CreateLinkRequest>({
    mutationFn: createLink,
    onSuccess: () => {
      // Invalidate and refetch links list
      queryClient.invalidateQueries({ queryKey: ['links'] });
    },
  });
}

