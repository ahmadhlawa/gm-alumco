import type { Locale } from '@/api/types';
import { toGalleryView, toPartnerView, toProjectView, toServiceView, toTestimonialView } from '@/api/adapters';
import { listGallery } from '@/api/gallery';
import { listPartners } from '@/api/partners';
import { listProjects } from '@/api/projects';
import { listServices } from '@/api/services';
import { listTestimonials } from '@/api/testimonials';
export { submitContactMessage, submitQuoteRequest } from '@/api/messages';

export const getProjects = async (locale: Locale = 'he') => (await listProjects()).map((item) => toProjectView(item, locale));
export const getServices = async (locale: Locale = 'he') => (await listServices()).map((item) => toServiceView(item, locale));
export const getGalleryImages = async (locale: Locale = 'he') => (await listGallery()).map((item) => toGalleryView(item, locale));
export const getTestimonials = async (locale: Locale = 'he') => (await listTestimonials()).map((item) => toTestimonialView(item, locale));
export const getPartners = async (locale: Locale = 'he') => (await listPartners()).map((item) => toPartnerView(item, locale));
