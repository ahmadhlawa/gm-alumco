import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { translatePublic } from '@/i18n';
import { ContactForm } from './ContactForm';

describe('ContactForm public localization', () => {
  it('renders English labels and direction-safe LTR inputs in English mode', () => {
    const html = renderToStaticMarkup(
      <ContactForm t={(he: string, en?: string) => translatePublic('en', he, en)} />,
    );

    expect(html).toContain('Full name');
    expect(html).toContain('Email');
    expect(html).toContain('Send message');
    expect(html).toContain('text-left');
    expect(html).not.toContain('Ø§Ù');
  });
});
