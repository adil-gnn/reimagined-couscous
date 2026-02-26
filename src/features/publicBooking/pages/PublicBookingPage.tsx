import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ApiClientError } from '../../../shared/api/apiClient';
import { getTodayIsoDate } from '../../../shared/utils/dateTime';
import { createIdempotencyKey } from '../../../shared/utils/idempotency';
import { CustomerForm, CustomerFormValues } from '../components/CustomerForm';
import { SectionMessage } from '../components/SectionMessage';
import { ServicePicker } from '../components/ServicePicker';
import { SlotsGrid } from '../components/SlotsGrid';
import { useCreatePublicAppointmentMutation } from '../hooks/useCreatePublicAppointmentMutation';
import { usePublicServicesQuery } from '../hooks/usePublicServicesQuery';
import { usePublicSlotsQuery } from '../hooks/usePublicSlotsQuery';
import { usePublicTenantQuery } from '../hooks/usePublicTenantQuery';

type ErrorScope = 'tenant' | 'services' | 'slots' | 'appointment';

function getErrorMessage(error: unknown, fallback: string, scope: ErrorScope): string {
  if (!(error instanceof ApiClientError)) {
    return fallback;
  }

  // Cas demandé: 404 tenant doit être traité explicitement dans l'UI.
  if (scope === 'tenant' && error.status === 404) {
    return 'Tenant introuvable pour ce slug.';
  }

  return error.message;
}

export function PublicBookingPage(): JSX.Element {
  const { slug: rawSlug } = useParams<{ slug: string }>();
  const slug = rawSlug ?? '';

  // Etat strictement UI: le calcul de disponibilité reste côté backend Symfony.
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayIsoDate);
  const [selectedSlotStartAt, setSelectedSlotStartAt] = useState<string>('');
  const [customerFormMessage, setCustomerFormMessage] = useState<string>('');

  const tenantQuery = usePublicTenantQuery(slug);
  const servicesQuery = usePublicServicesQuery(slug);
  const slotsQuery = usePublicSlotsQuery({ slug, serviceId: selectedServiceId, date: selectedDate });
  const createAppointmentMutation = useCreatePublicAppointmentMutation();

  useEffect(() => {
    setSelectedSlotStartAt('');
    setCustomerFormMessage('');
  }, [selectedServiceId, selectedDate]);

  const timezone = tenantQuery.data?.tenant.timezone ?? 'UTC';
  const timezoneLabel = tenantQuery.data?.tenant.timezone ?? 'UTC (fallback explicite)';
  const canFillCustomerForm = selectedServiceId !== '' && selectedSlotStartAt !== '';

  const selectedServiceName = useMemo(
    () => servicesQuery.data?.services.find((service) => service.id === selectedServiceId)?.name,
    [servicesQuery.data?.services, selectedServiceId],
  );

  const handleCustomerFormValidSubmit = async (values: CustomerFormValues): Promise<void> => {
    if (!canFillCustomerForm) {
      return;
    }

    createAppointmentMutation.reset();
    setCustomerFormMessage('');

    // Payload aligné strictement sur CreatePublicAppointmentRequest côté backend.
    const body = {
      service_id: selectedServiceId,
      start_at: selectedSlotStartAt,
      customer: {
        phone: values.phone,
        ...(values.name !== '' ? { name: values.name } : {}),
      },
      ...(values.note !== '' ? { note: values.note } : {}),
    };

    try {
      const result = await createAppointmentMutation.mutateAsync({
        slug,
        idempotencyKey: createIdempotencyKey(),
        body,
      });

      setCustomerFormMessage(`Rendez-vous créé: ${result.appointment_id} (${result.status}).`);
    } catch {
      // Le message d'erreur API est affiché via createAppointmentMutation.isError.
    }
  };

  return (
    <main className="booking-page">
      <h1>Booking public</h1>
      <p className="booking-subtitle">slug: {slug}</p>

      <section className="booking-section"><h2>Tenant</h2>
        {tenantQuery.isLoading && <SectionMessage tone="loading" message="Chargement du tenant..." />}
        {tenantQuery.isError && <SectionMessage tone="error" message={getErrorMessage(tenantQuery.error, 'Impossible de charger le tenant.', 'tenant')} />}
        {tenantQuery.isSuccess && <div className="tenant-card"><p><strong>Nom:</strong> {tenantQuery.data.tenant.name}</p><p><strong>Status:</strong> {tenantQuery.data.tenant.status}</p><p><strong>Timezone:</strong> {timezoneLabel}</p></div>}
      </section>

      <section className="booking-section"><h2>Services</h2>
        {servicesQuery.isLoading && <SectionMessage tone="loading" message="Chargement des services..." />}
        {servicesQuery.isError && <SectionMessage tone="error" message={getErrorMessage(servicesQuery.error, 'Impossible de charger les services.', 'services')} />}
        {servicesQuery.isSuccess && servicesQuery.data.services.length === 0 && <SectionMessage tone="empty" message="Aucun service disponible." />}
        {servicesQuery.isSuccess && servicesQuery.data.services.length > 0 && <ServicePicker services={servicesQuery.data.services} selectedServiceId={selectedServiceId} onSelect={setSelectedServiceId} />}
      </section>

      <section className="booking-section"><h2>Date</h2>
        <label htmlFor="booking-date">Choisir une date</label>
        <input id="booking-date" type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} disabled={selectedServiceId === ''} />
        {selectedServiceId === '' && <SectionMessage tone="info" message="Sélectionne un service pour charger les créneaux." />}
      </section>

      <section className="booking-section"><h2>Créneaux</h2>
        {selectedServiceId === '' && <SectionMessage tone="empty" message="Aucun créneau: service non sélectionné." />}
        {selectedServiceId !== '' && slotsQuery.isLoading && <SectionMessage tone="loading" message="Chargement des créneaux..." />}
        {selectedServiceId !== '' && slotsQuery.isError && <SectionMessage tone="error" message={getErrorMessage(slotsQuery.error, 'Impossible de charger les créneaux.', 'slots')} />}
        {selectedServiceId !== '' && slotsQuery.isSuccess && slotsQuery.data.slots.length === 0 && <SectionMessage tone="empty" message="Aucun créneau disponible pour cette date." />}
        {selectedServiceId !== '' && slotsQuery.isSuccess && slotsQuery.data.slots.length > 0 && <SlotsGrid slots={slotsQuery.data.slots} selectedSlotStartAt={selectedSlotStartAt} timezone={timezone} onSelect={setSelectedSlotStartAt} />}
      </section>

      <section className="booking-section"><h2>Client</h2>
        {!canFillCustomerForm && <SectionMessage tone="info" message="Choisis d'abord un service et un créneau." />}
        {createAppointmentMutation.isError && <SectionMessage tone="error" message={getErrorMessage(createAppointmentMutation.error, 'Erreur lors de la création du rendez-vous.', 'appointment')} />}
        {customerFormMessage !== '' && <SectionMessage tone="info" message={customerFormMessage} />}
        <CustomerForm disabled={!canFillCustomerForm} isSubmitting={createAppointmentMutation.isPending} onValidSubmit={handleCustomerFormValidSubmit} />
        {selectedServiceName && selectedSlotStartAt && <p className="selection-summary">Sélection: {selectedServiceName} - {selectedSlotStartAt}</p>}
      </section>
    </main>
  );
}
