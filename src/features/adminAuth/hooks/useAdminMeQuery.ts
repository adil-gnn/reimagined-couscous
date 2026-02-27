import { useQuery } from '@tanstack/react-query';
import { getAdminMe } from '../api/adminAuthApi';
import { adminAuthQueryKeys } from './adminAuthQueryKeys';

export function useAdminMeQuery() {
  return useQuery({
    queryKey: adminAuthQueryKeys.me,
    queryFn: getAdminMe,
    retry: false,
  });
}
