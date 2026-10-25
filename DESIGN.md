# Design system — "Navy & Brass"

This is the one visual language for every public-facing page (everything except
`src/app/(dashboard)/*`). It replaces an older "Midnight/Violet" dark-gradient look
that is being migrated away from page by page — if you find `#09091F`, `#7C3AED`, or
`#C026D3` in a file you're touching, that file hasn't been migrated yet.

All tokens live as CSS custom properties in `src/app/globals.css` (`:root`, wired into
Tailwind v4 via the `@theme` block). **Never redeclare a local `const ACCENT = '#...'`
in a component** — every color below already has a token or a documented Tailwind
class. New constants are how competing palettes happen in the first place.

**v3 note**: v1 (muted forest green) and v2 (padhai.ai-referenced bright green) are
both retired. The brief explicitly asked for something that doesn't read as a generic
green/blue/purple AI-generated SaaS palette — "Navy & Brass" is a deliberate,
specific choice: deep navy ink on warm cream, with a brass/gold accent. It should feel
like it belongs to a serious exam-prep / civil-services product (gravitas, documents,
official-ness), not a startup template. If you're referencing old green hex values
anywhere, they're stale — this table is current.

## Palette

| Role | Hex (approx) | HSL token | Tailwind class |
|---|---|---|---|
| Page background / surface | `#F7F4EC` (warm cream) | `--background` | `bg-background` |
| Body text / ink | `#16233E` (deep navy) | `--foreground` | `text-foreground` |
| Card surface | `#FFFFFF` | `--card` | `bg-card` |
| Primary (buttons, links, CTAs) | `#8A6A12` (deep brass) | `--primary` | `bg-primary` / `text-primary` |
| Primary, on-primary text | warm near-white | `--primary-foreground` | `text-primary-foreground` |
| Primary tint (soft background) | — | — | `bg-primary/8` |
| Primary tint (border) | — | — | `border-primary/18` |
| **Brand-pop** (brighter metallic gold — stars, badges, success, highlights **only**) | `#D4AF37` | `--brand-pop` | `bg-brand-pop` / `text-brand-pop` |
| Muted body text | `#5B6478`-ish (cool navy-gray) | `--muted-foreground` | `text-muted-foreground` |
| Muted surface (inputs, pills) | — | `--muted` | `bg-muted` |
| Hairline border | warm light tan | `--border` | `border-border` |
| Destructive | — | `--destructive` | `bg-destructive` / `text-destructive` |

**Primary vs. brand-pop — don't mix these up.** `primary` is the dark, accessible brass
that carries white text on buttons and does the normal "this is a link/CTA" job.
`brand-pop` is the brighter, more saturated gold — reserve it for small, high-contrast
accents (rating-style badges, "new" tags, success checkmarks, a highlighted word) where
it sits on a light or dark-ink background, never as a large filled surface with white
text on top (it doesn't have the contrast for that).

**Inverted surfaces** (footer, dark panels): don't invent a new "footer dark" palette —
`--foreground` *is* the inverted background. Use `bg-foreground` + `text-background`,
and `text-background/65`, `text-background/40` etc. for the muted tiers, exactly like
`PublicFooter.tsx` does.

GS-paper tag colors (GS1–GS4) are a separate, deliberately distinct semantic palette
(violet/cyan/emerald/red) used as content metadata, not UI chrome — keep those as-is
wherever they already appear; they aren't part of the Midnight/Violet theme being
retired.

## Type

- **Body / UI**: Poppins (`var(--font-poppins)`). Set globally on `body` — don't
  reapply per component.
- **Display / headlines**: Source Serif 4 (`var(--font-serif-display)`). Reach for it
  on page `<h1>`s and major section headers; keep everything else (nav, buttons,
  labels, body copy) in Poppins.
- **Scale**: Tailwind's default `text-*` utilities cover body copy, labels, and
  captions. For serif display headings that need a size Tailwind's scale doesn't have
  (responsive hero/article titles), use the three custom properties added for this:
  `var(--text-display-lg)` (page heroes), `var(--text-display-md)` (section/list-page
  heroes), `var(--text-display-sm)` (article `<h1>`s). Don't hand-roll another
  `clamp(...)` — if none of the three fit, that's a sign the scale needs a fourth step,
  not a one-off value.
- Body text defaults to `font-size: 14px; line-height: 1.65` (set on `body` in
  `globals.css`); `p, li, td, th` bump to `line-height: 1.7` for readability.

## Shape & surface

- Corner radius: `--radius: 0.5rem`, exposed as `rounded-lg`/`rounded-md`/`rounded-sm`.
  Cards generally use `rounded-2xl` (a de facto convention across the editorial pages,
  not yet tokenized — keep using it for new cards).
- Borders: 1px, `border-border`, no heavier card borders.
- Shadows: keep them quiet — `shadow-sm` for resting cards, a slightly deeper shadow
  only on hover/lift (see `current-affairs/page.tsx`'s promo banner for the pattern).

## Shared layout

Every public route should render through `PublicLayout` (`src/components/landing/PublicLayout.tsx`),
not its own header/footer markup:

```tsx
import { PublicLayout } from '@/components/landing/PublicLayout';

export default function SomePublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <PublicLayout tagline="One line describing this section for the footer">
      {children}
    </PublicLayout>
  );
}
```

`PublicLayout` composes `PublicHeader` (identical on every public page) and
`PublicFooter` (`tagline` is the only thing that varies per section). `NavAuthButtons`
and `CoursesNavDropdown` still accept a legacy `dark` prop internally — `PublicHeader`
always passes `dark={false}`. Once every public route is migrated off Midnight/Violet,
retire the `dark` prop and its dead branch from both components; don't do it before
then.

## Migration status

- ✅ Migrated: homepage (`src/app/page.tsx`), `current-affairs/*` (list, detail,
  layout)
- 🚧 Not yet migrated (still Midnight/Violet — `#09091F`/`#7C3AED`): `courses/*`,
  `general-studies/*`, `(auth)/*`, `privacy`, `terms`,
  `current-affairs/date/[date]/DailyDigestClient.tsx`,
  `current-affairs/places-in-news/page.tsx`

When migrating a page: swap its `layout.tsx` to `PublicLayout`, then replace local hex
constants with the token classes above. Grep for `09091F|7C3AED` in the files you
touched — it should come back empty before you call a page done.
