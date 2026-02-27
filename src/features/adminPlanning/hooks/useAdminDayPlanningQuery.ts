import { useQuery } from '@tanstack/react-query';
import { getAdminDayPlanning } from '../api/adminPlanningApi';
import { adminPlanningQueryKeys } from './adminPlanningQueryKeys';

export function useAdminDayPlanningQuery(date: string) {
  return useQuery({
    queryKey: adminPlanningQueryKeys.day(date),
    queryFn: () => getAdminDayPlanning(date),
    enabled: date.length > 0,
  });
}
