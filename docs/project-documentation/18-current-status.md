# 18 — Current Project Status

This describes the repository **exactly as it exists today** (main branch, clean working tree).

## What's complete and working end-to-end

- **Backend API** (FastAPI + SQLAlchemy + Alembic + MySQL): auth, all resource CRUD, uploads, dashboard, admins, audit logs, contact/quote intake, email notification. 63 pytest functions pass.
- **Public website**: Home, About, Services, Projects (filter/search), Contact, Request-a-quote — all wired to the live API with loading/error/empty states, bilingual HE/EN with RTL/LTR.
- **Admin CMS** (routed): Login, Dashboard, Projects (CRUD + image gallery), Services, Partners, Company Numbers, Contact messages, Quote requests, Admins (super-admin), Audit logs (super-admin).
- **Authentication & authorization**: JWT, roles, rate-limited login, route guards, 401 auto-logout.
- **Image uploads**: validated local uploads served at `/uploads`, with client-side progress and manual-URL fallback.
- **Localization**: HE default / EN fallback, trilingual data model, per-language fonts, mirrored layouts.
- **Tests**: 19 frontend (Vitest) + 13 backend (pytest) files; `typecheck`/`build` green.

## Production-ready aspects

- Fail-fast config (rejects weak JWT secret; rejects weak super-admin seed password outside dev).
- CORS locked to one origin.
- Reversible, versioned migrations.
- Soft-delete for catalogue content; hard-delete for inbox records.
- Documented VPS deployment notes for the persistent `uploads/` directory.
- Audit trail for privileged actions.

## Intentionally deferred / not in the final UI

- **Standalone Gallery page + editor**, **Testimonials editor**, **Site Settings editor** — tables/APIs exist, no routed UI.
- **Visual CMS / Website-Hero-Sections-Footer editors**, **Blog**, **Clients** — unrouted legacy mockups.
- **Detail pages** (`/projects/:slug`, `/services/:slug`) and **Careers** — intentional "coming soon" placeholders.
- **Live Google Map** on Contact — placeholder box.
- **Arabic public UI** — removed by design.

## Known limitations / caveats

- **No route-level code splitting**: the admin bundle ships to public visitors; the build emits Vite's chunk-size advisory. (Highest-impact frontend improvement.)
- **Login rate limiter is in-process**: multiply by worker count behind multiple processes; use a shared store in scaled deployments.
- **No token revocation/refresh**: tokens valid until expiry (30 min default); deactivated admins are blocked at validation time but live tokens aren't individually revocable.
- **SEO is basic** (CSR SPA, no SSR/meta-per-route/sitemap).
- **No image transcoding/resizing** on upload (original bytes stored, 5 MB cap).
- **No `prefers-reduced-motion`** handling.
- **Legacy/dead code present**: `backend_nestjs_backup/`, unrouted admin pages, mock `data/*` files, `_dump.json`. The root `README.md` and `frontend/README.md` are **outdated** (describe the old NestJS plan / pre-integration mock app) — this handbook supersedes them.
- **Naming inconsistency**: some shipped defaults still reference `gm_alomco_db`; the authoritative value is `backend/.env`'s `DATABASE_URL`.

## Configuration required before deployment

1. **Backend `.env`**: set a strong unique `JWT_SECRET_KEY`; set `DATABASE_URL` to the real MySQL DB; set `ENVIRONMENT=production`; set a strong `FIRST_SUPERADMIN_PASSWORD`; set `FRONTEND_URL` to the deployed frontend origin; (optional) configure SMTP for quote emails.
2. **Database**: create the MySQL database matching `DATABASE_URL`; run `alembic upgrade head`; run `python -m app.utils.seed_admin`.
3. **Frontend `.env`**: set `VITE_API_URL` to the deployed API base (`https://…/api/v1`); run `npm run build`; serve `dist/`.
4. **Uploads**: ensure `backend/uploads/` is persistent and writable, and excluded from any `rsync --delete` deploy.
5. **Reverse proxy**: terminate TLS; route the frontend and `/api` + `/uploads` to the backend.

## Deployment readiness verdict

The product is **functionally complete and deployable** for its intended scope (a corporate site + internal CMS on a modest VPS), provided the configuration checklist above is followed. The outstanding items are **operational/hardening** (code-splitting, SEO, image pipeline, scaled rate-limiting) and **housekeeping** (delete dead legacy code, refresh the old READMEs) rather than missing core functionality.
