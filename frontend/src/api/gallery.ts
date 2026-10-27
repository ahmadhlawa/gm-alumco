import { apiRequest } from './client';

export type GalleryLocation = 'LOCAL' | 'INTERNATIONAL';

export interface GalleryImageDto {
  id: number;
  image_url: string;
  title_en: string | null;
  title_he: string | null;
  alt_text_en: string | null;
  alt_text_he: string | null;
  category: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface NewGalleryImage {
  image_url: string;
  category: GalleryLocation;
  is_active: boolean;
  sort_order: number;
}

export const listGalleryImages = () =>
  apiRequest<GalleryImageDto[]>('/gallery');

export const listAdminGalleryImages = () =>
  apiRequest<GalleryImageDto[]>('/admin/gallery', { authenticated: true });

export const createGalleryImage = (data: NewGalleryImage) =>
  apiRequest<GalleryImageDto>('/admin/gallery', {
    method: 'POST',
    body: JSON.stringify(data),
    authenticated: true,
  });

export const updateGalleryImage = (
  id: number,
  data: Partial<Pick<GalleryImageDto, 'category' | 'is_active' | 'sort_order'>>,
) =>
  apiRequest<GalleryImageDto>('/admin/gallery/' + id, {
    method: 'PUT',
    body: JSON.stringify(data),
    authenticated: true,
  });
