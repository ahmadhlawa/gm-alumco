# 10 — Admin CMS

The admin CMS is the private, role-based content-management surface, served from the same SPA under `/admin/*`. It is **deliberately focused**: rather than a general page-builder, it exposes purpose-built editors for exactly the content the client needs to keep current, so non-technical staff cannot break the public design.

## Access, shell & roles

- **Login** at `/admin/login`. Successful login stores the JWT in `sessionStorage` and redirects to the dashboard.
- The whole `/admin` subtree is wrapped by `RequireAuth` (redirects to login if no token; listens for the global `gm-auth-expired` event to bounce out on any 401) and `AdminAuthProvider` (loads `GET /auth/me` once into context).
- **`AdminLayout`** renders the persistent RTL sidebar (logo, role-aware nav, "back to site", logout) and a header showing the logged-in admin's name/email/initials. The sidebar collapses to an off-canvas menu on mobile.
- **Role-aware navigation** (`adminNavigation.ts`): all admins see Dashboard, Projects, Services, Partners, Company Numbers (נתוני החברה), Contact messages, Quote requests. **Super-admins additionally** see "إدارة المدراء" (Admins) and "سجل النشاط" (Audit log).

### Permissions matrix

| Capability | `admin` | `super_admin` |
|------------|:------:|:-------------:|
| Dashboard | ✅ | ✅ |
| Projects (CRUD + images) | ✅ | ✅ |
| Services (CRUD) | ✅ | ✅ |
| Partners (CRUD) | ✅ | ✅ |
| Company Numbers | ✅ | ✅ |
| Contact messages (read / status / delete) | ✅ | ✅ |
| Quote requests (read / status / delete) | ✅ | ✅ |
| Upload images | ✅ | ✅ |
| **Manage admins** (create/role/reset/deactivate) | ❌ | ✅ |
| **Read audit log** | ❌ | ✅ |

Gating is enforced **on both ends**: the frontend (`RequireSuperAdmin` + nav filtering) and the backend (`require_super_admin` dependency). A non-super-admin who navigates directly to `/admin/admins` is redirected, and the API would reject the call anyway with `403`.

## Dashboard (`/admin`)

The operational landing page. It loads `GET /admin/dashboard/stats` and renders:

- **Stat cards**: total active projects, projects by category (local / international / featured), active services, active partners, unarchived contact messages, unarchived quote requests.
- **Quick actions**: shortcuts to create a project/service/partner, view messages, and (super-admin only) manage admins.
- **Recent activity**: for a regular admin, two panels showing the latest contact messages and quote requests; for a super-admin, a single panel of the latest audit events. Dates render with `toLocaleDateString('ar-EG')`.

## Projects (`/admin/projects`, `/new`, `/:id/edit`)

The richest editor. `AdminProjects` lists all projects as cards (main image, category badge, published/hidden status, sort order) with edit/delete actions (delete asks for confirmation and calls the soft-delete API).

`ProjectFormPage` + `ProjectForm` provide create/edit:
- **Localized fields edited in Hebrew + English** via a language switcher (title + description). Arabic values are **preserved** on save — the form simply doesn't edit them (existing `*_ar` is passed through untouched).
- **Category** select (LOCAL / INTERNATIONAL / FEATURED), **sort order**, and a **published** (`is_active`) checkbox.
- **Main image**: upload via `ImageUploadField` (with progress), or an "advanced" manual URL input (e.g. a Google Drive link).
- Validation requires Hebrew **and** English titles before submit.
- On create, the user is redirected to the edit page so they can immediately add gallery images.

In **edit mode**, a **Project Images Manager** lets the admin upload or URL-add additional gallery images and delete them, each persisted via the project-images API.

## Services (`/admin/services`, `/new`, `/:id/edit`)

`AdminServices` + `ServiceFormPage` manage the service catalogue (localized title/description, image, active flag, sort order) via the services API, mirroring the projects pattern.

## Partners (`/admin/partners`, `/new`, `/:id/edit`)

`AdminPartners` + `PartnerFormPage` manage partners. The form captures a single name (written to all three localized name columns via `partnerPayload`), a **logo upload** (folder `partners`), an optional website URL, active flag, and sort order.

## Company Numbers (`/admin/public-stats`)

The simplified "company information / numbers" editor — this is the client's preferred replacement for editing statistics in many places. It is **Hebrew/English only** (no Arabic UI anywhere on this page).

- Three fixed cards: **Completed projects**, **Years of experience**, **Years warranty**. Each card edits a numeric **value** plus a **Hebrew label** and **English label**.
- On save, the three canonical numbers are **projected onto the full statistics document** (`applyCompanyNumbers`): hero band, about-preview, and about-page statistics are all rebuilt from the same three values, while decorative content (value chips, the "since 2014" badge, the about-image highlight) and the legacy Arabic labels are **preserved untouched**. The result is written to the single `site_content` row `public_stats/content` (created if missing).
- A "restore defaults" button resets the form to the shipped defaults.

This is why the public site only ever needs these three numbers edited once — see [Localization](12-localization.md) for the projection mechanics.

## Contact messages (`/admin/contact-messages`)

A table of contact submissions (sender, contact details, subject/message, date) with an inline **status** dropdown (NEW / READ / ARCHIVED) that PATCHes the record. Loading/error/empty states included.

## Quote requests (`/admin/quote-requests`)

The equivalent inbox for quote leads, with a status workflow (NEW / IN_PROGRESS / DONE / ARCHIVED).

## Admins (`/admin/admins`) — super-admin only

Full admin-account management:
- **Create** an admin (name, email, password ≥8, role).
- **Change role** inline (admin ↔ super_admin) — disabled for your own row.
- **Reset password** via a prompt.
- **Deactivate / reactivate** — deactivation is disabled for your own row.
- The backend enforces the same self-protection (a super-admin cannot deactivate or demote themselves → `409`) and email-uniqueness (`409`).
- A non-super-admin who reaches this page sees a "super-admin only" notice (and is normally redirected by the route guard).

## Audit logs (`/admin/audit-logs`) — super-admin only

A read-only list of recent privileged actions (actor, action, entity type/id, timestamp), backed by `GET /admin/audit-logs`. Logins and project/admin mutations are recorded.

## What an admin can and cannot do

**Can:** manage projects (incl. image galleries), services, and partners; edit the three Company Numbers; upload images; read and triage contact messages and quote requests (status + delete).

**Cannot (regular `admin`):** create or manage other admin accounts; read the audit log.

**Cannot (anyone, by design):** edit arbitrary marketing copy / page layout through the CMS. Hero/about/section headings and footer text are shipped as locked default content (`src/data/siteContent.ts`); the standalone Gallery, Testimonials, Site Settings, and the old "visual" Website/Hero/Sections/Footer editors are **not** part of the routed admin UI (see [Removed Features](17-removed-features.md)).
