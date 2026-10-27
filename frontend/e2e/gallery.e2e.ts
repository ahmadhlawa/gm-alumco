import { expect, test, type Page } from '@playwright/test';

const photo = (id: number, category = 'LOCAL', is_active = true) => ({
  id,
  category,
  is_active,
  sort_order: id,
  image_url: `/images/backgrounds/tas-bg-projects.webp?photo=${id}`,
  title_he: null,
  title_en: null,
  alt_text_he: null,
  alt_text_en: null,
  created_at: '2026-10-27T00:00:00',
  updated_at: '2026-10-27T00:00:00',
});

async function setup(
  page: Page,
  options: {
    language?: 'he' | 'en';
    admin?: boolean;
    empty?: boolean;
    failed?: boolean;
    partial?: boolean;
    lostResponse?: boolean;
    failedUpload?: boolean;
  } = {},
) {
  const items = options.empty
    ? []
    : [photo(1), photo(2, 'INTERNATIONAL'), photo(3)];
  let uploads = 0;
  let creates = 0;
  await page.addInitScript(
    ({ language, admin }) => {
      localStorage.setItem('tas_public_language', language);
      localStorage.setItem('tas_admin_language', language);
      if (admin) sessionStorage.setItem('tas_admin_token', 'test-token');
    },
    { language: options.language ?? 'en', admin: options.admin ?? false },
  );
  // Every API request is intercepted; these tests never reach shared services.
  await page.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    const method = route.request().method();
    if (path.endsWith('/auth/me'))
      return route.fulfill({
        json: {
          id: 1,
          full_name: 'Test Admin',
          email: 'admin@example.com',
          role: 'admin',
          is_active: true,
        },
      });
    if (path.endsWith('/uploads/image')) {
      uploads++;
      if (options.failedUpload && uploads === 1) {
        return route.fulfill({ status: 503, json: { detail: 'Upload temporarily unavailable' } });
      }
      return route.fulfill({
        status: 201,
        json: {
          url: `/uploads/gallery/12345678-1234-1234-1234-${String(uploads).padStart(12, '0')}.png`,
          filename: 'photo.png',
          content_type: 'image/png',
          size: 68,
        },
      });
    }
    if (/\/gallery(?:\/project-photos)?(?:\/\d+)?$/.test(path)) {
      if (method === 'GET')
        return route.fulfill({
          status: options.failed ? 503 : 200,
          json: options.failed ? { detail: 'Unavailable' } : items,
        });
      if (method === 'POST') {
        creates++;
        if (options.partial && creates === 2)
          return route.fulfill({
            status: 503,
            json: { detail: 'Save temporarily unavailable' },
          });
        const data = route.request().postDataJSON();
        let created = items.find((item) => item.image_url === data.image_url);
        if (!created) {
          created = { ...photo(items.length + 1, data.category), ...data };
          items.push(created);
        }
        if (options.lostResponse && creates === 1) return route.abort();
        return route.fulfill({ status: 201, json: created });
      }
      if (method === 'PUT') {
        const item = items.find(
          (item) => item.id === Number(path.split('/').pop()),
        )!;
        Object.assign(item, route.request().postDataJSON());
        return route.fulfill({ json: item });
      }
    }
    if (path.endsWith('/projects'))
      return route.fulfill({
        json: [
          {
            id: 10,
            title_en: 'Existing detailed project',
            title_he: 'פרויקט קיים',
            description_en: 'Existing description',
            description_he: 'תיאור קיים',
            category: 'LOCAL',
            main_image_url: '/images/backgrounds/tas-bg-projects.webp',
            is_active: true,
            sort_order: 1,
          },
        ],
      });
    return route.fulfill({ json: [] });
  });
  await page.route('**/uploads/gallery/**', (route) =>
    route.fulfill({
      contentType: 'image/png',
      body: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
        'base64',
      ),
    }),
  );
  return { items, counts: () => ({ uploads, creates }) };
}

