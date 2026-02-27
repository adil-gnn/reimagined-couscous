import { useMutation, useQueryClient } from '@tanstack/react-query';
import { archiveAdminService } from '../api/adminServicesApi';
import { adminServicesQueryKeys } from './adminServicesQueryKeys';

export function useArchiveAdminServiceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serviceId: string) => archiveAdminService(serviceId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminServicesQueryKeys.list });
    },
  });
}

