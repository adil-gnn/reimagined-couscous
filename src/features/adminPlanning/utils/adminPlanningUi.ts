import { ApiClientError } from '../../../shared/api/apiClient';

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return fallback;
}

export function formatAdminTime(iso: string, timezone: string): string {
  const date = new Date(iso);

  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
  }).format(date);
}
