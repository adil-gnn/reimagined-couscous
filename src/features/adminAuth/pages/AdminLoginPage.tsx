import { FormEvent, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { ApiClientError } from '../../../shared/api/apiClient';
import { SectionMessage } from '../../publicBooking/components/SectionMessage';
import { useAdminLoginMutation } from '../hooks/useAdminLoginMutation';

const schema = z.object({
  tenant_slug: z.string().trim().min(1, 'Le slug tenant est requis.'),
  email: z.string().trim().email('Email invalide.'),
  password: z.string().min(1, 'Mot de passe requis.'),
});

type FormValues = z.infer<typeof schema>;
type FieldErrors = Partial<Record<keyof FormValues, string>>;

export function AdminLoginPage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | undefined)?.from ?? '/admin';

  const loginMutation = useAdminLoginMutation();
  const [values, setValues] = useState<FormValues>({ tenant_slug: 'demo', email: '', password: '' });
  const [errors, setErrors] = useState<FieldErrors>({});

  const onSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const nextErrors: FieldErrors = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0];
        if (typeof key === 'string' && nextErrors[key as keyof FormValues] === undefined) {
          nextErrors[key as keyof FormValues] = issue.message;
        }
      });
      setErrors(nextErrors);
      return;
    }

    setErrors({});

    try {
      await loginMutation.mutateAsync(parsed.data);
      navigate(from, { replace: true });
    } catch {
      // Affichage d'erreur via loginMutation.isError.
    }
  };

  return (
    <main className="booking-page">
      <section className="booking-section">
        <h2>Admin Login</h2>
        <form onSubmit={onSubmit} noValidate>
          <label htmlFor="tenant_slug">Tenant slug</label>
          <input id="tenant_slug" type="text" value={values.tenant_slug} onChange={(event) => setValues((current) => ({ ...current, tenant_slug: event.target.value }))} />
          {errors.tenant_slug && <p className="field-error">{errors.tenant_slug}</p>}

          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={values.email} onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))} />
          {errors.email && <p className="field-error">{errors.email}</p>}

          <label htmlFor="password">Mot de passe</label>
          <input id="password" type="password" value={values.password} onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))} />
          {errors.password && <p className="field-error">{errors.password}</p>}

          <button type="submit" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        {loginMutation.isError && (
          <SectionMessage
            tone="error"
            message={loginMutation.error instanceof ApiClientError ? loginMutation.error.message : 'Erreur de connexion.'}
          />
        )}
      </section>
    </main>
  );
}
