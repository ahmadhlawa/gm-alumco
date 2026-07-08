import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LanguageProvider } from '@/i18n';
import { LoadingState } from './LoadingState';

describe('LoadingState skeletons', () => {
  it('renders skeleton blocks instead of spinner text', () => {
    const html = renderToStaticMarkup(<LanguageProvider><LoadingState /></LanguageProvider>);

    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('data-skeleton="true"');
    expect(html).not.toContain('animate-spin');
    expect(html).not.toContain('Loading');
  });

  it('renders production-card shaped skeletons', () => {
    const html = renderToStaticMarkup(<LanguageProvider><LoadingState variant="production-cards" count={2} /></LanguageProvider>);

    expect(html).toContain('data-loading-variant="production-cards"');
    expect(html).toContain('aspect-[16/10]');
    expect((html.match(/data-skeleton-card="production"/g) ?? []).length).toBe(2);
  });
});
