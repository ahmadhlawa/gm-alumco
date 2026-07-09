import { describe, expect, it } from 'vitest';
import { getAdminNavigation } from './adminNavigation';

describe('admin navigation', () => {
  it('contains only operational company website sections', () => {
    const labels = getAdminNavigation('admin').map((item) => item.label);
    const paths = getAdminNavigation('admin').map((item) => item.path);

    expect(paths).toEqual([
      '/admin',
      '/admin/projects',
      '/admin/production-projects',
      '/admin/services',
      '/admin/partners',
      '/admin/testimonials',
      '/admin/homepage-video',
      '/admin/about-content',
      '/admin/public-stats',
      '/admin/contact-messages',
      '/admin/quote-requests',
    ]);
    expect(labels.join(' ')).not.toMatch(/منتج|متجر|CMS/i);
  });

  it('adds admin management and audit logs only for super admins', () => {
    const adminPaths = getAdminNavigation('admin').map((item) => item.path);
    const superPaths = getAdminNavigation('super_admin').map((item) => item.path);

    expect(adminPaths).not.toContain('/admin/admins');
    expect(adminPaths).not.toContain('/admin/audit-logs');
    expect(superPaths).toContain('/admin/admins');
    expect(superPaths).toContain('/admin/audit-logs');
  });
});
