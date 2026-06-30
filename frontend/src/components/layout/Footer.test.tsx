import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type React from 'react';
import { LanguageProvider, PUBLIC_LANGUAGE_STORAGE_KEY } from '@/i18n';
import type { Service } from '@/types';
import { Footer, FooterServices } from './Footer';

const service = (id: string, slug: string, title: string): Service => ({
  id,
  slug,
  title,
  shortDescription: '',
  description: '',
  image: '',
  benefits: [],
});

function renderWithLanguage(children: React.ReactNode, language: 'he' | 'en' = 'he') {
  vi.stubGlobal('window', {
    localStorage: {
      getItem: (key: string) => (key === PUBLIC_LANGUAGE_STORAGE_KEY ? language : null),
      setItem: vi.fn(),
    },
  });
  return renderToStaticMarkup(
    <MemoryRouter>
      <LanguageProvider>{children}</LanguageProvider>
    </MemoryRouter>,
  );
}

describe('Footer services (backend-driven)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('no longer renders any hardcoded/mock services', () => {
    const html = renderWithLanguage(<Footer />);

    // The footer still shows the Services heading...
    expect(html).toContain('שירותים');
    // ...but none of the old mock service names or slugs remain.
    expect(html).not.toContain('/services/curtain-walls');
    expect(html).not.toContain('/services/windows-doors');
    expect(html).not.toContain('/services/pergolas');
    expect(html).not.toContain('/services/handrails');
    expect(html).not.toContain('/services/aluminum-cladding');
    expect(html).not.toContain('פרגולות וסוככים');
    expect(html).not.toContain('Pergolas and shades');
  });

  it('renders only the services it is given, linking to the real service route', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <FooterServices
          services={[service('5', '5', 'קירות מסך'), service('9', '9', 'מעקות זכוכית')]}
          loaded
          heading="שירותים"
          emptyLabel="אין שירותים זמינים כרגע."
        />
      </MemoryRouter>,
    );

    expect(html).toContain('קירות מסך');
    expect(html).toContain('מעקות זכוכית');
    expect(html).toContain('href="/services/5"');
    expect(html).toContain('href="/services/9"');
    // No fabricated empty state when services exist.
    expect(html).not.toContain('אין שירותים זמינים');
  });

  it('shows a clean empty state (not fake services) when the DB returns none', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <FooterServices services={[]} loaded heading="שירותים" emptyLabel="אין שירותים זמינים כרגע." />
      </MemoryRouter>,
    );

    expect(html).toContain('אין שירותים זמינים כרגע.');
    expect(html).not.toContain('<ul');
  });

  it('renders neither a list nor an empty state while services are still loading', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <FooterServices services={[]} loaded={false} heading="שירותים" emptyLabel="אין שירותים זמינים כרגע." />
      </MemoryRouter>,
    );

    expect(html).toContain('שירותים');
    expect(html).not.toContain('אין שירותים זמינים');
    expect(html).not.toContain('<ul');
  });
});
