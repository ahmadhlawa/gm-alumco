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

  it('does not expose the Difference & Stats group — it is fixed website structure', () => {
    const html = renderToStaticMarkup(
      <LanguageProvider>
        <AdminAboutContent />
      </LanguageProvider>,
    );

    // Section header and field labels for the removed group.
    expect(html).not.toContain('Difference & Stats');
    expect(html).not.toContain('ההבדל שלנו וסטטיסטיקות');
    // CTA button link field.
    expect(html).not.toContain('Button link');
    expect(html).not.toContain('קישור כפתור');
    // Stat number/label fields.
    expect(html).not.toMatch(/Stat \d — (number|label)/);
    expect(html).not.toMatch(/סטטיסטיקה \d/);
  });

  it('does not expose the Experience fields — they are edited on the Company Numbers page', () => {
    const html = renderToStaticMarkup(
      <LanguageProvider>
        <AdminAboutContent />
      </LanguageProvider>,
    );

    expect(html).not.toContain('Experience number');
    expect(html).not.toContain('מספר ותק');
    expect(html).not.toContain('Experience label');
    expect(html).not.toContain('תווית ותק');
  });
});
