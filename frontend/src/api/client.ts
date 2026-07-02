import { clearAccessToken, getAccessToken } from './token';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

type ApiRequestOptions = RequestInit & { authenticated?: boolean };

interface ValidationDetail {
  loc?: Array<string | number>;
  msg?: string;
}

function formatDetail(detail: unknown, fallback: string): string {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item: unknown) => {
        if (!item || typeof item !== 'object') return null;
        const validation = item as ValidationDetail;
        if (!validation.msg) return null;
        const field = validation.loc?.filter((part) => part !== 'body').join('.');
        return field ? `${field}: ${validation.msg}` : validation.msg;
      })
      .filter((message): message is string => Boolean(message));
    if (messages.length) return messages.join('\n');
  }
  return fallback;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '');
  if (!baseUrl) throw new ApiError(0, 'VITE_API_URL is not configured');

  const { authenticated, ...requestOptions } = options;
  const token = authenticated ? getAccessToken() : null;
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(requestOptions.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...Object.fromEntries(new Headers(requestOptions.headers).entries()),
  };
  const response = await fetch(`${baseUrl}${path}`, { ...requestOptions, headers });

  if (response.status === 401 && authenticated) {
    clearAccessToken();
    globalThis.dispatchEvent?.(new Event('gm-auth-expired'));
  }
  if (!response.ok) {
    const fallback = `Request failed (${response.status})`;
    const payload = await response.json().catch(() => null) as { detail?: unknown } | null;
    throw new ApiError(response.status, formatDetail(payload?.detail, fallback));
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
