import { FormEvent, useState } from 'react';
import { z } from 'zod';

// Validation front basique uniquement (required/format) ; la validation métier reste côté backend.
const customerFormSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(1, 'Le téléphone est obligatoire.')
    .regex(/^[0-9+().\s-]{6,20}$/, 'Format téléphone invalide.'),
  name: z.string().trim().max(120, 'Nom trop long.').optional().default(''),
  note: z.string().trim().max(500, 'Note trop longue.').optional().default(''),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;

type FieldErrors = Partial<Record<keyof CustomerFormValues, string>>;

type CustomerFormProps = {
  disabled: boolean;
  isSubmitting: boolean;
  onValidSubmit: (values: CustomerFormValues) => Promise<void>;
};

export function CustomerForm({ disabled, isSubmitting, onValidSubmit }: CustomerFormProps): JSX.Element {
  const [values, setValues] = useState<CustomerFormValues>({ phone: '', name: '', note: '' });
  const [errors, setErrors] = useState<FieldErrors>({});

  const isFormDisabled = disabled || isSubmitting;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    const parsed = customerFormSchema.safeParse(values);
    if (!parsed.success) {
      const mappedErrors: FieldErrors = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0];
        if (typeof key === 'string' && mappedErrors[key as keyof CustomerFormValues] === undefined) {
          mappedErrors[key as keyof CustomerFormValues] = issue.message;
        }
      });
      setErrors(mappedErrors);
      return;
    }

    setErrors({});
    await onValidSubmit(parsed.data);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label htmlFor="customer-phone">Téléphone *</label>
      <input
        id="customer-phone"
        type="tel"
        value={values.phone}
        onChange={(event) => setValues((current) => ({ ...current, phone: event.target.value }))}
        disabled={isFormDisabled}
      />
      {errors.phone && <p className="field-error">{errors.phone}</p>}

      <label htmlFor="customer-name">Nom (optionnel)</label>
      <input
        id="customer-name"
        type="text"
        value={values.name}
        onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
        disabled={isFormDisabled}
      />
      {errors.name && <p className="field-error">{errors.name}</p>}

      <label htmlFor="customer-note">Note (optionnel)</label>
      <textarea
        id="customer-note"
        rows={3}
        value={values.note}
        onChange={(event) => setValues((current) => ({ ...current, note: event.target.value }))}
        disabled={isFormDisabled}
      />
      {errors.note && <p className="field-error">{errors.note}</p>}

      <button type="submit" disabled={isFormDisabled}>
        {isSubmitting ? 'Envoi en cours...' : 'Confirmer le rendez-vous'}
      </button>
    </form>
  );
}
