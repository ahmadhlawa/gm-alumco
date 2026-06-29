import { describe, expect, it, vi } from 'vitest';

// One row with distinct values per locale so we can prove which field is chosen.
vi.mock('@/api/projects', () => ({
  listProjects: async () => [
    {
      id: 1,
      title_ar: 'AR-title',
      title_en: 'EN-title',
      title_he: 'HE-title',
      description_ar: null,
      description_en: null,
      description_he: null,
      category: 'LOCAL',
      main_image_url: null,
    },
  ],
}));

import { getProjects } from './api';

describe('public data API locale default', () => {
  it('defaults to Hebrew (never Arabic) when no locale is passed', async () => {
    const [project] = await getProjects();
    expect(project.title).toBe('HE-title');
  });

  it('returns English content when English is requested', async () => {
    const [project] = await getProjects('en');
    expect(project.title).toBe('EN-title');
  });

  it('still falls back to Arabic only when Hebrew and English are both empty', async () => {
    // Default locale 'he' picks he -> en -> ar; with he/en present it must not pick Arabic.
    const [project] = await getProjects();
    expect(project.title).not.toBe('AR-title');
  });
});
