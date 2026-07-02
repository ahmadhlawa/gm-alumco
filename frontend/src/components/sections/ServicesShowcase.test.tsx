import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type React from 'react';
import { LanguageProvider, PUBLIC_LANGUAGE_STORAGE_KEY } from '@/i18n';
import type { Service } from '@/types';
import { ServicesShowcase, getServiceSlideIndex } from './ServicesShowcase';

const service: Service = {
  id: '7',
  slug: 'curtain-wall',
  title: 'קירות מסך',
  shortDescription: 'פתרונות הנדסיים לחזיתות מודרניות.',
  description: 'פרטי השירות',
  image: 'https://example.com/service.jpg',
  benefits: [],
};

function renderWithLanguage(children: React.ReactNode, language: 'he' | 'en' = 'he') {
  vi.stubGlobal('window', {
    localStorage: {
      getItem: (key: string) => key === PUBLIC_LANGUAGE_STORAGE_KEY ? language : null,
      setItem: vi.fn(),
    },
  });
  return renderToStaticMarkup(
    <MemoryRouter>
      <LanguageProvider>{children}</LanguageProvider>
    </MemoryRouter>,
  );
}

describe('ServicesShowcase', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the homepage anchor and real service content', () => {
    const html = renderWithLanguage(
      <ServicesShowcase
        services={[service]}
        title="השירותים שלנו"
        subtitle="פתרונות משולבים"
        emptyMessage="אין שירותים"
        actionLabel="בקש ייעוץ"
      />,
    );

    expect(html).toContain('id="services"');
    expect(html).toContain('קירות מסך');
    expect(html).toContain('https://example.com/service.jpg');
    expect(html).toContain('href="/contact"');
  });

  it('renders a branded empty state when the API returns no services', () => {
    const html = renderWithLanguage(
      <ServicesShowcase
        services={[]}
        title="השירותים שלנו"
        subtitle="פתרונות משולבים"
        emptyMessage="אין שירותים זמינים כרגע"
        actionLabel="בקש ייעוץ"
      />,
    );

    expect(html).toContain('אין שירותים זמינים כרגע');
  });

  it('wraps slider navigation in both directions', () => {
    expect(getServiceSlideIndex(2, 3, 1)).toBe(0);
    expect(getServiceSlideIndex(0, 3, -1)).toBe(2);
    expect(getServiceSlideIndex(0, 0, 1)).toBe(0);
  });

  it('renders direction-aware markup in English', () => {
    const html = renderWithLanguage(
      <ServicesShowcase
        services={[service, { ...service, id: '8', title: 'Second service' }]}
        title="Services"
        subtitle="Integrated solutions"
        emptyMessage="No services"
        actionLabel="Request consultation"
      />,
      'en',
    );

    expect(html).toContain('id="services"');
    expect(html).toContain('dir="ltr"');
    expect(html).toContain('text-left');
    expect(html).toContain('aria-label="Previous service"');
    expect(html).toContain('aria-label="Next service"');
  });
});
