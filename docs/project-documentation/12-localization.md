# 12 — Localization

Localization is one of the most consequential architectural threads in this project, because it changed direction during development. This chapter documents the **final** design and the journey that produced it.

## Original design (Arabic / English / Hebrew)

The data model and the `t()` helper were designed around **three languages**: Arabic, English, and Hebrew. Every content table carries `*_ar`, `*_en`, `*_he` columns (separate columns, not JSON), and the translation helper has the signature `t(ar, he, en)`. Arabic was the **primary development and preview language** — most admin UI copy is still written in Arabic, and the inline `t(...)` calls throughout the components list Arabic first.

## The transition

The client's real market is **Hebrew-speaking, with English as the international fallback**. Arabic was therefore **removed as a public-facing UI language**, but pulling it out of the data model would have been costly and lossy. The decision was to:

- keep the **trilingual data model** intact (so no data is destroyed and Arabic remains a usable fallback);
- restrict the **public language switcher** to Hebrew and English;
- make **Hebrew the default** language and default direction (RTL).

## Final architecture (Hebrew / English)

`src/i18n/index.tsx` defines the entire public i18n surface:

```ts
export type Language = 'he' | 'en';                       // public languages
resolveInitialLanguage(value) // → 'he' unless stored value is 'en'/'he'
getLanguageDirection(lang)    // 'en' → 'ltr', else 'rtl'
getNextPublicLanguage(lang)   // toggles he ↔ en
translatePublic(lang, ar, he, en):
  if lang === 'he' return he || en || ar
  else            return en || he || ar
```

- The **`LanguageProvider`** holds the current language, exposes `setLanguage`, computes `dir`, and provides `t(ar, he?, en?)`.
- On every change it sets `document.documentElement.lang` and `dir` and persists the language to `localStorage` under `tas_public_language`.
- `t(...)` itself **never surfaces Arabic** for the two public languages (Hebrew prefers `he`, English prefers `en`); Arabic is only the last-ditch fallback if both are missing.

## Fallback logic for data

UI strings use `t()`; **content** strings come from the backend's localized columns and are resolved in `src/api/adapters.ts`:

```ts
function pick(locale, ar, en, he) {
  if (locale === 'he') return he ?? en ?? ar ?? '';
  if (locale === 'en') return en ?? he ?? ar ?? '';
  return ar ?? he ?? en ?? '';   // ('ar' locale path, used internally)
}
```

This guarantees the UI never renders an empty string when one language is missing — it walks a sensible chain. The public read facade (`lib/api.ts`) passes the current locale into these adapters so pages receive ready-to-render localized view models.

## RTL / LTR and mirrored layouts

- The app's outermost wrapper applies `dir={dir}` from the language context, so **the entire layout mirrors** when you toggle language.
- Section components that need their own direction also set `dir={dir}` locally (hero, partners, Company Numbers).
- Tailwind logical utilities (`ps-`/`pe-`, `rtl:`/`ltr:` variants, `border-s`) handle direction-sensitive spacing and borders.

## Direction-aware icons & imagery

- The hero background image is **mirrored** for English via `heroBackgroundTransform(dir)` (`scaleX(-1)` for RTL, `scaleX(1)` for LTR) so the building composition sits opposite the headline in each direction.
- The hero CTA arrow is flipped in LTR (`ltr:-scale-x-100`).
- Gradient overlays follow the text side (dark wash on the right in RTL, left in LTR).

## Fonts

Per-language fonts are selected purely via the `lang` attribute in `src/index.css`:

```css
@theme { --font-sans: "Tajawal", ui-sans-serif, system-ui, sans-serif; }
@layer base {
  html[lang="he"] { --font-sans: "Heebo", ui-sans-serif, system-ui, sans-serif; }
}
```

So Hebrew renders in **Heebo** and everything else in **Tajawal**, with no per-component font logic.

## Admin language behavior

The admin UI is **not** internationalized the way the public site is — most admin copy is hard-coded **Arabic** (the operational language the team used during development), with the sidebar's "Company Numbers" item already in Hebrew. The one admin screen that is fully **Hebrew/English** is the **Company Numbers editor** (`AdminPublicStats`), which has its own `COPY` object and explicitly avoids Arabic, because that screen edits the customer-facing numbers and the client wanted it in production languages.

## Database compatibility & legacy Arabic handling

- The DB keeps all three localized columns, so historical Arabic content is never lost.
- The **Company Numbers** flow is explicit about this: when the admin edits the three numbers (Hebrew + English labels only), the projection logic (`applyCompanyNumbers` / `toStat`) **carries the legacy Arabic label through untouched** (`labelAr`), never edited and never cleared. The stored JSON therefore stays fully backward-compatible — value chips, the "since" badge, and the about highlight are preserved, and Arabic labels remain available as a fallback.
- The **Project** and **Partner** admin forms similarly preserve existing `*_ar` values (the project form edits he/en and passes `*_ar` through; the partner form writes the single entered name to all three columns on create).

## Net result

A clean two-language public experience (Hebrew-first, English fallback) with correct RTL/LTR, mirrored layouts, direction-aware visuals, and per-language fonts — built on a trilingual data model that safely retains Arabic as an internal fallback rather than throwing it away.
