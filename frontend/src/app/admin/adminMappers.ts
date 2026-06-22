import type { ContactStatus, PartnerDto, ProjectDto, QuoteStatus } from '@/api/types';

export const PROJECT_CATEGORY_LABELS: Record<ProjectDto['category'], string> = {
  LOCAL: 'مشاريع داخل البلاد',
  INTERNATIONAL: 'مشاريع خارج البلاد',
  FEATURED: 'مشاريع مميزة',
};

export const CONTACT_STATUS_LABELS: Record<ContactStatus, string> = { NEW: 'جديد', READ: 'مقروء', ARCHIVED: 'مؤرشف' };
export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = { NEW: 'جديد', IN_PROGRESS: 'قيد المتابعة', DONE: 'منجز', ARCHIVED: 'مؤرشف' };

export interface PartnerFormValues { name: string; logo_url: string; website_url: string; is_active: boolean; sort_order: number }

export function partnerPayload(values: PartnerFormValues): Partial<PartnerDto> {
  const name = values.name.trim();
  return { name_ar: name, name_en: name, name_he: name, logo_url: values.logo_url.trim(), website_url: values.website_url.trim() || null, is_active: values.is_active, sort_order: values.sort_order };
}
