# Dark Mode Design

**Date:** 2026-04-02

## Overview

Add dark mode to the SEO Keyword Analyzer. Respects OS/system preference by default, with a manual toggle in the header. User choice is persisted in localStorage.

## Architecture

- Install `next-themes` (tiny, ~3kb, handles SSR flash prevention)
- Add `components/Providers.tsx`: a `'use client'` wrapper around `<ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>` — needed because `layout.tsx` is a Server Component and cannot directly use client-side context providers
- In `app/layout.tsx`: wrap `{children}` with `<Providers>`
- Add `components/ThemeToggle.tsx`: a client component using `useTheme()` with a mount guard (renders `null` until mounted to avoid hydration mismatch)
- Place `<ThemeToggle />` in `app/page.tsx` inside the `<header>`, absolutely positioned to the right

## ThemeToggle Component

Uses the DaisyUI `swap` component (`dui-swap`, `dui-swap-rotate`) with sun and moon SVG icons. Clicking toggles between `"light"` and `"dark"` themes. The component renders `null` on first render (before mount) to prevent SSR mismatch.

```
components/ThemeToggle.tsx
- 'use client'
- useEffect to set mounted = true
- useTheme() for resolvedTheme and setTheme
- DaisyUI swap markup with sun/moon SVGs
```

## CSS Changes

Add a `[data-theme="dark"]` block in `app/globals.css` overriding the `:root` CSS custom properties:

| Variable | Dark value |
|---|---|
| `--bg` | `#0f172a` |
| `--surface` | `#1e293b` |
| `--text` | `#e2e8f0` |
| `--text-secondary` | `#94a3b8` |
| `--text-muted` | `#64748b` |
| `--border` | `#334155` |
| `--border-strong` | `#475569` |
| `--primary-light` | `#1e3a5f` |
| `--primary-subtle` | `#1e3a5f` |
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.2)` |
| `--shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.3), 0 2px 4px -2px rgba(0,0,0,0.2)` |
| `--shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.35), 0 4px 6px -4px rgba(0,0,0,0.2)` |

`--header-bg` and `--tabs-bg` remain unchanged (already dark in both modes).

## Toggle Placement

Absolutely positioned inside `<header>`, right-aligned:
```css
position: absolute;
right: 2rem;
top: 50%;
transform: translateY(-50%);
```

The header already has `position: relative`, so this works without changes to header CSS.

## Behavior

1. On first visit: uses system preference (`prefers-color-scheme`)
2. After manual toggle: saved to localStorage via `next-themes`, overrides system preference
3. On subsequent visits: localStorage value takes precedence

## Files Changed

- `package.json` — add `next-themes`
- `app/layout.tsx` — wrap children with `<Providers>`
- `app/globals.css` — add `[data-theme="dark"]` block
- `app/page.tsx` — add `<ThemeToggle />` in header
- `components/Providers.tsx` — new file (client wrapper for ThemeProvider)
- `components/ThemeToggle.tsx` — new file
