import { apiRequest } from './client';
import type { HomepageVideoSectionDto } from './types';

export const getHomepageVideoSection = () =>
  apiRequest<HomepageVideoSectionDto>('/homepage-video-section');

export const getAdminHomepageVideoSection = () =>
  apiRequest<HomepageVideoSectionDto>('/admin/homepage-video-section', { authenticated: true });

export const updateHomepageVideoSection = (data: Partial<HomepageVideoSectionDto>) =>
  apiRequest<HomepageVideoSectionDto>('/admin/homepage-video-section', {
    method: 'PUT',
    body: JSON.stringify(data),
    authenticated: true,
  });
