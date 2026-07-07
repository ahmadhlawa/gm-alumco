import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LanguageProvider } from '@/i18n';
import { AdminHomepageVideo } from './AdminHomepageVideo';

// renderToStaticMarkup does not run effects, so no API call fires; the page
// renders its default (Hebrew) state, which is what we assert on.
function render() {
  return renderToStaticMarkup(
    <LanguageProvider>
      <AdminHomepageVideo />
    </LanguageProvider>,
  );
}

describe('AdminHomepageVideo page', () => {
  it('renders the Hebrew title, helper text, enable toggle, video upload and save button', () => {
    const html = render();
    expect(html).toContain('סרטון דף הבית');
    expect(html).toContain('הפעל אפשרות זו כדי להציג את הסרטון בדף הבית.');
    expect(html).toContain('role="switch"');
    expect(html).toContain('קובץ סרטון');
    expect(html).toContain('שמירה');
  });

  it('does not expose title or description fields', () => {
    const html = render();
    expect(html).not.toContain('Title HE');
    expect(html).not.toContain('Title EN');
    expect(html).not.toContain('Description HE');
    expect(html).not.toContain('Description EN');
    expect(html).not.toContain('אופציונלי');
  });

  it('never exposes a poster field', () => {
    const html = render();
    expect(html.toLowerCase()).not.toContain('poster');
    expect(html).not.toContain('תמונת רקע');
  });

  it('never exposes Arabic fields', () => {
    const html = render();
    expect(html).not.toContain('ערבית');
    expect(html).not.toContain('Arabic');
  });
});
