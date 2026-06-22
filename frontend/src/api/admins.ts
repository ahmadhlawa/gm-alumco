import { apiRequest } from './client';
import type { AdminDto } from './types';

export interface AdminWriteDto {
  full_name: string;
  email: string;
  password?: string;
  role: 'admin' | 'super_admin';
  is_active?: boolean;
}

export const listAdmins = () => apiRequest<AdminDto[]>('/admin/admins', { authenticated: true });
export const getAdmin = (id: number) => apiRequest<AdminDto>(`/admin/admins/${id}`, { authenticated: true });
export const createAdmin = (data: AdminWriteDto) =>
  apiRequest<AdminDto>('/admin/admins', { method: 'POST', body: JSON.stringify(data), authenticated: true });
export const updateAdmin = (id: number, data: Partial<AdminWriteDto>) =>
  apiRequest<AdminDto>(`/admin/admins/${id}`, { method: 'PUT', body: JSON.stringify(data), authenticated: true });
export const deleteAdmin = (id: number) =>
  apiRequest<void>(`/admin/admins/${id}`, { method: 'DELETE', authenticated: true });
