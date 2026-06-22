# GM Alomco Admin Surgical Realignment

## Goal

Realign the existing admin panel around practical management of the GM Aluminum Manufacturing & Trading Co. public website while preserving working authentication, roles, project CRUD, dashboard, and audit logging.

## Scope

The active admin navigation contains Dashboard, Projects, Services, Partners, Contact Messages, and Quote Requests. Admins and Audit Logs are visible only to `super_admin`. Legacy products, gallery, testimonials, blog, settings, footer, and visual website editors remain available in the backend only for compatibility and are removed from admin routes and navigation.

All visible Ofok Aluminum branding in the frontend is replaced with GM Alomco or GM Aluminum Manufacturing & Trading Co. No ecommerce, inventory, order, payment, customer, cart, or general-purpose CMS functionality is introduced.

## Admin Experience

The Arabic RTL interface remains primary. English and Hebrew appear only as content-entry fields where required. Pages use direct forms, tables, status controls, clear empty/error states, and responsive layouts.

The dashboard shows active total, local, international, and featured projects; active services and partners; and all non-archived contact messages and quote requests. Quick actions link to project, service, partner, message, and role-gated admin management. Super admins see recent audit activity; regular admins see recent inbound messages and requests. Products never appear in the admin UI.

Projects retain multilingual titles and descriptions, main image, gallery images, active state, and ordering. Categories are normalized to `LOCAL`, `INTERNATIONAL`, and `FEATURED`. Services gain an optional starting price. Partners use a single visible name input while legacy multilingual database columns remain populated for compatibility. Contact messages and quote requests are separate operational pages with status updates and no destructive UI actions.

## Backend Compatibility and Migration

Existing endpoint families and legacy models remain. Dashboard responses are extended with project category counts and required operational totals. Project category values are migrated safely from `local`, `abroad`, and `featured` to uppercase business values. A nullable numeric service starting-price column is added. Quote-request email becomes nullable. Partner storage remains unchanged; the admin client mirrors the single entered name into the three existing columns.

Admin-management authorization and sole-super-admin protections remain unchanged. Audit-log endpoints remain super-admin-only.

## Testing and Verification

Behavior changes follow test-first development. Backend tests cover category normalization/counts, nullable quote email, service pricing, role restrictions, and preserved CRUD. Frontend tests cover dashboard mapping, role-gated navigation/actions, focused routes, and status/type changes where practical.

Final verification runs the complete backend test suite, frontend typecheck, frontend tests, and production build. Any unimplemented or blocked item is reported explicitly.
