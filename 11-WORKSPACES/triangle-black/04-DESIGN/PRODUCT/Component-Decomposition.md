# Component Decomposition

## Component Classification

Components are organized in three tiers based on reuse scope:

| Tier | Scope | Examples |
|------|-------|----------|
| **Foundation** | Global — used across all portals | Button, Input, Card, Modal, Toast |
| **Composite** | Portal-level — shared within a portal | DataTable, KanbanBoard, Timeline |
| **Feature** | Module-specific — single feature only | LeadForm, QuotationBuilder, MilestoneTracker |

---

## Foundation Components

| Component | Purpose | Props | States |
|-----------|---------|-------|--------|
| Button | Primary/secondary/ghost/danger actions | variant, size, loading, disabled, icon, fullWidth | Default, Hover, Active, Disabled, Loading |
| Input | Text, email, phone, password, number inputs | type, label, placeholder, error, helpText, prefix, suffix | Default, Focus, Error, Disabled |
| Select | Single/multi select dropdown | options, value, placeholder, searchable, clearable | Default, Open, Selected, Empty |
| Textarea | Multi-line text input | rows, maxLength, resize | Default, Focus, Error |
| Checkbox | Boolean toggle | checked, indeterminate, label | Checked, Unchecked, Indeterminate |
| Radio | Single selection from group | options, value, inline | Selected, Unselected |
| Toggle | On/off switch | checked, disabled, label | On, Off, Disabled |
| Card | Content container | title, subtitle, padding, shadow, hoverable | Default, Hover, Selected |
| Modal | Overlay dialog | open, title, size, closeOnOverlay, actions | Open, Closing |
| Drawer | Side panel | open, position, width | Open, Closed |
| Toast | Notification popup | message, type, duration, action | Show, Hiding, Dismissed |
| Badge | Status/count indicator | variant, count, dot | Default, Pulse (new) |
| Avatar | User photo or initials | src, name, size, fallback | Loaded, Error (initials) |
| Tooltip | Hover information | content, position, delay | Visible, Hidden |
| Breadcrumb | Navigation trail | items, maxItems | All, Truncated |
| Tabs | Section navigation within page | items, activeTab, onChange | Active, Inactive, Badge |
| Stepper | Multi-step progress | steps, activeStep, orientation | Complete, Active, Pending, Error |
| Pagination | Page navigation | page, totalPages, onChange | Active, Disabled |
| Loading | Loading indicator | variant (spinner, skeleton), rows | Spinner, Skeleton line/block |
| EmptyState | No data state | title, description, icon, action | Default |
| ErrorState | Error display | title, message, retryAction | Default |
| ProgressBar | Linear progress | value, max, variant, label, showLabel | Determinate, Indeterminate |
| SearchInput | Search with debounce | value, placeholder, onSearch | Default, Focus, HasResults |

---

## Composite Components

| Component | Portal | Purpose |
|-----------|--------|---------|
| DataTable | Operations, Executive | Sortable, filterable, paginated table |
| DataGrid | Executive, Client | Editable grid (V2) |
| KanbanBoard | Operations (CRM) | Drag-and-drop pipeline view |
| Timeline | Operations, Client | Milestone/project timeline |
| KpiCard | Executive, Client | Metric display with trend |
| StatCard | Executive, Client | Single metric with icon |
| Chart | Executive | Bar, line, pie, donut charts |
| FileUploader | Operations, Client | Drag-and-drop file upload |
| FileList | Operations, Client | File listing with icons |
| ActivityFeed | Operations, Client | Chronological activity log |
| ApprovalPanel | Operations | Approve/reject with comments |
| StatusBadge | All | Colored status indicator |
| NotificationBell | Operations, Client | Notification dropdown |
| UserMenu | All | Profile, settings, logout |
| SearchBar | Operations | Global search across entities |
| FilterBar | Operations | Multi-criteria filtering |
| FormSection | Operations, Client | Grouped form fields |
| ConfirmDialog | All | Action confirmation |
| Wizard | Operations | Multi-step creation flow |

---

## Feature-Specific Components

| Component | Module | Purpose |
|-----------|--------|---------|
| LeadForm | CRM | Create/edit lead form |
| LeadCard | CRM | Lead summary card in list |
| OpportunityForm | CRM | Create/edit opportunity |
| PipelineColumn | CRM | Single stage column in Kanban |
| PipelineCard | CRM | Opportunity card in pipeline |
| CompanyForm | CRM | Create/edit company |
| ContactForm | CRM | Create/edit contact |
| ActivityForm | CRM | Log activity form |
| ActivityTimeline | CRM | Activity history on detail page |
| QuotationBuilder | Quotations | Line-item editor with totals |
| QuotationPreview | Quotations | Read-only quotation view |
| QuotationPDF | Quotations | PDF template component |
| RfqForm | Quotations | RFQ creation form |
| ContractForm | Quotations | Contract generation form |
| ContractView | Quotations | Contract detail view |
| ProjectForm | Projects | Project creation form |
| ProjectHeader | Projects | Project overview header |
| MilestoneList | Projects | Ordered milestone list |
| MilestoneForm | Projects | Add/edit milestone |
| MilestoneTimeline | Projects | Visual timeline |
| DeliverableUpload | Projects | File upload for deliverables |
| FilePreview | Projects | In-browser file preview |
| SurveyForm | Projects | Site survey checklist |
| AssessmentForm | Projects | Engineering assessment form |
| PortalDashboard | Client Portal | KPI cards + widgets |
| QuotationReview | Client Portal | Client-facing quotation view |
| RequestForm | Client Portal | Service request form |
| RequestList | Client Portal | Request history |
| DocumentGrid | Client Portal | Grid/list document view |
| UserForm | Admin | Create/edit user |
| RoleForm | Admin | Create/edit role with permissions |
| PermissionTree | Admin | Permission hierarchy tree |
| SettingsForm | Admin | System configuration form |
| AuditLogTable | Admin | Filterable audit log |

---

## Component Naming Convention

```
{Feature/Module}{ComponentType}
Examples:
  LeadForm        — Form for creating/editing a Lead
  PipelineColumn  — Column in the Kanban pipeline view
  QuotationPDF    — PDF rendering component for quotations
  MilestoneList   — Ordered list of milestones
```

## Shared Module Structure

```
components/
├── foundation/          — Button, Input, Card, Modal, Toast, etc.
│   ├── Button.tsx
│   ├── Input.tsx
│   └── index.ts
├── composite/           — DataTable, KanbanBoard, Timeline, etc.
│   ├── DataTable.tsx
│   ├── KanbanBoard.tsx
│   └── index.ts
└── feature/             — Module-specific components
    ├── crm/
    ├── quotations/
    ├── projects/
    ├── portal/
    └── admin/
```
