# UX Standards

## Design System

- Use the project's design system (shadcn/ui or equivalent) for all components.
- Do not create custom components when an existing design system component covers the need.
- Custom components must be reviewed for design system compatibility.
- All colors, typography, and spacing must use design system tokens:
  ```typescript
  // ✅ Use design tokens
  <Button variant="primary" size="lg">
  
  // ❌ No hard-coded styles
  <button style={{ backgroundColor: '#007bff', fontSize: '16px' }}>
  ```

### Component Library

| Component | Source | Status |
|-----------|--------|--------|
| Button | shadcn/ui Button | Available |
| Input | shadcn/ui Input | Available |
| Select | shadcn/ui Select | Available |
| Table | shadcn/ui Table | Available |
| Modal/Dialog | shadcn/ui Dialog | Available |
| Toast | shadcn/ui Toast | Available |
| Form | react-hook-form + Zod | Available |

## Responsive Breakpoints

| Breakpoint | Width | Target | Layout |
|-----------|-------|--------|--------|
| `xs` | < 640px | Mobile | Single column, stacked |
| `sm` | 640px - 767px | Large phone | Single column, wider padding |
| `md` | 768px - 1023px | Tablet | Two columns, side panels |
| `lg` | 1024px - 1279px | Desktop | Full layout, sidebars |
| `xl` | 1280px - 1535px | Wide desktop | Max-width container |
| `2xl` | >= 1536px | Ultra-wide | Max-width container + margins |

### Implementation

```typescript
// Tailwind-based responsive classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

## Mobile-First Approach

- Build for the smallest screen first, then enhance for larger screens.
- Touch targets must be at least 44x44px.
- Forms use native input types (`type="email"`, `type="tel"`, `type="number"`).
- Horizontal scrolling is avoided on mobile — use accordion, tabs, or progressive disclosure.

## Accessibility (WCAG 2.1 AA)

### Standards
All interfaces must conform to **WCAG 2.1 Level AA**.

### Requirements

| Criterion | Requirement | Implementation |
|-----------|-------------|---------------|
| 1.1.1 | Non-text content has text alternative | `alt` on images, `aria-label` on icons |
| 1.4.3 | Contrast ratio >= 4.5:1 | Use design system colors |
| 2.1.1 | All functionality via keyboard | Tab order, focus management |
| 2.4.3 | Focus order is logical | Semantic HTML, proper tabindex |
| 2.4.7 | Visible focus indicator | Focus ring on all interactive elements |
| 3.2.1 | No unexpected context changes | Confirm before navigation |
| 3.3.1 | Error identification | Inline validation messages |
| 3.3.2 | Labels and instructions | `<label>` on all form fields |

### Implementation Patterns

```typescript
// ✅ Accessible button with loading state
<Button
  onClick={handleSubmit}
  disabled={isLoading}
  aria-busy={isLoading}
  aria-label="Submit order"
>
  {isLoading ? <Spinner /> : 'Submit'}
</Button>

// ✅ Form field with error
<div>
  <label htmlFor="email">Email address</label>
  <Input
    id="email"
    type="email"
    aria-invalid={!!errors.email}
    aria-describedby={errors.email ? 'email-error' : undefined}
  />
  {errors.email && (
    <p id="email-error" role="alert">{errors.email}</p>
  )}
</div>
```

### Testing Accessibility
- Run aXe DevTools or Lighthouse accessibility audit on every page.
- Test with keyboard-only navigation (Tab, Enter, Escape, Arrow keys).
- Test with screen reader (NVDA or VoiceOver).
- No accessibility violations with severity "critical" or "serious".

## Loading, Error, and Empty States

### Loading State
- Use skeleton placeholders for content loading (not spinners for page content).
- Use spinners for actions (submit, delete).
- Show loading state immediately on user action — no delay.

### Error State
- Display inline error messages for form validation.
- Display toast notifications for background operations.
- Display error pages for routing failures (404, 403, 500).
- Never show raw error objects or stack traces to users.
- Provide a retry action for recoverable errors.

### Empty State
- Show an illustration or icon with a helpful message.
- Include a call-to-action button when appropriate.
- Do not show empty tables — show the empty state component instead.

```typescript
function OrderList() {
  const { data, isLoading, error } = useOrders();

  if (isLoading) return <OrderListSkeleton />;
  if (error) return <ErrorState message="Failed to load orders" onRetry={refetch} />;
  if (data.length === 0) return <EmptyState
    icon={<PackageIcon />}
    title="No orders yet"
    description="Create your first order to get started."
    action={<Button onClick={createOrder}>Create Order</Button>}
  />;

  return <OrderTable data={data} />;
}
```

## Animation & Motion

- Use `prefers-reduced-motion` to respect user preferences.
  ```typescript
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  ```
- Animations should be subtle and purposeful (not decorative).
- Duration: 150-300ms for micro-interactions, 300-500ms for transitions.
- Use `transform` and `opacity` for performant animations (GPU-accelerated).

## Typography

- Use the design system's type scale exclusively.
- Line height: 1.5 for body text, 1.2 for headings.
- Maximum line width: 75 characters for readability.
- Responsive type scale using `clamp()` in Tailwind.

## Internationalization

- All user-facing strings must use i18n keys, not hard-coded text.
- Default locale: `en-US`.
- Date/time formatted with `Intl.DateTimeFormat`.
- Number/currency formatted with `Intl.NumberFormat`.
