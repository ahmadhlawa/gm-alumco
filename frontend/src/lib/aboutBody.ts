import type { AboutPageContentDto, Locale } from '@/api/types';

export const ABOUT_BODY_LIMIT = 16000;
export type AboutBodyBlock = { type: 'paragraph'; text: string } | { type: 'list'; items: string[] };

export function parseAboutBody(body: string): AboutBodyBlock[] {
  const blocks: AboutBodyBlock[] = [];
  let paragraph: string[] = [];
  let items: string[] = [];
  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ type: 'paragraph', text: paragraph.join('\n') });
    paragraph = [];
  };
  const flushList = () => {
    if (items.length) blocks.push({ type: 'list', items });
    items = [];
  };
  for (const line of body.replace(/\r\n?/g, '\n').split('\n')) {
    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }
    const bullet = line.match(/^[ \t]*[-*×•][ \t]*(.*)$/);
    if (bullet) {
      flushParagraph();
      if (bullet[1].trim()) items.push(bullet[1].trim());
    } else {
      flushList();
      paragraph.push(line.trim());
    }
  }
  flushParagraph();
  flushList();
  return blocks;
}

/** New content replaces legacy fields completely; an empty saved body stays empty. */
export function getAboutBody(content: AboutPageContentDto, locale: Locale): string {
  const other = locale === 'he' ? 'en' : 'he';
  if (content.body_he != null || content.body_en != null) {
    return content[`body_${locale}`] ?? content[`body_${other}`] ?? '';
  }
  const text = (name: 'paragraph_1' | 'paragraph_2' | 'bullet_1' | 'bullet_2' | 'bullet_3' | 'bullet_4') =>
    content[`${name}_${locale}`]?.trim() || content[`${name}_${other}`]?.trim() || '';
  const paragraphs = [text('paragraph_1'), text('paragraph_2')];
  const bullets = (['bullet_1', 'bullet_2', 'bullet_3', 'bullet_4'] as const).map(text).filter(Boolean).map((item) => `- ${item}`);
  return [...paragraphs, bullets.join('\n')].filter(Boolean).join('\n\n');
}
