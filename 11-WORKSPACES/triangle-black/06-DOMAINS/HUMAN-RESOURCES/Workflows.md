# 13-HUMAN-RESOURCES — Workflows

## W1: Employee Onboarding

```
[START] Offer accepted
    │
    ▼
HR creates employee record (Status = 'pending')
    │
    ├── Collect personal info + documents
    ├── Assign department + position
    ├── Set salary + start date
    └── Upload contract, IDs, certificates
    │
    ▼
IT Setup:
    ├── Create email account
    ├── Grant system access (RBAC)
    └── Issue equipment (laptop, badge)
    │
    ▼
Manager Setup:
    ├── Assign mentor/buddy
    ├── Schedule orientation
    └── Set initial goals
    │
    ▼
Status = 'active' → Welcome notification
[END]
```

## W2: Leave Management

```
[START] Employee submits leave request
    │
    ▼
Validation:
    ├── Sufficient balance? → Yes → Continue
    └── No → Block, show balance
    │
    ▼
Manager notified of pending request
    │
    ├── Approve → Update balance → Notify employee
    │   ├── Add to team calendar
    │   └── If timesheet locked → Flag for adjustment
    │
    └── Reject → Notify employee with reason
[END]
```

## W3: Timesheet Management

```
[START] Timesheet period opens (weekly)
    │
    ▼
Employee logs hours:
    ├── Per project (linked to PHASE-06 projects)
    ├── Per task category (engineering, supervision, admin)
    └── Per day (Sun-Thu)
    │
    ▼
Employee submits → Status = 'submitted'
    │
    ▼
Manager reviews:
    ├── Approve → Status = 'approved' → Lock for editing
    │   ├── Trigger cost allocation
    │   └── Available for payroll export
    └── Reject → Return to employee with comments
[END]
```

## W4: Attendance Tracking

```
[START] Work day begins
    │
    ▼
Employee checks in (mobile/web/kiosk):
    ├── GPS-verified location (optional)
    ├── Photo capture (optional)
    └── Timestamp recorded
    │
    ▼
Throughout day:
    ├── Break tracking (optional)
    └── Field visit logging
    │
    ▼
Employee checks out:
    ├── Timestamp recorded
    └── Hours calculated
    │
    ▼
Daily anomaly check (end of day):
    ├── Missing check-in → Flag
    ├── Early departure → Flag
    ├── Late arrival → Flag
    └── Overtime → Log for approval
[END]
```
