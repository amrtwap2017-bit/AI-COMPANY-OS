# Accessibility

## Standard

**Target: WCAG 2.1 Level AA** — minimum for public sector and enterprise compliance.

## Compliance Checklist

### Perceivable

| Requirement | Implementation | Verification |
|-------------|---------------|--------------|
| Text alternatives for non-text content | All images have `alt` attributes; icons have `aria-label` | Automated audit |
| Captions for audio/video | Not applicable in V1 (no media) | — |
| Content can be presented without loss of information | Responsive layout; no information conveyed only by color | Visual audit |
| Color contrast ratio ≥ 4.5:1 | Design tokens validated against WCAG AA | Automated check |
| Text can be resized up to 200% without loss | Responsive units (rem, em); no fixed pixel text | Manual test |
| Sufficient color contrast for UI components | All status colors checked against backgrounds | Design review |

### Operable

| Requirement | Implementation | Verification |
|-------------|---------------|--------------|
| All functionality available from keyboard | Tab order follows visual order; focus indicators visible | Manual keyboard audit |
| No keyboard traps | Focusable elements can be tabbed through/away | Automated + manual |
| Skip navigation link | "Skip to main content" link at top of every page | Manual check |
| Focus order preserves meaning | Logical left-to-right, top-to-bottom | Manual review |
| Link purpose from text alone | Links have descriptive text; no "click here" | Content audit |
| Pointer gestures not required | All actions available via click/tap | Manual test |
| Motion not required for understanding | No animations convey meaning; reduced motion supported | CSS media query |

### Understandable

| Requirement | Implementation | Verification |
|-------------|---------------|--------------|
| Page language defined | `<html lang="en">` on all pages | Automated check |
| Focus indicator visible | `:focus-visible` outline ≥ 2px, contrast ≥ 3:1 | Visual audit |
| Input labels and instructions | All form fields have `<label>` elements | Automated check |
| Error identification | Inline error messages below fields + aria-describedby | Manual + automated |
| Consistent navigation | Same order/location across pages | Design consistency |
| Consistent identification | Same icons/terms for same actions | Design system |
| Help and documentation | Tooltips on icons; help text on complex forms | Content review |

### Robust

| Requirement | Implementation | Verification |
|-------------|---------------|--------------|
| HTML elements have complete start/end tags | Linting enforced (JSX/HTML) | Build-time check |
| ARIA attributes used correctly | ARIA roles follow WAI-ARIA practices | Automated audit |
| Status messages announced by screen readers | `aria-live` regions for toasts, loading states | Manual screen reader test |

## Accessibility Implementation Plan

| Feature | Implementation | Priority |
|---------|---------------|----------|
| Skip navigation link | First focusable element on every page | P0 |
| Focus indicators | `:focus-visible` with 2px blue outline | P0 |
| Form labels | Every input wrapped in `<label>` or `aria-label` | P0 |
| Error announcements | `role="alert"` on form errors | P0 |
| Loading states | `aria-busy="true"` on loading regions | P0 |
| Keyboard navigation | Tab order, arrow keys for lists/tables | P0 |
| Screen reader support | Semantic HTML, ARIA landmarks | P0 |
| Reduced motion | `prefers-reduced-motion` media query | P1 |
| High contrast mode | `prefers-contrast: high` support | P1 |
| Focus trap management | Modals, drawers trap focus correctly | P0 |

## Testing Requirements

| Test Type | Frequency | Tool |
|-----------|-----------|------|
| Automated audit | Every PR | axe-core (Playwright integration) |
| Color contrast check | Design review | Stark plugin, Contrast Checker |
| Keyboard navigation | Manual per feature | Full tab-through test |
| Screen reader | Per major feature | VoiceOver (macOS), NVDA (Windows) |
| Zoom test | Per major feature | 200% browser zoom, no loss |
| Reduced motion | Once | prefers-reduced-motion media query |
