import { useQuery } from '@tanstack/react-query';
import { getAdminSlots } from '../api/adminPlanningApi';
import { adminPlanningQueryKeys } from './adminPlanningQueryKeys';

type AdminSlotsQueryInput = {
  tenantSlug: string;
  serviceId: string;
  date: string;
  staffId?: string;
};

export function useAdminSlotsQuery(input: AdminSlotsQueryInput) {
  const isEnabled = input.tenantSlug.length > 0 && input.serviceId.length > 0 && input.date.length > 0;

  return useQuery({
    queryKey: adminPlanningQueryKeys.slots(input.tenantSlug, input.serviceId, input.date, input.staffId),
    queryFn: () =>
      getAdminSlots({
        tenantSlug: input.tenantSlug,
        serviceId: input.serviceId,
        date: input.date,
        staffId: input.staffId,
      }),
    enabled: isEnabled,
  });
}
