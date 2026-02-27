import { useMutation, useQueryClient } from '@tanstack/react-query';
import { loginAdmin } from '../api/adminAuthApi';
import { AdminLoginRequest } from '../types/adminAuthTypes';
import { adminAuthQueryKeys } from './adminAuthQueryKeys';

export function useAdminLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminLoginRequest) => loginAdmin(payload),
    onSuccess: async (result) => {
      queryClient.setQueryData(adminAuthQueryKeys.me, result);
      await queryClient.invalidateQueries({ queryKey: adminAuthQueryKeys.me });
    },
  });
}
