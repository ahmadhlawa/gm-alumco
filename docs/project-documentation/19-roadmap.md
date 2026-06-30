# 19 — Future Roadmap

Logical next improvements, ordered roughly by value-to-effort. None are required for the product to function; they harden, optimize, and extend it.

## Tier 1 — High value, low/medium effort

1. **Code-split the admin bundle.** Wrap `/admin/*` in `React.lazy` + `Suspense` so public visitors don't download admin code. Directly addresses the Vite chunk-size advisory and improves first load. (See [Performance](15-performance.md).)
2. **SEO foundations.** Add per-route `<title>`/meta description/Open Graph/Twitter tags (e.g. a small head-manager), a `sitemap.xml`, `robots.txt`, canonical URLs, and JSON-LD `Organization`/`LocalBusiness` structured data. Biggest marketing-impact gap for a corporate site. (See [Public Website](11-public-website.md).)
3. **Email integration polish.** The quote-notification SMTP path exists; extend it to contact messages, add an autoresponder to the lead, and make recipients configurable. Add basic delivery logging.
4. **Housekeeping.** Delete unrouted legacy admin pages and the visual-CMS components once it's certain they won't be revived; remove `backend_nestjs_backup/`, mock `data/*`, and `_dump.json`; rewrite the outdated root and frontend READMEs to point at this handbook; reconcile the `gm_alomco_db` naming in shipped defaults.

## Tier 2 — Medium value, medium effort

5. **API read caching on the client.** Introduce a data-fetching cache (SWR / TanStack Query) to dedupe and cache public reads, with revalidation on language change — fewer requests, snappier navigation.
6. **Image optimization pipeline / CDN.** Generate resized + WebP/AVIF variants on upload (or via an image CDN), serve responsive `srcset`, and front `/uploads` with the proxy/CDN. Reduces bandwidth and improves LCP.
7. **Re-enable deferred editors as needed.** The `gallery_images`, `testimonials`, and `site_settings` tables/APIs are ready; add focused admin editors (matching the Projects/Partners pattern) if the client wants to self-manage them.
8. **Accessibility pass.** Add `prefers-reduced-motion` handling, audit focus order/ARIA on the admin tables and modals, and verify color-contrast on gold-on-navy text.
9. **Live Contact map.** Replace the Google Maps placeholder with an embedded map (lazy-loaded) and a real address.

## Tier 3 — Higher effort / scale-driven

10. **Scaled rate limiting & sessions.** Move login rate limiting to a shared store (Redis) for multi-worker deployments; consider refresh tokens + a revocation list if session control becomes important.
11. **Async backend / throughput.** If traffic grows, adopt an async DB driver or tune worker counts; offload static `/uploads` entirely to the proxy/CDN.
12. **Analytics & observability.** Add privacy-respecting web analytics (page views, language split, quote-form conversion), backend request/error logging, and uptime/health monitoring on `/health`.
13. **Notifications.** In-app or push/email notifications to admins on new contact/quote leads (beyond the current best-effort quote email).
14. **CI/CD.** Add a pipeline that runs backend pytest + frontend typecheck/test/build on every push, and automates migration + deploy to the VPS.
15. **Advanced CMS (optional).** If the client later wants richer editing, reintroduce a *constrained* version of the visual editing concept — but persisted to the backend, fully trilingual-aware, and scoped so it can't break the locked design.

## Suggested sequencing

A pragmatic order for the next phase: **(1) code-split admin → (2) SEO foundations → (4) housekeeping → (6) image pipeline → (5) client caching → (12) analytics**. This front-loads the items that most improve perceived quality, discoverability, and maintainability before tackling scale-driven concerns.
