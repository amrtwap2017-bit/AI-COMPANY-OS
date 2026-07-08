# Phase 03 — Design System

> UI component design system built on shadcn/ui + Tailwind CSS.

## Foundation

| Token | Scale | Example |
|-------|-------|---------|
| Colors | Tailwind default palette | Slate, Blue, Green, Red, Amber |
| Typography | Inter font family | 12px/14px/16px/18px/24px/30px |
| Spacing | 4px base unit | 4/8/12/16/20/24/32/40/48px |
| Border radius | Rounded-md (6px) | Consistent across all components |
| Shadows | Tailwind shadow-sm/md/lg | Card, dropdown, modal |

## Component Categories

| Category | Components | Source |
|----------|-----------|--------|
| Layout | Container, Grid, Card, Tabs, Accordion | shadcn/ui |
| Navigation | Sidebar, Breadcrumb, Pagination, Tabs | shadcn/ui + custom |
| Forms | Input, Select, DatePicker, Checkbox, Radio, Switch, Slider | shadcn/ui |
| Data Display | Table, Badge, Avatar, Tooltip, Progress, Chart | shadcn/ui + Recharts |
| Feedback | Alert, Toast, Dialog, Sheet, Popover, Dropdown | shadcn/ui |
| Overlays | Modal, Drawer, Command (Cmd+K) | shadcn/ui |

## Business Components

| Component | Domain | Description |
|-----------|--------|-------------|
| LeadCard | Commercial | Lead summary card for list views |
| PipelineColumn | Commercial | Kanban column for opportunity stages |
| QuotationLine | Commercial | Line item editor with margin calculator |
| ProjectTimeline | Project | Gantt-style project timeline |
| NCRBadge | Project | NCR severity badge (Critical/Major/Minor) |
| StockLevel | Inventory | Stock status indicator with thresholds |
| InvoiceStatus | Financial | Invoice lifecycle badge |
| KPIWidget | Executive | Configurable KPI card with sparkline |

## Dark Mode

- Supported via Tailwind `dark:` variant + next-themes
- Automatic based on system preference
- Manual toggle in user settings

## Accessibility

- WCAG 2.1 AA compliance target
- All shadcn/ui components are accessible by default
- Keyboard navigation supported on all interactive elements
- Screen reader labels on all icons and action buttons

## Related Documents

- `07-Product/Design-System.md` — Full design system specification
- [UX Architecture](UX-Architecture.md) — UX principles and patterns
