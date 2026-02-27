import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAdminLogoutMutation } from '../hooks/useAdminLogoutMutation';
import { useAdminMeQuery } from '../hooks/useAdminMeQuery';
import { canManageServices, canManageStaff } from '../utils/permissions';

function linkClassName({ isActive }: { isActive: boolean }): string {
  return `admin-nav__link ${isActive ? 'is-active' : ''}`;
}

export function AdminLayoutPage(): JSX.Element {
  const navigate = useNavigate();
  const meQuery = useAdminMeQuery();
  const logoutMutation = useAdminLogoutMutation();

  const role = meQuery.data?.user.role;

  const onLogout = async (): Promise<void> => {
    await logoutMutation.mutateAsync();
    navigate('/admin/login', { replace: true });
  };

  return (
    <main className="admin-layout">
      <aside className="admin-sidebar">
        <h1 className="admin-sidebar__title">Admin</h1>
        <p className="admin-sidebar__meta">{meQuery.data?.user.email}</p>
        <p className="admin-sidebar__meta">Role: {role}</p>
        <p className="admin-sidebar__meta">Tenant: {meQuery.data?.tenant.slug}</p>

        <nav className="admin-nav" aria-label="Navigation admin">
          <NavLink to="/admin/planning" className={linkClassName}>
            Planning jour
          </NavLink>
          {role && canManageServices(role) && (
            <NavLink to="/admin/services" className={linkClassName}>
              Services
            </NavLink>
          )}
          {role && canManageStaff(role) && (
            <NavLink to="/admin/staff" className={linkClassName}>
              Staff
            </NavLink>
          )}
        </nav>

        <button type="button" onClick={onLogout} disabled={logoutMutation.isPending}>
          {logoutMutation.isPending ? 'Deconnexion...' : 'Se deconnecter'}
        </button>
      </aside>

      <section className="admin-content">
        <Outlet />
      </section>
    </main>
  );
}
