import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ProjectForm, EMPTY_PROJECT } from './ProjectForm';
import { toPayload } from '@/app/admin/ProjectFormPage';

describe('ProjectForm admin language tabs', () => {
  it('exposes only Hebrew and English tabs (no Arabic language tab)', () => {
    const html = renderToStaticMarkup(<ProjectForm initialValues={EMPTY_PROJECT} onSubmit={() => {}} />);
    expect(html).toContain('עברית'); // Hebrew tab
    expect(html).toContain('English'); // English tab
    expect(html).not.toContain('العربية'); // Arabic tab must be gone
  });
});

describe('ProjectFormPage save payload', () => {
  it('preserves existing Arabic values instead of clearing them', () => {
    const payload = toPayload({
      ...EMPTY_PROJECT,
      title_ar: 'عنوان عربي قديم',
      description_ar: 'وصف عربي قديم',
      title_he: 'כותרת',
      title_en: 'Title',
    });
    // Arabic columns are passed through untouched (never blanked).
    expect(payload.title_ar).toBe('عنوان عربي قديم');
    expect(payload.description_ar).toBe('وصف عربي قديم');
    // Hebrew + English are saved too.
    expect(payload.title_he).toBe('כותרת');
    expect(payload.title_en).toBe('Title');
  });

  it('does not require Arabic — empty Arabic stays empty and still saves Hebrew/English', () => {
    const payload = toPayload({ ...EMPTY_PROJECT, title_he: 'כותרת', title_en: 'Title' });
    expect(payload.title_he).toBe('כותרת');
    expect(payload.title_en).toBe('Title');
    expect(payload.title_ar).toBe(''); // no Arabic entered, nothing fabricated or required
  });
});
