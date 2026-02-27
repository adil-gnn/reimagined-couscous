import { useQuery } from '@tanstack/react-query';
import { listAdminServices } from '../api/adminServicesApi';
import { adminServicesQueryKeys } from './adminServicesQueryKeys';

export function useAdminServicesQuery() {
  return useQuery({
    queryKey: adminServicesQueryKeys.list,
    queryFn: listAdminServices,
  });
}

