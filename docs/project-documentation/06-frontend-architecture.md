# 06 — Frontend Architecture

The frontend is a **Vite + React 19 + TypeScript single-page application** that serves both the public website and the admin CMS from one bundle. It talks to the FastAPI backend over JSON.

## Application shell & routing

`src/app/App.tsx` defines the whole route tree, wrapped in a single `<LanguageProvider>` (i18n) and a `<Router>` (React Router 7). The tree is split in two:

```tsx
<Routes>
  {/* Admin — guarded */}
  <Route path="/admin/login" element={<AdminLogin />} />
  <Route path="/admin" element={
    <RequireAuth><AdminAuthProvider><AdminLayout /></AdminAuthProvider></RequireAuth>
  }>
    <Route index element={<Dashboard />} />
    <Route path="projects" element={<AdminProjects />} />
    <Route path="projects/new" element={<ProjectFormPage />} />
    <Route path="projects/:id/edit" element={<ProjectFormPage />} />
    <Route path="services" … /> <Route path="partners" … />
    <Route path="contact-messages" … /> <Route path="quote-requests" … />
    <Route path="public-stats" element={<AdminPublicStats />} />
    <Route path="admins" element={<RequireSuperAdmin><AdminAdmins /></RequireSuperAdmin>} />
    <Route path="audit-logs" element={<RequireSuperAdmin><AdminAuditLogs /></RequireSuperAdmin>} />
    <Route path="messages" element={<Navigate to="/admin/contact-messages" replace />} />
  </Route>

  {/* Public — Navbar + Footer + WhatsApp wrap a nested <Routes> */}
  <Route path="/*" element={<><Navbar/><main>…</main><Footer/><WhatsAppButton/></>} />
</Routes>
```

Key points:
- The **admin subtree is guarded** by `RequireAuth` (token presence) and wrapped by `AdminAuthProvider` (loads the real admin identity). Two routes are additionally gated by `RequireSuperAdmin`.
- The **public subtree** mounts the chrome (navbar/footer/WhatsApp) once and nests the page `<Routes>` inside, so chrome doesn't remount on navigation.
- The top-level wrapper applies `dir={dir}` from the language context, so the entire app flips RTL/LTR with the language toggle.
- Legacy detail/careers routes render typed "coming soon" placeholders.

## Pages

| Page | File | Data source |
|------|------|-------------|
| Home | `app/Home.tsx` | `getServices/getProjects/getTestimonials` (API via `lib/api`) + `getPublicStatsContent` + static `siteContent` |
| About | `app/About.tsx` | `getPublicStatsContent` + static copy |
| Services | `app/Services.tsx` | `getServices` |
| Projects | `app/Projects.tsx` | `getProjects` (+ client-side filter/search) |
| Contact | `app/Contact.tsx` | static + `ContactForm` (POST) |
| Request a quote | `app/RequestQuote.tsx` | `QuoteRequestForm` (POST) |

Every data-driven page follows the same pattern: `useState` for data/loading/error, a `useEffect` keyed on `language` that fetches and falls back to empty/default on error, and explicit `LoadingState` / `ErrorState` / `EmptyState` rendering.

## Component families

- **`layout/`** — `Navbar` (scroll-aware, language toggle, section-scroll navigation, mobile menu), `Footer`, `WhatsAppButton`.
- **`sections/`** — large homepage blocks: `GeometricHero` (the animated hero), `ServicesShowcase`, `FeaturedProjectsShowcase`, `SuccessPartners` (the hand-built infinite carousel).
- **`cards/`** — `ProjectCard`, `ServiceCard`, `TestimonialCard`.
- **`common/`** — reusable primitives: `Button`, `SectionHeader`, `PageHero`, `CTASection`, `LoadingState`, `ErrorState`, `EmptyState`, `ContactActions`, `FileUploadPlaceholder`.
- **`forms/`** — `ContactForm`, `QuoteRequestForm`, `ProjectForm`, `ImageUploadField`.
- **`admin/`** — the admin shell and primitives (`AdminLayout`, `AdminPageHeader`, `AdminStatCard`, `AdminStatusBadge`, `AdminActionButtons`), the auth pieces (`AdminAuthProvider`, `RequireAuth`, `RequireSuperAdmin`), navigation config (`adminNavigation`), plus the unrouted legacy visual-CMS components.

## State management

There is **no global state library** (no Redux/Zustand). State is intentionally local and contextual:

- **Language** — `LanguageContext` (`i18n/index.tsx`): current language, `setLanguage`, computed `dir`, and the `t()` translator. Persists to `localStorage`.
- **Admin identity** — `AdminAuthContext` (`AdminAuthProvider`): loads `GET /auth/me` once, exposes `{ admin, loading, refresh }`, and the `useIsSuperAdmin()` helper. Drives role-gated navigation and pages.
- **Page/feature state** — plain `useState`/`useEffect` inside each page or form.

