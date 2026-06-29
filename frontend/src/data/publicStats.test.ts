import { describe, expect, it } from 'vitest';
import {
  applyCompanyNumbers,
  defaultCompanyNumbers,
  defaultPublicStats,
  extractCompanyNumbers,
  normalizePublicStatsContent,
} from './publicStats';

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

describe('company numbers adapter', () => {
  it('extracts the three canonical numbers, defaulting missing data', () => {
    const numbers = extractCompanyNumbers(undefined);
    expect(numbers).toEqual(defaultCompanyNumbers);
    expect(numbers.completedProjects.value).toBe('250+');
    expect(numbers.yearsExperience.labelHe).toBe('שנות ניסיון');
    expect(numbers.warrantyYears.labelEn).toBe('Years warranty');
  });

  it('reads admin-edited values back out of stored content', () => {
    const edited = applyCompanyNumbers(undefined, {
      ...defaultCompanyNumbers,
      completedProjects: { ...defaultCompanyNumbers.completedProjects, value: '999+', labelHe: 'הושלמו', labelEn: 'Done' },
    });
    const numbers = extractCompanyNumbers(edited);
    expect(numbers.completedProjects.value).toBe('999+');
    expect(numbers.completedProjects.labelHe).toBe('הושלמו');
    expect(numbers.completedProjects.labelEn).toBe('Done');
  });

  it('projects the same three numbers onto hero and about sections', () => {
    const numbers = {
      completedProjects: { id: 'completed-projects' as const, value: '300+', labelHe: 'פרויקטים', labelEn: 'Projects', labelAr: 'مشاريع' },
      yearsExperience: { id: 'years-experience' as const, value: '12+', labelHe: 'ניסיון', labelEn: 'Experience', labelAr: 'خبرة' },
      warrantyYears: { id: 'warranty-years' as const, value: '7', labelHe: 'אחריות', labelEn: 'Warranty', labelAr: 'ضمان' },
    };
    const content = applyCompanyNumbers(undefined, numbers);

    expect(content.heroStats).toHaveLength(3);
    expect(content.aboutPreviewStats).toHaveLength(3);
    expect(content.aboutPageStats).toHaveLength(3);

    // Hero / about preview / about page all show the identical canonical values.
    for (const section of [content.heroStats, content.aboutPreviewStats, content.aboutPageStats]) {
      expect(section.map((s) => s.value)).toEqual(['300+', '12+', '7']);
      expect(section.map((s) => s.label.he)).toEqual(['פרויקטים', 'ניסיון', 'אחריות']);
      expect(section.map((s) => s.label.en)).toEqual(['Projects', 'Experience', 'Warranty']);
    }
  });

  it('keeps the legacy Arabic label as an internal fallback', () => {
    const content = applyCompanyNumbers(undefined, defaultCompanyNumbers);
    expect(content.heroStats[0].label.ar).toBe('مشروع منجز');
  });

  it('preserves value chips, hero-since and about highlight when saving numbers', () => {
    const content = applyCompanyNumbers(undefined, defaultCompanyNumbers);
    expect(content.valueChips).toEqual(defaultPublicStats.valueChips);
    expect(content.heroSince).toEqual(defaultPublicStats.heroSince);
    expect(content.aboutHighlight).toEqual(defaultPublicStats.aboutHighlight);
  });
});
