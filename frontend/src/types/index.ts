export type CmsLocale = 'ar' | 'en' | 'he';

export type LocalizedText = {
  ar: string;
  en: string;
  he: string;
};

export type LocalizedFields<T, K extends keyof T> = Omit<T, K> & {
  [P in K]: LocalizedText;
};

export interface Service {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  image: string;
  benefits: string[];
  applications?: string[];
  seoTitle?: string;
  seoDescription?: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  category: string;
  location: string;
  year: string;
  shortDescription?: string;
  description?: string;
  mainImage: string;
  images: string[];
  featured?: boolean;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  challenge?: string;
  solution?: string;
  result?: string;
  scope?: string[];
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  category: string;
  image: string;
  gallery: string[];
  description: string;
  features: string[];
  specs: Record<string, string>;
  suitableFor: string[];
  seoTitle?: string;
  seoDescription?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company?: string;
  content: string;
  rating?: number;
}

export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  category: string;
}

export interface Partner {
  id: string;
  name: string;
  logo: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  projectType?: string;
  date: string;
  status: 'new' | 'read' | 'replied';
}

export interface QuoteRequest {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  projectType: string;
  serviceType: string;
  location: string;
  approximateArea: string;
  notes: string;
  date: string;
  status: 'new' | 'reviewed' | 'quoted' | 'rejected';
}
