import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { LanguageProvider } from '@/i18n';
import { Navbar } from './Navbar';

describe('Navbar language switcher', () => {
  it('offers English from the default Hebrew public language and never offers Arabic', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <LanguageProvider>
          <Navbar />
        </LanguageProvider>
      </MemoryRouter>,
    );

    expect(html).toContain('>EN<');
    expect(html).not.toContain('>AR<');
    expect(html).not.toContain('العربية');
  });
});
