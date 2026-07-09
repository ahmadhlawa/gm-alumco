import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { About } from './About';
import { LanguageProvider } from '@/i18n';
import { defaultCompanyNumbers } from '@/data/publicStats';

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

  it('renders the Difference/Stats/CTA band from the fixed public_stats + CTASection defaults, not about_page_content', () => {
    // Same no-effects render as above: the stats grid falls back to
    // defaultPublicStats (a different module from about_page_content's
    // fallback), and <CTASection /> is called with no props at all, so it
    // shows its own hardcoded default copy. This is the fixed-in-code
    // implementation the Difference/Stats/CTA band must keep using.
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <LanguageProvider>
          <About />
        </LanguageProvider>
      </MemoryRouter>,
    );

    // Stats grid: defaultCompanyNumbers labels (public_stats source).
    expect(html).toContain('פרויקטים שהושלמו');
    expect(html).toContain('שנות אחריות');
    // CTASection's own internal default title (no props passed from About).
    expect(html).toContain('האם יש לך פרויקט חדש? תן לנו לעזור לך לממש אותו.');
  });

  it('renders the Experience card from Company Numbers (public_stats), not from about_page_content', () => {
    // The Experience card used to duplicate this value in about_page_content
    // (experience_number/experience_label_*). It now reads exclusively from
    // publicStats.aboutHighlight, which is projected from the same
    // yearsExperience Company Number shown on the Home page and edited only
    // on the Company Numbers admin page — there is a single source of truth.
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <LanguageProvider>
          <About />
        </LanguageProvider>
      </MemoryRouter>,
    );

    expect(html).toContain(defaultCompanyNumbers.yearsExperience.value);
    expect(html).toContain(defaultCompanyNumbers.yearsExperience.labelHe);
  });
});
