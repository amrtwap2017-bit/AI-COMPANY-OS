---
ID: 08-UX-05
Title: Component Library
Purpose: Define shared UI components and their specifications
Version: 1.0
Status: Draft
Last Updated: 2026-06-30
---

# Component Library

This document defines the shared UI components used across the Triangle Black platform. All components follow the design tokens defined in Design-System.md.

## Button

| Prop | Options | Default |
|------|---------|---------|
| variant | primary, secondary, outline, ghost, danger | primary |
| size | sm, md, lg | md |
| fullWidth | boolean | false |
| disabled | boolean | false |
| loading | boolean | false |
| icon | Icon name or null | null |
| iconPosition | left, right | left |

### Variants

```
[Primary]  [Secondary]  [Outline]  [Ghost]  [Danger]

Primary:   bg-primary-700, white text, hover primary-600
Secondary: bg-neutral-100, neutral-800 text, hover neutral-200
Outline:   border-primary-700, primary-700 text, hover bg-primary-50
Ghost:     transparent, primary-700 text, hover bg-primary-50
Danger:    bg-error, white text, hover darker error
```

### Sizes

```
Small:  h-8 px-3 text-sm
Medium: h-10 px-4 text-base
Large:  h-12 px-6 text-lg
```

## Input

| Prop | Options | Default |
|------|---------|---------|
| type | text, email, tel, number, password, date | text |
| size | sm, md, lg | md |
| error | string or null | null |
| hint | string or null | null |
| label | string or null | null |
| required | boolean | false |
| disabled | boolean | false |
| fullWidth | boolean | true |

### States

```
Default:   border-neutral-300, focus: ring-2 primary-500
Error:     border-error, focus: ring-2 error, error text below
Disabled:  bg-neutral-50, text-neutral-400, cursor-not-allowed
Filled:    border-neutral-400, bg-white
```

## Select

Same props as Input with additional:

| Prop | Options | Default |
|------|---------|---------|
| placeholder | string | "Select..." |
| options | Array<{value, label}> | [] |
| searchable | boolean | false |

Custom dropdown with option groups supported.

## Table

| Prop | Options | Default |
|------|---------|---------|
| columns | Array<Column> | required |
| data | Array<any> | required |
| loading | boolean | false |
| sortable | boolean | true |
| selectable | boolean | false |
| pagination | {page, pageSize, total} or null | null |
| emptyMessage | string | "No data found" |

### Column Definition

```
{
  key: string,
  header: string,
  render?: (value, row) => ReactNode,
  sortable?: boolean,
  width?: string,
  align?: 'left' | 'center' | 'right',
}
```

### States

```
Normal:    striped rows (even: bg-white, odd: bg-neutral-50)
Hover:     bg-primary-50
Selected:  bg-primary-100
Loading:   skeleton rows or spinner overlay
Empty:     centered icon + message with CTA
```

## Card

| Prop | Options | Default |
|------|---------|---------|
| variant | default, elevated, bordered, flat | default |
| padding | sm, md, lg | md |
| header | ReactNode or null | null |
| footer | ReactNode or null | null |

### Variants

```
Default:   bg-white, border, shadow-sm
Elevated:  bg-white, shadow-md, no border
Bordered:  bg-white, border-2, no shadow
Flat:      bg-neutral-50, no border, no shadow
```

## Modal

| Prop | Options | Default |
|------|---------|---------|
| open | boolean | required |
| size | sm, md, lg, xl, full | md |
| title | string | required |
| closeOnOverlay | boolean | true |
| showCloseButton | boolean | true |
| footer | ReactNode or null | null |

### Sizes

```
Small:  max-w-sm (384px)
Medium: max-w-lg (512px)
Large:  max-w-2xl (672px)
XLarge: max-w-4xl (896px)
Full:   max-w-full m-4
```

### Behavior

- Traps focus within modal
- Closes on Escape key
- Prevents background scroll
- Fade + scale animation (200ms)
- Overlay click closes by default
- Returns focus to trigger element on close

## Badge

| Prop | Options | Default |
|------|---------|---------|
| variant | success, warning, error, info, neutral | neutral |
| size | sm, md | md |
| dot | boolean | false |

