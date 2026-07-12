import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { EMPTY_PRODUCTION_PROJECT } from '@/components/forms/ProductionProjectForm';
import { LanguageProvider } from '@/i18n';
import {
  ProductionProjectFormPage,
  productionProjectPayload,
  StagedImagesManager,
} from './ProductionProjectFormPage';

describe('Production Project create flow', () => {
  it('shows the image section before the create action', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/admin/production-projects/new']}>
        <LanguageProvider>
          <ProductionProjectFormPage />
        </LanguageProvider>
      </MemoryRouter>,
    );

    expect(html).toContain('type="file"');
    expect(html.indexOf('type="file"')).toBeLessThan(html.indexOf('שמירת פרויקט ייצור'));
  });

  it('includes staged image URLs and their order in the create payload', () => {
    const payload = productionProjectPayload(EMPTY_PRODUCTION_PROJECT, [
      { image_url: 'https://x.test/first.jpg', alt_text_en: null, alt_text_he: null, sort_order: 0 },
      { image_url: 'https://x.test/second.jpg', alt_text_en: null, alt_text_he: null, sort_order: 1 },
    ]);

    expect(payload.images).toEqual([
      { image_url: 'https://x.test/first.jpg', alt_text_en: null, alt_text_he: null, sort_order: 0 },
      { image_url: 'https://x.test/second.jpg', alt_text_en: null, alt_text_he: null, sort_order: 1 },
    ]);
  });

  it('renders staged image previews with remove controls before creation', () => {
    const html = renderToStaticMarkup(
      <LanguageProvider>
        <StagedImagesManager
          images={[
            { image_url: 'https://x.test/preview.jpg', alt_text_en: null, alt_text_he: null, sort_order: 0 },
          ]}
          onChange={() => undefined}
          onUploadingChange={() => undefined}
          disabled={false}
        />
      </LanguageProvider>,
    );

    expect(html).toContain('https://x.test/preview.jpg');
    expect(html).toContain('title="מחיקה"');
  });
});
