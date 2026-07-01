import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider, PUBLIC_LANGUAGE_STORAGE_KEY } from '@/i18n';
import { QuoteRequestForm } from './QuoteRequestForm';

function renderInEnglish() {
  vi.stubGlobal('window', {
    localStorage: {
      getItem: (key: string) => key === PUBLIC_LANGUAGE_STORAGE_KEY ? 'en' : null,
      setItem: vi.fn(),
    },
  });
  return renderToStaticMarkup(
    <LanguageProvider>
      <QuoteRequestForm />
    </LanguageProvider>,
  );
}

describe('QuoteRequestForm public localization', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders English field labels without Arabic public labels in English mode', () => {
    const html = renderInEnglish();

    expect(html).toContain('Full name');
    expect(html).toContain('Email');
    expect(html).toContain('Project type');
    expect(html).toContain('Submit quote request');
    expect(html).not.toContain('Ø§Ù');
  });
});
