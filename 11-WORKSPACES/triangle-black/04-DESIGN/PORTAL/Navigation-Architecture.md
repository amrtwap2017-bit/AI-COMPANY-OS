# Navigation Architecture

## Cross-Portal Navigation Map

```
┌─────────────────────────────────────────────────────────────┐
│                    TRIANGLE BLACK ECOSYSTEM                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  triangleblack.com        Public Website (unauthenticated)  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Home │ Services │ About │ Case Studies │ Blog │ Contact│  │
│  └───────────────────────────────────────────────────────┘  │
│                           │                                  │
│                           ▼ (Login)                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ app.triangleblack.com    Operations Portal (staff)     │  │
│  │ ┌─────────────────────────────────────────────────┐   │  │
│  │ │ Dashboard │ CRM ▾ │ Quotations ▾ │ Projects ▾ │   │  │
│  │ │           │ Admin when user.role=ADMIN         │   │  │
│  │ └─────────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────┘  │
│                           │                                  │
│                           ▼                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ portal.triangleblack.com    Client Portal (client)     │  │
│  │ ┌─────────────────────────────────────────────────┐   │  │
│  │ │ Dashboard │ Projects │ Quotations │ Documents │   │  │
│  │ │ Requests │ Profile                              │   │  │
│  │ └─────────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Navigation Patterns

### Pattern 1: Top Navigation Bar (All Authenticated Portals)

```
┌──────────────────────────────────────────────────────────────────┐
│ [Logo]  [Nav Item 1]  [Nav Item 2 ▾]  [Nav Item 3]  [🔔]  [👤] │
├──────────────────────────────────────────────────────────────────┤
│ Breadcrumb > Current Section > Page Name                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Page Content                                                     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

| Element | Behavior |
|---------|----------|
| Logo | Links to home/dashboard for portal |
| Nav Items | Active section highlighted; dropdown for sub-items |
| Notification Bell | Badge count; click opens dropdown list |
| User Menu | Profile, Settings, Logout dropdown |
| Breadcrumb | Located below nav; shows current location |

### Pattern 2: Tab Navigation (Detail Pages)

Used on detail pages to organize related sub-sections:

```
┌──────────────────────────────────────────────────────────────────┐
│ Project: Hilton Sharm HVAC Upgrade                     [Actions ▾]│
│                                                                  │
│ [Overview]  [Milestones]  [Files]  [Team]  [Activity]           │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Tab Content                                                      │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Pattern 3: Side Navigation (Admin Only)

```
┌──────────────────────────────────────────────────────────────────┐
│ [Logo]  [Dashboard]  [CRM]  [Quotes]  [Projects]  [🔔]  [👤]   │
├──────────┬───────────────────────────────────────────────────────┤
│ Admin    │                                                       │
│ ──────── │  Page Content                                         │
│ ■ Users  │                                                       │
│ ■ Roles  │                                                       │
│ ■ Co's   │                                                       │
│ ■ Config │                                                       │
│ ■ Audit  │                                                       │
└──────────┴───────────────────────────────────────────────────────┘
```

## Mobile Navigation

### Bottom Tab Bar (≤768px)

```
┌──────────────────────────────────────────────┐
│                                              │
│              Page Content                    │
│                                              │
├──────────────────────────────────────────────┤
│  [📊]  [📋]  [📄]  [🔧]  [⚙️]              │
│ Dash   CRM   Quotes  Proj   More             │
└──────────────────────────────────────────────┘
```

| Tab | Icon | Content |
|-----|------|---------|
| Dashboard | 📊 | Main dashboard |
| CRM | 📋 | Lead list (default CRM view) |
| Quotes | 📄 | Quotation list |
| Projects | 🔧 | Project list |
| More | ⚙️ | Menu with remaining sections |

## Breadcrumb Convention

`{Module} > {Sub-module} > {Entity Name} > {Action}`

| Example | Breakdown |
|---------|-----------|
| CRM > Leads > Sarah Johnson | Module > List > Detail |
| Quotations > Quotes > QTN-2026-00142 > Approve | Module > List > Detail > Action |
| Projects > Hilton Sharm > Milestones | Module > Detail > Tab |
| Admin > Users > Create New User | Module > List > Action |

Rules:
- Last item is current page (not linked)
- Each parent segment links to its list/detail view
- Breadcrumbs truncated with ellipsis on mobile
- `>` separator with appropriate spacing
