# Accessibility — WCAG 2.2 AA Compliance

Triangle Black aims for **WCAG 2.2 Level AA** compliance across all interfaces.

## Standards

| Principle       | Guidelines                                 |
| --------------- | ------------------------------------------ |
| Perceivable     | Text alternatives, captions, adaptable, distinguishable |
| Operable        | Keyboard accessible, enough time, seizures, navigable |
| Understandable  | Readable, predictable, input assistance    |
| Robust          | Compatible with current/future user agents |

## Implementation Checklist

### Semantic HTML

- Use proper heading hierarchy (h1 → h2 → h3)
- Use <nav>, <main>, <aside>, <article>, <section> landmarks
- Use <button> for actions, <a> for navigation
- Use <label> for all form controls

### Keyboard Navigation

- All interactive elements are reachable via Tab
- Visible focus indicators (custom :focus-visible styles)
- No keyboard traps
- Skip-to-content link at top of every page
- Dropdown menus open on Enter/Space, close on Escape
- Data table rows navigable with arrow keys

`	ypescript
// src/components/layout/skip-link.tsx
export function SkipLink() {
  return (
    <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground">
      Skip to main content
    </a>
  );
}
`

### Color & Contrast

- Minimum contrast ratio: **4.5:1** for normal text, **3:1** for large text
- Color is never the sole indicator of state (add icons, text labels)
- Dark mode also meets contrast requirements
- Use hsl() for theme colors to ensure accessible contrast ratios

### Forms

- Every input has an associated <label>
- Required fields indicated with ria-required="true" and visible asterisk
- Error messages linked via ria-describedby
- Success and error states announced via ria-live="polite" regions

`	ypescript
export function FormField({ label, error, id, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && (
        <p id={${id}-error} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
`

### Dynamic Content

- Loading states use ria-busy="true" on containers
- Toast notifications use ole="status" and ria-live="polite"
- Modal dialogs trap focus and restore on close (handled by Radix)
- Page title updates on route change

### Data Tables

- <table> with <thead>, <tbody>, <th scope="col">
- Sortable columns expose ria-sort="ascending|descending"
- Row selection uses checkboxes with labels
- Pagination links have descriptive ria-label

### Testing

`ash
# Automated aXe checks in CI
pnpm add -D @axe-core/playwright
pnpm test:accessibility

# Manual checklist
- VoiceOver / NVDA screen reader tests
- Keyboard-only navigation walkthrough
- Zoom to 200% — no content loss
- High contrast mode — all text readable
`

## Component-Level ARIA

| Component        | ARIA Attributes                             |
| ---------------- | ------------------------------------------- |
| Dialog           | ole="dialog", ria-modal="true", ria-labelledby |
| Tabs             | ole="tablist", ole="tab", ria-selected, ria-controls, ole="tabpanel" |
| DropdownMenu     | ole="menu", ria-expanded              |
| Switch           | ole="switch", ria-checked             |
| Progress         | ole="progressbar", ria-valuenow, ria-valuemin, ria-valuemax |
| Toast            | ole="status", ria-live="polite"       |
| Alert            | ole="alert", ria-live="assertive"     |
| DataTable        | ole="grid", ria-sort on column headers|
