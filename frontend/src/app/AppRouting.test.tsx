import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { LanguageProvider } from '@/i18n';
import { PublicSiteRoutes } from './App';

describe('public routing', () => {
  it('renders the standalone production page route', () => {
    const html = renderToStaticMarkup(
      <LanguageProvider>
        <MemoryRouter initialEntries={['/production']}>
          <PublicSiteRoutes />
        </MemoryRouter>
      </LanguageProvider>,
    );

    expect(html).toContain('data-page="production-projects"');
    expect(html).not.toContain('Page not found');
  });

  it('renders a real 404 screen for unknown public routes', () => {
    const html = renderToStaticMarkup(
      <LanguageProvider>
        <MemoryRouter initialEntries={['/missing-route-qa']}>
          <PublicSiteRoutes />
        </MemoryRouter>
      </LanguageProvider>,
    );

    expect(html).toContain('\u05d4\u05d3\u05e3 \u05dc\u05d0 \u05e0\u05de\u05e6\u05d0');
    expect(html).toContain('\u05d7\u05d6\u05e8\u05d4 \u05dc\u05d3\u05e3 \u05d4\u05d1\u05d9\u05ea');
  });
});
