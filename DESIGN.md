# Design system: minimal monochrome

The site's visual language is modelled on [impeccable.style](https://impeccable.style/). It uses near-black ink on neutral paper, thin 1px rules, three typefaces and **one** gold accent that appears only in tiny doses. It replaces the retired "Navy & Brass" (navy / brass / cream) and the older "Midnight/Violet" looks. A file containing `#16233E`, `#8A6A12`, `#F7F4EC` or `#7C3AED` hasn't been migrated.

All tokens live in `src/app/globals.css`. Semantic HSL variables are in `:root`, Tailwind tokens in `@theme`, and component classes in `@layer components`. **Never declare a local `const ACCENT = '#...'` in a component.** Use a token or one of the classes below.

## Palette

| Role | Value | Tailwind |
|---|---|---|
| Page background | `#F7F7F7`, oklch(97.8% 0 0) | `bg-paper` / `bg-background` |
| Raised surface (cards) | `#FDFDFD` | `bg-paper-raised` / `bg-card` |
| Deep surface (footer, inset, visual strips) | `#EFEFEF` | `bg-paper-deep` |
| Chips, tracks | `#EBEBEB` | `bg-paper-gray` / `bg-muted` |
| Headings, primary fills | near-black | `text-ink`, `bg-ink` / `bg-primary` |
| Body text | `#1C1C1C` | `text-ink-soft` / `text-foreground` |
| Secondary text | `#646464` | `text-ink-muted` / `text-muted-foreground` |
| Decorative only (not for meaningful text) | `#9A9A9A` | `text-ink-faint` |
| Hairline / strong rule / outline-button edge | ink at 8% / 16% / 45% | `border-rule`, `border-rule-strong`, `border-edge` |
| **Accent (the only colour)** | `#F2B620` gold | `bg-gold` / `text-gold` (`brand-pop`) |
| Error / destructive | vermilion oklch(52% .16 35) | `bg-destructive`, `.ks-tag-alert` |

Gold appears at most once or twice per screen: an active marker, a progress fill, a "new/today/important" tag or a streak flame. Never use it for buttons or large fills. Success is ink with a ✓, not green. Categories (GS papers, subjects, courses, exams) all look the same and differ only by label. No gradients, glows, blurred blobs or coloured shadows.

## Typography

| Use | Family | Tailwind | Notes |
|---|---|---|---|
| UI and body | **Albert Sans** | `font-ui` (body default) | 16px on public pages (`.theme-mono`), 14px in the app |
| Marketing display | **Alumni Sans** | `font-display` | weight 200–300 only: `.display-title`, `.section-title` |
| Labels, eyebrows, meta, code | **JetBrains Mono** | `font-label` | 11px uppercase, 0.12–0.18em tracking |

Content pages (articles, docs-like pages) use Albert Sans headings at weight 650, following [impeccable.style/docs](https://impeccable.style/docs/).

## Component classes

- **Page shell:** `.theme-mono` (public pages: 16px, paper background), `.ks-container` (max 1200px with gutters), `.ks-section` (large vertical rhythm).
- **Marketing:** `.eyebrow` + `.eyebrow-dot`, `.display-title`, `.section-title`, `.section-lead`, `.card-title`, `.card-quiet` (homepage panels).
- **Actions:** `.btn-ink` (primary), `.btn-outline` (secondary), `.btn-sm`, `.chip`, `.ks-link`, `.nav-link`. `components/ui/button` is already black.
- **Cards** (following [impeccable.style/slop](https://impeccable.style/slop/)): `.ks-card-grid` › `.ks-card` (flat, 2px radius, 1px rule, no shadow; `.is-interactive`, `.is-active`) › optional `.ks-card-visual` (grey 160px strip) › `.ks-card-body` › `.ks-card-head` with `.ks-tag` (`-outline`, `-ink`, `-gold`, `-alert`), `.ks-card-title`, `.ks-card-desc`, `.ks-card-meta`, `.ks-card-link` (mono, auto "→"). Group header: `.ks-group-head`, `.ks-group-title`, `.ks-group-count`.
- **Reading** (following [impeccable.style/docs](https://impeccable.style/docs/)): `.doc-title`, `.doc-lede`, `.doc-h2`, `.doc-h3`, `.doc-note`, `.doc-prose` (wrap any rendered article HTML), `.doc-nav-label` and `.doc-nav-link` (table of contents, gold bar on the active item).

## Shape and motion

- **Radii:** cards 2px; inputs and buttons 3–8px; pills only for chips and avatars.
- **Shadows:** none on cards. `shadow-lift-2` only for floating layers (dropdowns, dialogs, the FAB).
- **Motion:** short ease-outs (`ease-ks`, 120–200ms), and only where the animation carries meaning.

## Brand mark

`<Logo variant="mono" />` renders an ink square with an Alumni Sans "R", next to the tracked uppercase wordmark "REMINDOLOGY". `src/app/icon.svg` and `src/app/opengraph-image.tsx` follow it.
