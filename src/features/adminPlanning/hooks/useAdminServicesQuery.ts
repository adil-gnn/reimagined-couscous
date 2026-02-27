import { useQuery } from '@tanstack/react-query';
import { getAdminServices } from '../api/adminPlanningApi';
import { adminPlanningQueryKeys } from './adminPlanningQueryKeys';

export function useAdminServicesQuery(tenantSlug: string) {
  return useQuery({
    queryKey: adminPlanningQueryKeys.services(tenantSlug),
    queryFn: () => getAdminServices(tenantSlug),
    enabled: tenantSlug.length > 0,
  });
}
