import { useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectForm, EMPTY_PROJECT } from '@/components/forms/ProjectForm';
import { ProductionProjectForm, EMPTY_PRODUCTION_PROJECT } from '@/components/forms/ProductionProjectForm';
import { ServiceFormPage } from './ServiceFormPage';
import { TestimonialFormPage } from './TestimonialFormPage';
import { createService, updateService } from '@/api/services';
import { createTestimonial, updateTestimonial } from '@/api/testimonials';
import { ApiError } from '@/api/client';
import { AdminAboutContent } from './AdminAboutContent';
import { AdminPublicStats } from './AdminPublicStats';
import { defaultAboutPageContent } from '@/data/aboutPageContent';
import { getAboutBody } from '@/lib/aboutBody';
import { defaultCompanyNumbers, defaultPublicStats } from '@/data/publicStats';
import { updateAboutPageContent } from '@/api/aboutPageContent';
import { createSiteContent, updateSiteContent } from '@/api/content';

const routing = vi.hoisted(() => ({ id: undefined as string | undefined, navigate: vi.fn() }));
vi.mock('react', async (original) => ({
  ...await original<typeof import('react')>(),
  useState: vi.fn(),
  useEffect: vi.fn(),
}));
vi.mock('react-router-dom', () => ({ useParams: () => ({ id: routing.id }), useNavigate: () => routing.navigate }));
vi.mock('@/i18n', () => ({ useLanguage: () => ({ language: 'en', dir: 'ltr' }) }));
vi.mock('@/api/services', () => ({ createService: vi.fn(), updateService: vi.fn(), getAdminService: vi.fn() }));
vi.mock('@/api/testimonials', () => ({ createTestimonial: vi.fn(), updateTestimonial: vi.fn(), getAdminTestimonial: vi.fn() }));
vi.mock('@/api/aboutPageContent', () => ({ getAdminAboutPageContent: vi.fn(), updateAboutPageContent: vi.fn() }));
vi.mock('@/api/content', () => ({ listAdminSiteContent: vi.fn(), createSiteContent: vi.fn(), updateSiteContent: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
  routing.id = undefined;
  vi.mocked(useState).mockImplementation(((initial?: unknown) => [initial, vi.fn()]) as typeof useState);
});

describe('Hebrew content with English admin interface', () => {
  it('submits a project without requiring an English title', () => {
    const submit = vi.fn();
    const form = ProjectForm({ initialValues: { ...EMPTY_PROJECT, title_he: 'פרויקט' }, onSubmit: submit });
    form.props.onSubmit({ preventDefault() {} });
    expect(submit).toHaveBeenCalledWith(expect.objectContaining({ title_he: 'פרויקט' }));
  });

  it('submits a production project without requiring an English title', () => {
    const submit = vi.fn();
    const form = ProductionProjectForm({ initialValues: { ...EMPTY_PRODUCTION_PROJECT, title_he: 'ייצור' }, onSubmit: submit });
    form.props.onSubmit({ preventDefault() {} });
    expect(submit).toHaveBeenCalledWith(expect.objectContaining({ title_he: 'ייצור' }));
  });

  it.each([ServiceFormPage, TestimonialFormPage])('renders only Hebrew content editors', (Page) => {
    const html = renderToStaticMarkup(<Page />);
    expect(html).not.toContain('>English</h3>');
    expect(html).toContain('dir="rtl"');
  });

  it.each([undefined, '42'])('saves Hebrew service content for record %s', async (id) => {
    routing.id = id;
    vi.mocked(useState).mockImplementationOnce((() => [{ title_he: 'שירות', title_en: 'Old', description_he: 'תיאור', description_en: 'Old', image_url: '', starting_price: null, is_active: true, sort_order: 0 }, vi.fn()]) as typeof useState);
    vi.mocked(useState).mockImplementationOnce((() => [false, vi.fn()]) as typeof useState);
    const form = ServiceFormPage();
    await form.props.onSubmit({ preventDefault() {} });
    const expected = { title_he: 'שירות', description_he: 'תיאור', image_url: null, starting_price: null, is_active: true, sort_order: 0 };
    if (id) expect(updateService).toHaveBeenCalledWith('42', expected);
    else expect(createService).toHaveBeenCalledWith(expected);
    expect(routing.navigate).toHaveBeenCalledWith('/admin/services');
  });

  it.each([undefined, '42'])('saves Hebrew testimonial content for record %s', async (id) => {
    routing.id = id;
    vi.mocked(useState).mockImplementationOnce((() => [{ client_name_he: 'לקוח', client_name_en: '', message_he: 'תודה', message_en: '', client_position_he: '', client_position_en: '', rating: 5, is_active: true, sort_order: 0 }, vi.fn()]) as typeof useState);
    vi.mocked(useState).mockImplementationOnce((() => [false, vi.fn()]) as typeof useState);
    const form = TestimonialFormPage();
    await form.props.onSubmit({ preventDefault() {} });
    const expected = { client_name_he: 'לקוח', message_he: 'תודה', client_position_he: null, rating: 5, is_active: true, sort_order: 0 };
    if (id) expect(updateTestimonial).toHaveBeenCalledWith('42', expected);
    else expect(createTestimonial).toHaveBeenCalledWith(expected);
    expect(routing.navigate).toHaveBeenCalledWith('/admin/testimonials');
  });

  it('keeps a failed testimonial form open and shows the API error', async () => {
    const feedback = vi.fn();
    vi.mocked(useState)
      .mockImplementationOnce((() => [{ client_name_he: 'לקוח', message_he: 'תודה', rating: 5 }, vi.fn()]) as typeof useState)
      .mockImplementationOnce((() => [false, vi.fn()]) as typeof useState)
      .mockImplementationOnce((() => [false, vi.fn()]) as typeof useState)
      .mockImplementationOnce((() => [false, vi.fn()]) as typeof useState)
      .mockImplementationOnce((() => [null, feedback]) as typeof useState);
    vi.mocked(createTestimonial).mockRejectedValueOnce(new ApiError(503, 'Translation unavailable'));
    const form = TestimonialFormPage();
    await form.props.onSubmit({ preventDefault() {} });
    expect(feedback).toHaveBeenCalledWith('Translation unavailable');
    expect(routing.navigate).not.toHaveBeenCalled();
  });

  it('saves only editable Hebrew About content and the image', async () => {
    vi.mocked(updateAboutPageContent).mockResolvedValueOnce(defaultAboutPageContent);
    const page = AdminAboutContent();
    page.props.children[0].props.action.props.onClick();
    await vi.waitFor(() => expect(updateAboutPageContent).toHaveBeenCalled());
    const payload = vi.mocked(updateAboutPageContent).mock.calls[0][0];
    expect(payload.title_he).toBe('סיפור ההצלחה שלנו');
    expect(payload.image_url).toBe('/images/our-success-story.png');
    expect(Object.keys(payload).some((key) => key.endsWith('_en'))).toBe(false);
    expect(payload).not.toHaveProperty('stat_1_number');
    expect(payload.body_he).toBe(getAboutBody(defaultAboutPageContent, 'he'));
    expect(payload).not.toHaveProperty('paragraph_1_he');
    expect(payload).not.toHaveProperty('bullet_1_he');
  });

  it.each([false, true])('saves company-number Hebrew labels and preserves decorative content (edit=%s)', async (edit) => {
    const row = { id: 7, value: defaultPublicStats };
    vi.mocked(useState)
      .mockImplementationOnce((() => [defaultCompanyNumbers, vi.fn()]) as typeof useState)
      .mockImplementationOnce((() => [edit ? row : null, vi.fn()]) as typeof useState);
    vi.mocked(createSiteContent).mockResolvedValueOnce(row as never);
    vi.mocked(updateSiteContent).mockResolvedValueOnce(row as never);
    const page = AdminPublicStats();
    page.props.children[0].props.action.props.children[1].props.onClick();
    await vi.waitFor(() => expect(edit ? updateSiteContent : createSiteContent).toHaveBeenCalled());
    const payload = edit ? vi.mocked(updateSiteContent).mock.calls[0][1] : vi.mocked(createSiteContent).mock.calls[0][0];
    const content = payload.value as unknown as typeof defaultPublicStats;
    expect(content.heroStats[0].label.he).toBe('פרויקטים שהושלמו');
    for (const stat of [...content.heroStats, ...content.aboutPreviewStats, ...content.aboutPageStats, content.aboutHighlight]) {
      expect(stat.label).not.toHaveProperty('en');
    }
    expect(content.valueChips[0].label.en).toBe('Premium quality');
    expect(content.heroSince.label.en).toBe('Engineering excellence since');
    expect(defaultPublicStats.heroStats[0].label.en).toBe('Completed projects');
  });
});
