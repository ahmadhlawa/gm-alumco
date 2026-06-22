import { describe, expect, it } from 'vitest';
import { partnerPayload, PROJECT_CATEGORY_LABELS, QUOTE_STATUS_LABELS } from './adminMappers';

describe('admin mappers', () => {
  it('uses the approved project categories and quote statuses', () => {
    expect(Object.keys(PROJECT_CATEGORY_LABELS)).toEqual(['LOCAL', 'INTERNATIONAL', 'FEATURED']);
    expect(Object.keys(QUOTE_STATUS_LABELS)).toEqual(['NEW', 'IN_PROGRESS', 'DONE', 'ARCHIVED']);
  });

  it('mirrors the simple partner name for legacy multilingual storage', () => {
    expect(partnerPayload({ name: 'Schüco', logo_url: 'https://x.test/logo.png', website_url: '', is_active: true, sort_order: 2 })).toEqual({
      name_ar: 'Schüco',
      name_en: 'Schüco',
      name_he: 'Schüco',
      logo_url: 'https://x.test/logo.png',
      website_url: null,
      is_active: true,
      sort_order: 2,
    });
  });
});
