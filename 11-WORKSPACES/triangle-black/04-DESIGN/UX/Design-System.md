---
ID: 08-UX-04
Title: Design System
Purpose: Define colors, typography, spacing, components, and design tokens
Version: 1.0
Status: Draft
Last Updated: 2026-06-30
---

# Design System

## Brand Colors

### Primary Palette

| Token | Hex | Usage | WCAG AA |
|-------|-----|-------|---------|
| --color-primary-900 | #0D1F33 | Darkest shade | — |
| --color-primary-800 | #12294A | Headings | — |
| --color-primary-700 | #1B3A5C | Primary buttons, links | White text ✓ |
| --color-primary-600 | #254D73 | Hover states | White text ✓ |
| --color-primary-500 | #2E5F8A | Active states | White text ✓ |
| --color-primary-400 | #4A7BA6 | Secondary elements | White text ✓ |
| --color-primary-300 | #7A9FBF | Disabled states | Black text ✓ |
| --color-primary-200 | #A8C3D9 | Borders, dividers | Black text ✓ |
| --color-primary-100 | #D4E3F0 | Background tints | Black text ✓ |
| --color-primary-50 | #EBF2F8 | Lightest background | Black text ✓ |

### Accent Palette (Warm Orange)

| Token | Hex | Usage |
|-------|-----|-------|
| --color-accent-700 | #C4721F | Hover states |
| --color-accent-600 | #D9812E | Active states |
| --color-accent-500 | #E8913A | Primary accent, CTAs, highlights |
| --color-accent-400 | #F0A85C | Light accent |
| --color-accent-300 | #F5C48A | Borders, backgrounds |
| --color-accent-200 | #FAE0C0 | Light backgrounds |
| --color-accent-100 | #FDF2E5 | Lightest backgrounds |

### Neutral Palette

| Token | Hex | Usage |
|-------|-----|-------|
| --color-neutral-900 | #1A1A1A | Body text |
| --color-neutral-800 | #2D2D2D | Secondary text |
| --color-neutral-700 | #404040 | Tertiary text |
| --color-neutral-600 | #666666 | Disabled text |
| --color-neutral-500 | #808080 | Placeholder text |
| --color-neutral-400 | #999999 | Borders |
| --color-neutral-300 | #B3B3B3 | Light borders |
| --color-neutral-200 | #CCCCCC | Dividers |
| --color-neutral-100 | #E6E6E6 | Background |
| --color-neutral-50 | #F5F5F5 | Lightest background |
| --color-white | #FFFFFF | White |

### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| --color-success | #2E7D32 | Approved, Completed, Active |
| --color-success-light | #E8F5E9 | Success background |
| --color-warning | #F57C00 | Pending, In Progress |
| --color-warning-light | #FFF3E0 | Warning background |
| --color-error | #C62828 | Rejected, Overdue, Error |
| --color-error-light | #FFEBEE | Error background |
| --color-info | #1565C0 | Information, Neutral updates |
| --color-info-light | #E3F2FD | Info background |

## Typography

### Font Family

```
Primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
Monospace: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace
System Arabic: 'Cairo', 'Noto Sans Arabic', sans-serif (V2)
```

### Type Scale

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| --text-xs | 0.75rem (12px) | 1.25 | 400 | Captions, labels |
| --text-sm | 0.875rem (14px) | 1.375 | 400 | Body small, table cells |
| --text-base | 1rem (16px) | 1.5 | 400 | Body text |
| --text-lg | 1.125rem (18px) | 1.5 | 500 | Large body, subtitles |
| --text-xl | 1.25rem (20px) | 1.4 | 600 | Section headings |
| --text-2xl | 1.5rem (24px) | 1.3 | 600 | Page headings |
| --text-3xl | 1.875rem (30px) | 1.2 | 700 | Major headings |
| --text-4xl | 2.25rem (36px) | 1.1 | 700 | Hero headings |

### Font Weights

| Token | Weight | Usage |
|-------|--------|-------|
| --font-normal | 400 | Body text, paragraphs |
| --font-medium | 500 | Labels, buttons, emphasis |
| --font-semibold | 600 | Subheadings, active states |
| --font-bold | 700 | Headings, strong emphasis |

## Spacing

Based on 4px micro-unit, 8px base unit.

| Token | Value | Usage |
|-------|-------|-------|
| --space-1 | 0.25rem (4px) | Micro spacing, icons |
| --space-2 | 0.5rem (8px) | Tight spacing, badges |
| --space-3 | 0.75rem (12px) | Small padding, gaps |
| --space-4 | 1rem (16px) | Standard padding |
| --space-5 | 1.25rem (20px) | Comfortable padding |
| --space-6 | 1.5rem (24px) | Section spacing |
| --space-8 | 2rem (32px) | Large section spacing |
| --space-10 | 2.5rem (40px) | Page margins |
| --space-12 | 3rem (48px) | Component group spacing |
| --space-16 | 4rem (64px) | Major section spacing |

## Breakpoints

| Token | Width | Device |
|-------|-------|--------|
| --bp-sm | 640px | Mobile landscape |
| --bp-md | 768px | Tablet |
| --bp-lg | 1024px | Tablet landscape / small desktop |
| --bp-xl | 1280px | Desktop |
| --bp-2xl | 1536px | Large desktop |

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| --radius-sm | 4px | Inputs, small elements |
| --radius-md | 6px | Cards, buttons |
| --radius-lg | 8px | Modals, containers |
| --radius-xl | 12px | Large containers |
| --radius-full | 9999px | Pills, badges, avatars |

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| --shadow-sm | 0 1px 2px rgba(0,0,0,0.05) | Cards, subtle depth |
| --shadow-md | 0 4px 6px rgba(0,0,0,0.07) | Dropdowns, elevated cards |
| --shadow-lg | 0 10px 15px rgba(0,0,0,0.1) | Modals, drawers |
| --shadow-xl | 0 20px 25px rgba(0,0,0,0.15) | Large modals, alerts |

## Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| --z-dropdown | 100 | Dropdown menus |
| --z-sticky | 200 | Sticky headers |
| --z-overlay | 300 | Modal backdrops |
| --z-modal | 400 | Modal dialogs |
| --z-toast | 500 | Toast notifications |
| --z-tooltip | 600 | Tooltips |

## Design Token Naming Convention

```
--{category}-{property}-{variant}
--color-primary-700
--text-base
--space-4
--radius-md
--shadow-sm
```

Tokens are defined as CSS custom properties on `:root` and consumed by all components. No hardcoded values outside of token definitions.
