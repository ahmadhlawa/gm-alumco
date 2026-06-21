import { apiRequest } from './client'; import type { GalleryDto } from './types';
export const listGallery = () => apiRequest<GalleryDto[]>('/gallery');
export const listAdminGallery = () => apiRequest<GalleryDto[]>('/admin/gallery', { authenticated: true });
export const createGalleryImage = (data: Partial<GalleryDto>) => apiRequest<GalleryDto>('/admin/gallery', { method: 'POST', body: JSON.stringify(data), authenticated: true });
export const updateGalleryImage = (id: number | string, data: Partial<GalleryDto>) => apiRequest<GalleryDto>(`/admin/gallery/${id}`, { method: 'PUT', body: JSON.stringify(data), authenticated: true });
export const deleteGalleryImage = (id: number | string) => apiRequest<void>(`/admin/gallery/${id}`, { method: 'DELETE', authenticated: true });