This keeps the mental model simple: data is fetched where it's used, and the only cross-cutting contexts are the two that genuinely need to be global (language and the logged-in admin).

## API layer

A deliberately thin, fully typed layer in `src/api/`:

- **`client.ts`** — `apiRequest<T>(path, options)`: prefixes `VITE_API_URL`, sets `Accept`/`Content-Type`, attaches the bearer token when `authenticated: true`, parses JSON, and throws a typed `ApiError(status, detail)` on non-2xx. On a 401 for an authenticated request it clears the token and dispatches a global `gm-auth-expired` event (which `RequireAuth` listens for to bounce to login). Returns `undefined` for 204.
- **`token.ts`** — `sessionStorage`-backed get/set/clear for `tas_admin_token`.
- **`types.ts`** — the backend DTO interfaces (`ProjectDto`, `ServiceDto`, `PartnerDto`, `ContactMessageDto`, `QuoteRequestDto`, `AdminDto`, `SiteContentDto`, `AuditLogDto`, …).
- **`adapters.ts`** — locale-aware DTO→view-model mappers. The `pick(locale, ar, en, he)` function implements the fallback chain (e.g. Hebrew → he → en → ar) so the UI never shows an empty string when one language is missing.
- **Resource modules** (`projects.ts`, `services.ts`, `partners.ts`, `gallery.ts`, `testimonials.ts`, `messages.ts`, `content.ts`, `admins.ts`, `auditLogs.ts`, `dashboard.ts`, `auth.ts`) — one function per endpoint.
- **`uploads.ts`** — a separate `XMLHttpRequest`-based uploader so the UI can show upload **progress** (fetch can't report upload progress).
- **`lib/api.ts`** — a **public read facade** that the public pages use: it calls the resource modules and maps each result through the locale-aware adapters, so pages receive ready-to-render view models.

Admin pages generally use the typed `api/*` modules **directly** with raw DTOs (no lossy adapter round-trip), which is important for full-fidelity editing.

## Localization (frontend side)

See [Localization](12-localization.md) for the complete picture. In short: `useLanguage().t(ar, he, en)` resolves UI strings; data strings come from the backend's `*_ar/_en/_he` columns and are resolved by `pick()` in the adapters. The provider sets `document.documentElement.lang`/`dir` and persists the choice.

## Animations

- **Motion** (`motion/react`) powers the staged hero reveal (stagger + blur-in variants), scroll-reveal sections (`whileInView` with `viewport={{ once: true }}`), animated grid transitions on the Projects page (`AnimatePresence`, `layout`), and the active-nav underline (`layoutId`).
- The **partners carousel** is intentionally hand-built (CSS `translateX` track, triplicated items for a seamless infinite loop, pointer-drag, autoplay, responsive items-per-view) rather than using a library, for precise control of the infinite-loop snap.
- The hero background uses a continuous Ken Burns zoom and direction-aware mirroring (`heroBackgroundTransform`).

## Responsive strategy

Tailwind's breakpoint utilities (`sm`/`md`/`lg`/`xl`) drive every layout. Grids collapse from multi-column to single-column on small screens; the navbar and admin sidebar switch to off-canvas mobile menus; the partners carousel adapts items-per-view (2/3/4/5) to viewport width via a resize listener.

## Theme, design system & typography

Brand tokens are defined once in `src/index.css` via Tailwind v4's `@theme` block (`--color-brand-navy`, `--color-brand-gold`, etc.) and consumed as `bg-brand-navy`, `text-brand-gold`, … everywhere. Fonts switch by language (`Heebo` for Hebrew via `html[lang="he"]`, `Tajawal` otherwise). Full details in [Design System](13-design-system.md).

## Assets

Static assets live in `public/images/`: the T.A.S logos (navbar/footer/transparent variants), favicons, the hero image (`main.jpeg`), and decorative `webp` backgrounds (`tas-bg-about/process/cta`). **Uploaded** content images are *not* here — they live on the backend under `/uploads/...` and are resolved to the API origin at render time by `normalizeImageUrl`.

## Performance optimizations

- A single `apiRequest` path and minimal dependencies keep the bundle lean.
- `viewport={{ once: true }}` ensures scroll animations run once, not on every scroll.
- Lazy image loading (`loading="lazy"`) and `grayscale`/opacity transitions on partner logos.
- Image fallbacks avoid layout breakage on missing/broken images.
- See [Performance](15-performance.md) for the full list and known caveats (e.g. no route-level code splitting yet).
