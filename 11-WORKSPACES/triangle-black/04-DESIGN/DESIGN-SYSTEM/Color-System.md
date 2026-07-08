# Color System

## Brand Colors

| Token | Hex | Role |
|-------|-----|------|
| --tb-primary-900 | #0D1F33 | Darkest shade |
| --tb-primary-800 | #12294A | Headings |
| --tb-primary-700 | #1B3A5C | Primary buttons, links |
| --tb-primary-600 | #254D73 | Hover states |
| --tb-primary-500 | #2E5F8A | Active states |
| --tb-primary-400 | #4A7BA6 | Secondary elements |
| --tb-primary-300 | #7A9FBF | Disabled states |
| --tb-primary-200 | #A8C3D9 | Borders, dividers |
| --tb-primary-100 | #D4E3F0 | Background tints |
| --tb-primary-50 | #EBF2F8 | Lightest background |

## Accent Color (Warm Orange)

| Token | Hex | Role |
|-------|-----|------|
| --tb-accent-700 | #C4721F | Hover states |
| --tb-accent-600 | #D9812E | Active states |
| --tb-accent-500 | #E8913A | Primary CTAs, highlights |
| --tb-accent-400 | #F0A85C | Light accent |
| --tb-accent-300 | #F5C48A | Borders, backgrounds |
| --tb-accent-200 | #FAE0C0 | Light backgrounds |
| --tb-accent-100 | #FDF2E5 | Lightest backgrounds |

## Semantic Colors

| Token | Hex | Meaning | Usage |
|-------|-----|---------|-------|
| --tb-success | #2E7D32 | Approved, Completed, Active | Status badges, progress |
| --tb-success-light | #E8F5E9 | — | Background |
| --tb-warning | #F57C00 | Pending, In Progress | Status badges |
| --tb-warning-light | #FFF3E0 | — | Background |
| --tb-error | #C62828 | Rejected, Overdue, Error | Status badges, errors |
| --tb-error-light | #FFEBEE | — | Background |
| --tb-info | #1565C0 | Information, Neutral | Info banners |
| --tb-info-light | #E3F2FD | — | Background |

## Neutral Palette

| Token | Hex | Role |
|-------|-----|------|
| --tb-neutral-900 | #1A1A1A | Body text |
| --tb-neutral-800 | #2D2D2D | Secondary text |
| --tb-neutral-700 | #404040 | Tertiary text |
| --tb-neutral-600 | #666666 | Disabled text |
| --tb-neutral-500 | #808080 | Placeholder |
| --tb-neutral-400 | #999999 | Borders |
| --tb-neutral-300 | #B3B3B3 | Light borders |
| --tb-neutral-200 | #CCCCCC | Dividers |
| --tb-neutral-100 | #E6E6E6 | Background |
| --tb-neutral-50 | #F5F5F5 | Lightest background |
| --tb-white | #FFFFFF | White |

## Color Usage Rules

| Element | Background | Text |
|---------|-----------|------|
| Page background | --tb-neutral-50 | — |
| Card | --tb-white | --tb-neutral-900 |
| Primary button | --tb-primary-700 | White |
| Primary button hover | --tb-primary-600 | White |
| Secondary button | Transparent | --tb-primary-700 |
| Danger button | --tb-error | White |
| Link | --tb-primary-600 | — |
| Input | White | --tb-neutral-900 |
| Table header | --tb-neutral-50 | --tb-neutral-700 |
| Status badge | Semantic light | Semantic base |
| Toast success | --tb-success-light | --tb-success |
| Toast error | --tb-error-light | --tb-error |
| Toast warning | --tb-warning-light | --tb-warning |
| Toast info | --tb-info-light | --tb-info |
