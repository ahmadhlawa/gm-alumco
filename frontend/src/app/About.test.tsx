import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { About } from './About';
import { LanguageProvider } from '@/i18n';

describe('About page', () => {
  it('renders the hardcoded fallback content when the API has not resolved', () => {
    // renderToStaticMarkup does not run effects, so getAboutPageContent never
    // fires — the page renders its synchronous initial state, which is the
    // defaultAboutPageContent fallback. This is the same state a failed fetch
    // would produce, so it doubles as the "API fails" acceptance check.
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <LanguageProvider>
          <About />
        </LanguageProvider>
      </MemoryRouter>,
    );

    expect(html).toContain('סיפור ההצלחה שלנו');
    expect(html).toContain('החזון שלנו');
    expect(html).toContain('המשימה שלנו');
    expect(html).toContain('/images/our-success-story.png');
  });
});
