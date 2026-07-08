---
ID: 08-UX-06
Title: Portal Flows
Purpose: Define key user flows in the client portal
Version: 1.0
Status: Draft
Last Updated: 2026-06-30
---

# Portal Flows

## Flow 1: First-Time Login

```
[User receives welcome email]
        │
        ▼
[User clicks "Access Portal" button in email]
        │
        ├── [Magic link flow]
        │       │
        │       ▼
        │   [Logged into portal dashboard]
        │
        └── [Password setup flow]
                │
                ▼
        [Set password form]
                │
                ▼
        [Password confirmation]
                │
                ▼
        [Logged into portal dashboard]
                │
                ▼
        [Welcome modal with brief orientation]
                │
                ▼
        [Dashboard with empty states + tooltips]
```

### Screen Elements
- Welcome email: Triangle Black logo, "Welcome to your portal" heading, "Access Portal" CTA button, support contact
- Set password: Email pre-filled, password + confirm password fields, requirements checklist
- Welcome modal: "Here's what you can do" — 3 cards (View Projects, Review Quotations, Submit Requests)
- Dashboard: KPI cards (Active Projects, Pending Quotes, Open Requests), activity feed (empty with "Your activity will appear here")

---

## Flow 2: Quotation Review and Approval

```
[User receives email: "New quotation ready for review"]
        │
        ▼
[User logs into portal]
        │
        ▼
[Dashboard shows notification badge on Quotations]
        │
        ▼
[User clicks Quotations in nav]
        │
        ▼
[Quotation list — sorted by date, newest first]
        │
        ▼
[User clicks quotation number]
        │
        ▼
[Quotation detail page]
        │
        ├── [Review section]
        │       ├── Quotation number, date, valid until
        │       ├── Line items table (item, qty, unit, unit price, total)
        │       ├── Subtotal, tax, total
        │       └── Terms and conditions
        │
        ├── [Action buttons]
        │       ├── [Approve] → Confirm dialog → Success toast
        │       └── [Request Revision] → Comment form → Submit
        │
        └── [Additional actions]
                ├── Download PDF
                └── View history (version comparison)
```

### Screen Elements
- Quotation list: columns = Number, Date, Subject, Total, Status, Actions
- Status badges: Draft (neutral), Sent (info), Under Review (warning), Approved (success), Rejected (error), Expired (muted)
- Quotation detail: Header card with meta info, line items table, action buttons sticky on scroll
- Approval confirm dialog: "Approve QTN-2026-00142?" with optional comment field
- Revision dialog: Textarea for comments, "Submit for revision" button

---

## Flow 3: Project Progress View

```
[User logs into portal]
        │
        ▼
[Dashboard shows active project cards]
        │
        ▼
[User clicks "View All" on Projects widget or navigates to Projects]
        │
        ▼
[Project list — cards or table view]
        │
        ▼
[User clicks project card/row]
        │
        ▼
[Project detail page]
        │
        ├── [Overview tab]
        │       ├── Project header (name, status, value)
        │       ├── Timeline visual (milestone bar)
        │       ├── Progress bar with percentage
        │       └── Key dates (start, expected end, actual end)
        │
        ├── [Milestones tab]
        │       ├── Ordered milestone list
        │       ├── Each milestone: name, due date, assignee, status
        │       ├── Status indicator (Not Started / In Progress / Complete / Approved)
        │       └── Expandable for notes + files
        │
        └── [Files tab]
                ├── File list organized by milestone
                └── Download each file
```

### Screen Elements
- Project card: Status badge, name, progress bar, date range, value
- Timeline: Horizontal bar with milestone markers, current date indicator
- Milestone list: Vertical timeline with connecting line, colored status dot
- File list: Table with name, milestone, upload date, size, download button

---

## Flow 4: Service Request Submission

```
[User navigates to Requests > New Request]
        │
        ▼
[Request form]
        │
        ├── Request type: dropdown [Maintenance, Procurement, General Inquiry, Emergency]
        ├── Priority: [Low, Medium, High, Critical] (Emergency auto-sets Critical)
        ├── Subject: text input
        ├── Description: textarea
        ├── Attachments: file upload (optional, up to 5 files)
        └── Related project: optional lookup
        │
        ▼
[User clicks Submit]
        │
        ├── [Validation check]
        │       └── If missing required fields → inline errors
        │
        ├── [Success]
        │       ├── Success toast: "Request #REQ-00042 submitted"
        │       ├── Auto-acknowledgment email sent to user
        │       └── Redirect to request detail
        │
        └── [Error]
                └── Error toast: "Failed to submit request. Please try again."
```

### Screen Elements
- Form layout: Single column on mobile, two columns on desktop (type + priority on same row)
- Emergency type: Prominent red banner "Emergency requests will be prioritized"
- Priority help text: "Low = cosmetic, Medium = minor, High = needs attention, Critical = immediate"
- File upload: Drag zone with list of uploaded files showing name and size

---

## Flow 5: Document Repository Browsing

```
[User navigates to Documents]
        │
        ▼
[Document repository]
        │
        ├── [Filters]
        │       ├── Project: dropdown, "-- All Projects --" default
        │       ├── Category: dropdown [Reports, Invoices, Contracts, Photos, Drawings, Other]
        │       └── Search: text input, real-time filter
        │
        ├── [Document list]
        │       ├── Grid view (default): cards with icon, name, project, date
        │       └── List view: table with columns
        │
        └── [Actions per document]
                ├── Click → file preview (if supported) or download
                ├── Right-click / menu → Download, Share (V2)
                └── Bulk select → Download as ZIP
```

### Screen Elements
- View toggle: Grid/List icons in top-right
- Document card: File type icon, file name, project name (truncated), upload date, size
- List view: Icon, Name, Project, Category, Date, Size, Download button
- Empty state: "No documents shared yet" with illustration
- Search results: "Showing 5 results for 'chiller'"

---

## Flow 6: Dashboard — Weekly Check-In

```
[User logs into portal — first page is Dashboard]
        │
        ▼
[Dashboard layout]
        │
        ├── [Welcome bar]
        │       ├── "Good morning, Ahmed"
        │       └── Date + quick stats
        │
        ├── [KPI Cards row]
        │       ├── Active Projects (count)
        │       ├── Pending Quotations (count, highlight if >0)
        │       ├── Open Requests (count)
        │       └── Recent Documents (count)
        │
        ├── [Active Projects widget]
        │       ├── Top 3 projects by priority/recency
        │       ├── Each: name, progress bar, status
        │       └── "View All" link → full project list
        │
        ├── [Recent Activity feed]
        │       ├── Chronological list of latest actions
        │       ├── "Quotation QTN-2026-00142 was approved"
        │       ├── "Milestone 'Chiller Installation' completed"
        │       └── "Document 'Inspection Report.pdf' uploaded"
        │
        └── [Quick Actions]
                ├── "Submit a request"
                └── "View all quotations"
```

### States
- **First visit:** Welcome modal overlay, empty state widgets with helpful text
- **Active use:** Real data in all widgets, activity feed populated
- **No new activity:** "No recent activity" in feed, KPI cards showing 0 with muted styling

### Responsive Behavior
- Desktop (>1024px): 4-column KPI row, 2-column main content (projects + activity)
- Tablet (768-1024px): 2x2 KPI grid, stacked main content
- Mobile (<768px): Single column, stacked KPI cards, simplified widgets
