import { apiRequest } from './client';
import type { AboutPageContentDto } from './types';

export const getAboutPageContent = () =>
  apiRequest<AboutPageContentDto>('/about-page-content');

export const getAdminAboutPageContent = () =>
  apiRequest<AboutPageContentDto>('/admin/about-page-content', { authenticated: true });

export const updateAboutPageContent = (data: Partial<AboutPageContentDto>) =>
  apiRequest<AboutPageContentDto>('/admin/about-page-content', {
    method: 'PUT',
    body: JSON.stringify(data),
    authenticated: true,
  });
