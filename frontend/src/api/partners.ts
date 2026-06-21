import { apiRequest } from './client'; import type { PartnerDto } from './types';
export const listPartners = () => apiRequest<PartnerDto[]>('/partners');
export const listAdminPartners = () => apiRequest<PartnerDto[]>('/admin/partners', { authenticated: true });
export const createPartner = (data: Partial<PartnerDto>) => apiRequest<PartnerDto>('/admin/partners', { method: 'POST', body: JSON.stringify(data), authenticated: true });
export const updatePartner = (id: number | string, data: Partial<PartnerDto>) => apiRequest<PartnerDto>(`/admin/partners/${id}`, { method: 'PUT', body: JSON.stringify(data), authenticated: true });
export const deletePartner = (id: number | string) => apiRequest<void>(`/admin/partners/${id}`, { method: 'DELETE', authenticated: true });
