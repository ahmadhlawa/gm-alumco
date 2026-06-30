# 05 — Final Project Structure

## Top-level layout

```text
gm-alumco/
├── backend/                 FastAPI + SQLAlchemy + Alembic + MySQL API
├── frontend/                Vite + React 19 + TypeScript SPA (public site + admin)
├── backend_nestjs_backup/   Abandoned NestJS/Prisma/PostgreSQL foundation (legacy, not used)
├── docs/                    Documentation (this handbook lives in docs/project-documentation/)
├── README.md                Legacy workspace readme (describes the old NestJS plan)
├── README_PROJECT.md        Entry point for THIS documentation
├── _dump.json               Throwaway extraction of AR/HE strings (dev artifact, not used at runtime)
└── .gitignore
```

> **`backend_nestjs_backup/` and the root `README.md` are historical.** The project was originally scaffolded as a NestJS + PostgreSQL + Prisma backend. That approach was abandoned and fully replaced by the Python/FastAPI backend in `backend/`. The NestJS tree is kept only as a backup and should be treated as dead. The root `README.md` and `frontend/README.md` still describe the old plan and the pre-integration "mock" frontend; this handbook supersedes both.

## Backend (`backend/`)

```text
backend/
├── app/
│   ├── main.py                 FastAPI app: CORS, static /uploads mount, router include
│   ├── core/
│   │   ├── config.py           Pydantic Settings + JWT/seed-password validators
│   │   ├── security.py         bcrypt hashing + JWT create
│   │   └── rate_limit.py       In-process login rate limiter
│   ├── db/
│   │   ├── base.py             SQLAlchemy DeclarativeBase
│   │   └── database.py         Engine, SessionLocal, get_db dependency
│   ├── models/                 SQLAlchemy ORM models (one file per domain area)
│   │   ├── admin.py            Admin
│   │   ├── project.py          Project, ProjectImage
│   │   ├── service.py          Service
│   │   ├── partner.py          Partner
│   │   ├── gallery.py          GalleryImage
│   │   ├── testimonial.py      Testimonial
│   │   ├── message.py          ContactMessage, QuoteRequest
│   │   ├── site_content.py     SiteContent
│   │   ├── site_settings.py    SiteSettings
│   │   └── audit_log.py        AuditLog (+ actor_name/email properties)
│   ├── schemas/                Pydantic request/response models (per domain)
│   │   ├── common.py           ORMModel, URL validators (HttpUrlString, ImageUrlString)
│   │   ├── auth.py, admin.py, project.py, service.py, partner.py,
│   │   ├── gallery.py, testimonial.py, message.py, site_content.py,
│   │   ├── audit_log.py, dashboard.py
│   ├── services/               Business logic / data-access helpers
│   │   ├── crud.py             Generic list/get/create/update/soft-delete
│   │   ├── auth_service.py     authenticate_admin, issue_admin_token
│   │   ├── admin_service.py    Admin CRUD + self-protection rules
│   │   ├── audit_service.py    Best-effort audit recording
│   │   ├── project_service.py  Project-with-images queries, image add/delete
│   │   ├── inbox_service.py    Contact/quote list/get/status/delete
│   │   ├── site_content_service.py  Unique-record create/update for content/settings
│   │   └── email_service.py    SMTP quote-request notification
│   ├── api/
│   │   ├── dependencies.py     get_current_admin / require_admin / require_super_admin
│   │   └── v1/
│   │       ├── router.py       Mounts every endpoint router under prefixes/tags
│   │       └── endpoints/      One module per resource (auth, projects, services, …, uploads)
│   └── utils/
│       └── seed_admin.py       Idempotent first super-admin seed
├── alembic/
│   ├── env.py, script.py.mako
│   └── versions/               5 migrations (see Database chapter)
├── tests/                      pytest suite (conftest + 13 test_*.py files)
├── uploads/                    Persistent uploaded images (projects/, services/, partners/, gallery/)
├── alembic.ini, pytest.ini, requirements.txt
├── .env / .env.example         Runtime configuration
└── README.md                   Backend setup guide
```

**Architecture:** a clean three-layer split — **endpoints** (HTTP shape + auth dependency + audit call) → **services** (business rules / queries) → **models** (ORM). Pydantic **schemas** sit at the HTTP boundary for validation and serialization. A small generic `crud.py` removes boilerplate for the catalogue resources that share the same `is_active`/`sort_order` shape.

