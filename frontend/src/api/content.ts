import { normalizePublicStatsContent, type PublicStatsContent } from '@/data/publicStats';
import { apiRequest } from './client'; import type { SiteContentDto, SiteSettingDto } from './types';
export const listSiteContent = () => apiRequest<SiteContentDto[]>('/site-content');
export const getSiteContentSection = (section: string) => apiRequest<SiteContentDto[]>(`/site-content/${section}`);
export const listSiteSettings = () => apiRequest<SiteSettingDto[]>('/site-settings');
export const listAdminSiteContent = () => apiRequest<SiteContentDto[]>('/admin/site-content', { authenticated: true });
export const createSiteContent = (data: Partial<SiteContentDto>) => apiRequest<SiteContentDto>('/admin/site-content', { method: 'POST', body: JSON.stringify(data), authenticated: true });
export const updateSiteContent = (id: number, data: Partial<SiteContentDto>) => apiRequest<SiteContentDto>(`/admin/site-content/${id}`, { method: 'PUT', body: JSON.stringify(data), authenticated: true });
export const deleteSiteContent = (id: number) => apiRequest<void>(`/admin/site-content/${id}`, { method: 'DELETE', authenticated: true });
export const listAdminSiteSettings = () => apiRequest<SiteSettingDto[]>('/admin/site-settings', { authenticated: true });
export const createSiteSetting = (data: Partial<SiteSettingDto>) => apiRequest<SiteSettingDto>('/admin/site-settings', { method: 'POST', body: JSON.stringify(data), authenticated: true });
export const updateSiteSetting = (id: number, data: Partial<SiteSettingDto>) => apiRequest<SiteSettingDto>(`/admin/site-settings/${id}`, { method: 'PUT', body: JSON.stringify(data), authenticated: true });
export const deleteSiteSetting = (id: number) => apiRequest<void>(`/admin/site-settings/${id}`, { method: 'DELETE', authenticated: true });

export async function getPublicStatsContent(): Promise<PublicStatsContent> {
  const rows = await getSiteContentSection('public_stats');
  const row = rows.find((item) => item.key === 'content' && item.is_active);
  return normalizePublicStatsContent(row?.value);
}
