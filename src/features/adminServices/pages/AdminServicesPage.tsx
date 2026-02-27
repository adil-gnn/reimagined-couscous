import { useMemo, useState } from 'react';
import { ApiClientError } from '../../../shared/api/apiClient';
import { SectionMessage } from '../../publicBooking/components/SectionMessage';
import { AdminServiceForm } from '../components/AdminServiceForm';
import { useArchiveAdminServiceMutation } from '../hooks/useArchiveAdminServiceMutation';
import { useAdminServicesQuery } from '../hooks/useAdminServicesQuery';
import { useCreateAdminServiceMutation } from '../hooks/useCreateAdminServiceMutation';
import { useUpdateAdminServiceMutation } from '../hooks/useUpdateAdminServiceMutation';
import { AdminService, UpsertAdminServiceRequest } from '../types/adminServicesTypes';

const defaultServiceValues: UpsertAdminServiceRequest = {
  name: '',
  duration_minutes: 30,
  buffer_before_minutes: 0,
  buffer_after_minutes: 0,
  price_cents: null,
  display_order: 0,
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }
  return fallback;
}

function toUpsertValues(service: AdminService): UpsertAdminServiceRequest {
  return {
    name: service.name,
    duration_minutes: service.duration_minutes,
    buffer_before_minutes: service.buffer_before_minutes,
    buffer_after_minutes: service.buffer_after_minutes,
    price_cents: service.price_cents,
    display_order: service.display_order,
  };
}

export function AdminServicesPage(): JSX.Element {
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');

  const servicesQuery = useAdminServicesQuery();
  const createMutation = useCreateAdminServiceMutation();
  const updateMutation = useUpdateAdminServiceMutation();
  const archiveMutation = useArchiveAdminServiceMutation();

  const selectedService = useMemo(
    () => servicesQuery.data?.services.find((service) => service.id === selectedServiceId) ?? null,
    [servicesQuery.data?.services, selectedServiceId],
  );

  const handleCreate = async (values: UpsertAdminServiceRequest): Promise<void> => {
    setFeedback('');
    const created = await createMutation.mutateAsync(values);
    setFeedback(`Service créé: ${created.service_id}.`);
  };

  const handleUpdate = async (values: UpsertAdminServiceRequest): Promise<void> => {
    if (!selectedService) return;
    setFeedback('');
    const updated = await updateMutation.mutateAsync({ serviceId: selectedService.id, body: values });
    setFeedback(`Service mis à jour: ${updated.service_id}.`);
  };

  const handleArchive = async (serviceId: string): Promise<void> => {
    setFeedback('');
    await archiveMutation.mutateAsync(serviceId);
    if (selectedServiceId === serviceId) setSelectedServiceId('');
    setFeedback('Service archivé.');
  };

  return (
    <>
      <section className="booking-section">
        <h2>Services</h2>
        {servicesQuery.isLoading && <SectionMessage tone="loading" message="Chargement des services..." />}
        {servicesQuery.isError && <SectionMessage tone="error" message={getErrorMessage(servicesQuery.error, 'Impossible de charger les services.')} />}
        {servicesQuery.isSuccess && servicesQuery.data.services.length === 0 && (
          <SectionMessage tone="empty" message="Aucun service pour ce tenant." />
        )}
        {servicesQuery.isSuccess && servicesQuery.data.services.length > 0 && (
          <div className="admin-services-list">
            {servicesQuery.data.services.map((service) => (
              <article key={service.id} className={`admin-service-card ${service.is_active ? '' : 'is-inactive'}`}>
                <p className="admin-service-card__name">{service.name}</p>
                <p className="admin-service-card__meta">
                  {service.duration_minutes} min, buffer {service.buffer_before_minutes}/{service.buffer_after_minutes}
                </p>
                <p className="admin-service-card__meta">Prix: {service.price_cents ?? 'N/A'} | Ordre: {service.display_order}</p>
                <p className="admin-service-card__meta">Statut: {service.is_active ? 'Actif' : 'Archivé'}</p>
                <div className="admin-service-card__actions">
                  <button type="button" onClick={() => setSelectedServiceId(service.id)} disabled={updateMutation.isPending || archiveMutation.isPending}>
                    Modifier
                  </button>
                  {service.is_active && (
                    <button type="button" onClick={() => void handleArchive(service.id)} disabled={archiveMutation.isPending}>
                      Archiver
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
        {archiveMutation.isError && <SectionMessage tone="error" message={getErrorMessage(archiveMutation.error, 'Erreur lors de l’archivage.')} />}
        {feedback !== '' && <SectionMessage tone="info" message={feedback} />}
      </section>

      <section className="booking-section">
        <h2>Créer un service</h2>
        {createMutation.isError && <SectionMessage tone="error" message={getErrorMessage(createMutation.error, 'Erreur lors de la création.')} />}
        <AdminServiceForm
          key="create-service-form"
          initialValues={defaultServiceValues}
          submitLabel="Créer le service"
          isSubmitting={createMutation.isPending}
          onSubmit={handleCreate}
        />
      </section>

      <section className="booking-section">
        <h2>Modifier un service</h2>
        {selectedService === null && <SectionMessage tone="info" message="Sélectionne un service dans la liste." />}
        {selectedService !== null && (
          <>
            {updateMutation.isError && <SectionMessage tone="error" message={getErrorMessage(updateMutation.error, 'Erreur lors de la modification.')} />}
            <AdminServiceForm
              key={selectedService.id}
              initialValues={toUpsertValues(selectedService)}
              submitLabel="Enregistrer la modification"
              isSubmitting={updateMutation.isPending}
              onSubmit={handleUpdate}
            />
          </>
        )}
      </section>
    </>
  );
}

