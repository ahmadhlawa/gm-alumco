import type { Partner, ProductionProject, Project, Service, Testimonial } from '@/types';
import { defaultAboutPageContent } from '@/data/aboutPageContent';
import type { AboutPageContentDto, Locale, PartnerDto, ProductionProjectDto, ProjectDto, ServiceDto, SiteContentDto, TestimonialDto } from './types';

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
export const toProductionProjectView = (item: ProductionProjectDto, locale: Locale): ProductionProject => ({
  id: String(item.id),
  title: pick(locale, item.title_he, item.title_en),
  shortDescription: pick(locale, item.description_he, item.description_en),
  manufacturer: pick(locale, item.manufacturer_he, item.manufacturer_en),
  executionPartner: pick(locale, item.execution_partner_he, item.execution_partner_en),
  images: [...item.images]
    .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id)
    .map((image) => image.image_url),
});
export const toPartnerView = (item: PartnerDto, locale: Locale): Partner => ({ id: String(item.id), name: pick(locale, item.name_he, item.name_en), logo: item.logo_url });
export const toTestimonialView = (item: TestimonialDto, locale: Locale): Testimonial => ({
  id: String(item.id), name: pick(locale, item.client_name_he, item.client_name_en),
  role: pick(locale, item.client_position_he, item.client_position_en), company: '',
  content: pick(locale, item.message_he, item.message_en), rating: item.rating,
});

export function assembleSiteContent(rows: SiteContentDto[]): Record<string, unknown> {
  return Object.fromEntries(rows.filter((row) => row.key === 'content' && row.is_active).map((row) => [row.section, row.value]));
}

export interface AboutContentView {
  title: string;
  subtitle: string;
  paragraph1: string;
  paragraph2: string;
  bullets: string[];
  imageUrl: string;
  experienceNumber: string;
  experienceLabel: string;
  visionTitle: string;
  visionText: string;
  missionTitle: string;
  missionText: string;
}

// The Difference/Stats/CTA band is fixed website structure, not admin
// content — it is intentionally excluded from this view model. See
// components/sections that render it directly (CTASection, the About page's
// public_stats-driven stats grid), not about_page_content.
export const toAboutContentView = (dto: AboutPageContentDto, locale: Locale): AboutContentView => ({
  title: pick(locale, dto.title_he, dto.title_en),
  subtitle: pick(locale, dto.subtitle_he, dto.subtitle_en),
  paragraph1: pick(locale, dto.paragraph_1_he, dto.paragraph_1_en),
  paragraph2: pick(locale, dto.paragraph_2_he, dto.paragraph_2_en),
  bullets: [
    pick(locale, dto.bullet_1_he, dto.bullet_1_en),
    pick(locale, dto.bullet_2_he, dto.bullet_2_en),
    pick(locale, dto.bullet_3_he, dto.bullet_3_en),
    pick(locale, dto.bullet_4_he, dto.bullet_4_en),
  ],
  imageUrl: nonEmpty(dto.image_url) ?? defaultAboutPageContent.image_url ?? '',
  experienceNumber: dto.experience_number ?? '',
  experienceLabel: pick(locale, dto.experience_label_he, dto.experience_label_en),
  visionTitle: pick(locale, dto.vision_title_he, dto.vision_title_en),
  visionText: pick(locale, dto.vision_text_he, dto.vision_text_en),
  missionTitle: pick(locale, dto.mission_title_he, dto.mission_title_en),
  missionText: pick(locale, dto.mission_text_he, dto.mission_text_en),
});
