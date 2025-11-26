import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteLink } from '@/lib/api/links';

export function useDeleteLink() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteLink,
    onSuccess: () => {
      // Invalidate and refetch links list
      queryClient.invalidateQueries({ queryKey: ['links'] });
    },
  });
}

