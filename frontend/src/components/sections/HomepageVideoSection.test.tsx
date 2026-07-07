import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { HomepageVideoSectionDto } from '@/api/types';
import { HomepageVideoSection } from './HomepageVideoSection';

const enabled: HomepageVideoSectionDto = {
  is_enabled: true,
  video_url: '/uploads/videos/clip.mp4',
  display_order: 0,
};

function render(section: HomepageVideoSectionDto | null) {
  return renderToStaticMarkup(<HomepageVideoSection section={section} />);
}

describe('HomepageVideoSection', () => {
  it('renders nothing when there is no section data', () => {
    expect(render(null)).toBe('');
  });

  it('renders nothing when disabled', () => {
    expect(render({ ...enabled, is_enabled: false })).toBe('');
  });

  it('renders nothing when enabled but no video is set', () => {
    expect(render({ ...enabled, video_url: null })).toBe('');
  });

  it('renders an autoplay muted looped inline video with no controls or poster', () => {
    const html = render(enabled);
    expect(html).toContain('<video');
    expect(html).toContain('autoPlay');
    expect(html).toContain('muted');
    expect(html).toContain('loop');
    expect(html).toContain('playsInline');
    expect(html).toContain('preload="metadata"');
    expect(html).toContain('/uploads/videos/clip.mp4');
    expect(html).not.toContain('controls=""');
    expect(html).not.toContain('poster=');
  });

  it('renders a wide centered cinematic container with the original heights', () => {
    const html = render(enabled);
    expect(html).toContain('max-w-[1700px]');
    expect(html).toContain('mx-auto');
    expect(html).toContain('px-4');
    expect(html).toContain('sm:px-6');
    expect(html).toContain('lg:px-8');
    expect(html).toContain('h-[52vh]');
    expect(html).toContain('md:h-[70vh]');
    expect(html).toContain('object-cover');
  });

  it('renders video only — no title, description, or text overlay container', () => {
    const html = render(enabled);
    expect(html).not.toContain('<h2');
    expect(html).not.toContain('<p');
    expect(html).not.toContain('bg-brand-navy/10');
  });
});
