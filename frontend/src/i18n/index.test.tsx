import { describe, expect, it } from 'vitest';
import {
  getLanguageDirection,
  getNextPublicLanguage,
  resolveInitialLanguage,
  translatePublic,
} from './index';

describe('public language system', () => {
  it('defaults missing, invalid, and old Arabic storage values to Hebrew', () => {
    expect(resolveInitialLanguage(null)).toBe('he');
    expect(resolveInitialLanguage('fr')).toBe('he');
    expect(resolveInitialLanguage('ar')).toBe('he');
  });

  it('sets direction for Hebrew and English', () => {
    expect(getLanguageDirection('he')).toBe('rtl');
    expect(getLanguageDirection('en')).toBe('ltr');
  });

  it('toggles only between Hebrew and English', () => {
    expect(getNextPublicLanguage('he')).toBe('en');
    expect(getNextPublicLanguage('en')).toBe('he');
  });

  it('uses Arabic only as a last-resort translation fallback', () => {
    expect(translatePublic('he', 'Arabic', 'Hebrew', 'English')).toBe('Hebrew');
    expect(translatePublic('he', 'Arabic', undefined, 'English')).toBe('English');
    expect(translatePublic('en', 'Arabic', 'Hebrew', 'English')).toBe('English');
    expect(translatePublic('en', 'Arabic', 'Hebrew')).toBe('Hebrew');
  });
});
