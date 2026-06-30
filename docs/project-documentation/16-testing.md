# 16 — Testing

Both halves of the product ship with automated tests. The frontend uses **Vitest**; the backend uses **pytest** driving the API through FastAPI's test client.

## Frontend tests (Vitest)

**19 test files** under `frontend/src/`, co-located with the code they cover:

| Area | Files |
|------|-------|
| API client & mapping | `api/client.test.ts`, `api/adapters.test.ts`, `api/uploads.test.ts` |
| Data / stats logic | `data/publicStats.test.ts` |
| i18n | `i18n/index.test.tsx` |
| Utilities & navigation | `lib/utils.test.ts`, `lib/api.test.ts`, `lib/homeNavigation.test.ts` |
| Forms | `forms/ContactForm.test.tsx`, `forms/QuoteRequestForm.test.tsx`, `forms/ProjectForm.test.tsx`, `forms/ImageUploadField.test.tsx` |
| Components | `layout/Navbar.test.tsx`, `sections/GeometricHero.test.tsx`, `sections/ServicesShowcase.test.tsx`, `common/ContactActions.test.tsx` |
| Admin | `app/admin/adminMappers.test.ts`, `app/admin/AdminPublicStats.test.tsx`, `components/admin/adminNavigation.test.ts` |

These cover the integration-critical seams: the API client's auth/error/401 behavior, locale-aware DTO mapping and fallback chains, the Company Numbers projection/normalization logic, i18n direction/fallback rules, role-aware admin navigation, image-URL normalization, and form submit/validation behavior.

**Run:**
```bash
cd frontend
npm test          # vitest run
npm run typecheck # tsc --noEmit
npm run build     # production build (also a smoke test)
```

## Backend tests (pytest)

**63 test functions across 13 files** under `backend/tests/`, with a shared `conftest.py` fixture that spins up an isolated test database and a `TestClient`:

| File | Focus |
|------|-------|
| `test_auth.py` | Login success/failure, token issuance, rate limiting, `/auth/me` |
| `test_admins.py` | Admin CRUD, role changes, self-protection (`409`), email-uniqueness |
| `test_audit.py` | Audit-log recording and reading |
| `test_dashboard.py` | Aggregated stats correctness |
| `test_uploads.py` | Extension/content-type/magic-byte/size validation |
| `test_email_service.py` | SMTP notification + graceful degradation when unconfigured |
| `test_projects.py` | Projects CRUD, images, category filtering, soft delete |
| `test_services.py`, `test_partners.py`, `test_gallery.py`, `test_testimonials.py` | Catalogue CRUD |
| `test_messages.py` | Contact + quote submission, status updates, delete |
| `test_site_content.py` | Content/settings uniqueness and CRUD |
| `test_config.py` | Settings validators (weak JWT secret / weak seed password rejected) |

**Run:**
```bash
cd backend
pytest            # full suite
```

## What's covered well

- **Authentication & authorization** paths (roles, self-protection, rate limiting).
- **Upload security** (the multi-layer validation).
- **Localization mapping** and the Company Numbers projection — the trickiest pure logic.
- **Config safety** (fail-fast validators).
- **Every resource's CRUD** and the public/admin split.

## What is not covered (honest gaps)

- **No end-to-end / browser tests** (e.g. Playwright/Cypress) exercising the real SPA against the real API.
- **No backend coverage report committed**; the suite is comprehensive by file/function count but coverage % is not measured in-repo.
- **Legacy unrouted admin pages** are not tested (they're not part of the shipped surface).
- **Visual/animation regressions** are not snapshot-tested.

## Verification checklist (before claiming "done")

```bash
# Backend
cd backend && pytest

# Frontend
cd frontend && npm run typecheck && npm test && npm run build
```

All four should pass. The build doubles as a smoke test for the production bundle (note the chunk-size advisory discussed in [Performance](15-performance.md)).
