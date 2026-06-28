import type { GalleryImage, Partner, Product, Project, Service, Testimonial } from '@/types';
import type { GalleryDto, Locale, PartnerDto, ProductDto, ProjectDto, ServiceDto, SiteContentDto, TestimonialDto } from './types';

function nonEmpty(value: string | null | undefined): string | undefined {
  return value && value.trim() ? value : undefined;
}

function pick(locale: Locale, ar: string | null, en: string | null, he: string | null): string {
  if (locale === 'he') return nonEmpty(he) ?? nonEmpty(en) ?? nonEmpty(ar) ?? '';
  if (locale === 'en') return nonEmpty(en) ?? nonEmpty(he) ?? nonEmpty(ar) ?? '';
  return nonEmpty(ar) ?? nonEmpty(he) ?? nonEmpty(en) ?? '';
}

export const toServiceView = (item: ServiceDto, locale: Locale): Service => ({
  id: String(item.id), slug: String(item.id), title: pick(locale, item.title_ar, item.title_en, item.title_he),
  shortDescription: pick(locale, item.description_ar, item.description_en, item.description_he),
  description: pick(locale, item.description_ar, item.description_en, item.description_he), image: item.image_url ?? '', benefits: [], applications: [],
});
export const toProjectView = (item: ProjectDto, locale: Locale): Project => ({
  id: String(item.id), slug: String(item.id), title: pick(locale, item.title_ar, item.title_en, item.title_he), category: item.category,
  location: '', year: '', shortDescription: pick(locale, item.description_ar, item.description_en, item.description_he),
  description: pick(locale, item.description_ar, item.description_en, item.description_he), mainImage: item.main_image_url ?? '', images: [], featured: item.category === 'FEATURED', tags: [],
});
export const toProductView = (item: ProductDto, locale: Locale): Product => ({
  id: String(item.id), slug: String(item.id), title: pick(locale, item.title_ar, item.title_en, item.title_he), category: '', image: item.image_url ?? '', gallery: [],
  description: pick(locale, item.description_ar, item.description_en, item.description_he), features: [], specs: {}, suitableFor: [],
});
export const toGalleryView = (item: GalleryDto, locale: Locale): GalleryImage => ({
  id: String(item.id), url: item.image_url, alt: pick(locale, item.alt_text_ar ?? item.title_ar, item.alt_text_en ?? item.title_en, item.alt_text_he ?? item.title_he), category: item.category ?? '',
});
export const toPartnerView = (item: PartnerDto, locale: Locale): Partner => ({ id: String(item.id), name: pick(locale, item.name_ar, item.name_en, item.name_he), logo: item.logo_url });
export const toTestimonialView = (item: TestimonialDto, locale: Locale): Testimonial => ({
  id: String(item.id), name: pick(locale, item.client_name_ar, item.client_name_en, item.client_name_he),
  role: pick(locale, item.client_position_ar, item.client_position_en, item.client_position_he), company: '',
  content: pick(locale, item.message_ar, item.message_en, item.message_he), rating: undefined,
});

const PROJECT_CATEGORIES: ProjectDto['category'][] = ['LOCAL', 'INTERNATIONAL', 'FEATURED'];

// Maps the single-language admin form view-model back to the backend DTO.
// The admin form currently exposes one language input, so the entered title/
// description is written to all three locale columns (the admin's own text,
// not fabricated). Category falls back to 'local' when not a valid enum value.
export function toProjectDto(view: Partial<Project>): Partial<ProjectDto> {
  const title = view.title ?? '';
  const description = view.description || view.shortDescription || '';
  const category: ProjectDto['category'] = view.featured
    ? 'FEATURED'
    : PROJECT_CATEGORIES.includes(view.category as ProjectDto['category'])
      ? (view.category as ProjectDto['category'])
      : 'LOCAL';

  const dto: Partial<ProjectDto> = {
    title_ar: title,
    title_en: title,
    title_he: title,
    description_ar: description || null,
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
