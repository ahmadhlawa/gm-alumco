import { describe, expect, it } from 'vitest';
import {
  applyCompanyNumbers,
  defaultCompanyNumbers,
  defaultPublicStats,
  extractCompanyNumbers,
  normalizePublicStatsContent,
} from './publicStats';

describe('public stats content', () => {
  it('projects public company stats from canonical IDs and keeps fallback data for missing groups', () => {
    const result = normalizePublicStatsContent({
      heroStats: [
        { id: 'warranty-years', value: '7', label: { ar: 'Warranty', en: 'Warranty', he: 'Warranty' }, sort_order: 3 },
        { id: 'completed-projects', value: '300+', label: { ar: 'Projects', en: 'Projects', he: 'Projects' }, sort_order: 1 },
        { id: 'years-experience', value: '12+', label: { ar: 'Experience', en: 'Experience', he: 'Experience' }, sort_order: 2 },
      ],
    });

    expect(result.heroStats.map((item) => item.id)).toEqual(['completed-projects', 'years-experience', 'warranty-years']);
    expect(result.aboutPreviewStats.map((item) => item.value)).toEqual(['300+', '12+', '7']);
    expect(result.valueChips).toEqual(defaultPublicStats.valueChips);
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
    expect(numbers.yearsExperience.labelEn).toBe('Years of experience');
    expect(numbers.warrantyYears.labelEn).toBe('Years warranty');
  });

  it('reads admin-edited values back out of stored content', () => {
    const edited = applyCompanyNumbers(undefined, {
      ...defaultCompanyNumbers,
      completedProjects: { ...defaultCompanyNumbers.completedProjects, value: '999+', labelHe: 'Done HE', labelEn: 'Done' },
    });
    const numbers = extractCompanyNumbers(edited);
    expect(numbers.completedProjects.value).toBe('999+');
    expect(numbers.completedProjects.labelHe).toBe('Done HE');
    expect(numbers.completedProjects.labelEn).toBe('Done');
  });

  it('projects the same three numbers onto hero and about sections', () => {
    const numbers = {
      completedProjects: { id: 'completed-projects' as const, value: '300+', labelHe: 'Projects HE', labelEn: 'Projects', labelAr: 'Projects AR' },
      yearsExperience: { id: 'years-experience' as const, value: '12+', labelHe: 'Experience HE', labelEn: 'Experience', labelAr: 'Experience AR' },
      warrantyYears: { id: 'warranty-years' as const, value: '7', labelHe: 'Warranty HE', labelEn: 'Warranty', labelAr: 'Warranty AR' },
    };
    const content = applyCompanyNumbers(undefined, numbers);

    expect(content.heroStats).toHaveLength(3);
    expect(content.aboutPreviewStats).toHaveLength(3);
    expect(content.aboutPageStats).toHaveLength(3);

    for (const section of [content.heroStats, content.aboutPreviewStats, content.aboutPageStats]) {
      expect(section.map((s) => s.value)).toEqual(['300+', '12+', '7']);
      expect(section.map((s) => s.label.he)).toEqual(['Projects HE', 'Experience HE', 'Warranty HE']);
      expect(section.map((s) => s.label.en)).toEqual(['Projects', 'Experience', 'Warranty']);
    }
  });

  it('normalizes legacy duplicate public stats to the canonical company numbers', () => {
    const content = normalizePublicStatsContent({
      heroStats: [
        { id: 'completed-projects', value: '250+', label: { ar: 'Projects AR', en: 'Projects', he: 'Projects HE' }, sort_order: 1 },
        { id: 'years-experience', value: '10+', label: { ar: 'Experience AR', en: 'Experience', he: 'Experience HE' }, sort_order: 2 },
        { id: 'warranty-years', value: '5', label: { ar: 'Warranty AR', en: 'Warranty', he: 'Warranty HE' }, sort_order: 3 },
      ],
      aboutPreviewStats: [
        { id: 'about-experience', value: '15+', label: { ar: 'Old AR', en: 'Old experience', he: 'Old HE' }, sort_order: 1 },
        { id: 'about-team', value: '40+', label: { ar: 'Team AR', en: 'Team', he: 'Team HE' }, sort_order: 2 },
      ],
      aboutPageStats: [
        { id: 'about-years', value: '15+', label: { ar: 'Old AR', en: 'Years of leadership', he: 'Old HE' }, sort_order: 1 },
        { id: 'about-projects', value: '350+', label: { ar: 'Old AR', en: 'Old projects', he: 'Old HE' }, sort_order: 2 },
      ],
      aboutHighlight: { id: 'about-highlight-years', value: '15+', label: { ar: 'Old AR', en: 'Years of leadership', he: 'Old HE' } },
    });

    for (const section of [content.heroStats, content.aboutPreviewStats, content.aboutPageStats]) {
      expect(section.map((s) => s.id)).toEqual(['completed-projects', 'years-experience', 'warranty-years']);
      expect(section.map((s) => s.value)).toEqual(['250+', '10+', '5']);
    }
    expect(content.aboutHighlight).toMatchObject({
      id: 'years-experience',
      value: '10+',
      label: { en: 'Experience', he: 'Experience HE' },
    });
  });

  it('preserves value chips and hero-since when saving numbers', () => {
    const content = applyCompanyNumbers(undefined, defaultCompanyNumbers);
    expect(content.valueChips).toEqual(defaultPublicStats.valueChips);
    expect(content.heroSince).toEqual(defaultPublicStats.heroSince);
    expect(content.aboutHighlight.value).toEqual(defaultCompanyNumbers.yearsExperience.value);
  });
});
