import { AdminRole } from '../../adminAuth/types/adminAuthTypes';
import { AdminPlanningAppointment, AdminPlanningStaff, AdminUpdatableStatus } from '../types/adminPlanningTypes';
import { formatAdminTime } from '../utils/adminPlanningUi';

type AdminPlanningGridProps = {
  viewerRole: AdminRole;
  staff: AdminPlanningStaff[];
  appointments: AdminPlanningAppointment[];
  timezone: string;
  updatingAppointmentId: string | null;
  onUpdateStatus: (appointmentId: string, status: AdminUpdatableStatus) => Promise<void>;
  onEditAppointment: (appointmentId: string) => void;
};

function statusClassName(status: string): string {
  if (status === 'PENDING_CONFIRMATION') return 'appointment-card--pending';
  if (status === 'CONFIRMED') return 'appointment-card--confirmed';
  if (status === 'COMPLETED') return 'appointment-card--completed';
  if (status === 'NO_SHOW') return 'appointment-card--no-show';
  if (status.startsWith('CANCELLED')) return 'appointment-card--cancelled';
  return 'appointment-card--default';
}

function getActionsByStatus(status: string, role: AdminRole): Array<{ label: string; targetStatus: AdminUpdatableStatus }> {
  if (role !== 'ADMIN' && role !== 'RECEPTION') {
    return [];
  }

  if (status === 'PENDING_CONFIRMATION') {
    return [
      { label: 'Confirmer', targetStatus: 'CONFIRMED' },
      { label: 'Annuler', targetStatus: 'CANCELLED_BY_STAFF' },
    ];
  }

  if (status === 'CONFIRMED') {
    return [
      { label: 'Présent', targetStatus: 'COMPLETED' },
      { label: 'No-show', targetStatus: 'NO_SHOW' },
      { label: 'Annuler', targetStatus: 'CANCELLED_BY_STAFF' },
    ];
  }

  return [];
}

export function AdminPlanningGrid({
  viewerRole,
  staff,
  appointments,
  timezone,
  updatingAppointmentId,
  onUpdateStatus,
  onEditAppointment,
}: AdminPlanningGridProps): JSX.Element {
  return (
    <div className="planning-columns" role="list" aria-label="Planning jour par staff">
      {staff.map((staffItem) => {
        const staffAppointments = appointments.filter((appointment) => appointment.staff_id === staffItem.id);

        return (
          <article key={staffItem.id} className="planning-column" role="listitem">
            <h3 className="planning-column__title">{staffItem.display_name}</h3>

            {staffAppointments.length === 0 && <p className="planning-column__empty">Aucun RDV</p>}

            {staffAppointments.map((appointment) => (
              <AdminAppointmentCard
                key={appointment.id}
                appointment={appointment}
                timezone={timezone}
                viewerRole={viewerRole}
                updatingAppointmentId={updatingAppointmentId}
                onUpdateStatus={onUpdateStatus}
                onEditAppointment={onEditAppointment}
              />
            ))}
          </article>
        );
      })}
    </div>
  );
}

type AdminAppointmentCardProps = {
  appointment: AdminPlanningAppointment;
  timezone: string;
  viewerRole: AdminRole;
  updatingAppointmentId: string | null;
  onUpdateStatus: (appointmentId: string, status: AdminUpdatableStatus) => Promise<void>;
  onEditAppointment: (appointmentId: string) => void;
};

function AdminAppointmentCard({
  appointment,
  timezone,
  viewerRole,
  updatingAppointmentId,
  onUpdateStatus,
  onEditAppointment,
}: AdminAppointmentCardProps): JSX.Element {
  const actions = getActionsByStatus(appointment.status, viewerRole);
  const canEdit = (viewerRole === 'ADMIN' || viewerRole === 'RECEPTION') && actions.length > 0;

  return (
    <div className={`appointment-card ${statusClassName(appointment.status)}`}>
      <p className="appointment-card__time">
        {formatAdminTime(appointment.start_at, timezone)} - {formatAdminTime(appointment.end_at, timezone)}
      </p>
      <p className="appointment-card__service">{appointment.service_name}</p>
      <p className="appointment-card__customer">
        {appointment.customer_name ?? 'Client'} {appointment.customer_phone ? `(${appointment.customer_phone})` : ''}
      </p>
      <p className="appointment-card__status">{appointment.status}</p>

      {canEdit && (
        <button
          type="button"
          className="appointment-card__action appointment-card__action--edit"
          onClick={() => onEditAppointment(appointment.id)}
          disabled={updatingAppointmentId !== null}
        >
          Modifier
        </button>
      )}

      {actions.length > 0 && (
        <div className="appointment-card__actions">
          {actions.map((action) => (
            <button
              key={`${appointment.id}-${action.targetStatus}`}
              type="button"
              className="appointment-card__action"
              onClick={() => void onUpdateStatus(appointment.id, action.targetStatus)}
              disabled={updatingAppointmentId !== null}
            >
              {updatingAppointmentId === appointment.id ? 'Mise à jour...' : action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
