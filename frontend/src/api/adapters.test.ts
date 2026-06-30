import { describe, expect, it } from 'vitest';
import { assembleSiteContent, toPartnerView, toProjectView, toServiceView, toTestimonialView } from './adapters';

describe('API adapters', () => {
  it('localizes resource DTOs without inventing unavailable data', () => {
    const service = toServiceView({
      id: 4,
      title_en: 'Service', title_he: 'שירות',
      description_en: 'Description', description_he: 'תיאור',
      image_url: null, starting_price: null, is_active: true, sort_order: 0,
      created_at: '', updated_at: '',
    }, 'en');
    const project = toProjectView({
      id: 5,
      title_en: 'Project', title_he: 'פרויקט',
      description_en: null, description_he: null,
      category: 'FEATURED', main_image_url: null, is_active: true, sort_order: 0,
      created_at: '', updated_at: '',
    }, 'en');
    const testimonial = toTestimonialView({
      id: 6,
      client_name_en: 'Client', client_name_he: 'לקוח',
      message_en: 'Message', message_he: 'הודעה',
      client_position_en: null, client_position_he: null,
      is_active: true, sort_order: 0, created_at: '', updated_at: '',
    }, 'en');

    expect(service).toMatchObject({ id: '4', slug: '4', title: 'Service', image: '' });
    expect(project).toMatchObject({ id: '5', slug: '5', featured: true, location: '', year: '' });
    expect(testimonial.rating).toBeUndefined();
  });

  it('falls back he->en and en->he for public DTOs (no Arabic)', () => {
    const service = {
      id: 7,
      title_en: 'English title', title_he: '',
      description_en: null, description_he: 'Hebrew description',
      image_url: null, starting_price: null, is_active: true, sort_order: 0,
      created_at: '', updated_at: '',
    };
    const partner = {
      id: 8,
      name_en: '', name_he: 'Hebrew partner',
      logo_url: '', website_url: null, is_active: true, sort_order: 0,
      created_at: '', updated_at: '',
    };

    // Hebrew requested but empty -> falls back to English.
    expect(toServiceView(service, 'he').title).toBe('English title');
    // English requested but description_en empty -> falls back to Hebrew.
    expect(toServiceView(service, 'en').description).toBe('Hebrew description');
    // Both empty -> empty string (nothing fabricated).
    expect(toServiceView({ ...service, title_en: '', title_he: '' }, 'he').title).toBe('');
    // English requested but name_en empty -> falls back to Hebrew.
    expect(toPartnerView(partner, 'en').name).toBe('Hebrew partner');
  });

  it('assembles section content from active section/content rows', () => {
    const result = assembleSiteContent([
      { id: 1, section: 'hero', key: 'content', value: { headline: { he: 'T.A.S', en: 'T.A.S' } }, content_type: 'json', is_active: true, created_at: '', updated_at: '' },
      { id: 2, section: 'hero', key: 'ignored', value: 'x', content_type: 'text', is_active: true, created_at: '', updated_at: '' },
    ]);

    expect(result.hero).toEqual({ headline: { he: 'T.A.S', en: 'T.A.S' } });
  });
});
