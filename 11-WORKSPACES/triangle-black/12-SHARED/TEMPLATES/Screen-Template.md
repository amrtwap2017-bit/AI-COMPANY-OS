# Screen Specification

## Route
`/[module]/[feature]/[:param]`

## Purpose
[Describe the business purpose and user goal of this screen. What problem does it solve for the user?]

## User Persona(s)
- [Persona name / role 1]
- [Persona name / role 2]

## Components

### Hierarchy
```
[ScreenName]
├── [TopBar]
│   ├── [SearchBar]
│   ├── [NotificationBell]
│   └── [UserAvatarMenu]
├── [Sidebar]
│   ├── [NavigationItem] (×N)
│   └── [CollapseButton]
├── [MainContent]
│   ├── [PageHeader]
│   │   ├── [Title]
│   │   ├── [Breadcrumbs]
│   │   └── [ActionButton]
│   ├── [DataTable]
│   │   ├── [TableHeader]
│   │   ├── [TableRow] (×N)
│   │   └── [Pagination]
│   └── [EmptyState]
└── [ModalLayer]
    └── [ConfirmDialog]
```

### Component Details
| Component | Type | Props | State | Description |
|---|---|---|---|---|
| `[ComponentName]` | `[Presentational/Container]` | `[prop1, prop2]` | `[loading/error/data]` | [Description] |

## States

### Loading State
- **Skeleton:** [Describe skeleton / shimmer pattern]
- **Spinner:** [Location and type of spinner]
- **Progressive Loading:** [Any progressive loading behavior]

```typescript
// Example state management
interface ScreenState {
    status: 'loading' | 'empty' | 'error' | 'success';
    data: DataType | null;
    error: ErrorPayload | null;
}
```

### Empty State
- **Icon / Illustration:** `[path/to/empty-state-illustration]`
- **Title:** "`[No items found]`"
- **Description:** "`[There are no items to display. Create your first item to get started.]`"
- **Action Button:** "`[Create Item]`" → navigates to `[route]`

### Error State
- **Error Boundary:** [Which component wraps the error boundary]
- **Fallback UI:** "`[Something went wrong]`" with retry button
- **Error Types Handled:**
  | Error Type | UX Treatment |
  |---|---|
  | `NetworkError` | Toast notification + retry |
  | `NotFoundError` | Dedicated 404 page |
  | `ForbiddenError` | Redirect to home + toast |
  | `ValidationError` | Inline field errors |

### Edge Cases
| Edge Case | Behavior |
|---|---|
| **Extremely long text** | Truncate with ellipsis after X characters |
| **Rapid double-click** | Debounce / disable button after first click |
| **Zero results after filter** | Show "no matching results" with clear-filter action |
| **Offline mode** | Show offline banner; serve cached data if available |
| **Slow network** | Show progress bar after 2s threshold |
| **Browser back button** | Restore previous scroll position and filter state |

## User Interactions
| Interaction | Trigger | Behavior | Feedback |
|---|---|---|---|
| `[Click row]` | User clicks a table row | Navigate to detail page `[route]` | Row highlight + loading spinner |
| `[Search]` | User types in search bar | Debounced API call after 300ms | Search results update; clear button appears |
| `[Delete]` | User clicks delete icon | Confirm dialog appears → API call on confirm | Item removed from list; success toast |
| `[Infinite scroll]` | User scrolls to bottom | Fetch next page of results | Loading indicator at bottom |

## Responsive Behavior
| Breakpoint | Layout Change |
|---|---|
| `>= 1280px` (Desktop) | Full sidebar + table view |
| `768px - 1279px` (Tablet) | Collapsible sidebar; stacked cards instead of table |
| `< 768px` (Mobile) | Bottom navigation; single-column list |

## Accessibility
- **Keyboard Navigation:** Tab order, Enter/Space for actions, Escape to close modals
- **ARIA Roles:** `[role="navigation"]`, `[role="main"]`, `[aria-label]` on all interactive elements
- **Focus Management:** Focus trap in modals; return focus on close
- **Screen Reader:** Hidden descriptive text for icons; live regions for dynamic updates

## Performance Targets
| Metric | Target |
|---|---|
| **First Contentful Paint (FCP)** | < 1.5s |
| **Largest Contentful Paint (LCP)** | < 2.5s |
| **Time to Interactive (TTI)** | < 3.5s |
| **API Response (p95)** | < 500ms |

## Related Traceability
| Artifact | ID / Path |
|---|---|
| **User Story** | `[US-XXX]` |
| **API Endpoint(s)** | `[API-XXX]` |
| **Design Mockup** | `[path/to/figma]` |
| **Component Spec** | `[path/to/component]` |
