import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AboutBody } from './AboutBody';
import { getAboutBody, parseAboutBody } from '@/lib/aboutBody';
import { defaultAboutPageContent } from '@/data/aboutPageContent';
import { toAboutContentView } from '@/api/adapters';

describe('ordered About body', () => {
  it('keeps long paragraphs, six bullets, following paragraphs and separated lists in order', () => {
    const long = 'Long paragraph '.repeat(70).trim();
    const body = `${long}\n\nIntroduction\n- One\n* Two\n×Three\n• Four\n- Five\n• Six\n\nAfter\n\nFinal paragraph\n\n* Another list\n\nEnding`;
    expect(parseAboutBody(body)).toEqual([
      { type: 'paragraph', text: long }, { type: 'paragraph', text: 'Introduction' },
      { type: 'list', items: ['One', 'Two', 'Three', 'Four', 'Five', 'Six'] },
      { type: 'paragraph', text: 'After' }, { type: 'paragraph', text: 'Final paragraph' },
      { type: 'list', items: ['Another list'] }, { type: 'paragraph', text: 'Ending' },
    ]);
    const html = renderToStaticMarkup(<AboutBody text={body} language="en" />);
    expect(html.match(/<ul /g)).toHaveLength(2);
    expect(html.match(/<li /g)).toHaveLength(7);
    expect(html.indexOf('After')).toBeGreaterThan(html.indexOf('</ul>'));
  });

  it.each(['-', '*', '×', '•'])('recognizes %s at the start of a line with optional whitespace', (marker) => {
    expect(parseAboutBody(`Paragraph\n  ${marker}Item\n\nAfter`)).toEqual([
      { type: 'paragraph', text: 'Paragraph' }, { type: 'list', items: ['Item'] }, { type: 'paragraph', text: 'After' },
    ]);
    expect(parseAboutBody(`Inline ${marker} text`)).toEqual([{ type: 'paragraph', text: `Inline ${marker} text` }]);
  });

  it('handles CRLF, single paragraph line breaks and empty input', () => {
    expect(parseAboutBody('First\r\nSecond\r\n\r\n- Item')).toEqual([
      { type: 'paragraph', text: 'First\nSecond' }, { type: 'list', items: ['Item'] },
    ]);
    expect(parseAboutBody(' \n\n- \n')).toEqual([]);
  });

  it('escapes all author text and uses the correct direction', () => {
    const html = renderToStaticMarkup(<AboutBody text={'<script>alert(1)</script>\n\n• <img src=x onerror=alert(1)>'} language="he" />);
    expect(html).toContain('dir="rtl"');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&lt;img');
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<img');
    expect(renderToStaticMarkup(<AboutBody text="English" language="en" />)).toContain('dir="ltr"');
  });

  it('uses legacy content once, then entirely replaces it with the new body', () => {
    const legacy = getAboutBody(defaultAboutPageContent, 'he');
    expect(parseAboutBody(legacy).map((block) => block.type)).toEqual(['paragraph', 'paragraph', 'list']);
    const legacyEnglish = getAboutBody(defaultAboutPageContent, 'en');
    expect(legacyEnglish).toContain(defaultAboutPageContent.paragraph_1_en);
    const saved = { ...defaultAboutPageContent, body_he: 'חדש\n\n• נקודה\n\nסיום', body_en: 'New\n\n• Item\n\nEnd' };
    expect(toAboutContentView(saved, 'he').body).toBe(saved.body_he);
    expect(toAboutContentView(saved, 'en').body).toBe(saved.body_en);
    expect(parseAboutBody(saved.body_he).map((block) => block.type)).toEqual(parseAboutBody(saved.body_en).map((block) => block.type));
    expect(getAboutBody({ ...saved, body_he: '', body_en: '' }, 'he')).toBe('');
    expect(toAboutContentView(saved, 'he').visionText).toBe(defaultAboutPageContent.vision_text_he);
    expect(toAboutContentView(saved, 'en').missionText).toBe(defaultAboutPageContent.mission_text_en);
  });
});
