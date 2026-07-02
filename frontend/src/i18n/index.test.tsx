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

  it('falls back between Hebrew and English', () => {
    expect(translatePublic('he', 'Hebrew', 'English')).toBe('Hebrew');
    expect(translatePublic('he', '', 'English')).toBe('English');
    expect(translatePublic('en', 'Hebrew', 'English')).toBe('English');
    expect(translatePublic('en', 'Hebrew')).toBe('Hebrew');
  });
});
