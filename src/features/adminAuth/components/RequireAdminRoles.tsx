import { ReactNode } from 'react';
import { SectionMessage } from '../../publicBooking/components/SectionMessage';
import { useAdminMeQuery } from '../hooks/useAdminMeQuery';
import { AdminRole } from '../types/adminAuthTypes';

type RequireAdminRolesProps = {
  allowed: AdminRole[];
  children: ReactNode;
};

export function RequireAdminRoles({ allowed, children }: RequireAdminRolesProps): JSX.Element {
  const meQuery = useAdminMeQuery();

  if (meQuery.isLoading) {
    return <SectionMessage tone="loading" message="Verification des permissions..." />;
  }

  if (meQuery.isError || !meQuery.data) {
    return <SectionMessage tone="error" message="Impossible de verifier les permissions." />;
  }

  if (!allowed.includes(meQuery.data.user.role)) {
    return <SectionMessage tone="error" message="Acces non autorise pour ce role." />;
  }

  return <>{children}</>;
}
