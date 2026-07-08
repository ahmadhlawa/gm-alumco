export type CmsLocale = 'en' | 'he';

export type LocalizedText = {
  en: string;
  he: string;
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

export interface ProductionProject {
  id: string;
  title: string;
  shortDescription: string;
  manufacturer: string;
  executionPartner: string;
  images: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company?: string;
  content: string;
  rating?: number;
}

export interface Partner {
  id: string;
  name: string;
  logo: string;
}
