# Empty States

## Design Philosophy

Empty states are not "nothing here" — they are opportunities to guide the user toward the next action. Every empty state includes:
- A clear message explaining the current state
- The expected content that will appear
- A primary action to start populating data
- An illustration (optional, V2)

---

## CRM Empty States

### Lead List (Empty)
```
┌──────────────────────────────────────────────────────────────┐
│                         [Illustration: Binoculars]            │
│                                                              │
│                    No leads yet                               │
│                    Lead from the website will appear here.    │
│                    Or add your first lead manually.           │
│                                                              │
│                    ┌──────────────────────┐                   │
│                    │  + Add First Lead    │                   │
│                    └──────────────────────┘                   │
└──────────────────────────────────────────────────────────────┘
```

### Pipeline (Empty)
```
┌──────────────────────────────────────────────────────────────┐
│                         [Illustration: Funnel]               │
│                                                              │
│                    No opportunities yet                       │
│                    Convert a qualified lead to see            │
│                    your pipeline here.                        │
│                                                              │
│                    ┌────────────────────────────┐             │
│                    │  Go to Leads to convert    │             │
│                    └────────────────────────────┘             │
└──────────────────────────────────────────────────────────────┘
```

### Activity Feed (Empty)
```
    No recent activity to show.
    Activities — calls, emails, meetings — will appear here
    as you interact with your leads and opportunities.
```

---

## Quotations Empty States

### RFQ List (Empty)
```
┌──────────────────────────────────────────────────────────────┐
│                         [Illustration: Document]              │
│                                                              │
│                    No RFQs yet                                │
│                    Create your first RFQ from an              │
│                    opportunity or project.                    │
│                                                              │
│                    ┌──────────────────────┐                   │
│                    │  + Create First RFQ  │                   │
│                    └──────────────────────┘                   │
└──────────────────────────────────────────────────────────────┘
```

### Quotation List (Empty)
```
    No quotations yet.
    Create a quotation from a won opportunity to get started.
    → Create Quotation
```

### Contract List (Empty)
```
    No contracts yet.
    Contracts are generated from approved quotations.
    → Go to Quotations
```

---

## Projects Empty States

### Project List (Empty)
```
┌──────────────────────────────────────────────────────────────┐
│                         [Illustration: Hard hat]              │
│                                                              │
│                    No projects yet                            │
│                    Projects are created automatically when    │
│                    a contract is signed. Or create one now.   │
│                                                              │
│                    ┌────────────────────────┐                 │
│                    │  + Create First Project │                 │
│                    └────────────────────────┘                 │
└──────────────────────────────────────────────────────────────┘
```

### Milestones (Empty)
```
    No milestones yet.
    Add milestones to track project progress.
    → Add Milestone
```

### Files (Empty)
```
    No files uploaded yet.
    Upload project documents, drawings, and reports here.
    → Upload File
```

---

## Client Portal Empty States

### Dashboard (First Visit)
```
┌──────────────────────────────────────────────────────────────┐
│                         [Illustration: Rocket]                │
│                                                              │
│            Welcome to your Triangle Black Portal!             │
│                                                              │
│    Here's what you'll find here:                             │
│    • View your project progress in real-time                 │
│    • Review and approve quotations                           │
│    • Access project documents and reports                    │
│    • Submit service requests                                 │
│                                                              │
│    As soon as your projects start, everything will appear    │
│    right here on your dashboard.                             │
│                                                              │
│                    ┌─────────────────────────┐                │
│                    │  Got it — Show me around │               │
│                    └─────────────────────────┘                │
└──────────────────────────────────────────────────────────────┘
```

### Documents (Empty)
```
    No documents shared yet.
    Documents like reports, invoices, and drawings will appear
    here as your projects progress.
```

### Requests (Empty)
```
    No service requests yet.
    Submit your first request when you need assistance.
    → Submit Request
```

---

## Executive Dashboard Empty States

### Pipeline (No Data)
```
    No pipeline data to display.
    Pipeline will populate as leads convert to opportunities
    and progress through stages.
```

### Revenue (No Data)
```
    No revenue data yet.
    Revenue will appear as quotations are approved and
    contracts are signed.
```

### Project Health (No Data)
```
    No active projects.
    Project data will appear once contracts are signed and
    projects are created.
```
