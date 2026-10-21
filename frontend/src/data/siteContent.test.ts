import { describe, expect, it } from 'vitest';
import { translatePublic } from '@/i18n';
import { siteContent } from './siteContent';

describe('homepage About preview branding', () => {
  it('uses the approved T.A.S sentence in the English Difference section', () => {
    const { title, subtitle } = siteContent.about;
    expect(translatePublic('en', title.he, title.en)).toBe('We Make the Difference in Every Detail');
    expect(translatePublic('en', subtitle.he, subtitle.en)).toBe(
      'We are T.A.S, combining rich experience and modern technologies to deliver sustainable architectural solutions.',
    );
  });

  it.each(['he', 'en'] as const)('keeps legacy GM branding out of the %s About preview', (language) => {
    const { subtitle, description } = siteContent.about;
    const text = [subtitle, description].map((copy) => translatePublic(language, copy.he, copy.en)).join(' ');
    expect(text).toContain('T.A.S');
    expect(text).not.toMatch(/\bGM\b|Manufacturing\s*&\s*Trading/i);
  });
});
