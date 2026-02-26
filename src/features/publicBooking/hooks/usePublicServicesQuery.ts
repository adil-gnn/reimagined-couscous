import { useQuery } from '@tanstack/react-query';
import { listPublicServices } from '../api/publicBookingApi';
import { publicBookingQueryKeys } from './publicBookingQueryKeys';

export function usePublicServicesQuery(slug: string) {
  return useQuery({
    queryKey: publicBookingQueryKeys.services(slug),
    queryFn: () => listPublicServices(slug),
    enabled: slug.length > 0,
  });
}
