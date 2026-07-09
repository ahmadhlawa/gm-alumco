import { describe, expect, it } from 'vitest';
import { assembleSiteContent, toAboutContentView, toPartnerView, toProductionProjectView, toProjectView, toServiceView, toTestimonialView } from './adapters';
import type { AboutPageContentDto } from './types';

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
      rating: 4,
      is_active: true, sort_order: 0, created_at: '', updated_at: '',
    }, 'en');

    expect(service).toMatchObject({ id: '4', slug: '4', title: 'Service', image: '' });
    expect(project).toMatchObject({ id: '5', slug: '5', featured: true, location: '', year: '' });
    expect(testimonial.rating).toBe(4);
    expect(testimonial).toMatchObject({ name: 'Client', content: 'Message' });
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

  it('adapts production projects with localized metadata and ordered images', () => {
    const result = toProductionProjectView({
      id: 9,
      title_en: 'Production', title_he: 'ייצור',
      description_en: 'Industrial work', description_he: '',
      manufacturer_en: 'Factory', manufacturer_he: '',
      execution_partner_en: '', execution_partner_he: 'שותף',
      is_active: true, sort_order: 0, created_at: '', updated_at: '',
      images: [
        { id: 2, project_id: 9, image_url: '/uploads/production-projects/2.webp', alt_text_en: null, alt_text_he: null, sort_order: 2, created_at: '' },
        { id: 1, project_id: 9, image_url: '/uploads/production-projects/1.webp', alt_text_en: null, alt_text_he: null, sort_order: 1, created_at: '' },
      ],
    }, 'en');

    expect(result).toMatchObject({
      id: '9',
      title: 'Production',
      shortDescription: 'Industrial work',
      manufacturer: 'Factory',
      executionPartner: 'שותף',
      images: ['/uploads/production-projects/1.webp', '/uploads/production-projects/2.webp'],
    });
  });
});

describe('toAboutContentView', () => {
  const dto: AboutPageContentDto = {
    title_en: 'Success', title_he: 'הצלחה',
    subtitle_en: 'Sub EN', subtitle_he: 'תת כותרת',
    paragraph_1_en: 'P1 EN', paragraph_1_he: 'פסקה 1',
    paragraph_2_en: 'P2 EN', paragraph_2_he: 'פסקה 2',
    bullet_1_en: 'B1', bullet_1_he: 'נ1',
    bullet_2_en: 'B2', bullet_2_he: 'נ2',
    bullet_3_en: 'B3', bullet_3_he: 'נ3',
    bullet_4_en: 'B4', bullet_4_he: 'נ4',
    image_url: '/images/success.png',
    experience_number: '10+',
    experience_label_en: 'Years', experience_label_he: 'שנים',
    vision_title_en: 'Vision', vision_title_he: 'חזון',
    vision_text_en: 'Vision text', vision_text_he: 'טקסט חזון',
    mission_title_en: 'Mission', mission_title_he: 'משימה',
    mission_text_en: 'Mission text', mission_text_he: 'טקסט משימה',
    difference_title_en: 'Difference', difference_title_he: 'הבדל',
    difference_intro_en: 'Intro EN', difference_intro_he: 'מבוא',
    difference_paragraph_en: 'Diff paragraph', difference_paragraph_he: 'פסקת הבדל',
    cta_text_en: 'Go', cta_text_he: 'לך',
    cta_link: '/contact',
    stat_1_number: '1', stat_1_label_en: 'One', stat_1_label_he: 'אחד',
    stat_2_number: '2', stat_2_label_en: 'Two', stat_2_label_he: 'שתיים',
    stat_3_number: '3', stat_3_label_en: 'Three', stat_3_label_he: 'שלוש',
  };

  it('localizes to English', () => {
    const view = toAboutContentView(dto, 'en');
    expect(view).toMatchObject({
      title: 'Success',
      visionTitle: 'Vision',
      missionTitle: 'Mission',
      imageUrl: '/images/success.png',
      experienceNumber: '10+',
    });
  });

  it('localizes to Hebrew', () => {
    const view = toAboutContentView(dto, 'he');
    expect(view.title).toBe('הצלחה');
    expect(view.visionTitle).toBe('חזון');
  });

  it('falls back to the other language when one is empty', () => {
    const partial: AboutPageContentDto = { ...dto, title_he: '' };
    expect(toAboutContentView(partial, 'he').title).toBe('Success');
  });

  it('falls back to the default image when empty or null', () => {
    const empty: AboutPageContentDto = { ...dto, image_url: '' };
    expect(toAboutContentView(empty, 'en').imageUrl).toBe('/images/our-success-story.png');

    const nulled: AboutPageContentDto = { ...dto, image_url: null };
    expect(toAboutContentView(nulled, 'en').imageUrl).toBe('/images/our-success-story.png');
  });

  it('never exposes the fixed Difference/Stats/CTA fields — they are website structure, not admin content', () => {
    const view = toAboutContentView(dto, 'en');
    const keys = Object.keys(view);
    for (const forbidden of ['differenceTitle', 'differenceIntro', 'differenceParagraph', 'ctaText', 'ctaLink', 'stats']) {
      expect(keys).not.toContain(forbidden);
    }
  });
});
