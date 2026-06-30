# 15 — Performance

This chapter describes the performance characteristics of the **final** codebase honestly — both the optimizations in place and the deliberate trade-offs/known caveats.

## Frontend

### What's optimized
- **Lean dependency footprint.** The app uses a small set of focused libraries (React, Router, Motion, lucide, clsx/tailwind-merge). There is no heavy state-management or component framework, keeping the JS payload modest.
- **Single HTTP path.** All requests go through one `apiRequest`, avoiding duplicated client logic and making it easy to add caching later in one place.
- **Animation discipline.** Scroll reveals use `whileInView` with `viewport={{ once: true }}`, so they animate **once** rather than re-running on every scroll. Transform/opacity-based animations (not layout-thrashing properties) keep motion on the compositor.
- **Lazy image loading** (`loading="lazy"`) on partner logos and other below-the-fold imagery.
- **Robust image fallbacks** (`normalizeImageUrl` + `onError` → inline SVG placeholder) prevent broken-image reflows and failed-request retries.
- **WebP decorative backgrounds** (`tas-bg-about/process/cta.webp`) for the large architectural backdrops — smaller than equivalent JP/PNG.
- **Tailwind v4** produces a small, purged CSS bundle driven by the tokens in `@theme`.
- **`localStorage`/`sessionStorage` reads** for language and token are synchronous and trivial; the language choice avoids a flash by initializing from storage on first render.

### Known caveats / trade-offs
- **No route-level code splitting yet.** `App.tsx` imports every page (public and admin) statically, so the initial bundle includes the admin code even for public visitors. The old `frontend/README` already noted the production build triggers Vite's chunk-size warning. **Biggest available win:** lazy-load the `/admin/*` tree with `React.lazy` + `Suspense`. (See [Roadmap](19-roadmap.md).)
- **No HTTP response caching** of API reads (no SWR/React Query); each page fetches on mount and re-fetches when the language changes.
- **Some remote images** on marketing pages are loaded from Unsplash URLs at full quality; production should host/optimize these.
- The **partners carousel** triplicates items and animates a transform — efficient, but very large partner counts would grow the DOM linearly.

## Image optimization & uploads

- Uploaded images are size-capped at **5 MB** and validated, but the backend does **not** transcode, resize, or generate responsive variants — it stores the original bytes. For heavy image use, a future image pipeline / CDN is the logical next step (see Roadmap).
- The `normalizeImageUrl` helper resolves relative `/uploads/...` paths to the API origin and rewrites Google-Drive share links to direct-view URLs, avoiding broken embeds.

## Build optimization

- `npm run build` runs `vite build` (Rollup) with tree-shaking and minification. `npm run typecheck`/`lint` run `tsc --noEmit` for type safety without emitting JS.
- The `@` path alias keeps imports clean and resolvable without affecting bundle size.

## Backend

### What's efficient
- **Targeted queries.** The generic `crud.list_entities` builds a single ordered `SELECT` with optional filters; project detail uses `selectinload` to fetch images in a second batched query rather than N+1.
- **Dashboard aggregation** uses `COUNT`/`GROUP BY` queries rather than loading rows into Python.
- **Indexes** on the columns that are filtered/looked up (`email`, `category`, `status`, `section`/`key`, `admin_id`, `action`) keep those queries fast.
- **Per-request sessions** (`get_db`) are opened and closed cleanly; no long-lived global session.

### Caveats
- **Synchronous DB access** (PyMySQL + SQLAlchemy ORM) under FastAPI — fine for the expected low-to-moderate traffic of a corporate site, but not maximizing async throughput. For higher concurrency, an async driver or more worker processes would help.
- **Static `/uploads` served by the app process** — acceptable on a single VPS; behind real traffic, fronting it with the reverse proxy or a CDN is preferable.

## Animation performance

The hero and section animations are GPU-friendly (transform/opacity/filter), use long durations and eased loops, and respect the "animate once" pattern for scroll reveals. There is no continuous JS-driven layout work in the hot path. (No `prefers-reduced-motion` handling is implemented yet — a small accessibility/perf nicety for the future.)

## Responsive optimizations

Layouts and the partners carousel adapt to viewport width (items-per-view 2/3/4/5) via a resize listener, so mobile devices render fewer, appropriately sized elements rather than scaling down a desktop layout.

## Summary

For a corporate marketing site with an internal CMS, the current performance profile is solid out of the box. The single highest-impact improvement is **code-splitting the admin bundle**; the next tier is **API read caching** and an **image-optimization/CDN pipeline**.
