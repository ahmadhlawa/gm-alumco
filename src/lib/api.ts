import { Project, Service, Product, GalleryImage, Client, Testimonial, BlogPost, ContactMessage, QuoteRequest } from '@/types';
import { mockProjects } from '../data/projects';
import { mockServices } from '../data/services';
import { mockProducts, mockGallery, mockClients, mockTestimonials, mockBlogPosts } from '../data/entities';

// Simulate artificial delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getProjects(): Promise<Project[]> {
  await delay(800);
  return mockProjects;
}

export async function getFeaturedProjects(): Promise<Project[]> {
  await delay(600);
  return mockProjects.filter((p) => p.featured);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  await delay(500);
  return mockProjects.find((p) => p.slug === slug) || null;
}

export async function createProject(data: Partial<Project>): Promise<Project> {
  await delay(1000);
  // TODO: Replace mock implementation with real backend API integration later.
  return { ...data, id: `proj-${Date.now()}` } as Project;
}

export async function updateProject(id: string, data: Partial<Project>): Promise<Project> {
  await delay(1000);
  // TODO: Replace with real patch/put update
  return { ...data, id } as Project;
}

export async function deleteProject(id: string): Promise<boolean> {
  await delay(1000);
  // TODO: Replace with real delete
  return true;
}

export async function getServices(): Promise<Service[]> {
  await delay(700);
  return mockServices;
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  await delay(500);
  return mockServices.find((s) => s.slug === slug) || null;
}

export async function getProducts(): Promise<Product[]> {
  await delay(800);
  return mockProducts;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  await delay(500);
  return mockProducts.find((p) => p.slug === slug) || null;
}

export async function getGalleryImages(): Promise<GalleryImage[]> {
  await delay(1000);
  return mockGallery;
}

export async function getClients(): Promise<Client[]> {
  await delay(500);
  return mockClients;
}

export async function getTestimonials(): Promise<Testimonial[]> {
  await delay(600);
  return mockTestimonials;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  await delay(800);
  return mockBlogPosts;
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  await delay(500);
  return mockBlogPosts.find((b) => b.slug === slug) || null;
}

export async function submitContactMessage(data: Partial<ContactMessage>): Promise<boolean> {
  await delay(1200);
  // TODO: Connect to real messaging endpoint
  return true;
}

export async function submitQuoteRequest(data: Partial<QuoteRequest>): Promise<boolean> {
  await delay(1500);
  // TODO: Connect to backend quoting system
  return true;
}
