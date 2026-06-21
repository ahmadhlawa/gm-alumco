import { beforeEach, describe, expect, it, vi } from 'vitest';

const storage = new Map<string, string>();

beforeEach(() => {
  storage.clear();
  vi.stubEnv('VITE_API_URL', 'http://api.test/api/v1');
  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  });
});

describe('apiRequest', () => {
  it('uses VITE_API_URL and adds the session JWT', async () => {
    const { setAccessToken } = await import('./token');
    const { apiRequest } = await import('./client');
    setAccessToken('jwt-token');
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: 1 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await apiRequest('/admin/projects', { authenticated: true });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://api.test/api/v1/admin/projects',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer jwt-token' }),
      }),
    );
  });

  it('clears the token and reports unauthorized responses', async () => {
    const { getAccessToken, setAccessToken } = await import('./token');
    const { ApiError, apiRequest } = await import('./client');
    setAccessToken('expired');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 401 })));

    await expect(apiRequest('/auth/me', { authenticated: true })).rejects.toBeInstanceOf(ApiError);
    expect(getAccessToken()).toBeNull();
  });
});
