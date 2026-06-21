import { clearAccessToken, getAccessToken } from './token';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

type ApiRequestOptions = RequestInit & { authenticated?: boolean };

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
    const payload = await response.json().catch(() => null) as { detail?: string } | null;
    throw new ApiError(response.status, payload?.detail ?? `Request failed (${response.status})`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
