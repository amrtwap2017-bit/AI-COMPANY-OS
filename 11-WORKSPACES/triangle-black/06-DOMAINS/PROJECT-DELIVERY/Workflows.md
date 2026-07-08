# 02-PROJECT-DELIVERY — Workflows

## W1: Project Mobilization

```
[Contract Activated] → Create Project
    │
    ├── Set project team:
    │   ├── Project Manager (required)
    │   ├── Site Engineer(s)
    │   └── Support staff
    │
    ├── Define milestones:
    │   ├── Milestones from contract schedule
    │   └── Internal work breakdown milestones
    │
    └── Set budget:
        ├── Allocate contract value to phases
        └── Set material budget (05-INVENTORY)
```

## W2: Daily Site Operations

```
[Morning] Site Engineer logs in
    │
    ├── Create Site Daily Report:
    │   ├── Weather conditions
    │   ├── Workforce on-site
    │   ├── Equipment in use
    │   ├── Work completed (against schedule)
    │   ├── Issues encountered
    │   └── Planned for next day
    │
    ├── Log time entries for crew
    │
    ├── Report issues:
    │   ├── Material shortage → 03-PROCUREMENT
    │   ├── Quality issue → Create NCR
    │   └── Safety issue → Create Risk
    │
    └── Photo documentation
```

## W3: NCR Lifecycle

```
[Issue Identified] → Create NCR
    │
    ├── Category: material, workmanship, design, safety
    ├── Severity: minor, major, critical
    │
    ▼
Assign to responsible party
    │
    ├── Contractor → Fix → Submit for verification
    └── Client/Consultant → Clarify → Close
    │
    ▼
Verification:
    ├── Pass → Close NCR
    └── Fail → Re-open → Re-fix
```

## W4: Project Handover

```
[All Milestones Complete] → Initiate Handover
    │
    ├── Snag List:
    │   ├── Inspect all works
    │   ├── Log remaining items
    │   └── Assign completion dates
    │
    ├── Documentation:
    │   ├── As-built drawings
    │   ├── O&M manuals
    │   ├── Test certificates
    │   └── Training records
    │
    ├── Client Training:
    │   ├── System walkthrough
    │   └── Document handover
    │
    └── Closeout:
        ├── Final financial reconciliation
        ├── Lessons learned
        ├── Archive project
        └── Status = completed
```
