import { FormEvent, useState } from 'react';
import { z } from 'zod';
import { UpsertAdminServiceRequest } from '../types/adminServicesTypes';

const serviceFormSchema = z.object({
  name: z.string().trim().min(1, 'Le nom est obligatoire.').max(120, 'Nom trop long.'),
  duration_minutes: z.coerce.number().int().min(1, 'Durée invalide.'),
  buffer_before_minutes: z.coerce.number().int().min(0, 'Buffer invalide.'),
  buffer_after_minutes: z.coerce.number().int().min(0, 'Buffer invalide.'),
  price_cents: z.union([z.literal(''), z.coerce.number().int().min(0, 'Prix invalide.')]),
  display_order: z.coerce.number().int().min(0, 'Ordre invalide.'),
});

type ServiceFormFields = {
  name: string;
  duration_minutes: string;
  buffer_before_minutes: string;
  buffer_after_minutes: string;
  price_cents: string;
  display_order: string;
};

type ServiceFormErrors = Partial<Record<keyof ServiceFormFields, string>>;

type AdminServiceFormProps = {
  initialValues: UpsertAdminServiceRequest;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (values: UpsertAdminServiceRequest) => Promise<void>;
};

function toFields(values: UpsertAdminServiceRequest): ServiceFormFields {
  return {
    name: values.name,
    duration_minutes: String(values.duration_minutes),
    buffer_before_minutes: String(values.buffer_before_minutes),
    buffer_after_minutes: String(values.buffer_after_minutes),
    price_cents: values.price_cents !== null ? String(values.price_cents) : '',
    display_order: String(values.display_order),
  };
}

export function AdminServiceForm({
  initialValues,
  submitLabel,
  isSubmitting,
  onSubmit,
}: AdminServiceFormProps): JSX.Element {
  const [fields, setFields] = useState<ServiceFormFields>(() => toFields(initialValues));
  const [errors, setErrors] = useState<ServiceFormErrors>({});

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    const parsed = serviceFormSchema.safeParse(fields);
    if (!parsed.success) {
      const nextErrors: ServiceFormErrors = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0];
        if (typeof key === 'string' && nextErrors[key as keyof ServiceFormFields] === undefined) {
          nextErrors[key as keyof ServiceFormFields] = issue.message;
        }
      });
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    await onSubmit({
      name: parsed.data.name,
      duration_minutes: parsed.data.duration_minutes,
      buffer_before_minutes: parsed.data.buffer_before_minutes,
      buffer_after_minutes: parsed.data.buffer_after_minutes,
      price_cents: parsed.data.price_cents === '' ? null : parsed.data.price_cents,
      display_order: parsed.data.display_order,
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label htmlFor="service-name">Nom</label>
      <input id="service-name" value={fields.name} onChange={(event) => setFields((v) => ({ ...v, name: event.target.value }))} disabled={isSubmitting} />
      {errors.name && <p className="field-error">{errors.name}</p>}

      <label htmlFor="service-duration">Durée (minutes)</label>
      <input id="service-duration" type="number" min={1} value={fields.duration_minutes} onChange={(event) => setFields((v) => ({ ...v, duration_minutes: event.target.value }))} disabled={isSubmitting} />
      {errors.duration_minutes && <p className="field-error">{errors.duration_minutes}</p>}

      <label htmlFor="service-buffer-before">Buffer avant</label>
      <input id="service-buffer-before" type="number" min={0} value={fields.buffer_before_minutes} onChange={(event) => setFields((v) => ({ ...v, buffer_before_minutes: event.target.value }))} disabled={isSubmitting} />
      {errors.buffer_before_minutes && <p className="field-error">{errors.buffer_before_minutes}</p>}

      <label htmlFor="service-buffer-after">Buffer après</label>
      <input id="service-buffer-after" type="number" min={0} value={fields.buffer_after_minutes} onChange={(event) => setFields((v) => ({ ...v, buffer_after_minutes: event.target.value }))} disabled={isSubmitting} />
      {errors.buffer_after_minutes && <p className="field-error">{errors.buffer_after_minutes}</p>}

      <label htmlFor="service-price">Prix (centimes, optionnel)</label>
      <input id="service-price" type="number" min={0} value={fields.price_cents} onChange={(event) => setFields((v) => ({ ...v, price_cents: event.target.value }))} disabled={isSubmitting} />
      {errors.price_cents && <p className="field-error">{errors.price_cents}</p>}

      <label htmlFor="service-order">Ordre d'affichage</label>
      <input id="service-order" type="number" min={0} value={fields.display_order} onChange={(event) => setFields((v) => ({ ...v, display_order: event.target.value }))} disabled={isSubmitting} />
      {errors.display_order && <p className="field-error">{errors.display_order}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Enregistrement...' : submitLabel}
      </button>
    </form>
  );
}

