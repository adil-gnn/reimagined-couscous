import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAdminStaff } from '../api/adminStaffApi';
import { UpsertAdminStaffRequest } from '../types/adminStaffTypes';
import { adminStaffQueryKeys } from './adminStaffQueryKeys';

type UpdateAdminStaffInput = {
  staffId: string;
  body: UpsertAdminStaffRequest;
};

export function useUpdateAdminStaffMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateAdminStaffInput) => updateAdminStaff(input.staffId, input.body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminStaffQueryKeys.list });
    },
  });
}

