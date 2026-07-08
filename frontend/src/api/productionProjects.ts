import { apiRequest } from './client';
import type { ProductionProjectDto, ProductionProjectImageDto } from './types';

export const listProductionProjects = () => apiRequest<ProductionProjectDto[]>('/production-projects');
export const getProductionProject = (id: number | string) => apiRequest<ProductionProjectDto>(`/production-projects/${id}`);
export const listAdminProductionProjects = () => apiRequest<ProductionProjectDto[]>('/admin/production-projects', { authenticated: true });
export const getAdminProductionProject = (id: number | string) => apiRequest<ProductionProjectDto>(`/admin/production-projects/${id}`, { authenticated: true });
export const createProductionProject = (data: Partial<ProductionProjectDto>) => apiRequest<ProductionProjectDto>('/admin/production-projects', { method: 'POST', body: JSON.stringify(data), authenticated: true });
export const updateProductionProject = (id: number | string, data: Partial<ProductionProjectDto>) => apiRequest<ProductionProjectDto>(`/admin/production-projects/${id}`, { method: 'PUT', body: JSON.stringify(data), authenticated: true });
export const deleteProductionProject = (id: number | string) => apiRequest<void>(`/admin/production-projects/${id}`, { method: 'DELETE', authenticated: true });
export const addProductionProjectImage = (id: number | string, data: Partial<ProductionProjectImageDto>) => apiRequest<ProductionProjectImageDto>(`/admin/production-projects/${id}/images`, { method: 'POST', body: JSON.stringify(data), authenticated: true });
export const deleteProductionProjectImage = (id: number | string) => apiRequest<void>(`/admin/production-project-images/${id}`, { method: 'DELETE', authenticated: true });