test('filters, switches language, preserves detailed projects and contains no captions', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await setup(page);
  await page.goto('/projects', { waitUntil: 'domcontentloaded' });
  const gallery = page.locator(
    'section[aria-labelledby="project-photo-gallery"]',
  );
  await expect(gallery.getByRole('button', { name: /Open photo/ })).toHaveCount(
    3,
  );
  await gallery
    .getByRole('button', { name: 'International', exact: true })
    .click();
  await expect(gallery.getByRole('button', { name: /Open photo/ })).toHaveCount(
    1,
  );
  await page.getByRole('button', { name: 'HE', exact: true }).click();
  await expect(
    gallery.getByRole('button', { name: 'בינלאומי', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(
    gallery.getByRole('button', { name: /פתיחת תמונה/ }),
  ).toHaveCount(1);
  await expect(page.getByText('פרויקט קיים', { exact: true })).toBeVisible();
  await expect(gallery.locator('figcaption')).toHaveCount(0);
});

test('empty category, single-photo viewer, RTL keys and touch navigation', async ({
  page,
}) => {
  const api = await setup(page, { language: 'he' });
  api.items.splice(1);
  await page.goto('/projects', { waitUntil: 'domcontentloaded' });
  const gallery = page.locator(
    'section[aria-labelledby="project-photo-gallery"]',
  );
  await gallery.getByRole('button', { name: 'בינלאומי', exact: true }).click();
  await expect(
    gallery.getByText('אין תמונות בקטגוריה זו.', { exact: true }),
  ).toBeVisible();
  await gallery.getByRole('button', { name: 'הכל', exact: true }).click();
  await gallery.getByRole('button', { name: /פתיחת תמונה/ }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('button')).toHaveCount(1);
  await expect(dialog.getByRole('status')).toHaveText('1 / 1');
  await page.keyboard.press('Escape');
  api.items.push(photo(2), photo(3));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await gallery.getByRole('button', { name: /פתיחת תמונה 1/ }).click();
  await page.keyboard.press('ArrowLeft');
  await expect(dialog.getByRole('status')).toHaveText('2 / 3');
  await dialog.evaluate((element) => {
    const start = new Touch({
      identifier: 1,
      target: element,
      clientX: 200,
      clientY: 200,
    });
    const end = new Touch({
      identifier: 1,
      target: element,
      clientX: 300,
      clientY: 200,
    });
    element.dispatchEvent(
      new TouchEvent('touchstart', { touches: [start], bubbles: true }),
    );
    element.dispatchEvent(
      new TouchEvent('touchend', { changedTouches: [end], bubbles: true }),
    );
  });
  await expect(dialog.getByRole('status')).toHaveText('3 / 3');
});

test('public fetch retry and broken photo recovery', async ({ page }) => {
  await setup(page, { failed: true });
  await page.goto('/projects', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('alert')).toContainText('Could not load photos');
  await page.route('**/api/v1/gallery/project-photos', (route) =>
    route.fulfill({ json: [photo(1)] }),
  );
  await page.route(
    '**/images/backgrounds/tas-bg-projects.webp?photo=*',
    (route) => route.abort(),
  );
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await expect(
    page.getByText('This photo could not be displayed.', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: /Open photo 1/ }).click();
  await expect(
    page.getByRole('dialog').getByText('This photo could not be displayed.'),
  ).toBeVisible();
});

test('lightbox traps focus, navigates, locks scroll and restores opener', async ({
  page,
}) => {
  await setup(page);
  await page.goto('/projects', { waitUntil: 'domcontentloaded' });
  const opener = page.getByRole('button', { name: /Open photo 1/ });
  await opener.click();
  const dialog = page.getByRole('dialog', { name: 'Photo viewer' });
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole('button', { name: 'Close', exact: true }),
  ).toBeFocused();
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  await page.keyboard.press('ArrowRight');
  await expect(dialog.getByRole('status')).toHaveText('2 / 3');
  await page.keyboard.press('ArrowLeft');
  await expect(dialog.getByRole('status')).toHaveText('1 / 3');
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Tab');
    expect(
      await dialog.evaluate((el) => el.contains(document.activeElement)),
    ).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
});

test('empty gallery and failed fetch have clear independent states', async ({
  page,
}) => {
  await setup(page, { empty: true });
  await page.goto('/projects', { waitUntil: 'domcontentloaded' });
  await expect(
    page.getByText('No gallery photos yet.', { exact: true }),
  ).toBeVisible();
  await setup(page, { failed: true });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(
    page.getByText('Could not load photos. Please try again.', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('Existing detailed project', { exact: true }),
  ).toBeVisible();
});

test('admin gallery redirects unauthenticated visitors', async ({ page }) => {
  await setup(page);
  await page.goto('/admin/gallery', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/admin\/login$/);
});

const files = [1, 2].map((id) => ({
  name: `photo-${id}.png`,
  mimeType: 'image/png',
  buffer: Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    'base64',
  ),
}));

for (const lostResponse of [false, true]) {
  test(`admin previews uploads and retries ${lostResponse ? 'lost responses' : 'partial saves'} without reuploading`, async ({
    page,
  }) => {
    const api = await setup(page, {
      admin: true,
      empty: true,
      partial: !lostResponse,
      lostResponse,
    });
    await page.goto('/admin/gallery', { waitUntil: 'domcontentloaded' });
    await page
      .getByLabel('Project location', { exact: true })
      .selectOption('INTERNATIONAL');
    await page.locator('input[type="file"]').setInputFiles(files);
    await expect(page.getByText('photo-1.png', { exact: true })).toBeVisible();
    expect(api.counts().uploads).toBe(0);
    await page
      .getByRole('button', { name: 'Upload and publish', exact: true })
      .dblclick();
    await expect(
      page.getByRole('button', { name: 'Retry failed', exact: true }),
    ).toBeVisible();
    await page
      .getByRole('button', { name: 'Retry failed', exact: true })
      .click();
    await expect(
      page.getByRole('button', { name: 'Hide', exact: true }),
    ).toHaveCount(2);
    expect(api.counts().uploads).toBe(2);
    expect(api.items).toHaveLength(2);
    expect(api.items.every((item) => item.category === 'INTERNATIONAL')).toBe(
      true,
    );
    await page
      .getByRole('button', { name: 'Hide', exact: true })
      .first()
      .click();
    await expect(
      page.getByRole('button', { name: 'Publish', exact: true }),
    ).toHaveCount(1);
    await page
      .getByLabel('Photo category 1', { exact: true })
      .selectOption('LOCAL');
    await expect(
      page.getByLabel('Photo category 1', { exact: true }),
    ).toHaveValue('LOCAL');
    await page.getByRole('button', { name: 'Publish', exact: true }).click();
    await expect(
      page.getByRole('button', { name: 'Hide', exact: true }),
    ).toHaveCount(2);
  });
}

test('admin resumes uploaded files after reload and rejects unsupported images before upload', async ({
  page,
}) => {
  const api = await setup(page, {
    admin: true,
    empty: true,
    lostResponse: true,
  });
  await page.goto('/admin/gallery', { waitUntil: 'domcontentloaded' });
  await page.locator('input[type="file"]').setInputFiles(files[0]);
  await page
    .getByRole('button', { name: 'Upload and publish', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Retry failed', exact: true }),
  ).toBeVisible();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Retry failed', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Hide', exact: true }),
  ).toHaveCount(1);
  expect(api.counts().uploads).toBe(1);
  expect(api.items).toHaveLength(1);
  await page
    .locator('input[type="file"]')
    .setInputFiles({
      name: 'unsafe.svg',
      mimeType: 'image/svg+xml',
      buffer: Buffer.from('<svg/>'),
    });
  await expect(page.getByRole('alert')).toContainText(
    'Choose a JPG, PNG or WEBP image up to 5MB.',
  );
  expect(api.counts().uploads).toBe(1);
});

