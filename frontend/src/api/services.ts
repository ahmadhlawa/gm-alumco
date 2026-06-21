import { apiRequest } from './client'; import type { ServiceDto } from './types';
export const listServices = () => apiRequest<ServiceDto[]>('/services');
export const getService = (id: number | string) => apiRequest<ServiceDto>(`/services/${id}`);
export const listAdminServices = () => apiRequest<ServiceDto[]>('/admin/services', { authenticated: true });
export const createService = (data: Partial<ServiceDto>) => apiRequest<ServiceDto>('/admin/services', { method: 'POST', body: JSON.stringify(data), authenticated: true });
export const updateService = (id: number | string, data: Partial<ServiceDto>) => apiRequest<ServiceDto>(`/admin/services/${id}`, { method: 'PUT', body: JSON.stringify(data), authenticated: true });
export const deleteService = (id: number | string) => apiRequest<void>(`/admin/services/${id}`, { method: 'DELETE', authenticated: true });
