# 🎨 Theming System

> Multi-palette × light/dark theming via CSS custom properties and HTML data attributes.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Token Layers](#token-layers)
3. [Two-Attribute System](#two-attribute-system)
4. [Palettes](#palettes)
5. [File Structure](#file-structure)
6. [Using Tokens in Components](#using-tokens-in-components)
7. [Switching Themes at Runtime](#switching-themes-at-runtime)
8. [System Preference Handling](#system-preference-handling)
9. [Adding a New Palette](#adding-a-new-palette)
10. [Token Reference](#token-reference)

---

## Architecture Overview

The theming system separates **palette identity** (`data-theme`) from **brightness mode** (`data-mode`). Both attributes live on the `<html>` element and CSS cascades in the correct priority order:

```
Layer 1 — Primitive palette   (_variables.scss :root)       ← raw values, never used in components
Layer 2 — Semantic tokens     (_variables.scss :root)       ← what components consume
Layer 3 — Theme overrides     (themes/*.scss)               ← swap only Layer 2 aliases
```

Components reference **only Layer 2** tokens (e.g. `var(--color-primary)`). Switching a theme or mode reassigns those aliases; no component SCSS changes.

---

## Token Layers

### Layer 1 — Primitive Palette

Defined in `src/styles/abstracts/_variables.scss` inside the first `:root` block.

Raw, named color values — never referenced directly in components or layouts.

```scss
// examples
--blue-500: #2196f3;
--teal-300: #80cbc4;
--gray-950: #121212;
--black-500: rgb(0 0 0 / 0.50);
```

Available color scales (each with steps `100 200 300 500 700 800 900 950`):

| Scale | Typical use |
|-------|-------------|
| `blue` | Default primary |
| `gray` | Neutral surfaces, muted text |
| `purple` | Default tertiary / accent |
| `teal` | Ocean primary |
| `cyan` | Ocean secondary |
| `indigo` | Ocean tertiary |
| `green` | Success status |
| `orange` | Warning status |
| `red` | Error status |
| `yellow` / `amber` | Caution states |
| `violet` / `pink` / `rose` | Additional accent options |
| `white-*` / `black-*` | Alpha overlay scales |

---

### Layer 2 — Semantic Tokens

Defined in `src/styles/abstracts/_variables.scss` inside the second `:root` block. **These are the only tokens components should use.**

| Token | Purpose |
|-------|---------|
| `--color-primary` | Button fill, active indicators, links |
| `--color-on-primary` | Text/icon placed on a primary fill |
| `--color-primary-container` | Tinted background — chips, cards, badges |
| `--color-primary-on-container` | Text/icon on a primary-container bg |
| `--color-primary-hover` | Hover/focus state for primary |
| `--color-secondary` | Secondary button fill |
| `--color-on-secondary` | Text/icon on secondary fill |
| `--color-secondary-container` | Secondary tinted bg — rows, secondary chips |
| `--color-secondary-on-container` | Text/icon on secondary-container |
| `--color-secondary-hover` | Hover state for secondary |
| `--color-tertiary` | Accent fill — tags, premium UI |
| `--color-on-tertiary` | Text/icon on tertiary fill |
| `--color-tertiary-container` | Tertiary tinted bg |
| `--color-tertiary-on-container` | Text/icon on tertiary-container |
| `--color-tertiary-hover` | Hover state for tertiary |
| `--color-success` | Success messages, icons |
| `--color-warning` | Warning messages, icons |
| `--color-error` | Error messages, validation |
| `--color-bg` | Page/app background |
| `--color-surface` | Card/panel/sidebar background |
| `--color-text` | Default body text |
| `--color-text-muted` | Secondary/helper text, placeholders |
| `--color-border` | Input borders, dividers, outlines |
| `--shadow-sm / md / lg` | Box shadow scale |
| `--spacing-xs … 2xl` | Spacing scale |
| `--font-size-sm … 2xl` | Type scale |
| `--font-weight-normal … bold` | Weight scale |
| `--radius-sm … full` | Border-radius scale |
| `--transition-fast / base / slow` | Transition durations |
| `--z-dropdown / sticky / modal / tooltip` | Z-index scale |

---

### Layer 3 — Theme Overrides

Files in `src/styles/themes/`. Each file only re-assigns Layer 2 tokens — Layer 1 primitives are never modified.

---

## Two-Attribute System

Both attributes are set on `<html>`:

```html
<!-- Default palette, follows system preference for mode -->
<html>

<!-- Ocean palette, explicit dark mode -->
<html data-theme="ocean" data-mode="dark">

<!-- Default palette, locked to light mode -->
<html data-mode="light">
```

| Attribute | Values | Controls |
|-----------|--------|---------|
| `data-theme` | `ocean` (omit for default) | Color palette — primary/secondary/tertiary/surface tints |
| `data-mode` | `dark` · `light` (omit to follow system) | Brightness — dark or light surfaces and text |

### CSS Cascade Priority

The resolved styles for each combination of attributes and system preference:

| `data-theme` | `data-mode` | System dark? | Applied styles |
|---|---|---|---|
| — | — | No | Default light (Layer 2 `:root`) |
| — | — | Yes | Default dark (`_dark.scss`) |
| — | `light` | Either | Default light (locked) |
| — | `dark` | Either | Default dark (`_dark.scss`) |
| `ocean` | — | No | Ocean light (`_ocean.scss`) |
| `ocean` | — | Yes | Ocean dark (`_ocean-dark.scss`) |
| `ocean` | `light` | Either | Ocean light (locked) |
| `ocean` | `dark` | Either | Ocean dark (`_ocean-dark.scss`) |

> **Specificity rules the cascade.** Single-attribute selectors (`[data-mode]`, `[data-theme]`) carry specificity `0,1,0`; compound selectors (`[data-theme][data-mode]`) carry `0,2,0` and always win. When specificity ties, source order decides — theme files load as `dark → ocean → ocean-dark`, so later files take precedence.

---

## Palettes

### Default (Blue/Gray/Purple)

Activated by omitting `data-theme`. Uses blue for primary, gray for secondary, purple for tertiary.

| Mode | Selector |
|------|---------|
| Light | `:root` defaults in `_variables.scss` |
| Dark | `[data-mode='dark']` or system `prefers-color-scheme: dark` |

Files:
- Light: `src/styles/abstracts/_variables.scss` (Layer 2 `:root`)
- Dark: `src/styles/themes/_dark.scss`

---

### Ocean (Teal/Cyan/Indigo)

A cooler, sea-inspired palette. Applies teal-tinted surfaces in both modes.

| Mode | Selector |
|------|---------|
| Light | `[data-theme='ocean']` |
| Dark | `[data-theme='ocean'][data-mode='dark']` or system preference |

Files:
- Light: `src/styles/themes/_ocean.scss`
- Dark: `src/styles/themes/_ocean-dark.scss`

**Palette tokens:**

| Token | Light | Dark |
|-------|-------|------|
| `--color-primary` | `--teal-500` | `--teal-300` |
| `--color-secondary` | `--cyan-200` | `--cyan-700` |
| `--color-tertiary` | `--indigo-500` | `--indigo-300` |
| `--color-bg` | `--white` | `--gray-950` |
| `--color-surface` | `--teal-100` | `--teal-950` |
| `--color-text` | `--gray-900` | `--teal-100` |
| `--color-border` | `--teal-200` | `--teal-800` |

---

## File Structure

```
src/
├── styles.scss                         ← Entry point; @use-s all theme files
└── styles/
    ├── abstracts/
    │   ├── _index.scss                 ← @forward all abstracts (no output)
    │   ├── _variables.scss             ← Layer 1 primitives + Layer 2 semantic tokens
    │   ├── _mixins.scss
    │   └── _functions.scss
    ├── base/ …
    ├── layout/ …
    ├── components/ …
    └── themes/
        ├── _dark.scss                  ← Default palette, dark mode
        ├── _ocean.scss                 ← Ocean palette, light mode
        └── _ocean-dark.scss            ← Ocean palette, dark mode
```

`styles.scss` load order (themes loaded last so they override everything):

```scss
@use 'styles/abstracts';            // no CSS output
@use 'styles/vendors/vendors';
@use 'styles/base/reset';
@use 'styles/base/typography';
@use 'styles/base/base';
@use 'styles/layout/grid';
@use 'styles/layout/header';
@use 'styles/layout/footer';
@use 'styles/components/buttons';
@use 'styles/components/cards';
@use 'styles/themes/dark';
@use 'styles/themes/ocean';
@use 'styles/themes/ocean-dark';
```

---

## Using Tokens in Components

Always use **Layer 2** tokens. Never reference Layer 1 primitives or hardcode values.

```scss
// ✅ Correct — uses semantic token
.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  border-radius: var(--radius-md);
  transition: background-color var(--transition-fast);

  &:hover {
    background-color: var(--color-primary-hover);
  }
}

// ✅ Correct — surface token for cards
.card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-md);
  color: var(--color-text);
}

// ✅ Correct — muted helper text
.label {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

// ❌ Wrong — hardcoded value
.badge {
  background-color: #2196f3;
}

// ❌ Wrong — Layer 1 primitive referenced directly
.badge {
  background-color: var(--blue-500);
}
```

---

## Switching Themes at Runtime

Angular's `effect()` is the idiomatic way to sync signal state to imperative, non-reactive APIs — exactly what DOM attribute writes are. Store `palette` and `mode` as writable signals; declare `effect()` calls in the constructor to reactively apply them to `<html>` whenever either signal changes. Call sites only ever call `.set()` — no manual DOM code outside the service.

`inject(DOCUMENT)` and `isPlatformBrowser` keep the service SSR-safe: DOM writes are skipped on the server, and CSS handles the initial theme via `:root` defaults.

### Theme service pattern

```typescript
import { Injectable, inject, PLATFORM_ID, effect, signal } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

type ThemePalette = 'default' | 'ocean';
type ThemeMode   = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc        = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  // DOM writes are skipped during SSR — CSS handles initial theme via :root defaults
  private readonly isBrowser  = isPlatformBrowser(this.platformId);

  // Public writable signals — consumers read and set these directly
  readonly palette = signal<ThemePalette>('default');
  readonly mode    = signal<ThemeMode>('system');

  constructor() {
    // effect() is Angular's recommended way to side-effect on non-reactive APIs (the DOM).
    // Each effect re-runs automatically whenever its tracked signal changes.
    effect(() => {
      if (!this.isBrowser) return;
      const p = this.palette();
      if (p === 'default') {
        this.doc.documentElement.removeAttribute('data-theme');
      } else {
        this.doc.documentElement.setAttribute('data-theme', p);
      }
    });

    effect(() => {
      if (!this.isBrowser) return;
      const m = this.mode();
      if (m === 'system') {
        this.doc.documentElement.removeAttribute('data-mode');
      } else {
        this.doc.documentElement.setAttribute('data-mode', m);
      }
    });
  }
}
```

### Usage examples

```typescript
// Default palette, follow system
themeService.palette.set('default');
themeService.mode.set('system');
// → <html>

// Ocean palette, explicit dark
themeService.palette.set('ocean');
themeService.mode.set('dark');
// → <html data-theme="ocean" data-mode="dark">

// Default palette, lock to light
themeService.palette.set('default');
themeService.mode.set('light');
// → <html data-mode="light">
```

### Persisting preference

```typescript
// Save (e.g. in a settings component)
localStorage.setItem('theme-palette', themeService.palette());
localStorage.setItem('theme-mode', themeService.mode());

// Restore on app init (before first render to avoid flash)
const palette = localStorage.getItem('theme-palette') as ThemePalette ?? 'default';
const mode    = localStorage.getItem('theme-mode')    as ThemeMode   ?? 'system';
themeService.palette.set(palette);
themeService.mode.set(mode);
// The effects fire automatically — no explicit setAttribute calls needed
```

---

## System Preference Handling

The theming system respects `prefers-color-scheme` automatically. No JavaScript is required for the initial load — CSS handles it:

```
data-mode absent   → follow @media prefers-color-scheme
data-mode="light"  → always light (overrides system)
data-mode="dark"   → always dark  (overrides system)
```

Each dark-mode theme file uses this dual-selector pattern to apply dark tokens:

```scss
@mixin _palette-dark-tokens {
  color-scheme: dark;
  /* ... overrides ... */
}

// 1. Explicit user preference
[data-theme='palette'][data-mode='dark'] {
  @include _palette-dark-tokens;
}

// 2. System preference — skipped if user locked to light
@media (prefers-color-scheme: dark) {
  [data-theme='palette']:not([data-mode='light']) {
    @include _palette-dark-tokens;
  }
}
```

> **Default palette exception:** `_dark.scss` omits `data-theme` from its selectors entirely — it uses `[data-mode='dark']` and `:root:not([data-mode='light'])`. The template above (with `[data-theme='palette']`) applies only to named palettes. This is intentional: the default palette is the baseline, so its dark tokens attach directly to `:root` with no theme qualifier.

The `color-scheme` CSS property inside each mixin tells the browser to style native UI elements (scrollbars, `<select>`, date pickers, etc.) to match the active mode.

---

## Adding a New Palette

### How the method works

Each palette is split into exactly **two files** — one for light mode and one for dark mode:

- **`_<name>.scss`** — scopes all overrides to `[data-theme='<name>']`. Activated the moment that attribute appears on `<html>`, regardless of mode. Only overrides Layer 2 brand tokens (primary, secondary, tertiary, surfaces).
- **`_<name>-dark.scss`** — adds dark-mode tokens via a private `@mixin`, keeping them in one place. Uses two selectors: explicit (`[data-theme][data-mode='dark']`) and media-query-based (system preference). The mixin avoids duplicating the same token declarations in both selectors.

Both files register in `styles.scss` — light before dark — so the dark file's higher-specificity compound selectors always win when both `data-theme` and `data-mode` are set.

**No component SCSS changes are needed.** Components always consume Layer 2 tokens; the palette files only reassign what those tokens point to.

**Palette design tips:**
- Pick three scales that work together: a saturated **primary**, a softer/neutral **secondary**, and a complementary **tertiary**.
- Light mode: use mid-step (`500`) for fills, `100` for containers, `900` for on-container text.
- Dark mode: shift fills to lighter steps (`300`) so they read on dark surfaces, use `950` for containers, `200` for on-container text.
- Surface tinting is optional — tinting `--color-surface` with a pale hue from your primary scale gives the palette a cohesive feel (as done in Ocean). Leaving it neutral (`--gray-100` / `--gray-850`) is equally valid.
- `--color-success`, `--color-warning`, and `--color-error` are intentionally **not** overridden per palette — they are status signals that should remain consistent across all themes.

---

Follow these steps to add a palette named `forest` (for example).

**1. Create the light file** — `src/styles/themes/_forest.scss`

```scss
// ─── Forest palette — light mode ─────────────────────────────────────────────
[data-theme='forest'] {
  color-scheme: light;

  // Primary — green
  --color-primary:              var(--green-500);
  --color-on-primary:           var(--white);
  --color-primary-container:    var(--green-100);
  --color-primary-on-container: var(--green-900);
  --color-primary-hover:        var(--green-700);

  // Secondary — amber
  --color-secondary:              var(--amber-200);
  --color-on-secondary:           var(--black);
  --color-secondary-container:    var(--amber-100);
  --color-secondary-on-container: var(--amber-900);
  --color-secondary-hover:        var(--amber-500);

  // Tertiary — violet (earthy complement to green + amber)
  --color-tertiary:              var(--violet-500);
  --color-on-tertiary:           var(--white);
  --color-tertiary-container:    var(--violet-100);
  --color-tertiary-on-container: var(--violet-900);
  --color-tertiary-hover:        var(--violet-700);

  // Surface & text — green-tinted light
  --color-bg:         var(--white);
  --color-surface:    var(--green-100);
  --color-text:       var(--gray-900);
  --color-text-muted: var(--gray-500);
  --color-border:     var(--green-200);
}
```

**2. Create the dark file** — `src/styles/themes/_forest-dark.scss`

```scss
// ─── Forest palette — dark mode ──────────────────────────────────────────────
@mixin _forest-dark-tokens {
  color-scheme: dark;

  // Primary — green (dark)
  --color-primary:              var(--green-300);
  --color-on-primary:           var(--black);
  --color-primary-container:    var(--green-950);
  --color-primary-on-container: var(--green-200);
  --color-primary-hover:        var(--green-500);

  // Secondary — amber (dark)
  --color-secondary:              var(--amber-700);
  --color-on-secondary:           var(--white);
  --color-secondary-container:    var(--amber-950);
  --color-secondary-on-container: var(--amber-200);
  --color-secondary-hover:        var(--amber-500);

  // Tertiary — violet (dark)
  --color-tertiary:              var(--violet-300);
  --color-on-tertiary:           var(--black);
  --color-tertiary-container:    var(--violet-950);
  --color-tertiary-on-container: var(--violet-200);
  --color-tertiary-hover:        var(--violet-500);

  // Surface & text — forest-tinted dark
  --color-bg:         var(--gray-950);
  --color-surface:    var(--green-950);
  --color-text:       var(--green-100);
  --color-text-muted: var(--green-300);
  --color-border:     var(--green-800);

  // Shadows
  --shadow-sm: 0 1px 2px 0 var(--black-300);
  --shadow-md: 0 4px 6px -1px var(--black-500);
  --shadow-lg: 0 10px 15px -3px var(--black-500);

  background-color: var(--color-bg);
  color: var(--color-text);
}

[data-theme='forest'][data-mode='dark'] {
  @include _forest-dark-tokens;
}

@media (prefers-color-scheme: dark) {
  [data-theme='forest']:not([data-mode='light']) {
    @include _forest-dark-tokens;
  }
}
```

**3. Register in `styles.scss`**

```scss
@use 'styles/themes/dark';
@use 'styles/themes/ocean';
@use 'styles/themes/ocean-dark';
@use 'styles/themes/forest';       // ← add
@use 'styles/themes/forest-dark';  // ← add
```

**4. Extend `ThemePalette` type**

```typescript
type ThemePalette = 'default' | 'ocean' | 'forest';
```

**Checklist:**
- [ ] All 5 primary/secondary/tertiary groups defined (base, on-, container, on-container, hover)
- [ ] Status tokens (`--color-success/warning/error`) intentionally omitted — they are neutral and not palette-specific
- [ ] `color-scheme: light/dark` set in every selector/mixin
- [ ] Dark file uses a private `@mixin` to avoid duplicating tokens
- [ ] Both `[data-theme][data-mode='dark']` and `@media` blocks present in the dark file
- [ ] `styles.scss` has both new `@use` lines added (light before dark)
- [ ] `ThemePalette` type updated in the theme service

---

## Token Reference

### Color tokens

```
--color-primary              Primary fill (button bg, active indicator)
--color-on-primary           Text/icon on primary fill
--color-primary-container    Primary tinted background
--color-primary-on-container Text/icon on primary-container
--color-primary-hover        Hover/focus state

--color-secondary              Secondary fill
--color-on-secondary           Text/icon on secondary fill
--color-secondary-container    Secondary tinted background
--color-secondary-on-container Text/icon on secondary-container
--color-secondary-hover        Hover state

--color-tertiary              Tertiary/accent fill
--color-on-tertiary           Text/icon on tertiary fill
--color-tertiary-container    Tertiary tinted background
--color-tertiary-on-container Text/icon on tertiary-container
--color-tertiary-hover        Hover state

--color-success   Success state (green)
--color-warning   Warning state (orange)
--color-error     Error state (red)

--color-bg          Page background
--color-surface     Card/panel background
--color-text        Default text
--color-text-muted  Secondary/helper text
--color-border      Borders, dividers
```

### Non-color tokens (palette-independent)

```
--spacing-xs / sm / md / lg / xl / 2xl
--font-family-base
--font-size-sm / base / lg / xl / 2xl
--font-weight-normal / medium / semibold / bold
--line-height-tight / normal / loose
--radius-sm / md / lg / full
--shadow-sm / md / lg
--transition-fast / base / slow
--z-dropdown / sticky / modal / tooltip
```
