import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ADMIN_LANGUAGE_STORAGE_KEY, AdminLanguageProvider } from '@/i18n';
import { AdminLayout } from './AdminLayout';

vi.mock('@/api/auth', () => ({ logout: vi.fn() }));

vi.mock('@/components/admin/AdminAuthProvider', () => ({
  useAdminAuth: () => ({
    admin: { id: 1, email: 'owner@example.com', full_name: 'Owner Admin', role: 'super_admin' },
  }),
}));

function renderAdminLayout(path = '/admin', language: 'he' | 'en' = 'he') {
  vi.stubGlobal('window', {
    localStorage: {
      getItem: (key: string) => (key === ADMIN_LANGUAGE_STORAGE_KEY ? language : null),
      setItem: vi.fn(),
    },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}>
      <AdminLanguageProvider>
        <Routes>
          <Route path="/admin/*" element={<AdminLayout />}>
            <Route path="*" element={<div>Admin content</div>} />
          </Route>
        </Routes>
      </AdminLanguageProvider>
    </MemoryRouter>,
  );
}

describe('AdminLayout sidebar', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('keeps desktop sidebar items visible without a scrollbar and preserves small-height fallback', () => {
    const html = renderAdminLayout('/admin/testimonials');

    expect(html).toContain('flex-col');
    // Mobile scrolls the drawer nav whenever it overflows; desktop keeps the
    // no-scrollbar polish and only falls back to scrolling on short viewports.
    expect(html).toContain('flex-1 overflow-y-auto');
    expect(html).toContain('lg:overflow-visible');
    expect(html).toContain('lg:[@media(max-height:699px)]:overflow-y-auto');
    expect(html).toContain('shrink-0 border-t');
    expect(html).not.toContain('absolute bottom-0');
    expect((html.match(/min-h-11/g) ?? []).length).toBeGreaterThanOrEqual(12);

    [
      '/admin/testimonials',
      '/admin/public-stats',
      '/admin/contact-messages',
      '/admin/quote-requests',
      '/admin/admins',
      '/admin/audit-logs',
      '/',
    ].forEach((href) => expect(html).toContain(`href="${href}"`));
  });
});

describe('AdminLayout mobile/tablet drawer', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('is closed by default: off-canvas, using logical (nearest-dir-aware) positioning, and always visible at lg+', () => {
    const html = renderAdminLayout('/admin');

    // Fixed off-canvas below lg, sticky in-flow at lg+; no reliance on an
    // implicit/undefined static position (explicit logical inset).
    expect(html).toContain('fixed top-0 start-0');
    expect(html).toContain('lg:sticky');
    expect(html).toContain('lg:start-auto');
    // Border follows the drawer's content-facing edge via a logical property,
    // not Tailwind's ltr:/rtl: variants (see note below on why those are unsafe
    // here) and not a hardcoded physical side.
    expect(html).toContain('border-e');
    // Desktop is always visible regardless of the mobile toggle state.
    expect(html).toContain('lg:translate-x-0');
    expect(html).not.toContain('lg:translate-x-0 translate-x-0');
    // Requested drawer sizing: ~280-320px on mobile, 100dvh height.
    expect(html).toContain('w-72');
    expect(html).toContain('h-dvh');
    // No backdrop while closed.
    expect(html).not.toContain('bg-black/50');
    // Tailwind's ltr:/rtl: variants match ANY ancestor with that dir attribute,
    // not only the nearest one — so they silently break once the admin area's
    // own dir differs from the public site's outer dir wrapper. The closed-state
    // slide direction must therefore never be authored with these variants.
    expect(html).not.toContain('ltr:');
    expect(html).not.toContain('rtl:');
  });

  it('slides off-screen on the correct physical side per language (nearest-dir-aware, not ancestor-any-match)', () => {
    const he = renderAdminLayout('/admin', 'he');
    const en = renderAdminLayout('/admin', 'en');

    // Hebrew (RTL): drawer is anchored to the visual right and hides by
    // translating further right.
    expect(he).toContain('dir="rtl"');
    expect(he).toContain('translate-x-full');
    expect(he).not.toContain('-translate-x-full');

    // English (LTR): drawer is anchored to the visual left and hides by
    // translating further left. This is the exact case that silently broke
    // under Tailwind's ltr:/rtl: variants (see previous test) because the
    // admin subtree's dir="ltr" is nested inside the public site's outer
    // dir="rtl" wrapper.
    expect(en).toContain('dir="ltr"');
    expect(en).toContain('-translate-x-full');
  });

  it('exposes an accessible, single toggle button wired to the drawer', () => {
    const html = renderAdminLayout('/admin');
    expect(html).toContain(`aria-controls="admin-mobile-sidebar"`);
    expect(html).toContain('aria-expanded="false"');
    // Toggle stays above the drawer's stacking context.
    expect(html).toContain('z-[60]');
  });
});
