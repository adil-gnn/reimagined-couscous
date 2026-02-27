import { useQuery } from '@tanstack/react-query';
import { listAdminStaff } from '../api/adminStaffApi';
import { adminStaffQueryKeys } from './adminStaffQueryKeys';

export function useAdminStaffQuery() {
  return useQuery({
    queryKey: adminStaffQueryKeys.list,
    queryFn: listAdminStaff,
  });
}

