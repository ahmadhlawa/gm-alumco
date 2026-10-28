import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { LanguageProvider } from '@/i18n';
import type { Project } from '@/types';
import { FeaturedProjectsShowcase } from './FeaturedProjectsShowcase';

const render = (projects: Project[]) =>
  renderToStaticMarkup(
    <MemoryRouter>
      <LanguageProvider>
        <FeaturedProjectsShowcase projects={projects} />
      </LanguageProvider>
    </MemoryRouter>,
  );

describe('homepage project showcase', () => {
  it('guides visitors to all projects without a coming-soon placeholder when empty', () => {
    const html = render([]);
    expect(html).toContain('href="/projects"');
    expect(html).toContain('כל הפרויקטים');
    expect(html).not.toContain('הפרויקטים שלנו יתווספו בקרוב');
  });

  it('preserves detailed project content and includes the all-projects CTA', () => {
    const html = render([
      {
        id: '1',
        slug: '1',
        title: 'Existing project',
        category: 'LOCAL',
        location: '',
        year: '',
        mainImage: '/images/backgrounds/tas-bg-projects.webp',
        images: [],
        featured: true,
      },
    ]);
    expect(html).toContain('Existing project');
    expect(html).toContain('href="/projects"');
  });
});
