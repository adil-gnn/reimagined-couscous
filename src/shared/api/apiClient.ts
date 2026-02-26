import { ApiErrorPayload } from '../types/api';

type ApiMethod = 'GET' | 'POST';

type ApiRequestOptions = {
  body?: unknown;
  query?: Record<string, string | undefined>;
  headers?: Record<string, string>;
};

export class ApiClientError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details: Record<string, unknown>;

  public constructor(status: number, code: string, message: string, details: Record<string, unknown>) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function buildQueryString(query?: Record<string, string | undefined>): string {
  if (!query) {
    return '';
  }

  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) {
      params.set(key, value);
    }
  });

  const queryString = params.toString();
  return queryString.length > 0 ? `?${queryString}` : '';
}

async function parseJsonSafely(response: Response): Promise<unknown> {
  const text = await response.text();
  if (text.length === 0) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

async function apiRequest<T>(method: ApiMethod, path: string, options: ApiRequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...options.headers,
  };

  // On n'ajoute Content-Type JSON que si un body est présent.
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${path}${buildQueryString(options.query)}`, {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const data = (await parseJsonSafely(response)) as T | ApiErrorPayload | null;

  if (response.ok) {
    return data as T;
  }

  const errorPayload = data as ApiErrorPayload | null;
  throw new ApiClientError(
    response.status,
    errorPayload?.error?.code ?? 'HTTP_ERROR',
    errorPayload?.error?.message ?? 'Unexpected API error.',
    errorPayload?.error?.details ?? {},
  );
}

export function apiGet<T>(path: string, query?: Record<string, string | undefined>): Promise<T> {
  return apiRequest<T>('GET', path, { query });
}

export function apiPost<T>(path: string, body: unknown, headers?: Record<string, string>): Promise<T> {
  return apiRequest<T>('POST', path, { body, headers });
}
