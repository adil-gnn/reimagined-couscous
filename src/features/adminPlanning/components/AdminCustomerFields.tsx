export type AdminCustomerValues = {
  phone: string;
  name: string;
  note: string;
};

export type AdminCustomerFieldErrors = Partial<Record<keyof AdminCustomerValues, string>>;

type AdminCustomerFieldsProps = {
  values: AdminCustomerValues;
  errors: AdminCustomerFieldErrors;
  disabled: boolean;
  onChange: (next: AdminCustomerValues) => void;
};

export function AdminCustomerFields({
  values,
  errors,
  disabled,
  onChange,
}: AdminCustomerFieldsProps): JSX.Element {
  return (
    <>
      <label htmlFor="admin-create-phone">Téléphone *</label>
      <input
        id="admin-create-phone"
        type="tel"
        value={values.phone}
        onChange={(event) => onChange({ ...values, phone: event.target.value })}
        disabled={disabled}
      />
      {errors.phone && <p className="field-error">{errors.phone}</p>}

      <label htmlFor="admin-create-name">Nom (optionnel)</label>
      <input
        id="admin-create-name"
        type="text"
        value={values.name}
        onChange={(event) => onChange({ ...values, name: event.target.value })}
        disabled={disabled}
      />
      {errors.name && <p className="field-error">{errors.name}</p>}

      <label htmlFor="admin-create-note">Note (optionnel)</label>
      <textarea
        id="admin-create-note"
        rows={3}
        value={values.note}
        onChange={(event) => onChange({ ...values, note: event.target.value })}
        disabled={disabled}
      />
      {errors.note && <p className="field-error">{errors.note}</p>}
    </>
  );
}
