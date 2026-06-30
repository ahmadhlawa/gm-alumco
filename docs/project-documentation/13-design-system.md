# 13 — Design System

The visual identity is a **premium dark theme**: deep navy backgrounds, gold accents, restrained motion, and generous spacing. It is shared verbatim between the public site and the admin panel, so the CMS feels like part of the same product. Tokens are defined once in `src/index.css` via Tailwind v4's `@theme` block and consumed as utility classes everywhere.

## Colors (brand tokens)

| Token | Hex | Usage |
|-------|-----|-------|
| `brand-navy` | `#0A192F` | Primary background |
| `brand-surface` | `#112240` | Cards, sections, elevated panels |
| `brand-surface-alt` | `#172A45` | Inputs, secondary elevated surfaces |
| `brand-gold` | `#D4AF37` | Accent: highlights, primary buttons, active states, edit controls |
| `brand-silver` | `#8892B0` | Secondary / muted text |
| `brand-text` | `#F3F4F6` | Primary text |
| `brand-border` | `#233554` | Subtle borders, shadow tints |

Consumed as `bg-brand-navy`, `text-brand-gold`, `border-brand-border`, etc. A frequent recurring hover accent is the slightly brighter gold `#e3c454`/`#b8962e`.

## Typography

- **Per-language sans fonts**: `Heebo` for Hebrew (`html[lang="he"]`), `Tajawal` otherwise, both with system fallbacks.
- Headings are heavy (`font-bold`/`font-black`) with tight tracking; the hero uses up to `text-7xl` in LTR. Body text is `brand-silver` at comfortable line-heights (`leading-relaxed`/`leading-8`).
- Numeric values are frequently forced `dir="ltr"` even in RTL layouts so figures like `250+` read correctly.

## Spacing & layout

- Section vertical rhythm is generous (`py-24` is the standard section padding).
- A centered `container mx-auto px-4` wrapper governs content width.
- Grids use Tailwind's responsive columns (`grid md:grid-cols-2 lg:grid-cols-3 …`) and collapse cleanly on mobile.

## Cards

The recurring card pattern: `bg-brand-navy` or `bg-brand-surface`, a hairline border (`border border-white/5` or `border-white/10`), squared or lightly rounded corners, and a **gold border on hover** (`hover:border-brand-gold`) often paired with a slight lift (`hover:-translate-y-2`) and a soft gold glow shadow. Project, service, partner, testimonial, and admin stat cards all share this language.

## Buttons

A shared `Button` component plus inline button styles:
- **Primary / gold**: `bg-brand-gold text-white` (or `text-brand-navy`), hover to a brighter gold, used for the main CTA on each surface.
- **Outline / secondary**: transparent with a white/gold border, hover to gold text/border.
- Buttons use bold weight, comfortable padding, and subtle transitions (`hover:-translate-y-0.5`, shadow growth).

## Forms

Inputs are dark and minimal: `bg-brand-navy`/`bg-brand-surface`, `border-white/10`, gold focus ring (`focus:border-brand-gold focus:ring-1 focus:ring-brand-gold`), white text. `select option`s are themed dark in `index.css`. Direction-sensitive inputs (email, phone, URLs, numbers) are forced `dir="ltr"` with left alignment even within RTL forms. Validation/error blocks use a translucent red (`bg-red-500/10 border-red-500/20 text-red-300`); success uses translucent green/emerald.

## Animations & motion philosophy

Motion is **cinematic but restrained** (see [Public Website](11-public-website.md)):
- A slow, infinite Ken Burns zoom on the hero background.
- Staggered, blur-in reveals (`opacity/y/filter` variants with a custom cubic-bezier ease `[0.22, 1, 0.36, 1]`).
- One-time scroll reveals (`whileInView` + `viewport={{ once: true }}`).
- Smooth layout transitions on the Projects grid; a `layoutId` underline on the active nav link.
- Floating clipped-polygon decorative shapes in the hero with long, eased loops.
The intent: feel high-end and alive without being noisy or hurting performance.

## Premium visual language: backgrounds, shadows, gradients

- **Layered gradient overlays** over photographic backgrounds (e.g. the hero stacks a directional navy wash, a radial gold glow, and top/bottom fades) to guarantee text contrast while keeping imagery visible.
- **Decorative architectural backgrounds** (`tas-bg-about/process/cta.webp`) are placed at very low opacity (`opacity-[0.14]`–`0.2`) behind sections, with a gradient wash on top for readability.
- **Gold hairlines and grid patterns** (thin gradient lines, an SVG grid in the process section) reinforce the engineering/architectural theme.
- **Soft, tinted shadows** (`shadow-brand-border/50`, gold-tinted glows on hover) rather than harsh drop shadows.

## Luxury styling decisions (rationale)

- **Dark navy + gold** signals premium/architectural rather than mass-market.
- **Squared-ish geometry** and thin gold lines echo aluminum/glass framing — the product the company sells.
- **Low-opacity real photography** under gradients keeps the site feeling bespoke without sacrificing legibility.
- **Consistent token usage** means the entire look can be re-tuned from one `@theme` block, and the admin inherits the same identity for free.

## Iconography

`lucide-react` throughout, in gold or silver, sized consistently. Some icons are direction-flipped in LTR. Icons reinforce meaning (process steps, value chips, admin nav, status badges) without carrying critical information alone.
