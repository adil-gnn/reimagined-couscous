import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAdminStaff } from '../api/adminStaffApi';
import { UpsertAdminStaffRequest } from '../types/adminStaffTypes';
import { adminStaffQueryKeys } from './adminStaffQueryKeys';

export function useCreateAdminStaffMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpsertAdminStaffRequest) => createAdminStaff(body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminStaffQueryKeys.list });
    },
  });
}

