import { useQuery } from '@tanstack/react-query';
import { getPublicTenant } from '../api/publicBookingApi';
import { publicBookingQueryKeys } from './publicBookingQueryKeys';

export function usePublicTenantQuery(slug: string) {
  return useQuery({
    queryKey: publicBookingQueryKeys.tenant(slug),
    queryFn: () => getPublicTenant(slug),
    enabled: slug.length > 0,
  });
}
