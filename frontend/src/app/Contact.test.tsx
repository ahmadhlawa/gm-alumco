import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { LanguageProvider } from '@/i18n';
import { Contact } from './Contact';

describe('Contact location section', () => {
  it('renders the premium address card with a direct Google Maps link', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <LanguageProvider>
          <Contact />
        </LanguageProvider>
      </MemoryRouter>,
    );

    expect(html).toContain('Isefya, Abu Hushi Street 5');
    expect(html).toContain('TECHNO ALUM SYSTEM');
    expect(html).not.toContain('GM Alumco');
    expect(html).toContain('עוספיא, רח׳ אבא חושי 5');
    expect(html).toContain('href="https://maps.app.goo.gl/pYcDJeSKoVqDzdrP7"');
    expect(html).toContain('Open in Google Maps');
    expect(html).not.toContain('[Google Maps Placeholder]');
    expect(html).not.toContain('<iframe');
  });
});
