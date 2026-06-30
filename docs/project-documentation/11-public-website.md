# 11 — Public Website

The public site is the marketing surface. It is bilingual (Hebrew default, English), animated, and dark-premium. All chrome (navbar, footer, WhatsApp button) wraps a nested route tree; the language toggle flips the entire layout RTL↔LTR.

## Navigation & chrome

- **Navbar** (`components/layout/Navbar.tsx`): transparent at the top, becomes a blurred navy bar on scroll. Links point at homepage sections (Home, About, Services, Projects, Partners) and the Contact page. Section links **scroll smoothly** when already on the homepage, or navigate home with router state and then scroll (handled by `homeNavigation.ts` + `Home.tsx`). Includes the **language toggle** (HE↔EN) and a "Request a quote" CTA. Collapses to a full-screen mobile menu.
- **Footer** and a persistent **WhatsApp button** appear on every public page.

## Pages & sections

### Home (`/`)
Composed of, in order:
1. **GeometricHero** — full-screen animated hero: Ken Burns background zoom on `main.jpeg` (mirrored for LTR), layered navy/gold gradient overlays, floating clipped polygon shapes, a "since 2014" badge, the headline + subtitle, two CTAs, a **three-number statistics band**, and a **value-chips** row. Numbers and chips come from the Company Numbers document.
2. **About preview** — heading/description (from static `siteContent`) + a 2×2 statistics grid (from `aboutPreviewStats`), over a subtle architectural background.
3. **ServicesShowcase** — active services fetched live from the API (`getServices`).
4. **FeaturedProjectsShowcase** — featured projects from the API.
5. **"How we work" process grid** — four steps (consultation, survey, manufacturing, installation), static localized copy, over a facade background with an SVG grid pattern.
6. **SuccessPartners** — the partners carousel (live from the API).
7. **Testimonials** — three testimonial cards (live from the API).
8. **CTASection**.

### About (`/about`)
Company story, a checklist of differentiators, an animated highlight badge (from `aboutHighlight`), a four-stat band (from `aboutPageStats`), and vision & mission panels. Statistics are driven by the Company Numbers document; the rest is static localized copy.

### Services (`/services`)
Live list of active services from the API, rendered with the shared section/card components and loading/error/empty states.

### Projects (`/projects`)
Live list of active projects with a **category filter** (All / the categories present in the data) and a **text search** (matches title/location). The grid animates entries/exits (`AnimatePresence`, `layout`) and shows loading/error/empty states.

### Contact (`/contact`)
Direct-contact block (address "by appointment", phone/WhatsApp number, email), the **ContactForm** (POSTs to `/contact/messages`), and a Google Maps **placeholder** (the live map is deferred).

### Request a quote (`/request-quote`)
The **QuoteRequestForm** (name, phone, email — all required client-side — plus project-type and service selects and a plans-upload placeholder). On submit it POSTs to `/quote-requests`; on success it shows a confirmation panel. The project-type selection is folded into the `message` field; the service select maps to `service_type`.

### Placeholders
`/projects/:slug` and `/services/:slug` render a typed "details in preparation" page; `/careers` renders a "coming soon" page. These are intentional, not stubs left by accident.

## Where the data comes from

| Surface | Source |
|---------|--------|
| Services, Projects, Partners, Testimonials | **Backend API**, mapped to localized view models by `lib/api.ts` + `adapters.ts` |
| Hero/about statistics, value chips, badges | **Backend** `site_content` (`public_stats/content`) via `getPublicStatsContent`, with typed defaults as fallback |
| Hero/about/section headings, footer text, vision/mission, process steps | **Static typed content** in `src/data/siteContent.ts` (locked to the approved design) |
| Contact / quote submissions | **Backend** POST endpoints |
| Logos, hero image, backgrounds, favicons | **Static assets** in `public/images/` |
| Uploaded content images | **Backend** `/uploads/...`, resolved to the API origin by `normalizeImageUrl` |

When an API call fails, pages fall back to empty lists or default statistics rather than crashing, so the site degrades gracefully.

## Animation philosophy

Motion is **cinematic but restrained**: a slow, continuous hero zoom; staggered, blur-in reveals for hero content; one-time scroll reveals (`whileInView` + `once: true`) so sections animate in as you scroll but don't re-trigger; smooth layout transitions on the Projects grid; and a custom infinite, draggable, autoplaying partners carousel. The goal is to feel high-end without being distracting or hurting performance.

## Responsive behavior

Every layout uses Tailwind breakpoints. Multi-column grids collapse to single columns on mobile; the hero scales its type and switches column widths by direction; the navbar and (in admin) the sidebar become off-canvas menus; the partners carousel shows 2/3/4/5 logos depending on viewport width.

## Localization (public)

- Default language **Hebrew (RTL)**, toggle to **English (LTR)**. The choice persists in `localStorage` and is applied to `<html lang>`/`dir`.
- UI strings use `t(ar, he, en)`; data strings use the localized columns with a fallback chain.
- Fonts switch by language (Heebo for Hebrew, Tajawal otherwise). Direction-aware details include the mirrored hero background and the LTR-flipped arrow icon on the hero CTA. Full detail in [Localization](12-localization.md).

## SEO considerations

The site is a **client-side-rendered Vite SPA**, so SEO is currently **basic**: a single static `index.html`, per-language `<html lang>`/`dir` set at runtime, semantic headings, descriptive `alt` text on content images, and clean route paths. There is **no** server-side rendering, no per-route `<title>`/meta management, no sitemap/robots, and no structured data yet. These are called out as improvements in [Roadmap](19-roadmap.md). For a marketing site this is the most significant area for future investment.
