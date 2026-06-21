import type { Locale } from '@/api/types';
import { toGalleryView, toPartnerView, toProductView, toProjectView, toServiceView, toTestimonialView } from '@/api/adapters';
import { listGallery } from '@/api/gallery';
import { listPartners } from '@/api/partners';
import { listProducts } from '@/api/products';
import { listProjects } from '@/api/projects';
import { listServices } from '@/api/services';
import { listTestimonials } from '@/api/testimonials';
export { submitContactMessage, submitQuoteRequest } from '@/api/messages';

export const getProjects = async (locale: Locale = 'ar') => (await listProjects()).map((item) => toProjectView(item, locale));
export const getServices = async (locale: Locale = 'ar') => (await listServices()).map((item) => toServiceView(item, locale));
export const getProducts = async (locale: Locale = 'ar') => (await listProducts()).map((item) => toProductView(item, locale));
export const getGalleryImages = async (locale: Locale = 'ar') => (await listGallery()).map((item) => toGalleryView(item, locale));
export const getTestimonials = async (locale: Locale = 'ar') => (await listTestimonials()).map((item) => toTestimonialView(item, locale));
export const getPartners = async (locale: Locale = 'ar') => (await listPartners()).map((item) => toPartnerView(item, locale));
