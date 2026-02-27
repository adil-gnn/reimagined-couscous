import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAdminService } from '../api/adminServicesApi';
import { UpsertAdminServiceRequest } from '../types/adminServicesTypes';
import { adminServicesQueryKeys } from './adminServicesQueryKeys';

export function useCreateAdminServiceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpsertAdminServiceRequest) => createAdminService(body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminServicesQueryKeys.list });
    },
  });
}

