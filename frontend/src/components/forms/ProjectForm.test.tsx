import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LanguageProvider } from '@/i18n';
import { ProjectForm, EMPTY_PROJECT } from './ProjectForm';
import { toPayload } from '@/app/admin/ProjectFormPage';

describe('ProjectForm admin language tabs', () => {
  it('exposes only Hebrew and English tabs (no Arabic language tab)', () => {
    const html = renderToStaticMarkup(
      <LanguageProvider>
        <ProjectForm initialValues={EMPTY_PROJECT} onSubmit={() => {}} />
      </LanguageProvider>,
    );
    expect(html).toContain('עברית'); // Hebrew tab
    expect(html).toContain('English'); // English tab
    expect(html).not.toContain('العربية'); // Arabic tab must be gone
  });
});

describe('ProjectFormPage save payload', () => {
  it('saves Hebrew and English and emits no Arabic (*_ar) fields', () => {
    const payload = toPayload({
      ...EMPTY_PROJECT,
      title_he: 'כותרת',
      title_en: 'Title',
      description_he: 'תיאור',
      description_en: 'Description',
    });
    expect(payload.title_he).toBe('כותרת');
    expect(payload.title_en).toBe('Title');
    expect(payload.description_he).toBe('תיאור');
    expect(payload.description_en).toBe('Description');
    // Arabic columns no longer exist in the schema, so none are sent.
    expect(Object.keys(payload).some((key) => key.endsWith('_ar'))).toBe(false);
  });
});
