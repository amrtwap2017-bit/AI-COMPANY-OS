# Notifications UX

## Notification Channels (V1)

| Channel | V1 Status | Use Case |
|---------|-----------|----------|
| Email | ✓ Primary | All system notifications |
| In-app | ✓ Primary | Bell icon with badge |
| SMS | — V2 | Emergency, urgent approvals |
| Push | — V2 | Mobile app notifications |

---

## Notification Triggers

### CRM Triggers
| Trigger | Recipient | Channel | Template |
|---------|-----------|---------|----------|
| New lead from website | Assigned sales rep | Email + In-app | "New lead: {name} from {company}" |
| Lead assigned | Sales rep | Email + In-app | "Lead {name} has been assigned to you" |
| Lead stale (>48h no contact) | Sales rep + manager | Email | "Reminder: Lead {name} has not been contacted" |
| Opportunity stage changed | Opportunity owner | In-app | "{opportunity} moved to {stage}" |
| Opportunity won | Sales team + dashboard | In-app | "{opportunity} won! Value: {value}" |
| Opportunity lost | Sales manager | In-app | "{opportunity} lost. Reason: {reason}" |

### Quotation Triggers
| Trigger | Recipient | Channel | Template |
|---------|-----------|---------|----------|
| Quotation created | Creator | In-app | "Quotation {number} created" |
| Quotation submitted for approval | Approver(s) | Email + In-app | "Quotation {number} pending your approval" |
| Quotation approved (internal) | Sales rep | Email + In-app | "Quotation {number} has been approved" |
| Quotation rejected (internal) | Sales rep | Email + In-app | "Quotation {number} was rejected. Reason: {reason}" |
| Quotation sent to client | Sales rep | In-app | "Quotation {number} sent to client" |
| Quotation accepted by client | Sales rep + manager | Email + In-app | "{client} has accepted quotation {number}" |
| Quotation revision requested | Sales rep | Email + In-app | "{client} requested revision: {reason}" |
| Quotation expiring soon | Sales rep | Email | "Quotation {number} expires in 7 days" |

### Project Triggers
| Trigger | Recipient | Channel | Template |
|---------|-----------|----------|---------|
| Project created | Project team | In-app | "Project {name} has been created" |
| Milestone completed | PM + client | Email + In-app | "Milestone {name} completed for {project}" |
| Milestone approved | Engineer + client | In-app | "Milestone {name} approved" |
| Milestone overdue (7 days) | PM + director | Email | "Milestone {name} is overdue by {days} days" |
| Site survey scheduled | Field engineer | Email + In-app | "Survey scheduled: {location} on {date}" |
| Site survey completed | Sales + engineering | In-app | "Survey completed for {project}" |
| Assessment completed | Sales rep | In-app | "Engineering assessment ready for {project}" |

### Client Portal Triggers
| Trigger | Recipient | Channel | Template |
|---------|-----------|---------|----------|
| New quotation available | Client | Email | "New quotation ready for review" |
| Quotation approved by client | TB sales team | Email + In-app | "{client} approved quotation {number}" |
| New document shared | Client | Email | "New document: {name} available in portal" |
| Service request submitted | Client | Email | "Request {number} received — we'll respond within 4 hours" |
| Service request status change | Client | Email | "Your request {number} has been updated to {status}" |
| Milestone completed | Client | Email + In-app | "Milestone {name} completed for your project {project}" |

### Administration Triggers
| Trigger | Recipient | Channel | Template |
|---------|-----------|---------|----------|
| User account created | New user | Email | "Welcome to Triangle Black. Access your account here." |
| Password reset | User | Email | "Reset your password using this link (expires in 1 hour)" |
| Contract expiry warning (<90 days) | Client success | Email | "Contract {number} with {client} expires in {days} days" |

---

## In-App Notification Center

### Bell Icon
```
Top nav bar:
[🔔] — Gray bell when no notifications
[🔔] — Red badge with count when notifications exist

Click opens dropdown:
┌──────────────────────────────────────────┐
│ Notifications              [Mark all read]│
├──────────────────────────────────────────┤
│ ● New lead: Hilton Sharm          2m ago  │
│ ● QTN-2026-00142 approved         15m ago │
│ ● Milestone completed              1h ago  │
│ ● Contract expiring in 60 days     1d ago  │
│ ● Survey completed                 2d ago  │
├──────────────────────────────────────────┤
│                    [View all →]           │
└──────────────────────────────────────────┘
```

### Notification Detail Page
```
URL: /app/notifications

┌──────────────────────────────────────────────┐
│ Notifications                    [Filters ▾] │
├──────────────────────────────────────────────┤
│ ┌──────┬──────────────────────────┬─────────┐│
│ │ Read │ Message                   │ Date    ││
│ ├──────┼──────────────────────────┼─────────┤│
│ │  ○   │ New lead from Hilton     │ 2m ago  ││
│ │  ●   │ QTN approved: $45K       │ 15m ago ││
│ │  ●   │ Milestone: Chiller done  │ 1h ago  ││
│ │  ○   │ Contract expiring        │ 1d ago  ││
│ └──────┴──────────────────────────┴─────────┘│
│                                       [Load more]│
└──────────────────────────────────────────────┘
```

## Email Notification Format

```
Subject: [Triangle Black] {template_subject}

───
Triangle Black
{notification_message}

{action_button_or_link}

If you have questions, contact support@triangleblack.com
───
```

### Example: New Quotation
```
Subject: [Triangle Black] New quotation ready for review

───
You have a new quotation ready for review.

Hilton Sharm — Chiller Replacement
QTN-2026-00142 | Total: EGP 450,000

[Review Quotation →]

If you have questions, contact your account manager or
support@triangleblack.com
───
```

---

## User Notification Preferences

| Preference | Options | Portal Location |
|-----------|---------|-----------------|
| Email frequency | Immediate, Daily digest, Weekly digest | Profile → Notifications |
| Notification types | CRM, Quotations, Projects, Admin | Profile → Notifications |
| In-app sound | On/Off | Profile → Notifications |
| Quiet hours | Start/End time | Profile → Notifications (V2) |

## V1 Notification Constraints

| Constraint | Reason |
|-----------|--------|
| Email only (no SMS, no push) | Infrastructure scope |
| Immediate delivery (no digest) | Simple queue processing |
| No notification templates UI | Templates hardcoded in code |
| No unsubscribe per-type | All-or-nothing email (toggled by role) |
