import { apiRequest } from './client'; import { clearAccessToken, setAccessToken } from './token'; import type { AdminDto } from './types';
export async function login(email: string, password: string): Promise<AdminDto> { const token = await apiRequest<{ access_token: string }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }); setAccessToken(token.access_token); return getCurrentAdmin(); }
export const getCurrentAdmin = () => apiRequest<AdminDto>('/auth/me', { authenticated: true });
export const logout = () => clearAccessToken();
