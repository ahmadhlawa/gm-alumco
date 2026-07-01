import type { GalleryImage, Partner, Project, Service, Testimonial } from '@/types';
import type { GalleryDto, Locale, PartnerDto, ProjectDto, ServiceDto, SiteContentDto, TestimonialDto } from './types';

function nonEmpty(value: string | null | undefined): string | undefined {
  return value && value.trim() ? value : undefined;
}

// Production content is Hebrew + English only. Hebrew is the default/primary
// fallback, English is the secondary fallback.
function pick(locale: Locale, he: string | null, en: string | null): string {
  if (locale === 'en') return nonEmpty(en) ?? nonEmpty(he) ?? '';
  return nonEmpty(he) ?? nonEmpty(en) ?? '';
}

export const toServiceView = (item: ServiceDto, locale: Locale): Service => ({
  id: String(item.id), slug: String(item.id), title: pick(locale, item.title_he, item.title_en),
  shortDescription: pick(locale, item.description_he, item.description_en),
  description: pick(locale, item.description_he, item.description_en), image: item.image_url ?? '', benefits: [], applications: [],
});
export const toProjectView = (item: ProjectDto, locale: Locale): Project => ({
  id: String(item.id), slug: String(item.id), title: pick(locale, item.title_he, item.title_en), category: item.category,
  location: '', year: '', shortDescription: pick(locale, item.description_he, item.description_en),
  description: pick(locale, item.description_he, item.description_en), mainImage: item.main_image_url ?? '', images: [], featured: item.category === 'FEATURED', tags: [],
});
export const toGalleryView = (item: GalleryDto, locale: Locale): GalleryImage => ({
  id: String(item.id), url: item.image_url, alt: pick(locale, item.alt_text_he ?? item.title_he, item.alt_text_en ?? item.title_en), category: item.category ?? '',
});
export const toPartnerView = (item: PartnerDto, locale: Locale): Partner => ({ id: String(item.id), name: pick(locale, item.name_he, item.name_en), logo: item.logo_url });
export const toTestimonialView = (item: TestimonialDto, locale: Locale): Testimonial => ({
  id: String(item.id), name: pick(locale, item.client_name_he, item.client_name_en),
  role: pick(locale, item.client_position_he, item.client_position_en), company: '',
  content: pick(locale, item.message_he, item.message_en), rating: item.rating,
});

const PROJECT_CATEGORIES: ProjectDto['category'][] = ['LOCAL', 'INTERNATIONAL', 'FEATURED'];

// Maps the single-language admin form view-model back to the backend DTO.
// The admin form currently exposes one language input, so the entered title/
// description is written to both locale columns (the admin's own text, not
// fabricated). Category falls back to 'local' when not a valid enum value.
export function toProjectDto(view: Partial<Project>): Partial<ProjectDto> {
  const title = view.title ?? '';
  const description = view.description || view.shortDescription || '';
  const category: ProjectDto['category'] = view.featured
    ? 'FEATURED'
    : PROJECT_CATEGORIES.includes(view.category as ProjectDto['category'])
      ? (view.category as ProjectDto['category'])
      : 'LOCAL';

  const dto: Partial<ProjectDto> = {
    title_en: title,
    title_he: title,
    description_en: description || null,
    description_he: description || null,
    category
  };
  if (view.mainImage) dto.main_image_url = view.mainImage;
  return dto;
}

export function assembleSiteContent(rows: SiteContentDto[]): Record<string, unknown> {
  return Object.fromEntries(rows.filter((row) => row.key === 'content' && row.is_active).map((row) => [row.section, row.value]));
}
