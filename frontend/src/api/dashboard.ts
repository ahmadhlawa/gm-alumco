import { apiRequest } from './client';

export interface DashboardStats {
  projects: number;
  local_projects: number;
  international_projects: number;
  featured_projects: number;
  services: number;
  partners: number;
  contact_messages: Record<string, number>;
  quote_requests: Record<string, number>;
  unread_contact_messages: number;
  unread_quote_requests: number;
}

export const getDashboardStats = () =>
  apiRequest<DashboardStats>('/admin/dashboard/stats', { authenticated: true });
