import { expect, test, type Page } from '@playwright/test';

async function setup(page: Page, language: 'he' | 'en', detailed = false) {
  const failures: string[] = [];
  page.on('pageerror', (error) => failures.push(error.message));
  page.on('response', (response) => {
    if (
      response.url().startsWith('http://127.0.0.1:4173/') &&
      response.status() >= 400
    )
      failures.push(`${response.status()} ${response.url()}`);
  });
  await page.addInitScript(
    (language) => localStorage.setItem('tas_public_language', language),
    language,
  );
  await page.route('**/api/v1/**', (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/projects'))
      return route.fulfill({
        json: detailed
          ? [
              {
                id: 1,
                title_en: 'Detailed project fixture',
                title_he: 'פרויקט מפורט לבדיקה',
                description_en: 'Existing detailed content',
                description_he: 'תוכן מפורט קיים',
                category: 'FEATURED',
                is_active: true,
                sort_order: 1,
                main_image_url: '/images/backgrounds/tas-bg-projects.webp',
              },
            ]
          : [],
      });
    if (path.endsWith('/gallery/project-photos'))
      return route.fulfill({
        json: Array.from({ length: 6 }, (_, index) => ({
          id: index + 1,
          image_url: `/images/backgrounds/tas-bg-projects.webp?photo=${index}`,
          category: index % 2 ? 'INTERNATIONAL' : 'LOCAL',
          is_active: true,
          sort_order: index,
          title_he: null,
          title_en: null,
          alt_text_he: null,
          alt_text_en: null,
          created_at: '2026-10-28T00:00:00',
          updated_at: '2026-10-28T00:00:00',
        })),
      });
    if (path.endsWith('/homepage-video-section'))
      return route.fulfill({ json: null });
    return route.fulfill({ json: [] });
  });
  return failures;
}

