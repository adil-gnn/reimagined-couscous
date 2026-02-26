import { useQuery } from '@tanstack/react-query';
import { getPublicSlots } from '../api/publicBookingApi';
import { publicBookingQueryKeys } from './publicBookingQueryKeys';

type PublicSlotsQueryInput = {
  slug: string;
  serviceId: string;
  date: string;
  staffId?: string;
};

export function usePublicSlotsQuery(input: PublicSlotsQueryInput) {
  const isEnabled = input.slug.length > 0 && input.serviceId.length > 0 && input.date.length > 0;

  return useQuery({
    queryKey: publicBookingQueryKeys.slots(input.slug, input.serviceId, input.date, input.staffId),
    queryFn: () =>
      getPublicSlots({
        slug: input.slug,
        service_id: input.serviceId,
        date: input.date,
        staff_id: input.staffId,
      }),
    enabled: isEnabled,
  });
}
