import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logoutAdmin } from '../api/adminAuthApi';
import { adminAuthQueryKeys } from './adminAuthQueryKeys';

export function useAdminLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutAdmin,
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: adminAuthQueryKeys.me });
      await queryClient.invalidateQueries({ queryKey: adminAuthQueryKeys.me });
    },
  });
}
