import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LanguageProvider } from '@/i18n';
import {
  CONTACT_EMAIL,
  ContactActions,
  WHATSAPP_DISPLAY_NUMBER,
  WHATSAPP_URL,
} from './ContactActions';

describe('ContactActions', () => {
  it('renders the approved WhatsApp and email destinations', () => {
    const html = renderToStaticMarkup(
      <LanguageProvider>
        <ContactActions title="זקוקים לעזרה מיידית?" compact />
      </LanguageProvider>,
    );

    expect(WHATSAPP_URL).toBe('https://wa.me/972525808988');
    expect(WHATSAPP_DISPLAY_NUMBER).toBe('+972 52-580-8988');
    expect(CONTACT_EMAIL).toBe('Mina@techno-alum.com');
    expect(html).toContain('href="https://wa.me/972525808988"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('href="mailto:Mina@techno-alum.com"');
    expect(html).toContain('+972 52-580-8988');
  });
});
