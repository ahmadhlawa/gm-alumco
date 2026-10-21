# T.A.S Corporate Website & CMS

T.A.S Corporate Website & CMS is a custom production web application built for a commercial client. It combines a premium public company website with a secure administrative content management system.

This project was designed and developed by TFN Technologies as a tailored business platform for presenting company services, projects, partners, and customer inquiries.

## Business Overview

The application supports a complete corporate web presence for a service-based company. It provides a modern public website for brand presentation, service discovery, project portfolio browsing, and customer contact.

The administrative CMS allows authorized staff to maintain core website content, manage project and service records, review contact messages, and process quotation requests from one private interface.

## Key Features

- Responsive modern user interface
- Hebrew and English content support
- RTL and LTR layout support
- Services showcase
- Project portfolio management
- Partner management
- Testimonials management
- Company statistics management
- Contact message management
- Quote request management
- Image upload support
- Secure authentication
- Role-based administration
- Audit logging for administrative activity

## Technology Stack

### Frontend

- React 19
- TypeScript 5
- Vite 6
- Tailwind CSS 4
- React Router 7
- Motion for React
- Lucide React icons
- Vitest

### Backend

- Python 3.11+
- FastAPI
- SQLAlchemy
- Alembic
- MySQL 8+

### Infrastructure

- REST API
- JWT authentication
- Local file uploads
- Nginx
- Linux VPS deployment

## Project Architecture

The project is organized as a frontend and backend application.

The frontend is a React single-page application that serves the public website and administrative CMS. It communicates with the backend through a REST API.

The backend is a FastAPI application responsible for authentication, business data, uploads, validation, and administrative operations.

The database stores structured website and CMS data. Uploaded media files are stored on the server filesystem and served through the backend.

## Application Modules

### Public Website

- Homepage
- About page
- Services listing
- Projects portfolio
- Contact form
- Quote request form

### Administrative CMS

- Dashboard
- Projects
- Services
- Partners
- Testimonials
- Contact messages
- Quote requests
- Company statistics
- Admin accounts
- Audit logs

## Security

The application includes JWT-based authentication, role-based authorization, request validation, secure password storage, file upload validation, and audit logging for sensitive administrative actions.

Sensitive configuration is managed through environment variables and must not be committed to the repository.

## Repository Structure

```text
project-root/
  frontend/   React frontend application
  backend/    FastAPI backend application
```

## Development

Use the provided `.env.example` files as templates for local configuration. Do not commit real environment files, credentials, keys, or production values.

### Requirements

- Node.js 20 or newer
- Python 3.11 or newer
- MySQL 8 or newer

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Useful frontend commands:

```bash
npm run typecheck
npm run test
npm run build
npm run preview
```

### Backend

```bash
cd backend
python -m venv .venv
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

Useful backend commands:

```bash
alembic revision --autogenerate -m "describe change"
alembic upgrade head
python -m app.utils.seed_admin
```

The seed command is optional and reads its values from environment variables. There is no public registration endpoint.

CMS content is edited in Hebrew. FastAPI generates English through the internal
LibreTranslate `/translate` endpoint before writing projects, production projects,
services, testimonials, partners, About content, company-number labels, and image
captions. Unchanged Hebrew preserves existing English; clearing optional Hebrew
also clears its English counterpart. English-only content writes return 422;
submitted English requires its paired Hebrew source and is never authoritative.
Website and admin interface language switching is unchanged.

Set `TRANSLATION_URL` (default `http://127.0.0.1:5000`) and
`TRANSLATION_TIMEOUT_SECONDS` (default 15, maximum 60) in the backend environment.
The translation budget spans the save; repeated text is cached within that save.
Latin names and model numbers are kept verbatim. The narrow Hebrew glossary in
`backend/app/services/translation_service.py` protects the ATS company name and
confirmed industry terms; other Hebrew names still need content review.
Service failures return 503;
invalid or overlength translated content returns 422. These failures save nothing.
Automatic translation needs no backfill. The flexible About body requires the
additive migration described below. Tests use SQLite and mocked HTTP;
run `python -m pytest` from `backend` to validate without contacting LibreTranslate.

#### Protected Hebrew terminology

