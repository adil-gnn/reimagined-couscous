import { FormEvent, useEffect, useMemo, useState } from 'react';
import { SectionMessage } from '../../publicBooking/components/SectionMessage';
import { useAdminServicesQuery } from '../hooks/useAdminServicesQuery';
import { useAdminSlotsQuery } from '../hooks/useAdminSlotsQuery';
import { useUpdateAdminAppointmentMutation } from '../hooks/useUpdateAdminAppointmentMutation';
import { AdminPlanningAppointment, AdminPlanningStaff } from '../types/adminPlanningTypes';
import { formatAdminTime, getApiErrorMessage } from '../utils/adminPlanningUi';

type AdminEditAppointmentFormProps = {
  tenantSlug: string;
  date: string;
  timezone: string;
  appointment: AdminPlanningAppointment;
  staff: AdminPlanningStaff[];
  onSaved: (message: string) => void;
  onCancel: () => void;
};

export function AdminEditAppointmentForm({
  tenantSlug,
  date,
  timezone,
  appointment,
  staff,
  onSaved,
  onCancel,
}: AdminEditAppointmentFormProps): JSX.Element {
  const [serviceId, setServiceId] = useState<string>(appointment.service_id);
  const [staffId, setStaffId] = useState<string>(appointment.staff_id ?? '');
  const [slotStartAt, setSlotStartAt] = useState<string>(appointment.start_at);

  const servicesQuery = useAdminServicesQuery(tenantSlug);
  const slotsQuery = useAdminSlotsQuery({
    tenantSlug,
    serviceId,
    date,
    staffId: staffId || undefined,
  });
  const updateMutation = useUpdateAdminAppointmentMutation();

  useEffect(() => {
    setServiceId(appointment.service_id);
    setStaffId(appointment.staff_id ?? '');
    setSlotStartAt(appointment.start_at);
  }, [appointment.id, appointment.service_id, appointment.staff_id, appointment.start_at]);

  useEffect(() => {
    if (serviceId !== appointment.service_id || staffId !== (appointment.staff_id ?? '')) {
      setSlotStartAt('');
    }
  }, [appointment.service_id, appointment.staff_id, serviceId, staffId]);

  const selectedService = useMemo(
    () => servicesQuery.data?.services.find((service) => service.id === serviceId),
    [serviceId, servicesQuery.data?.services],
  );

  const onSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (serviceId === '' || slotStartAt === '') {
      return;
    }

    const result = await updateMutation.mutateAsync({
      tenantSlug,
      date,
      appointmentId: appointment.id,
      body: {
        service_id: serviceId,
        start_at: slotStartAt,
        ...(staffId !== '' ? { staff_id: staffId } : {}),
      },
    });

    onSaved(`RDV ${result.appointment_id} modifié (${result.start_at}).`);
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      <label htmlFor="admin-edit-service">Service</label>
      {servicesQuery.isLoading && <SectionMessage tone="loading" message="Chargement des services..." />}
      {servicesQuery.isError && (
        <SectionMessage tone="error" message={getApiErrorMessage(servicesQuery.error, 'Impossible de charger les services.')} />
      )}
      {servicesQuery.isSuccess && (
        <select
          id="admin-edit-service"
          value={serviceId}
          onChange={(event) => setServiceId(event.target.value)}
          disabled={updateMutation.isPending}
        >
          <option value="">Choisir un service</option>
          {servicesQuery.data.services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} ({service.duration_minutes} min)
            </option>
          ))}
        </select>
      )}

      <label htmlFor="admin-edit-staff">Staff</label>
      <select
        id="admin-edit-staff"
        value={staffId}
        onChange={(event) => setStaffId(event.target.value)}
        disabled={updateMutation.isPending || staff.length === 0}
      >
        <option value="">Sans staff (assigner plus tard)</option>
        {staff.map((staffMember) => (
          <option key={staffMember.id} value={staffMember.id}>
            {staffMember.display_name}
          </option>
        ))}
      </select>

      <p className="admin-create__label">Créneaux</p>
      {serviceId === '' && <SectionMessage tone="info" message="Sélectionne un service pour charger les créneaux." />}
      {serviceId !== '' && slotsQuery.isLoading && <SectionMessage tone="loading" message="Chargement des créneaux..." />}
      {serviceId !== '' && slotsQuery.isError && (
        <SectionMessage tone="error" message={getApiErrorMessage(slotsQuery.error, 'Impossible de charger les créneaux.')} />
      )}
      {serviceId !== '' && slotsQuery.isSuccess && slotsQuery.data.slots.length === 0 && (
        <SectionMessage tone="empty" message="Aucun créneau disponible pour cette sélection." />
      )}
      {serviceId !== '' && slotsQuery.isSuccess && slotsQuery.data.slots.length > 0 && (
        <div className="slots-grid">
          {slotsQuery.data.slots.map((slot) => (
            <button
              key={slot.start_at}
              type="button"
              className={`slot-button ${slotStartAt === slot.start_at ? 'is-selected' : ''}`}
              onClick={() => setSlotStartAt(slot.start_at)}
              disabled={updateMutation.isPending}
            >
              {formatAdminTime(slot.start_at, timezone)}
            </button>
          ))}
        </div>
      )}

      {updateMutation.isError && (
        <SectionMessage tone="error" message={getApiErrorMessage(updateMutation.error, 'Erreur lors de la modification du RDV.')} />
      )}
      {selectedService && slotStartAt !== '' && (
        <p className="selection-summary">
          Sélection: {selectedService.name} - {formatAdminTime(slotStartAt, timezone)}
        </p>
      )}

      <div className="admin-edit-actions">
        <button type="submit" disabled={updateMutation.isPending || serviceId === '' || slotStartAt === ''}>
          {updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer la modification'}
        </button>
        <button type="button" onClick={onCancel} disabled={updateMutation.isPending}>
          Annuler
        </button>
      </div>
    </form>
  );
}
