import { describe, expect, it, vi } from 'vitest';
import {
  HOME_SECTION_IDS,
  getHomeNavigationAction,
  scrollToHomeSection,
} from './homeNavigation';

describe('homepage section navigation', () => {
  it('defines the public landing-page sections', () => {
    expect(HOME_SECTION_IDS).toEqual(['home', 'about', 'services', 'projects', 'partners']);
  });

  it('scrolls directly when already on the homepage', () => {
    expect(getHomeNavigationAction('/', 'services')).toEqual({ type: 'scroll', target: 'services' });
  });

  it('navigates home with scroll state from another route', () => {
    expect(getHomeNavigationAction('/contact', 'about')).toEqual({
      type: 'navigate',
      to: '/',
      state: { scrollTo: 'about' },
    });
  });

  it('smooth-scrolls to a rendered section', () => {
    const scrollIntoView = vi.fn();
    const found = scrollToHomeSection('partners', () => ({ scrollIntoView }));

    expect(found).toBe(true);
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });
});
