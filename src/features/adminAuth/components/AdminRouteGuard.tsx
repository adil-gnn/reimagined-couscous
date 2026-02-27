import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ApiClientError } from '../../../shared/api/apiClient';
import { SectionMessage } from '../../publicBooking/components/SectionMessage';
import { useAdminMeQuery } from '../hooks/useAdminMeQuery';

export function AdminRouteGuard(): JSX.Element {
  const location = useLocation();
  const meQuery = useAdminMeQuery();

  if (meQuery.isLoading) {
    return <SectionMessage tone="loading" message="Verification de session admin..." />;
  }

  if (meQuery.isError) {
    if (meQuery.error instanceof ApiClientError && meQuery.error.status === 401) {
      return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
    }

    return <SectionMessage tone="error" message="Erreur de session admin." />;
  }

  return <Outlet />;
}
