import { FormEvent, useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { createIdempotencyKey } from '../../../shared/utils/idempotency';
import { SectionMessage } from '../../publicBooking/components/SectionMessage';
import { AdminCustomerFieldErrors, AdminCustomerFields, AdminCustomerValues } from './AdminCustomerFields';
import { useCreateAdminAppointmentMutation } from '../hooks/useCreateAdminAppointmentMutation';
import { useAdminServicesQuery } from '../hooks/useAdminServicesQuery';
import { useAdminSlotsQuery } from '../hooks/useAdminSlotsQuery';
import { AdminPlanningStaff } from '../types/adminPlanningTypes';
import { formatAdminTime, getApiErrorMessage } from '../utils/adminPlanningUi';

const customerSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(1, 'Le téléphone est obligatoire.')
    .regex(/^[0-9+().\s-]{6,20}$/, 'Format téléphone invalide.'),
  name: z.string().trim().max(120, 'Nom trop long.').optional().default(''),
  note: z.string().trim().max(500, 'Note trop longue.').optional().default(''),
});

type CustomerValues = z.infer<typeof customerSchema>;
type FieldErrors = AdminCustomerFieldErrors;

type AdminCreateAppointmentFormProps = {
  tenantSlug: string;
  date: string;
  timezone: string;
  staff: AdminPlanningStaff[];
};

export function AdminCreateAppointmentForm({
  tenantSlug,
  date,
  timezone,
  staff,
}: AdminCreateAppointmentFormProps): JSX.Element {
  const [serviceId, setServiceId] = useState<string>('');
  const [staffId, setStaffId] = useState<string>('');
  const [slotStartAt, setSlotStartAt] = useState<string>('');
  const [customer, setCustomer] = useState<AdminCustomerValues>({ phone: '', name: '', note: '' });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [feedback, setFeedback] = useState<string>('');

  const servicesQuery = useAdminServicesQuery(tenantSlug);
  const slotsQuery = useAdminSlotsQuery({
    tenantSlug,
    serviceId,
    date,
    staffId: staffId || undefined,
  });
  const createMutation = useCreateAdminAppointmentMutation();

  useEffect(() => {
    // Changement d'inputs disponibilités => on invalide uniquement la sélection UI locale.
    setSlotStartAt('');
    setFeedback('');
  }, [serviceId, staffId, date]);

  const selectedService = useMemo(
    () => servicesQuery.data?.services.find((service) => service.id === serviceId),
    [servicesQuery.data?.services, serviceId],
  );

  const onSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setFeedback('');

    const parsed = customerSchema.safeParse(customer);
    if (!parsed.success) {
      const nextErrors: FieldErrors = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0];
        if (typeof key === 'string' && nextErrors[key as keyof CustomerValues] === undefined) {
          nextErrors[key as keyof CustomerValues] = issue.message;
        }
      });
      setFieldErrors(nextErrors);
      return;
    }

    if (serviceId === '' || slotStartAt === '') {
      setFeedback('Sélectionne un service et un créneau.');
      return;
    }

    setFieldErrors({});

    try {
      const result = await createMutation.mutateAsync({
        date,
        tenantSlug,
        serviceId,
        staffId: staffId || undefined,
        idempotencyKey: createIdempotencyKey(),
        body: {
          service_id: serviceId,
          ...(staffId !== '' ? { staff_id: staffId } : {}),
          start_at: slotStartAt,
          customer: {
            phone: parsed.data.phone,
            ...(parsed.data.name !== '' ? { name: parsed.data.name } : {}),
          },
          ...(parsed.data.note !== '' ? { note: parsed.data.note } : {}),
        },
      });

      setFeedback(`RDV créé: ${result.appointment_id} (${result.status}).`);
    } catch {
      // Le message d'erreur API est rendu via createMutation.isError.
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      <label htmlFor="admin-create-service">Service</label>
      {servicesQuery.isLoading && <SectionMessage tone="loading" message="Chargement des services..." />}
      {servicesQuery.isError && (
        <SectionMessage tone="error" message={getApiErrorMessage(servicesQuery.error, 'Impossible de charger les services.')} />
      )}
      {servicesQuery.isSuccess && servicesQuery.data.services.length === 0 && (
        <SectionMessage tone="empty" message="Aucun service disponible." />
      )}
      {servicesQuery.isSuccess && servicesQuery.data.services.length > 0 && (
        <select
          id="admin-create-service"
          value={serviceId}
          onChange={(event) => setServiceId(event.target.value)}
          disabled={createMutation.isPending}
        >
          <option value="">Choisir un service</option>
          {servicesQuery.data.services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} ({service.duration_minutes} min)
            </option>
          ))}
        </select>
      )}

      <label htmlFor="admin-create-staff">Staff</label>
      <select
        id="admin-create-staff"
        value={staffId}
        onChange={(event) => setStaffId(event.target.value)}
        disabled={createMutation.isPending || staff.length === 0}
      >
        <option value="">Sans préférence (auto-assign)</option>
        {staff.map((staffMember) => (
          <option key={staffMember.id} value={staffMember.id}>
            {staffMember.display_name}
          </option>
        ))}
      </select>

      <label htmlFor="admin-create-date">Date</label>
      <input id="admin-create-date" type="date" value={date} readOnly />

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
              disabled={createMutation.isPending}
            >
              {formatAdminTime(slot.start_at, timezone)}
            </button>
          ))}
        </div>
      )}

      <AdminCustomerFields values={customer} errors={fieldErrors} disabled={createMutation.isPending} onChange={setCustomer} />

      {createMutation.isError && (
        <SectionMessage tone="error" message={getApiErrorMessage(createMutation.error, 'Erreur lors de la création du RDV.')} />
      )}
      {feedback !== '' && <SectionMessage tone="info" message={feedback} />}
      {selectedService && slotStartAt !== '' && (
        <p className="selection-summary">
          Sélection: {selectedService.name} - {formatAdminTime(slotStartAt, timezone)}
        </p>
      )}

      <button type="submit" disabled={createMutation.isPending || serviceId === '' || slotStartAt === ''}>
        {createMutation.isPending ? 'Création...' : 'Créer le rendez-vous'}
      </button>
    </form>
  );
}
