# 02 — Business Requirements

This chapter describes the **final** business requirements — what the client actually wanted after several rounds of iteration — and, just as importantly, what was intentionally dropped. The original brief was broader (a full multilingual "Visual CMS" with products, gallery, testimonials, footer editing, and Arabic UI). The product was deliberately narrowed to a focused, robust core. The removals are summarized here and explained in depth in [Removed Features](17-removed-features.md).

## Final functional requirements

### Company presentation
- A homepage that establishes the premium brand: animated hero, an "about" preview, services preview, featured projects, a "how we work" process section, partners carousel, and testimonials.
- A dedicated **About** page (company story, vision, mission, headline statistics).
- All copy available in **Hebrew and English**, correctly mirrored for RTL/LTR.

### Projects (portfolio)
- A categorized portfolio: each project belongs to one of three categories — **LOCAL** (داخل البلاد / inside the country), **INTERNATIONAL** (خارج البلاد / abroad), or **FEATURED**.
- Each project has a localized title and description, a main image, an ordered gallery of additional images, an active/hidden flag, and a sort order.
- The public Projects page supports category filtering and free-text search.
- "Featured" projects are surfaced on the homepage.

### Services
- A managed catalogue of services, each with a localized title/description, an image, an optional starting price, an active flag, and a sort order.
- Services preview on the homepage and a dedicated Services listing page.

### Partners
- A managed roster of success partners, each with a localized name, a logo image, an optional website URL, an active flag, and a sort order.
- Displayed as an auto-playing, draggable, infinite carousel on the homepage.

### Company information & "Company Numbers"
- The company's headline statistics (completed projects, years of experience, warranty years) must be editable **once** and shown consistently everywhere they appear (hero band, about preview, about page).
- This is the **Company Numbers** model: three canonical numbers, each with a value and Hebrew/English labels, projected automatically onto every statistics section. See [Localization](12-localization.md) and [Admin CMS](10-admin-cms.md).
- Decorative/secondary content (value chips, the "since 2014" badge, the about-image highlight) is preserved in storage but is not part of the simplified editing surface.

### Contact
- A public contact page with the company's direct-contact channels (phone/WhatsApp, email) and a contact form.
- Contact submissions are stored as immutable inbox records with a status workflow (NEW → READ → ARCHIVED).

### Quote requests
- A dedicated "Request a quote" page with a structured form (name, phone, email, project type, service required, optional plans upload placeholder).
- Quote submissions are stored with a status workflow (NEW → IN_PROGRESS → DONE → ARCHIVED) and, when SMTP is configured, trigger an email notification to the company.

### Administration
- No public registration. Admins are created by a super-admin or by a one-off seed script.
- Two roles: `admin` (manages content + inboxes) and `super_admin` (also manages admins and reads the audit log).
- An operational dashboard with live counts and recent activity.
- An audit log of privileged actions (logins and project/admin mutations), readable by super-admins.

## Non-functional requirements

- **Premium, consistent visual identity** across public and admin surfaces (dark navy + gold).
- **Bilingual correctness**: RTL for Hebrew, LTR for English, mirrored layouts, direction-aware icons, per-language fonts.
- **Deployable on a modest VPS** (e.g. Hostinger KVM): local image uploads on a persistent directory, MySQL, a single FastAPI process.
- **Safe-by-default configuration**: the backend refuses to start with a weak/placeholder JWT secret, and refuses a weak super-admin seed password outside development.
- **Maintainability**: a small, conventional, well-tested codebase a future developer can pick up quickly.

## What was intentionally removed

These were part of earlier scope and were **deliberately cut** to keep the product focused and the editing surface safe. Full reasoning is in [Removed Features](17-removed-features.md).

| Removed | Status in the final product |
|---------|-----------------------------|
| **Products module** | Removed entirely. The `products` DB table was dropped by migration; the public `/products` route was removed. The company is a project-portfolio business, not a catalogue retailer. |
| **Visual CMS (in-place page editing)** | Superseded by focused admin forms. The visual-editing components and several admin screens remain in the repo as unrouted legacy code. |
| **Gallery (standalone) editing on the public site** | The `gallery_images` table and API still exist, but there is no public gallery page and no routed admin gallery editor in the final UI. |
| **Testimonials editing** | The `testimonials` table and API still exist and testimonials render on the homepage from the API, but there is no routed admin testimonials editor (the editor screen is unrouted legacy code). |
| **Footer / full website-section editors** | Superseded; the footer and section "visual editors" remain as unrouted legacy code. |
| **Arabic as a public UI language** | Removed from the public language switcher. Arabic remains only as an internal data fallback. |
| **Site settings editor (admin UI)** | The `site_settings` table and API exist, but there is no routed admin screen for it in the final UI. |

## What replaced the removed scope

- The broad "edit anything visually" idea was replaced by **purpose-built forms**: Projects (with gallery), Services, Partners, and the **Company Numbers** editor.
- Static marketing copy (hero/about/section headings, footer text) is shipped as **typed default content** in the frontend (`src/data/siteContent.ts`) rather than being a CMS-managed surface, because the client wanted those locked to the approved design. A legacy `localStorage` preview path remains for that copy and is explicitly not production persistence.