## Frontend (`frontend/`)

```text
frontend/
├── src/
│   ├── main.tsx                React root
│   ├── index.css               Tailwind import + @theme brand tokens + font/RTL rules
│   ├── app/
│   │   ├── App.tsx             Router: admin tree (guarded) + public tree
│   │   ├── Home.tsx About.tsx Services.tsx Projects.tsx Contact.tsx RequestQuote.tsx
│   │   └── admin/             Admin pages (see Admin CMS chapter)
│   │       ├── Dashboard.tsx
│   │       ├── AdminProjects.tsx  ProjectFormPage.tsx
│   │       ├── AdminServices.tsx  ServiceFormPage.tsx
│   │       ├── AdminPartners.tsx  PartnerFormPage.tsx
│   │       ├── AdminContactMessages.tsx  AdminQuoteRequests.tsx
│   │       ├── AdminPublicStats.tsx       (Company Numbers)
│   │       ├── AdminAdmins.tsx  AdminAuditLogs.tsx   (super-admin)
│   │       ├── AdminLogin.tsx
│   │       ├── adminMappers.ts  (labels + partner payload mapping)
│   │       └── [legacy, unrouted]: AdminGallery, AdminTestimonials, AdminSettings,
│   │           AdminWebsite, AdminWebsiteHero, AdminWebsiteSections, AdminFooter,
│   │           AdminBlog, AdminClients, AdminMessages
│   ├── api/                    Typed REST client layer
│   │   ├── client.ts          apiRequest<T>() + ApiError + 401 handling
│   │   ├── token.ts           sessionStorage token (tas_admin_token)
│   │   ├── types.ts           Backend DTO interfaces
│   │   ├── adapters.ts        DTO → view-model mappers (locale-aware pick())
│   │   ├── auth.ts admins.ts auditLogs.ts dashboard.ts
│   │   ├── projects.ts services.ts partners.ts gallery.ts testimonials.ts
│   │   ├── content.ts         site-content/settings + Company Numbers reader
│   │   ├── messages.ts        contact + quote submit/list/status
│   │   └── uploads.ts         XHR image upload with progress
│   ├── components/
│   │   ├── layout/            Navbar, Footer, WhatsAppButton
│   │   ├── sections/          GeometricHero, ServicesShowcase, FeaturedProjectsShowcase, SuccessPartners
│   │   ├── cards/             ProjectCard, ServiceCard, TestimonialCard
│   │   ├── common/            Button, SectionHeader, PageHero, CTASection, LoadingState,
│   │   │                      ErrorState, EmptyState, ContactActions, FileUploadPlaceholder
│   │   ├── forms/             ContactForm, QuoteRequestForm, ProjectForm, ImageUploadField
│   │   └── admin/             AdminLayout, AdminAuthProvider, RequireAuth, RequireSuperAdmin,
│   │                          adminNavigation, AdminPageHeader, AdminStatCard, AdminStatusBadge,
│   │                          AdminActionButtons, + legacy visual-CMS pieces (EditableBlock,
│   │                          EditContentModal, VisualCmsToolbar, AdminVisualGrid, …)
│   ├── i18n/index.tsx          LanguageProvider / useLanguage / t()
│   ├── data/                   Typed default content + Company Numbers model
│   │   ├── siteContent.ts     Static marketing copy (+ legacy localStorage preview)
│   │   ├── publicStats.ts     PublicStats + Company Numbers projection logic
│   │   └── [mock data]: projects.ts services.ts partners.ts testimonials.ts gallery.ts blog.ts
│   ├── lib/                    api.ts (public read facade), utils.ts (cn, image URL), homeNavigation.ts, cms.ts
│   └── types/index.ts          Shared view-model types (Project, Service, Partner, …)
├── public/images/             Logos, favicons, hero/background webp assets
├── package.json vite.config.ts tsconfig.json
└── .env / .env.example         VITE_API_URL
```

**Architecture:** the SPA is layered too — **pages** (route components) consume either the **public read facade** (`lib/api.ts`, which maps DTOs to localized view models) or the **typed `api/*` resource modules** (used directly by admin pages). All HTTP goes through one `apiRequest` client that centralizes auth headers, error shaping, and 401 handling. Presentation is split into `layout` / `sections` / `cards` / `common` / `forms` component families. Internationalization is a single context; brand styling is a single Tailwind theme.
