import { useState } from 'react';
import { useAdminMeQuery } from '../../adminAuth/hooks/useAdminMeQuery';
import { getTodayIsoDate } from '../../../shared/utils/dateTime';
import { SectionMessage } from '../../publicBooking/components/SectionMessage';
import { AdminCreateAppointmentForm } from '../components/AdminCreateAppointmentForm';
import { AdminEditAppointmentForm } from '../components/AdminEditAppointmentForm';
import { AdminPlanningGrid } from '../components/AdminPlanningGrid';
import { useAdminDayPlanningQuery } from '../hooks/useAdminDayPlanningQuery';
import { useUpdateAdminAppointmentStatusMutation } from '../hooks/useUpdateAdminAppointmentStatusMutation';
import { AdminUpdatableStatus } from '../types/adminPlanningTypes';
import { getApiErrorMessage } from '../utils/adminPlanningUi';

export function AdminPlanningPage(): JSX.Element {
  const [date, setDate] = useState<string>(getTodayIsoDate);
  const [statusFeedback, setStatusFeedback] = useState<string>('');
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null);
  const meQuery = useAdminMeQuery();
  const planningQuery = useAdminDayPlanningQuery(date);
  const updateStatusMutation = useUpdateAdminAppointmentStatusMutation();
  const viewerRole = meQuery.data?.user.role;
  const canCreateAppointment = viewerRole === 'ADMIN' || viewerRole === 'RECEPTION';
  const timezone = planningQuery.data?.timezone ?? 'UTC';
  const updatingAppointmentId = updateStatusMutation.isPending ? updateStatusMutation.variables?.appointmentId ?? null : null;
  const editingAppointment =
    planningQuery.data?.appointments.find((appointment) => appointment.id === editingAppointmentId) ?? null;

  const handleUpdateStatus = async (appointmentId: string, status: AdminUpdatableStatus): Promise<void> => {
    setStatusFeedback('');
    const result = await updateStatusMutation.mutateAsync({
      appointmentId,
      date,
      status,
    });
    setEditingAppointmentId(null);
    setStatusFeedback(`RDV ${result.appointment_id} mis à jour: ${result.status}.`);
  };

  return (
    <>
      <section className="booking-section">
        <h2>Planning jour</h2>
        <label htmlFor="planning-date">Date</label>
        <input id="planning-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />

        {planningQuery.isLoading && <SectionMessage tone="loading" message="Chargement du planning..." />}
        {planningQuery.isError && (
          <SectionMessage tone="error" message={getApiErrorMessage(planningQuery.error, 'Erreur lors du chargement du planning.')} />
        )}
        {updateStatusMutation.isError && (
          <SectionMessage
            tone="error"
            message={getApiErrorMessage(updateStatusMutation.error, 'Erreur lors de la mise à jour du statut du rendez-vous.')}
          />
        )}
        {statusFeedback !== '' && <SectionMessage tone="info" message={statusFeedback} />}
        {planningQuery.isSuccess && planningQuery.data.staff.length === 0 && (
          <SectionMessage tone="empty" message="Aucun staff disponible pour cette vue." />
        )}
        {planningQuery.isSuccess && planningQuery.data.staff.length > 0 && (
          <AdminPlanningGrid
            viewerRole={planningQuery.data.viewer_role}
            staff={planningQuery.data.staff}
            appointments={planningQuery.data.appointments}
            timezone={planningQuery.data.timezone}
            updatingAppointmentId={updatingAppointmentId}
            onUpdateStatus={handleUpdateStatus}
            onEditAppointment={setEditingAppointmentId}
          />
        )}
      </section>

      <section className="booking-section">
        <h2>Modification RDV</h2>
        {editingAppointment === null && <SectionMessage tone="info" message="Choisis un rendez-vous dans le planning pour le modifier." />}
        {meQuery.isSuccess && editingAppointment !== null && (
          <AdminEditAppointmentForm
            tenantSlug={meQuery.data.tenant.slug}
            date={date}
            timezone={timezone}
            appointment={editingAppointment}
            staff={planningQuery.data?.staff ?? []}
            onSaved={(message) => {
              setStatusFeedback(message);
              setEditingAppointmentId(null);
            }}
            onCancel={() => setEditingAppointmentId(null)}
          />
        )}
      </section>

      <section className="booking-section">
        <h2>Création manuelle RDV</h2>
        {meQuery.isLoading && <SectionMessage tone="loading" message="Vérification du rôle..." />}
        {meQuery.isError && <SectionMessage tone="error" message="Impossible de récupérer le profil admin." />}
        {meQuery.isSuccess && !canCreateAppointment && (
          <SectionMessage tone="info" message="Ce rôle ne peut pas créer de rendez-vous." />
        )}
        {meQuery.isSuccess && canCreateAppointment && (
          <AdminCreateAppointmentForm
            tenantSlug={meQuery.data.tenant.slug}
            date={date}
            timezone={timezone}
            staff={planningQuery.data?.staff ?? []}
          />
        )}
      </section>
    </>
  );
}
