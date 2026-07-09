import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AdminAboutContent } from './AdminAboutContent';
import { LanguageProvider } from '@/i18n';

describe('AdminAboutContent page', () => {
  it('shows character counters for text fields', () => {
    const html = renderToStaticMarkup(
      <LanguageProvider>
        <AdminAboutContent />
      </LanguageProvider>,
    );

    // Title field defaults to the seeded "סיפור ההצלחה שלנו" (17 chars) with
    // a 60-char limit, so its counter reads "17/60".
    expect(html).toContain('17/60');
  });

  it('exposes only Hebrew and English inputs, never Arabic', () => {
    const html = renderToStaticMarkup(
      <LanguageProvider>
        <AdminAboutContent />
      </LanguageProvider>,
    );

    expect(html).not.toMatch(/_ar\b/);
    expect(html).not.toMatch(/ערבית/);
    expect(html).not.toMatch(/Arabic/i);
  });
});
