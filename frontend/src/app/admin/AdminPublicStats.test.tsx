import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LanguageProvider } from '@/i18n';
import { AdminPublicStats } from './AdminPublicStats';

// renderToStaticMarkup does not run effects, so no API call fires; the form
// renders its default (Hebrew) state, which is exactly what we assert on.
function render() {
  return renderToStaticMarkup(
    <LanguageProvider>
      <AdminPublicStats />
    </LanguageProvider>,
  );
}

describe('AdminPublicStats — Company Numbers page', () => {
  it('renders the simplified Hebrew page title', () => {
    expect(render()).toContain('נתוני החברה');
  });

  it('shows both Hebrew and English label fields for each number', () => {
    const html = render();
    // Hebrew labels
    expect(html).toContain('פרויקטים שהושלמו');
    expect(html).toContain('שנות ניסיון');
    expect(html).toContain('שנות אחריות');
    // English labels
    expect(html).toContain('Completed projects');
    expect(html).toContain('Years of experience');
    expect(html).toContain('Years warranty');
  });

  it('never exposes Arabic in the admin UI', () => {
    const html = render();
    for (const arabic of ['مشروع منجز', 'سنوات خبرة', 'سنوات ضمان', 'منجز', 'سنوات']) {
      expect(html).not.toContain(arabic);
    }
  });

  it('removes the active checkbox, suffix and sort order fields', () => {
    const html = render();
    expect(html).not.toContain('type="checkbox"');
    expect(html).not.toContain('suffix');
    expect(html.toLowerCase()).not.toContain('sort');
  });

  it('drops the old technical section headings', () => {
    const html = render();
    expect(html).not.toContain('Hero stats');
    expect(html).not.toContain('Homepage about stats');
    expect(html).not.toContain('About page stats');
    expect(html).not.toContain('value chips');
    expect(html).not.toContain('Hero since year');
  });

  it('shows exactly three canonical stat rows', () => {
    const matches = render().match(/data-testid="company-number-card"/g) ?? [];
    expect(matches).toHaveLength(3);
  });
});
