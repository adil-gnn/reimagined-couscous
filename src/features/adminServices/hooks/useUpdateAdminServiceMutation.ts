import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAdminService } from '../api/adminServicesApi';
import { UpsertAdminServiceRequest } from '../types/adminServicesTypes';
import { adminServicesQueryKeys } from './adminServicesQueryKeys';

type UpdateAdminServiceInput = {
  serviceId: string;
  body: UpsertAdminServiceRequest;
};

export function useUpdateAdminServiceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateAdminServiceInput) => updateAdminService(input.serviceId, input.body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminServicesQueryKeys.list });
    },
  });
}

