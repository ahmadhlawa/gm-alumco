import type {
  ContactMessage,
  GalleryImage,
  Product,
  Project,
  QuoteRequest,
  Service,
  Testimonial
} from '@/types';
import { galleryImages } from '@/data/gallery';
import { products } from '@/data/products';
import { projects } from '@/data/projects';
import { services } from '@/data/services';
import { testimonials } from '@/data/testimonials';

// TODO(backend): Replace this Promise-only adapter with the NestJS REST client.
const resolveAfter = <T>(value: T, delayMs: number): Promise<T> =>
  new Promise((resolve) => {
    setTimeout(() => resolve(value), delayMs);
  });

export function getProjects(): Promise<Project[]> {
  return resolveAfter(projects, 800);
}

export function createProject(data: Partial<Project>): Promise<Project> {
  return resolveAfter({ ...data, id: `proj-${Date.now()}` } as Project, 1000);
}

export function updateProject(id: string, data: Partial<Project>): Promise<Project> {
  return resolveAfter({ ...data, id } as Project, 1000);
}

export function deleteProject(_id: string): Promise<boolean> {
  return resolveAfter(true, 1000);
}

export function getServices(): Promise<Service[]> {
  return resolveAfter(services, 700);
}

export function getProducts(): Promise<Product[]> {
  return resolveAfter(products, 800);
}

export function getGalleryImages(): Promise<GalleryImage[]> {
  return resolveAfter(galleryImages, 1000);
}

export function getTestimonials(): Promise<Testimonial[]> {
  return resolveAfter(testimonials, 600);
}

export function submitContactMessage(_data: Partial<ContactMessage>): Promise<boolean> {
  // TODO(backend): POST validated contact data to /api/v1/contact-messages.
  return resolveAfter(true, 1200);
}

export function submitQuoteRequest(_data: Partial<QuoteRequest>): Promise<boolean> {
  // TODO(backend): POST the quote request and attachment references to the API.
  return resolveAfter(true, 1500);
}
