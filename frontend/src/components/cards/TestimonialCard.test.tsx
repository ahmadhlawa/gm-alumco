import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { Testimonial } from '@/types';
import { TestimonialCard } from './TestimonialCard';

const base: Testimonial = {
  id: '1',
  name: 'Sarah Levi',
  role: 'Villa owner',
  company: '',
  content: 'Excellent work.',
  rating: 3,
};

const filledStars = (html: string) => (html.match(/fill="currentColor"/g) ?? []).length;

describe('TestimonialCard', () => {
  it('fills exactly the rated number of stars (no NaN / no broken stars)', () => {
    const html = renderToStaticMarkup(<TestimonialCard testimonial={base} />);
    expect(filledStars(html)).toBe(3);
    expect(html).toContain('Sarah Levi');
    expect(html).toContain('Excellent work.');
  });

  it('defaults to 5 filled stars when rating is missing', () => {
    const { rating, ...noRating } = base;
    void rating;
    const html = renderToStaticMarkup(<TestimonialCard testimonial={noRating} />);
    expect(filledStars(html)).toBe(5);
  });

  it('shows the role without a dangling bullet when there is no company', () => {
    const html = renderToStaticMarkup(<TestimonialCard testimonial={base} />);
    expect(html).toContain('Villa owner');
    expect(html).not.toContain('\u2022');
  });

  it('joins role and company with a bullet when both exist', () => {
    const html = renderToStaticMarkup(<TestimonialCard testimonial={{ ...base, company: 'Modern Build' }} />);
    expect(html).toContain('Villa owner \u2022 Modern Build');
  });

  it('can render the Stitch-style active carousel card', () => {
    const html = renderToStaticMarkup(<TestimonialCard testimonial={base} active />);
    expect(html).toContain('bg-brand-gold');
    expect(html).toContain('text-brand-navy');
  });

  it('renders a future client photo field instead of initials when available', () => {
    const testimonial = { ...base, photoUrl: '/uploads/clients/sarah.jpg' };
    const html = renderToStaticMarkup(<TestimonialCard testimonial={testimonial} />);
    expect(html).toContain('src="/uploads/clients/sarah.jpg"');
    expect(html).toContain('alt="Sarah Levi"');
  });
});
