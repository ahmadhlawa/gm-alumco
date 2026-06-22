import { apiRequest } from './client';

export interface DashboardStats {
  projects: number;
  services: number;
  products: number;
  gallery: number;
  partners: number;
  testimonials: number;
  contact_messages: Record<string, number>;
  quote_requests: Record<string, number>;
}

export const getDashboardStats = () =>
  apiRequest<DashboardStats>('/admin/dashboard/stats', { authenticated: true });
