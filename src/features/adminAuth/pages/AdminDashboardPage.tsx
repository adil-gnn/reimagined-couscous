import { useNavigate } from 'react-router-dom';
import { useAdminLogoutMutation } from '../hooks/useAdminLogoutMutation';
import { useAdminMeQuery } from '../hooks/useAdminMeQuery';

export function AdminDashboardPage(): JSX.Element {
  const navigate = useNavigate();
  const meQuery = useAdminMeQuery();
  const logoutMutation = useAdminLogoutMutation();

  const onLogout = async (): Promise<void> => {
    await logoutMutation.mutateAsync();
    navigate('/admin/login', { replace: true });
  };

  return (
    <main className="booking-page">
      <section className="booking-section">
        <h2>Dashboard Admin</h2>
        <p>
          <strong>Utilisateur:</strong> {meQuery.data?.user.email}
        </p>
        <p>
          <strong>Role:</strong> {meQuery.data?.user.role}
        </p>
        <p>
          <strong>Tenant:</strong> {meQuery.data?.tenant.slug}
        </p>
        <p>Socle auth/guard pret. Etapes suivantes: planning + CRUD metier.</p>
        <button type="button" onClick={onLogout} disabled={logoutMutation.isPending}>
          {logoutMutation.isPending ? 'Deconnexion...' : 'Se deconnecter'}
        </button>
      </section>
    </main>
  );
}
