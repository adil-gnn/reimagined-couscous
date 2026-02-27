import { useMutation, useQueryClient } from '@tanstack/react-query';
import { archiveAdminStaff } from '../api/adminStaffApi';
import { adminStaffQueryKeys } from './adminStaffQueryKeys';

export function useArchiveAdminStaffMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (staffId: string) => archiveAdminStaff(staffId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminStaffQueryKeys.list });
    },
  });
}