test('admin retries only the failed upload and preserves successful records', async ({ page }) => {
  const api = await setup(page, { admin: true, empty: true, failedUpload: true });
  await page.goto('/admin/gallery', { waitUntil: 'domcontentloaded' });
  await page.locator('input[type="file"]').setInputFiles(files);
  await page.getByRole('button', { name: 'Upload and publish', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Upload temporarily unavailable');
  await expect(page.getByRole('button', { name: 'Hide', exact: true })).toHaveCount(1);
  await page.getByRole('button', { name: 'Retry failed', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Hide', exact: true })).toHaveCount(2);
  expect(api.counts().uploads).toBe(3);
  expect(api.items).toHaveLength(2);
});

test('slow upload shows progress and leaves existing photo controls usable', async ({ page }, testInfo) => {
  await setup(page, { admin: true });
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/v1/admin/uploads/image', async route => {
    await gate;
    await route.fulfill({ status: 201, json: {
      url: '/uploads/gallery/12345678-1234-1234-1234-123456789abc.png',
      filename: 'photo.png', content_type: 'image/png', size: 68,
    } });
  });
  try {
    await page.goto('/admin/gallery', { waitUntil: 'domcontentloaded' });
    await page.locator('input[type="file"]').setInputFiles(files[0]);
    await page.getByRole('button', { name: 'Upload and publish', exact: true }).click();
    await expect(page.getByRole('progressbar')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Uploading and publishing…', exact: true })).toBeDisabled();
    await page.getByRole('button', { name: 'Hide', exact: true }).first().click();
    await expect(page.getByRole('button', { name: 'Publish', exact: true })).toHaveCount(1);
    await page.screenshot({ path: testInfo.outputPath('upload-progress.png') });
  } finally { release(); }
  await expect(page.getByRole('button', { name: 'Hide', exact: true })).toHaveCount(3);
  await expect(page.getByRole('progressbar')).toHaveCount(0);
});

for (const language of ['he', 'en'] as const) {
  for (const width of [320, 390, 768, 1024, 1440]) {
    test(`responsive public and admin ${language} ${width}px`, async ({
      page,
    }, testInfo) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.setViewportSize({ width, height: 900 });
      await setup(page, { language, admin: true });
      await page.goto('/projects', { waitUntil: 'domcontentloaded' });
      const gallery = page.locator(
        'section[aria-labelledby="project-photo-gallery"]',
      );
      await expect(gallery.locator('img')).toHaveCount(3);
      await gallery.evaluate(element => window.scrollTo({
        top: element.getBoundingClientRect().top + window.scrollY - 80,
        behavior: 'instant',
      }));
      await expect.poll(() => gallery.locator('img').evaluateAll(images =>
        images.every(image => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0),
      )).toBe(true);
      await expect(gallery.locator('h2')).toHaveCSS('opacity', '1');
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({ path: testInfo.outputPath('public.png') });
      await gallery
        .getByRole('button', { name: /Open photo|פתיחת תמונה/ })
        .first()
        .click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      const box = await dialog.boundingBox();
      expect(box!.width).toBeLessThanOrEqual(width);
      await page.screenshot({ path: testInfo.outputPath('lightbox.png') });
      await page.keyboard.press('Escape');
      await page.goto('/admin/gallery', { waitUntil: 'domcontentloaded' });
      await expect(
        page.getByRole('button', { name: /^(Hide|הסתרה)$/ }),
      ).toHaveCount(3);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({ path: testInfo.outputPath('admin.png') });
      expect(errors).toEqual([]);
    });
  }
}
