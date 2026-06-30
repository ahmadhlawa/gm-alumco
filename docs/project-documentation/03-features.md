# 03 — Final Feature List

Every feature below is present and wired in the final repository. Features are grouped by surface. Items that exist in the data model/API but are **not** surfaced in the final UI are flagged explicitly.

## Public website

- **Bilingual UI (Hebrew default, English)** with a one-click language toggle in the navbar; language preference persists in `localStorage` (`tas_public_language`).
- **Direction-aware layout**: `document.documentElement.dir` and per-page `dir` switch between `rtl` (Hebrew) and `ltr` (English); icons and hero background mirror accordingly.
- **Animated homepage** (`/`): cinematic geometric hero with Ken Burns background zoom, floating clipped shapes, staggered reveal, headline numbers band, and value chips; about preview; services showcase; featured projects; "how we work" process grid; partners carousel; testimonials; CTA.
- **About page** (`/about`): company story, checklist of differentiators, vision & mission, headline statistics (driven by Company Numbers), and an animated highlight badge.
- **Services page** (`/services`): live list of active services from the API.
- **Projects page** (`/projects`): live list of active projects with **category filter** and **text search**, animated grid with enter/exit transitions, loading/error/empty states.
- **Contact page** (`/contact`): direct-contact block (WhatsApp/phone, email), a working contact form, and a Google Maps placeholder.
- **Request-a-quote page** (`/request-quote`): structured quote form (name, phone, email, project type, service required, plans-upload placeholder) that POSTs live to the backend.
- **Persistent WhatsApp button** and direct-contact actions.
- **Cross-route section scrolling**: navbar links to homepage sections scroll smoothly, even from other routes (via router state + `requestAnimationFrame`).
- **Detail-page placeholders** (`/projects/:slug`, `/services/:slug`) and a **careers placeholder** (`/careers`) — intentionally "coming soon".
- **Graceful image handling**: an inline SVG placeholder and an `onError` fallback for every remote/uploaded image; Google Drive `/file/d/…/view` links are auto-rewritten to a direct-view URL.

## Admin CMS

Routed, working admin pages (see [Admin CMS](10-admin-cms.md) for full detail):

- **Login** (`/admin/login`) — real JWT auth against the backend.
- **Dashboard** (`/admin`) — live stat cards (active projects by category, services, partners, unarchived messages/quotes), quick-action shortcuts, and a recent-activity panel (recent messages/quotes for admins; recent audit events for super-admins).
- **Projects** (`/admin/projects`, `/new`, `/:id/edit`) — full create/edit/delete, Hebrew+English title/description editing, category, sort order, active flag, main image (upload or manual URL), and an **image-gallery manager** in edit mode.
- **Services** (`/admin/services`, `/new`, `/:id/edit`) — managed via the services API.
- **Partners** (`/admin/partners`, `/new`, `/:id/edit`) — name, logo upload, website URL, active flag, sort order.
- **Company Numbers** (`/admin/public-stats`) — Hebrew/English editor for the three canonical numbers, with save and "restore defaults".
- **Contact messages** (`/admin/contact-messages`) — read messages, change status (NEW/READ/ARCHIVED).
- **Quote requests** (`/admin/quote-requests`) — read quotes, change status (NEW/IN_PROGRESS/DONE/ARCHIVED).
- **Admins** (`/admin/admins`, super-admin only) — create admins, change roles, reset passwords, deactivate/reactivate, with self-protection guards.
- **Audit logs** (`/admin/audit-logs`, super-admin only) — recent privileged actions.
- **Role-aware navigation**: the sidebar shows the admin/super-admin items appropriate to the logged-in role.
- **Auth lifecycle**: route guard redirects unauthenticated users to login; a global `gm-auth-expired` event clears the token and bounces to login on any 401.

> **Not in the final admin UI** (data/API exist, no routed editor): standalone Gallery editor, Testimonials editor, Site Content/Settings editors, Website/Hero/Sections/Footer "visual" editors, Blog, Clients. These remain as unrouted legacy files — see [Removed Features](17-removed-features.md).

## Backend (API)

- **REST API** under `/api/v1` with auto-generated OpenAPI docs at `/api/v1/docs`.
- **Public read endpoints** for projects, services, partners, gallery, testimonials, site-content, site-settings.
- **Public write endpoints** for contact messages and quote requests.
- **Admin (JWT-protected) CRUD** for projects (+ project images), services, partners, gallery, testimonials, site-content, site-settings, contact messages, quote requests.
- **Super-admin-only** admin-account management and audit-log reading.
- **Dashboard stats** aggregation endpoint.
- **Soft delete** (`is_active = false`) for catalogue entities; **hard delete** for inbox records, project images, and site settings.
- **Quote-request email notification** via SMTP (best-effort; saving always succeeds even if email fails).
- **Health check** endpoint.

## Uploads

- **Authenticated image upload** endpoint (`POST /admin/uploads/image`) accepting a file + a target folder (`projects` / `services` / `partners` / `gallery`).
- **Strict validation**: extension allow-list (`.jpg/.jpeg/.png/.webp`), declared content-type match, **magic-byte signature check**, and a 5 MB size cap.
- **UUID-named storage** under `backend/uploads/<folder>/`, served statically from `/uploads/...`.
- **Client-side upload with progress** (XHR `upload.onprogress`).
- Uploaded URLs are stored as relative `/uploads/...` strings and resolved to the API origin at render time.

## Authentication

- **JWT bearer** auth (HS256), token issued by `POST /auth/login`, validated on every protected request.
- **Token stored in `sessionStorage`** (`tas_admin_token`) on the client.
- **Bcrypt** password hashing (passlib).
- **Login rate limiting**: max 5 failed attempts per IP per 5-minute sliding window (in-process).
- **Two roles** (`admin`, `super_admin`) enforced by FastAPI dependencies.
- **`GET /auth/me`** to load the current admin identity into the SPA.

## Localization

- **Two public languages** (Hebrew, English) with a runtime `LanguageProvider`/`useLanguage` context and a `t(ar, he, en)` helper.
- **Trilingual data model** (`*_ar`, `*_en`, `*_he` columns) with a locale-aware `pick()` fallback chain.
- **Per-language fonts** (`Heebo` for Hebrew, `Tajawal` otherwise) selected via `html[lang]`.
- **Arabic preserved as internal fallback** but absent from the public language switcher.
- Admin UI copy is mostly Arabic (legacy operational language); the **Company Numbers** editor is Hebrew/English only.