for (const language of ['he', 'en'] as const) {
  const projectsLabel = language === 'he' ? 'פרויקטים' : 'Projects';
  const allLabel = language === 'he' ? 'כל הפרויקטים' : 'View All Projects';
  for (const width of [390, 1440]) {
    test(`Projects navbar navigation ${language} ${width}px`, async ({
      page,
    }) => {
      const failures = await setup(page, language);
      await page.setViewportSize({ width, height: 900 });
      for (const from of ['/', '/contact', '/projects']) {
        await page.goto(from, { waitUntil: 'domcontentloaded' });
        if (width < 1024)
          await page
            .locator('header button[aria-controls="mobile-navigation"]')
            .click();
        const link = page
          .locator('header')
          .getByRole('link', { name: projectsLabel, exact: true })
          .filter({ visible: true });
        await expect(link).toHaveAttribute('href', '/projects');
        if (from === '/projects')
          await expect(link).toHaveAttribute('aria-current', 'page');
        await link.click();
        await expect(page).toHaveURL('/projects');
        if (width < 1024)
          await expect(
            page.locator('header button[aria-controls="mobile-navigation"]'),
          ).toHaveAttribute('aria-expanded', 'false');
        else await expect(link).toHaveAttribute('aria-current', 'page');
      }
      // Other homepage navigation retains its cross-route and on-page scroll.
      for (let click = 0; click < 2; click++) {
        if (width < 1024)
          await page
            .locator('header button[aria-controls="mobile-navigation"]')
            .click();
        await page
          .locator('header')
          .getByRole('link', {
            name: language === 'he' ? 'עלינו' : 'About',
            exact: true,
          })
          .filter({ visible: true })
          .click();
        await expect(page).toHaveURL('/');
        await expect
          .poll(() =>
            page
              .locator('#about')
              .evaluate((element) =>
                Math.abs(element.getBoundingClientRect().top),
              ),
          )
          .toBeLessThan(130);
      }
      expect(failures).toEqual([]);
    });
  }

  for (const detailed of [false, true]) {
    test(`Homepage projects ${detailed ? 'populated' : 'empty'} ${language}`, async ({
      page,
    }, testInfo) => {
      const failures = await setup(page, language, detailed);
      await page.setViewportSize({ width: 390, height: 900 });
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      const section = page.locator('#projects');
      await expect(
        section.getByRole('link', { name: allLabel, exact: true }),
      ).toHaveAttribute('href', '/projects');
      await section.scrollIntoViewIfNeeded();
      if (!detailed) {
        expect((await section.boundingBox())!.height).toBeLessThan(400);
        await expect(section.getByText(/added soon|יתווספו בקרוב/)).toHaveCount(
          0,
        );
      } else
        await expect(
          section.getByRole('heading', {
            name:
              language === 'he'
                ? 'פרויקט מפורט לבדיקה'
                : 'Detailed project fixture',
          }),
        ).toBeVisible();
      await page.screenshot({ path: testInfo.outputPath('homepage.png') });
      await section.getByRole('link', { name: allLabel, exact: true }).click();
      await expect(page).toHaveURL('/projects');
      await expect(
        page
          .locator('section[aria-labelledby="project-photo-gallery"]')
          .locator('img'),
      ).toHaveCount(6);
      if (!detailed)
        await expect(
          page.getByPlaceholder(/Search projects|חפש בפרויקטים/),
        ).toHaveCount(0);
      else
        await expect(
          page.getByRole('heading', {
            name:
              language === 'he'
                ? 'פרויקט מפורט לבדיקה'
                : 'Detailed project fixture',
          }),
        ).toBeVisible();
      expect(failures).toEqual([]);
    });
  }

  for (const width of [320, 360, 390, 430, 768]) {
    test(`Mobile gallery polish ${language} ${width}px`, async ({
      page,
    }, testInfo) => {
      const failures = await setup(page, language);
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/projects', { waitUntil: 'domcontentloaded' });
      const gallery = page.locator(
        'section[aria-labelledby="project-photo-gallery"]',
      );
      await expect(gallery.locator('img')).toHaveCount(6);
      await gallery.evaluate((element) =>
        window.scrollTo({
          top: element.getBoundingClientRect().top + scrollY - 80,
          behavior: 'instant',
        }),
      );
      await expect(gallery.locator('h2')).toHaveCSS('opacity', '1');
      const photos = gallery.locator('button:has(img)');
      const first = await photos.nth(0).boundingBox();
      const second = await photos.nth(1).boundingBox();
      expect(Math.abs(first!.y - second!.y)).toBeLessThan(1);
      for (const filter of await gallery.locator('[aria-pressed]').all())
        expect((await filter.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await gallery
        .locator('img')
        .first()
        .evaluate(
          (image) => image instanceof HTMLImageElement && image.decode(),
        );
      await page.screenshot({ path: testInfo.outputPath('gallery.png') });
      await gallery.locator('[aria-pressed]').nth(2).click();
      await expect(photos).toHaveCount(3);
      await gallery.locator('[aria-pressed]').first().click();
      await photos.first().click();
      const dialog = page.getByRole('dialog');
      await dialog
        .locator('img')
        .evaluate(
          (image) => image instanceof HTMLImageElement && image.decode(),
        );
      await expect(
        dialog.getByRole('button', {
          name: language === 'he' ? 'סגירה' : 'Close',
          exact: true,
        }),
      ).toBeFocused();
      const next = dialog.getByRole('button', {
        name: language === 'he' ? 'התמונה הבאה' : 'Next photo',
        exact: true,
      });
      if (width < 640) {
        const image = await dialog.locator('img').boundingBox();
        expect((await next.boundingBox())!.y).toBeGreaterThan(
          image!.y + image!.height,
        );
      }
      await next.click();
      await expect(
        dialog.getByRole('status').filter({ hasText: '2 / 6' }),
      ).toBeVisible();
      await page.screenshot({ path: testInfo.outputPath('lightbox.png') });
      await page.keyboard.press('Escape');
      await expect(dialog).toHaveCount(0);
      await expect(photos.first()).toBeFocused();
      await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
      expect(failures).toEqual([]);
    });
  }

  test(`Portrait lightbox stays clear of phone controls ${language}`, async ({
    page,
  }, testInfo) => {
    const failures = await setup(page, language);
    await page.route(
      '**/images/backgrounds/tas-bg-projects.webp?photo=*',
      (route) =>
        route.fulfill({
          contentType: 'image/svg+xml',
          body: '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="1600"><rect width="400" height="1600" fill="#8892B0"/></svg>',
        }),
    );
    for (const height of [844, 480]) {
      await page.setViewportSize({ width: 390, height });
      await page.goto('/projects', { waitUntil: 'domcontentloaded' });
      await page
        .locator(
          'section[aria-labelledby="project-photo-gallery"] button:has(img)',
        )
        .first()
        .click();
      const dialog = page.getByRole('dialog');
      await dialog
        .locator('img')
        .evaluate(
          (image) => image instanceof HTMLImageElement && image.decode(),
        );
      const image = (await dialog.locator('img').boundingBox())!;
      const next = (await dialog
        .getByRole('button', {
          name: language === 'he' ? 'התמונה הבאה' : 'Next photo',
          exact: true,
        })
        .boundingBox())!;
      expect(image.width / image.height).toBeCloseTo(0.25, 2);
      expect(image.y).toBeGreaterThanOrEqual(64);
      expect(image.y + image.height).toBeLessThan(next.y);
      expect(next.y + next.height).toBeLessThanOrEqual(height);
      await page.screenshot({
        path: testInfo.outputPath(`portrait-${height}.png`),
      });
      await page.keyboard.press('Escape');
    }
    expect(failures).toEqual([]);
  });
}
