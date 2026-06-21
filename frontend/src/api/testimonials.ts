import { apiRequest } from './client'; import type { TestimonialDto } from './types';
export const listTestimonials = () => apiRequest<TestimonialDto[]>('/testimonials');
export const listAdminTestimonials = () => apiRequest<TestimonialDto[]>('/admin/testimonials', { authenticated: true });
export const createTestimonial = (data: Partial<TestimonialDto>) => apiRequest<TestimonialDto>('/admin/testimonials', { method: 'POST', body: JSON.stringify(data), authenticated: true });
export const updateTestimonial = (id: number | string, data: Partial<TestimonialDto>) => apiRequest<TestimonialDto>(`/admin/testimonials/${id}`, { method: 'PUT', body: JSON.stringify(data), authenticated: true });
export const deleteTestimonial = (id: number | string) => apiRequest<void>(`/admin/testimonials/${id}`, { method: 'DELETE', authenticated: true });
