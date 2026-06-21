import { describe, expect, it } from 'vitest';
import { assembleSiteContent, toProjectView, toServiceView, toTestimonialView } from './adapters';

describe('API adapters', () => {
  it('localizes resource DTOs without inventing unavailable data', () => {
    const service = toServiceView({
      id: 4,
      title_ar: 'خدمة', title_en: 'Service', title_he: 'שירות',
      description_ar: 'وصف', description_en: 'Description', description_he: 'תיאור',
      image_url: null, is_active: true, sort_order: 0,
      created_at: '', updated_at: '',
    }, 'en');
    const project = toProjectView({
      id: 5,
      title_ar: 'مشروع', title_en: 'Project', title_he: 'פרויקט',
      description_ar: null, description_en: null, description_he: null,
      category: 'featured', main_image_url: null, is_active: true, sort_order: 0,
      created_at: '', updated_at: '',
    }, 'en');
    const testimonial = toTestimonialView({
      id: 6,
      client_name_ar: 'عميل', client_name_en: 'Client', client_name_he: 'לקוח',
      message_ar: 'رسالة', message_en: 'Message', message_he: 'הודעה',
      client_position_ar: null, client_position_en: null, client_position_he: null,
      is_active: true, sort_order: 0, created_at: '', updated_at: '',
    }, 'en');

    expect(service).toMatchObject({ id: '4', slug: '4', title: 'Service', image: '' });
    expect(project).toMatchObject({ id: '5', slug: '5', featured: true, location: '', year: '' });
    expect(testimonial.rating).toBeUndefined();
  });

  it('assembles section content from active section/content rows', () => {
    const result = assembleSiteContent([
      { id: 1, section: 'hero', key: 'content', value: { headline: { ar: 'أفق', en: 'Ofok', he: 'אופק' } }, content_type: 'json', is_active: true, created_at: '', updated_at: '' },
      { id: 2, section: 'hero', key: 'ignored', value: 'x', content_type: 'text', is_active: true, created_at: '', updated_at: '' },
    ]);

    expect(result.hero).toEqual({ headline: { ar: 'أفق', en: 'Ofok', he: 'אופק' } });
  });
});
