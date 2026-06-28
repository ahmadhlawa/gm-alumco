import { describe, expect, it } from 'vitest';
import { defaultPublicStats, normalizePublicStatsContent } from './publicStats';

describe('public stats content', () => {
  it('uses sorted active backend stats and keeps fallback data for missing groups', () => {
    const result = normalizePublicStatsContent({
      heroStats: [
        { id: 'hidden', value: '1', label: { ar: 'x', en: 'x', he: 'x' }, is_active: false, sort_order: 0 },
        { id: 'second', value: '20', label: { ar: 'ثاني', en: 'Second', he: 'שני' }, sort_order: 2 },
        { id: 'first', value: '10', label: { ar: 'أول', en: 'First', he: 'ראשון' }, sort_order: 1 },
      ],
    });

    expect(result.heroStats.map((item) => item.id)).toEqual(['first', 'second']);
    expect(result.aboutPreviewStats).toEqual(defaultPublicStats.aboutPreviewStats);
  });

  it('falls back when backend content is malformed', () => {
    expect(normalizePublicStatsContent(null)).toEqual(defaultPublicStats);
    expect(normalizePublicStatsContent({ heroStats: 'bad' })).toEqual(defaultPublicStats);
  });
});
