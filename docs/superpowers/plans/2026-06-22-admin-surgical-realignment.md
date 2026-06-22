# GM Alomco Admin Surgical Realignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a focused Arabic RTL admin for GM Alomco website projects, services, partners, inbound requests, admins, and audit logs.

**Architecture:** Preserve FastAPI endpoint families and React auth/role patterns. Extend schemas and data through one additive Alembic migration, replace visual/mock admin pages with direct CRUD screens, and keep legacy backend modules unexposed for compatibility.

**Tech Stack:** FastAPI, SQLAlchemy, Alembic, Pydantic, pytest, React 19, TypeScript, Vite, Vitest, Tailwind CSS.

---

### Task 1: Backend contract and migration

**Files:**
- Modify: `backend/tests/test_dashboard.py`
- Modify: `backend/tests/test_projects.py`
- Modify: `backend/tests/test_services.py`
- Modify: `backend/tests/test_messages.py`
- Modify: `backend/app/models/service.py`
- Modify: `backend/app/models/message.py`
- Modify: `backend/app/schemas/project.py`
- Modify: `backend/app/schemas/service.py`
- Modify: `backend/app/schemas/message.py`
- Modify: `backend/app/schemas/dashboard.py`
- Modify: `backend/app/api/v1/endpoints/dashboard.py`
- Create: `backend/alembic/versions/20260622_0001_admin_realignment.py`

- [ ] Write failing tests asserting uppercase categories/statuses, nullable quote email, service `starting_price`, active-only content counts, and non-archived inbox counts.
- [ ] Run focused tests and confirm failures are caused by the missing contract.
- [ ] Add `Numeric(12, 2)` nullable starting price, nullable quote email, normalized enums, dashboard fields, and one reversible data migration.
- [ ] Run focused tests until green.

Expected dashboard assertion:

```python
assert payload == {
    "projects": 3,
    "local_projects": 1,
    "international_projects": 1,
    "featured_projects": 1,
    "services": 2,
    "partners": 2,
    "contact_messages": {"NEW": 1, "READ": 1},
    "quote_requests": {"NEW": 1, "IN_PROGRESS": 1},
}
```

### Task 2: Audit actor and preserved role protections

**Files:**
- Modify: `backend/tests/test_audit.py`
- Modify: `backend/tests/test_admins.py`
- Modify: `backend/app/schemas/audit_log.py`
- Modify: `backend/app/api/v1/endpoints/audit_logs.py`

- [ ] Write failing tests for actor display data and sole-active-super-admin protection.
- [ ] Run focused tests and verify expected failures.
- [ ] Extend audit reads with nullable actor name/email without weakening `require_super_admin`.
- [ ] Ensure deactivation/demotion checks count active super admins rather than only blocking self-targeting.
- [ ] Run focused tests until green.

### Task 3: Frontend contracts, routes, and navigation

**Files:**
- Modify: `frontend/src/api/types.ts`
- Modify: `frontend/src/api/dashboard.ts`
- Create: `frontend/src/api/auditLogs.ts`
- Create: `frontend/src/components/admin/adminNavigation.ts`
- Create: `frontend/src/components/admin/adminNavigation.test.ts`
- Modify: `frontend/src/components/admin/AdminLayout.tsx`
- Modify: `frontend/src/app/App.tsx`

- [ ] Write failing tests for uppercase DTO values, active dashboard fields, allowed navigation entries, and absence of Products/visual CMS entries.
- [ ] Run frontend tests and confirm the intended failures.
- [ ] Centralize the allowed navigation config, add super-admin filtering, add audit API access, remove legacy admin routes, redirect `/admin/messages`, and guard privileged routes.
- [ ] Run focused frontend tests until green.

### Task 4: Operational admin screens

**Files:**
- Modify: `frontend/src/app/admin/Dashboard.tsx`
- Modify: `frontend/src/app/admin/AdminProjects.tsx`
- Modify: `frontend/src/components/forms/ProjectForm.tsx`
- Modify: `frontend/src/app/admin/ProjectFormPage.tsx`
- Replace: `frontend/src/app/admin/AdminServices.tsx`
- Replace: `frontend/src/app/admin/AdminPartners.tsx`
- Create: `frontend/src/app/admin/ServiceFormPage.tsx`
- Create: `frontend/src/app/admin/PartnerFormPage.tsx`
- Create: `frontend/src/app/admin/AdminContactMessages.tsx`
- Create: `frontend/src/app/admin/AdminQuoteRequests.tsx`
- Create: `frontend/src/app/admin/AdminAuditLogs.tsx`
- Create: `frontend/src/app/admin/adminMappers.ts`
- Create: `frontend/src/app/admin/adminMappers.test.ts`
- Modify: `frontend/src/api/services.ts`
- Modify: `frontend/src/api/partners.ts`

- [ ] Write failing tests for pure status/category mappings and form payload adapters.
- [ ] Run tests and verify expected failures.
- [ ] Implement direct lists/forms, responsive Arabic tables, status controls, role-aware dashboard activity, and simple empty/error states using existing components.
- [ ] Run focused tests until green.

### Task 5: Branding cleanup and full verification

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/package-lock.json`
- Modify: `frontend/src/data/siteContent.ts`
- Modify: `frontend/src/data/testimonials.ts`
- Modify: `frontend/src/data/services.ts`
- Modify: `frontend/src/data/projects.ts`
- Modify: `frontend/src/data/blog.ts`
- Modify: `frontend/src/app/About.tsx`
- Modify: `frontend/src/app/admin/AdminLogin.tsx`
- Modify: `frontend/src/components/layout/Navbar.tsx`
- Modify: `frontend/src/components/layout/Footer.tsx`

- [ ] Replace visible Ofok branding with GM Alomco naming and rename the frontend package.
- [ ] Verify no Products or Ofok text remains in admin routes, labels, dashboard, or quick actions.
- [ ] Run `python -m pytest` from `backend`.
- [ ] Run `npm run lint` from `frontend`.
- [ ] Run `npm test` from `frontend`.
- [ ] Run `npm run build` from `frontend`.
- [ ] Review `git diff --check` and report exact changed files, migration, test evidence, and pending work.
