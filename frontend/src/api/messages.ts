import { apiRequest } from './client'; import type { ContactMessageDto, ContactStatus, QuoteRequestDto, QuoteStatus } from './types';
export const submitContactMessage = (data: Partial<ContactMessageDto>) => apiRequest<ContactMessageDto>('/contact/messages', { method: 'POST', body: JSON.stringify(data) });
export const submitQuoteRequest = (data: Partial<QuoteRequestDto>) => apiRequest<QuoteRequestDto>('/quote-requests', { method: 'POST', body: JSON.stringify(data) });
export const listContactMessages = () => apiRequest<ContactMessageDto[]>('/admin/contact-messages', { authenticated: true });
export const updateContactStatus = (id: number, status: ContactStatus) => apiRequest<ContactMessageDto>(`/admin/contact-messages/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }), authenticated: true });
export const deleteContactMessage = (id: number) => apiRequest<void>(`/admin/contact-messages/${id}`, { method: 'DELETE', authenticated: true });
export const listQuoteRequests = () => apiRequest<QuoteRequestDto[]>('/admin/quote-requests', { authenticated: true });
export const updateQuoteStatus = (id: number, status: QuoteStatus) => apiRequest<QuoteRequestDto>(`/admin/quote-requests/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }), authenticated: true });
export const deleteQuoteRequest = (id: number) => apiRequest<void>(`/admin/quote-requests/${id}`, { method: 'DELETE', authenticated: true });
