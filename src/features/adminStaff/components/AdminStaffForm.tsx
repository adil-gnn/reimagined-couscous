import { FormEvent, useMemo, useState } from 'react';
import { z } from 'zod';
import { UpsertAdminStaffRequest } from '../types/adminStaffTypes';

const staffFormSchema = z.object({
  display_name: z.string().trim().min(1, 'Le nom est obligatoire.').max(120, 'Nom trop long.'),
  display_order: z.coerce.number().int().min(0, 'Ordre invalide.'),
  service_ids: z.array(z.string()),
});

type StaffFormFields = {
  display_name: string;
  display_order: string;
  service_ids: string[];
};

type StaffFormErrors = Partial<Record<'display_name' | 'display_order', string>>;

type ServiceOption = {
  id: string;
  name: string;
  isActive: boolean;
};

type AdminStaffFormProps = {
  initialValues: UpsertAdminStaffRequest;
  serviceOptions: ServiceOption[];
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (values: UpsertAdminStaffRequest) => Promise<void>;
};

function toFields(values: UpsertAdminStaffRequest): StaffFormFields {
  return {
    display_name: values.display_name,
    display_order: String(values.display_order),
    service_ids: values.service_ids,
  };
}

export function AdminStaffForm({
  initialValues,
  serviceOptions,
  submitLabel,
  isSubmitting,
  onSubmit,
}: AdminStaffFormProps): JSX.Element {
  const [fields, setFields] = useState<StaffFormFields>(() => toFields(initialValues));
  const [errors, setErrors] = useState<StaffFormErrors>({});
  const activeServices = useMemo(() => serviceOptions.filter((service) => service.isActive), [serviceOptions]);

  const toggleService = (serviceId: string): void => {
    setFields((current) => {
      const exists = current.service_ids.includes(serviceId);
      const nextServiceIds = exists
        ? current.service_ids.filter((id) => id !== serviceId)
        : [...current.service_ids, serviceId];

      return { ...current, service_ids: nextServiceIds };
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    const parsed = staffFormSchema.safeParse(fields);
    if (!parsed.success) {
      const nextErrors: StaffFormErrors = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0];
        if (typeof key === 'string' && nextErrors[key as keyof StaffFormErrors] === undefined) {
          nextErrors[key as keyof StaffFormErrors] = issue.message;
        }
      });
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    await onSubmit({
      display_name: parsed.data.display_name,
      display_order: parsed.data.display_order,
      service_ids: parsed.data.service_ids,
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label htmlFor="staff-name">Nom affiché</label>
      <input
        id="staff-name"
        value={fields.display_name}
        onChange={(event) => setFields((v) => ({ ...v, display_name: event.target.value }))}
        disabled={isSubmitting}
      />
      {errors.display_name && <p className="field-error">{errors.display_name}</p>}

      <label htmlFor="staff-order">Ordre d'affichage</label>
      <input
        id="staff-order"
        type="number"
        min={0}
        value={fields.display_order}
        onChange={(event) => setFields((v) => ({ ...v, display_order: event.target.value }))}
        disabled={isSubmitting}
      />
      {errors.display_order && <p className="field-error">{errors.display_order}</p>}

      <p className="admin-create__label">Services habilités</p>
      {activeServices.length === 0 && <p className="section-message section-message--info">Aucun service actif à associer.</p>}
      {activeServices.length > 0 && (
        <div className="admin-checkbox-grid">
          {activeServices.map((service) => (
            <label key={service.id} className="admin-checkbox-item">
              <input
                type="checkbox"
                checked={fields.service_ids.includes(service.id)}
                onChange={() => toggleService(service.id)}
                disabled={isSubmitting}
              />
              <span>{service.name}</span>
            </label>
          ))}
        </div>
      )}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Enregistrement...' : submitLabel}
      </button>
    </form>
  );
}

