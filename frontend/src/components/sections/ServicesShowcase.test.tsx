import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import type { Service } from '@/types';
import { ServicesShowcase, getServiceSlideIndex } from './ServicesShowcase';

const service: Service = {
  id: '7',
  slug: 'curtain-wall',
  title: 'واجهات زجاجية',
  shortDescription: 'حلول هندسية للواجهات الحديثة.',
  description: 'تفاصيل الخدمة',
  image: 'https://example.com/service.jpg',
  benefits: [],
};

describe('ServicesShowcase', () => {
  it('renders the homepage anchor and real service content', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <ServicesShowcase
          services={[service]}
          title="خدماتنا"
          subtitle="حلول متكاملة"
          emptyMessage="لا توجد خدمات"
          actionLabel="اطلب استشارة"
        />
      </MemoryRouter>,
    );

    expect(html).toContain('id="services"');
    expect(html).toContain('واجهات زجاجية');
    expect(html).toContain('https://example.com/service.jpg');
    expect(html).toContain('href="/contact"');
  });

  it('renders a branded empty state when the API returns no services', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <ServicesShowcase
          services={[]}
          title="خدماتنا"
          subtitle="حلول متكاملة"
          emptyMessage="لا توجد خدمات حالياً"
          actionLabel="اطلب استشارة"
        />
      </MemoryRouter>,
    );

    expect(html).toContain('لا توجد خدمات حالياً');
  });

  it('wraps slider navigation in both directions', () => {
    expect(getServiceSlideIndex(2, 3, 1)).toBe(0);
    expect(getServiceSlideIndex(0, 3, -1)).toBe(2);
    expect(getServiceSlideIndex(0, 0, 1)).toBe(0);
  });
});
