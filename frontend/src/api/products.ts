import { apiRequest } from './client'; import type { ProductDto } from './types';
export const listProducts = () => apiRequest<ProductDto[]>('/products');
export const getProduct = (id: number | string) => apiRequest<ProductDto>(`/products/${id}`);
export const listAdminProducts = () => apiRequest<ProductDto[]>('/admin/products', { authenticated: true });
export const createProduct = (data: Partial<ProductDto>) => apiRequest<ProductDto>('/admin/products', { method: 'POST', body: JSON.stringify(data), authenticated: true });
export const updateProduct = (id: number | string, data: Partial<ProductDto>) => apiRequest<ProductDto>(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data), authenticated: true });
export const deleteProduct = (id: number | string) => apiRequest<void>(`/admin/products/${id}`, { method: 'DELETE', authenticated: true });