| Hebrew source | Canonical English |
|---|---|
| טכנו אלום סיסטם (including final-letter and space/hyphen variants) | Techno Alum System |
| אלוקובונד | ALUCOBOND |
| חיפויי אלוקובונד | ALUCOBOND cladding |
| קירות מסך | curtain walls |
| חזיתות מבנים | building façades |

The ALUCOBOND brand/cladding terminology follows the [manufacturer's façade documentation](https://www.alucobond.com/en/products/according-to-application/facades/);
curtain walls follows [Strømmen's aluminium systems terminology](https://strommengroup.com/en/curtain-walls).
Matches require word boundaries, allowing common attached Hebrew prepositions
and conjunctions to remain available to the translation engine; the glossary
does not replace unrelated words or guess additional terms. Recognized Hebrew
phrases and existing Latin names are masked before translation, preserving
whole-sentence context, then restored
to canonical text. Pure glossary entries need no translation request. Missing,
duplicated, corrupted or unexpected markers reject the complete save with 503.
Paragraphs and list markers remain outside translation as before.

This affects new or changed Hebrew only. It does not rewrite stored English,
including previously malformed translations; unchanged Hebrew preserves it.
For existing About content, **proposed only, explicit approval required**:
prepare a before/after preview for the single selected About record and only the
English fields containing the confirmed errors. Review `The Aluminum Sistm` →
`Techno Alum System`, `The Alkovunds` → `ALUCOBOND cladding` when paired with
`חיפויי אלוקובונד`, `Screen walls` → `curtain walls`, and `Building fronts` →
`building façades`. Confirm the Hebrew source and field context for each edit.
After approval, back up those exact values and apply only approved English
changes in one transaction with an expected-value/source guard; abort if the
record changed since review. Preserve all other fields. Rollback restores the
backed-up values only if the corrected values still match. No backfill, database
update tool, migration or correction has been executed by this glossary change.

### Flexible About body

The main About editor accepts up to 16,000 characters in Hebrew, with blank lines
between paragraphs and `-`, `*`, `×`, or `•` at the start of list lines. Paragraphs
and multiple lists retain their order. The live preview and public page use the
same safe text renderer; HTML is displayed as text. Vision/Mission controls and
display remain separate and unchanged.

English is generated per text line while line breaks and bullet prefixes stay
outside translation requests. A response that introduces new structural markers
is rejected. Changed nonempty bodies use a separate whole-save budget,
`ABOUT_TRANSLATION_TIMEOUT_SECONDS=60` (greater than 0, at most 300 seconds).
Other saves retain `TRANSLATION_TIMEOUT_SECONDS=15`. Translation finishes before
any content is written; failures preserve the existing record. Very large bodies
can still exceed the configured budget or the English size limit.

Before running the updated backend, apply Alembic revision `20261021_0001`
(`alembic upgrade head` through the separately authorized migration process).
It adds nullable `body_he` and `body_en` TEXT columns and retains all old paragraph,
bullet, and Vision/Mission columns. No production migration has been executed by
this work. Until a body is saved, the editor/public page derive it from the legacy
fields without modifying them or appending duplicate content. The first unchanged
legacy save copies the existing English. An explicitly empty/null body update
clears the new body and suppresses the legacy display fallback.

An application rollback can leave these nullable columns in place. The reversible
schema downgrade removes only the new columns; export any authored body data
before downgrading, since legacy columns retain their old text, not subsequent
flexible-body edits. Migration upgrade/downgrade is tested against local SQLite;
the upgrade was also verified on local development MySQL with all legacy values
unchanged. Production MySQL execution requires its own approved verification and
backup. A missing migration produces an actionable About API 503 response. The
Admin disables saving until existing content loads and shows API/network errors.

## Data & Uploads

Database schema changes are managed with Alembic migrations. Uploaded images are stored under the backend upload directory and must be preserved across deployments.

Administrative access is role-based. Standard administrators can manage website content, while super administrators can also manage admin accounts and audit logs.

## Deployment

The application is intended for deployment on a Linux VPS behind Nginx. The frontend is built as static assets, and the backend runs as a FastAPI service connected to a MySQL database.

Production deployment must use secure environment variables, HTTPS, restricted server access, database backups, and a persistent upload directory.

## License

This software is proprietary.

Copyright © TFN Technologies.

All rights reserved.

This repository contains software developed for a commercial client and may not be copied, redistributed, or reused without written permission from TFN Technologies.