```
[● Active]    [● Pending]    [● Overdue]    [● Info]    [● Draft]
```

## Tabs

| Prop | Options | Default |
|------|---------|---------|
| tabs | Array<{key, label, count?}> | required |
| activeKey | string | required |
| onChange | (key) => void | required |
| variant | underline, pills | underline |

## Toast / Notification

| Prop | Options | Default |
|------|---------|---------|
| variant | success, error, warning, info | info |
| title | string | required |
| message | string or null | null |
| duration | number (ms) | 5000 |
| dismissible | boolean | true |
| position | top-right, top-left, bottom-right | top-right |

- Stack vertically, max 3 visible
- Auto-dismiss with progress bar
- Slide-in animation from top-right

## Pagination

```
[< Prev]  [1] [2] [3] ... [10] [Next >]

Show: [10 ▾] 1-10 of 142
```

| Prop | Options | Default |
|------|---------|---------|
| page | number | required |
| pageSize | number | 10 |
| total | number | required |
| onChange | (page) => void | required |
| pageSizeOptions | number[] | [10, 25, 50, 100] |

## Empty State

```
┌─────────────────────┐
│      [📋 Icon]       │
│   No leads yet       │
│   Create your first  │
│   lead to get        │
│   started.           │
│                      │
│   [Create Lead]      │
└─────────────────────┘
```

| Prop | Options | Default |
|------|---------|---------|
| icon | Icon name | based on context |
| title | string | "No data yet" |
| description | string | — |
| action | {label, onClick} | null |

## Skeleton / Loading

```
┌─────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │  title
│ ▓▓▓▓▓▓▓▓       ▓▓▓▓▓▓  │  two columns
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │  full width
└─────────────────────────┘
```

Skeleton components mirror the shape of the content being loaded. Pulse animation (opacity 0.3 → 0.6 → 0.3, 1.5s).

## Avatar

| Prop | Options | Default |
|------|---------|---------|
| src | string or null | null |
| name | string | required |
| size | sm, md, lg | md |

Generates initials from name when no image. Background color derived from name hash.

## Dropdown Menu

| Prop | Options | Default |
|------|---------|---------|
| trigger | ReactNode | required |
| items | Array<{icon, label, onClick, divider?, disabled?}> | required |
| align | left, right | left |

- Click outside closes
- Keyboard navigation (arrow keys, Enter, Escape)
- Portal-rendered (z-index overlay)

## Tooltip

| Prop | Options | Default |
|------|---------|---------|
| content | string | required |
| position | top, bottom, left, right | top |
| delay | number (ms) | 300 |

Appears on hover, disappears on mouse leave. Arrow pointing to element.

## Progress Bar

| Prop | Options | Default |
|------|---------|---------|
| value | number (0-100) | required |
| variant | primary, success, warning, error | primary |
| size | sm, md | md |
| showLabel | boolean | false |

## File Upload

| Prop | Options | Default |
|------|---------|---------|
| accept | string (MIME types) | multiple types |
| maxSize | number (bytes) | 25MB |
| multiple | boolean | false |
| onUpload | (File[]) => void | required |
| disabled | boolean | false |

Drag-and-drop zone with click alternative. Shows file list with progress and remove option.

## Confirm Dialog

```
┌──────────────────────────┐
│ ⚠️ Delete lead?          │
│ Are you sure you want    │
│ to delete this lead?     │
│ This action can be       │
│ undone within 30 days.   │
│                          │
│    [Cancel]  [Delete]    │
└──────────────────────────┘
```

| Prop | Options | Default |
|------|---------|---------|
| open | boolean | required |
| title | string | "Confirm" |
| message | string | required |
| confirmLabel | string | "Confirm" |
| cancelLabel | string | "Cancel" |
| variant | primary, danger | primary |
| onConfirm | () => void | required |
| onCancel | () => void | required |

## Search Bar

| Prop | Options | Default |
|------|---------|---------|
| value | string | required |
| onChange | (value) => void | required |
| placeholder | string | "Search..." |
| debounce | number (ms) | 300 |
| filters | Array<Filter> | null |

Search icon on left, clear button on right when value present.
