import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LanguageProvider } from '@/i18n';
import { ProductionProjectCard } from './ProductionProjectCard';
import type { ProductionProject } from '@/types';

const project: ProductionProject = {
  id: '1',
  title: 'Factory facade',
  shortDescription: 'Precision aluminum production for a premium facade.',
  manufacturer: 'T.A.S Factory',
  executionPartner: 'Install Partner',
  images: ['/uploads/production-projects/one.webp', '/uploads/production-projects/two.webp'],
};

describe('ProductionProjectCard', () => {
  it('keeps a fixed image area and shows accessible dots only for multiple images', () => {
    const html = renderToStaticMarkup(
      <LanguageProvider>
        <ProductionProjectCard project={project} index={1} />
      </LanguageProvider>,
    );

    expect(html).toContain('aspect-[16/10]');
    expect(html).not.toContain('aria-label="Next image"');
    expect(html).not.toContain('aria-label="Previous image"');
    expect(html).toContain('aria-label="הצגת תמונה 1"');
    expect(html).toContain('aria-current="true"');
    expect(html).toContain('lg:flex-row-reverse');
  });

  it('does not render carousel controls for a single image', () => {
    const html = renderToStaticMarkup(
      <LanguageProvider>
        <ProductionProjectCard project={{ ...project, images: [project.images[0]] }} index={0} />
      </LanguageProvider>,
    );

    expect(html).not.toContain('aria-label="Show image 1"');
    expect(html).not.toContain('aria-current');
  });
});
