import { useMemo, useState } from 'react';
import { ApiClientError } from '../../../shared/api/apiClient';
import { SectionMessage } from '../../publicBooking/components/SectionMessage';
import { useAdminServicesQuery } from '../../adminServices/hooks/useAdminServicesQuery';
import { AdminStaffForm } from '../components/AdminStaffForm';
import { useAdminStaffQuery } from '../hooks/useAdminStaffQuery';
import { useArchiveAdminStaffMutation } from '../hooks/useArchiveAdminStaffMutation';
import { useCreateAdminStaffMutation } from '../hooks/useCreateAdminStaffMutation';
import { useUpdateAdminStaffMutation } from '../hooks/useUpdateAdminStaffMutation';
import { AdminStaff, UpsertAdminStaffRequest } from '../types/adminStaffTypes';

const defaultStaffValues: UpsertAdminStaffRequest = {
  display_name: '',
  display_order: 0,
  service_ids: [],
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiClientError) return error.message;
  return fallback;
}

function toUpsertValues(staff: AdminStaff): UpsertAdminStaffRequest {
  return {
    display_name: staff.display_name,
    display_order: staff.display_order,
    service_ids: staff.service_ids,
  };
}

export function AdminStaffPage(): JSX.Element {
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');

  const staffQuery = useAdminStaffQuery();
  const servicesQuery = useAdminServicesQuery();
  const createMutation = useCreateAdminStaffMutation();
  const updateMutation = useUpdateAdminStaffMutation();
  const archiveMutation = useArchiveAdminStaffMutation();

  const selectedStaff = useMemo(
    () => staffQuery.data?.staff.find((item) => item.id === selectedStaffId) ?? null,
    [staffQuery.data?.staff, selectedStaffId],
  );

  const serviceOptions = useMemo(
    () =>
      (servicesQuery.data?.services ?? []).map((service) => ({
        id: service.id,
        name: service.name,
        isActive: service.is_active,
      })),
    [servicesQuery.data?.services],
  );

  const handleCreate = async (values: UpsertAdminStaffRequest): Promise<void> => {
    setFeedback('');
    const created = await createMutation.mutateAsync(values);
    setFeedback(`Staff créé: ${created.staff_id}.`);
  };

  const handleUpdate = async (values: UpsertAdminStaffRequest): Promise<void> => {
    if (!selectedStaff) return;
    setFeedback('');
    const updated = await updateMutation.mutateAsync({ staffId: selectedStaff.id, body: values });
    setFeedback(`Staff mis à jour: ${updated.staff_id}.`);
  };

  const handleArchive = async (staffId: string): Promise<void> => {
    setFeedback('');
    await archiveMutation.mutateAsync(staffId);
    if (selectedStaffId === staffId) setSelectedStaffId('');
    setFeedback('Staff archivé.');
  };

  return (
    <>
      <section className="booking-section">
        <h2>Staff</h2>
        {staffQuery.isLoading && <SectionMessage tone="loading" message="Chargement du staff..." />}
        {staffQuery.isError && <SectionMessage tone="error" message={getErrorMessage(staffQuery.error, 'Impossible de charger le staff.')} />}
        {staffQuery.isSuccess && staffQuery.data.staff.length === 0 && <SectionMessage tone="empty" message="Aucun membre staff." />}
        {staffQuery.isSuccess && staffQuery.data.staff.length > 0 && (
          <div className="admin-services-list">
            {staffQuery.data.staff.map((item) => (
              <article key={item.id} className={`admin-service-card ${item.is_active ? '' : 'is-inactive'}`}>
                <p className="admin-service-card__name">{item.display_name}</p>
                <p className="admin-service-card__meta">Ordre: {item.display_order} | User: {item.user_id ?? 'N/A'}</p>
                <p className="admin-service-card__meta">Services liés: {item.service_ids.length}</p>
                <p className="admin-service-card__meta">Statut: {item.is_active ? 'Actif' : 'Archivé'}</p>
                <div className="admin-service-card__actions">
                  <button type="button" onClick={() => setSelectedStaffId(item.id)} disabled={updateMutation.isPending || archiveMutation.isPending}>
                    Modifier
                  </button>
                  {item.is_active && (
                    <button type="button" onClick={() => void handleArchive(item.id)} disabled={archiveMutation.isPending}>
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
        <h2>Créer un staff</h2>
        {servicesQuery.isLoading && <SectionMessage tone="loading" message="Chargement des services..." />}
        {servicesQuery.isError && <SectionMessage tone="error" message={getErrorMessage(servicesQuery.error, 'Impossible de charger les services.')} />}
        {createMutation.isError && <SectionMessage tone="error" message={getErrorMessage(createMutation.error, 'Erreur lors de la création.')} />}
        <AdminStaffForm
          key="create-staff-form"
          initialValues={defaultStaffValues}
          serviceOptions={serviceOptions}
          submitLabel="Créer le staff"
          isSubmitting={createMutation.isPending}
          onSubmit={handleCreate}
        />
      </section>

      <section className="booking-section">
        <h2>Modifier un staff</h2>
        {selectedStaff === null && <SectionMessage tone="info" message="Sélectionne un membre staff dans la liste." />}
        {selectedStaff !== null && (
          <>
            {updateMutation.isError && <SectionMessage tone="error" message={getErrorMessage(updateMutation.error, 'Erreur lors de la modification.')} />}
            <AdminStaffForm
              key={selectedStaff.id}
              initialValues={toUpsertValues(selectedStaff)}
              serviceOptions={serviceOptions}
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

