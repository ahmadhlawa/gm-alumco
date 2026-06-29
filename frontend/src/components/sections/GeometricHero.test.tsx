import { describe, expect, it } from 'vitest';
import { heroBackgroundTransform } from './GeometricHero';

describe('heroBackgroundTransform', () => {
  it('keeps the original orientation in Hebrew / RTL', () => {
    expect(heroBackgroundTransform('rtl')).toBe('scaleX(-1)');
  });

  it('mirrors the background image in English / LTR', () => {
    expect(heroBackgroundTransform('ltr')).toBe('scaleX(1)');
  });
});
