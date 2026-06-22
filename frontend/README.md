# GM Alomco Corporate Website

Frontend for the GM Aluminum Manufacturing & Trading Co. corporate website and its focused Arabic RTL administration panel.

This checkpoint is frontend-only. It does not include a backend, database, real authentication, or persistent CMS publishing.

## Current Tech Stack

- Vite 6
- React 19
- TypeScript 5
- Tailwind CSS 4
- React Router
- Motion for React
- Lucide React icons

The application is a Vite single-page application. It is not currently a Next.js project.

## Premium Dark Theme

The design tokens are defined in `src/index.css`:

| Token | Color | Usage |
| --- | --- | --- |
| Brand navy | `#0A192F` | Main backgrounds |
| Brand surface | `#112240` | Cards and sections |
| Brand surface alt | `#172A45` | Inputs and elevated surfaces |
| Brand gold | `#D4AF37` | Accent, highlights, and edit controls |
| Brand silver | `#8892B0` | Secondary text |
| Brand text | `#F3F4F6` | Primary text |
| Brand border | `#233554` | Subtle borders and shadows |

The public website and admin dashboard share this visual identity. Cleanup and CMS work must not redesign the existing UI.

## Visual CMS Concept

The admin dashboard is designed around visual previews instead of table-only content management.

- Public card components are reused in admin previews where practical.
- Editable regions display a gold outline and Edit button on hover.
- Editing opens a shared modal.
- Changes update React component state only.
- A fake success state confirms the local update.
- No CMS change is published or persisted to a server.
- Arabic is available for development preview.
- English and Hebrew are the intended production languages.

The shared CMS building blocks are:

- `src/components/admin/EditableBlock.tsx`
- `src/components/admin/EditContentModal.tsx`
- `src/components/admin/VisualCmsToolbar.tsx`
- `src/components/admin/visual-editors/HeroVisualEditor.tsx`

## Project Structure

```text
src/
  app/          Public and admin route components
  components/   Shared public, layout, form, card, and CMS components
  data/         Static frontend content and CMS defaults
  i18n/         Runtime language context
  lib/          Fake API and shared utilities
  types/        Shared TypeScript models
```

## Public Routes

| Route | Purpose |
| --- | --- |
| `/` | Homepage |
| `/about` | Company overview |
| `/services` | Services listing |
| `/services/:slug` | Service detail placeholder |
| `/projects` | Projects gallery |
| `/projects/:slug` | Project detail placeholder |
| `/products` | Product catalog |
| `/products/:slug` | Product detail placeholder |
| `/contact` | Contact page and form |
| `/request-quote` | Quote request form |
| `/careers` | Careers placeholder |

## Admin Routes

| Route | Purpose |
| --- | --- |
| `/admin/login` | Simulated admin login |
| `/admin` | Visual CMS dashboard |
| `/admin/website` | Website section directory |
| `/admin/website/hero` | Visual hero and statistics editor |
| `/admin/website/sections` | Company section visual editor |
| `/admin/projects` | Visual project editor |
| `/admin/projects/new` | Project form baseline |
| `/admin/projects/:id/edit` | Project edit form baseline |
| `/admin/services` | Visual service editor |
| `/admin/products` | Visual product editor |
| `/admin/gallery` | Visual gallery editor |
| `/admin/partners` | Visual partner editor |
| `/admin/testimonials` | Visual testimonial editor |
| `/admin/footer` | Visual footer editor |
| `/admin/blog` | Blog management baseline |
| `/admin/clients` | Client management baseline |
| `/admin/messages` | Contact and quote inbox mockup |
| `/admin/settings` | Settings form mockup |

## Current Limitations

- The fake API returns static frontend data through delayed Promises.
- Visual CMS edits are local component state and disappear after refresh.
- Some legacy homepage content utilities use browser `localStorage`; this is not production persistence.
- Admin login accepts form submission without checking credentials.
- Admin routes are not protected.
- Contact and quote forms do not send data to a server.
- Project create, update, and delete actions are simulated.
- Messages, clients, blog entries, and settings use mock data.
- File upload controls do not upload files.
- Detail pages, careers, and the contact map remain placeholders.
- English and Hebrew are not yet validated as required production fields.
- There are no automated frontend tests.
- The production bundle currently triggers Vite's chunk-size recommendation.

## Run Locally

Prerequisites:

- Node.js 20 or newer
- npm

```bash
npm install
npm run dev
```

The development server runs on port `5173` (matching the backend's allowed CORS origin) and is exposed on the local network by the existing Vite script.

Other commands:

```bash
npm run lint
npm run build
npm run preview
npm run clean
```

## Future Backend Roadmap

The planned backend uses NestJS, PostgreSQL, and Prisma. It will provide admin-only authentication, persistent multilingual content, CRUD APIs, secure image uploads, contact and quote processing, settings, audit logs, validation, and deployment infrastructure.

Public registration will not be implemented. Admin accounts will be provisioned through a controlled seed or administrative process.

See [BACKEND_ROADMAP.md](../backend/BACKEND_ROADMAP.md) for the proposed database schema, endpoint contract, security checklist, infrastructure options, and deployment phases.
