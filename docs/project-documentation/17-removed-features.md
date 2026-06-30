# 17 — Features Removed During Development

This is the most important chapter for understanding *why the final product looks the way it does*. The original brief was a broad multilingual "Visual CMS." It was deliberately narrowed to a focused, robust core. Each removal below includes the business reasoning. Code or tables that still physically exist are flagged so a future developer isn't misled.

## 1. Products module — fully removed

- **What it was:** a product catalogue (`products` table + public `/products` pages + an admin product editor).
- **Final state:** the `products` table was **dropped** via migration `20260629_0001` (reversible downgrade exists); the public `/products` route was removed; there is no product editor in the routed admin UI.
- **Why:** T.A.S is a **project-portfolio fabrication/installation business**, not a product retailer. A catalogue with prices/SKUs implied an e-commerce posture the company didn't want and would never maintain. Removing it simplified the model and the admin surface.

## 2. Visual CMS (in-place "edit anything" page builder) — superseded

- **What it was:** an in-place visual editor where admins would hover editable regions (gold outline + Edit button), open a shared modal, and edit hero/sections/footer directly on a preview, reusing public card components in the admin.
- **Final state:** **replaced by focused forms** (Projects, Services, Partners, Company Numbers). The visual-editing building blocks remain in the repo as **unrouted legacy code**: `components/admin/EditableBlock.tsx`, `EditContentModal.tsx`, `VisualCmsToolbar.tsx`, `AdminVisualGrid.tsx`, `visual-editors/HeroVisualEditor.tsx`, plus admin pages `AdminWebsite.tsx`, `AdminWebsiteHero.tsx`, `AdminWebsiteSections.tsx`, `AdminFooter.tsx`.
- **Why:** the visual CMS was powerful but **risky and incomplete** — its edits were component-state-only / `localStorage` (never persisted to a server), it collapsed the trilingual model into single strings, and it let non-technical staff alter the carefully designed layout. The client preferred a **locked design with narrow, safe editing**. Static marketing copy is now shipped as typed defaults (`src/data/siteContent.ts`) rather than being CMS-editable.

## 3. Gallery (standalone) — table/API kept, UI removed

- **What it was:** a standalone image gallery with a public gallery page and an admin gallery editor.
- **Final state:** the `gallery_images` table and full CRUD API **still exist**, but there is **no public gallery page** and **no routed admin gallery editor** (`AdminGallery.tsx` is unrouted legacy). Project image galleries cover the real need.
- **Why:** a separate gallery duplicated the project-images feature and added an editing surface nobody needed. Project-level galleries are where images actually belong.

## 4. Testimonials editing — table/API kept + rendered, editor removed

- **What it was:** an admin editor for client testimonials.
- **Final state:** the `testimonials` table and API exist, and testimonials **do render on the homepage** from the API. But there is **no routed admin testimonials editor** (`AdminTestimonials.tsx` is unrouted legacy).
- **Why:** testimonials change rarely; the client was comfortable seeding/managing them out-of-band rather than maintaining another full editor. Kept in the data model so an editor can be re-enabled cheaply later.

## 5. Footer / full website-section editors — superseded

- **What it was:** "visual editors" for the footer and homepage sections.
- **Final state:** unrouted legacy (`AdminFooter.tsx`, `AdminWebsiteSections.tsx`, `AdminWebsiteHero.tsx`). Footer and section copy are shipped as typed defaults.
- **Why:** same reasoning as the Visual CMS — lock the design, avoid a fragile editing surface for content that almost never changes.

## 6. Arabic as a public UI language — removed (kept as data fallback)

- **What it was:** Arabic was the original primary development/preview language, selectable on the public site.
- **Final state:** the public language switcher offers **Hebrew and English only**. Arabic remains **inside the data model** (`*_ar` columns) and as the **last-resort fallback** in `t()`/`pick()`, and most admin UI copy is still Arabic.
- **Why:** the company's real market is Hebrew-first with English as the international fallback. Removing Arabic from the switcher matched reality, while keeping the columns avoided destroying data and preserved a safety net. See [Localization](12-localization.md).

## 7. Site Settings editor — table/API kept, UI removed

- **What it was:** an admin settings screen (`AdminSettings.tsx`).
- **Final state:** the `site_settings` table and API exist; the admin screen is **unrouted legacy**.
- **Why:** there was no concrete configuration the client needed to self-manage yet. The table/API remain for future use.

## 8. Blog & Clients management — removed

- **What it was:** admin mockups for a blog and a clients list (`AdminBlog.tsx`, `AdminClients.tsx`), backed only by mock data.
- **Final state:** unrouted legacy; never had a backend.
- **Why:** out of scope for a portfolio/lead-gen site; they were exploratory mockups that didn't make the cut.

## 9. NestJS/PostgreSQL/Prisma backend — abandoned

- **What it was:** the original backend was scaffolded as NestJS + PostgreSQL + Prisma (still present in `backend_nestjs_backup/`, and described by the root `README.md`).
- **Final state:** **fully replaced** by the Python **FastAPI + SQLAlchemy + MySQL** backend in `backend/`. The NestJS tree is a dead backup.
- **Why:** the team standardized on the FastAPI/MySQL stack (simpler VPS deployment, the schema was rebuilt to the approved trilingual-columns spec rather than JSON blobs). The original brief's "products/visual CMS" schema was rewritten in the process.

## Why so much legacy code remains in the tree

The removed admin screens and visual-CMS components were **left in place rather than deleted** to keep history recoverable and to make re-enabling a feature (e.g. testimonials editing) cheap. They are **not routed** in `App.tsx`, so they never reach users. A reasonable future cleanup is to delete the unrouted legacy files once it's certain none will be revived — see [Current Status](18-current-status.md) and [Roadmap](19-roadmap.md).
