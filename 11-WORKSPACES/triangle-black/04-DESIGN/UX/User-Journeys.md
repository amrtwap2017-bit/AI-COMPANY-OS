# User Journeys

## Journey 1: Sales Rep — Close a Deal

**Persona:** Ahmed, Sales Rep at Triangle Black

```
Day 1: Lead assigned from website
  → Ahmed receives email notification
  → Logs into Operations Portal
  → Opens Lead List → sees new lead (Hilton Sharm, value: high)
  → Opens lead detail → reviews form data
  → Clicks "Qualify" → Lead status → Qualified
  → Converts to Opportunity → creates Company + Contact records
  → Logs call activity: "Spoke to Chief Engineer, chiller replacement needed"

Day 3: Site survey needed
  → Creates site survey request from opportunity
  → Assignes field engineer
  → Sends email to client confirming survey date

Day 7: Survey complete → Engineering assessment done
  → Receives notification: Assessment ready
  → Opens opportunity → sees assessment summary + BOQ

Day 10: Quotation ready
  → Clicks "Create Quotation" from opportunity
  → BOQ auto-populated from assessment
  → Reviews line items, adds pricing, adjusts margin
  → Submits for internal approval
  → Manager reviews and approves

Day 11: Send to client
  → Generates PDF
  → Sends quotation to client via portal
  → Client receives email notification

Day 18: Client accepts
  → Receives notification: Quotation approved by client
  → Opens portal → sees client approval
  → Generates contract from approved quotation
  → Sends contract for e-signature
  → Contract signed → Project automatically created
```

| Stage | Portal | Screens | Events |
|-------|--------|---------|--------|
| Lead creation | Operations | SCR-CRM-001, SCR-CRM-002 | LeadCreated |
| Qualification | Operations | SCR-CRM-002 | LeadQualified |
| Opportunity | Operations | SCR-CRM-004, SCR-CRM-005 | OpportunityCreated |
| Survey | Operations | SCR-PRJ-006 | SiteSurveyScheduled |
| Assessment | Operations | SCR-PRJ-007 | AssessmentCompleted |
| Quotation | Operations | SCR-QTN-005, SCR-QTN-006 | QuotationCreated |
| Approval | Operations | SCR-QTN-007 | QuotationSent |
| Client approval | Client Portal | SCR-CPT-006 | QuotationAccepted |
| Contract | Operations | SCR-QTN-010, SCR-QTN-011 | ContractSigned |
| Project | Operations | SCR-PRJ-002 | ProjectKickedOff |

---

## Journey 2: Hotel GM — Review Operations

**Persona:** Sarah, General Manager of Hilton Sharm

```
Morning check-in (mobile):
  → Opens portal on phone
  → Sees dashboard: 2 active projects, 1 pending quotation
  → Project 1 (Chiller replacement): 75% complete, on track ✓
  → Project 2 (Fire pump upgrade): 45% complete, on track ✓
  → Taps pending quotation → reviews line items
  → Approves quotation — done in 3 minutes

Weekly review (desktop):
  → Logs into portal on laptop
  → Opens documents → filters by "Monthly Reports"
  → Downloads latest HVAC performance report
  → Reviews energy consumption trends
  → Submits new request: "Need pool pump inspection"
```

| Stage | Portal | Screens |
|-------|--------|---------|
| Mobile check-in | Client Portal | SCR-CPT-002 |
| Project review | Client Portal | SCR-CPT-004 |
| Quotation approval | Client Portal | SCR-CPT-006 |
| Document access | Client Portal | SCR-CPT-007 |
| Service request | Client Portal | SCR-CPT-009 |

---

## Journey 3: CEO — Strategic Decision

**Persona:** Karim, CEO of Triangle Black

```
Monday morning:
  → Opens Executive Dashboard
  → Pipeline funnel: $5.1M total, 34% win rate
    → Hover: "Negotiation stage down 20% from last month"
    → Clicks pipeline → drills into stalled opportunities
    → Notes: 3 deals at Negotiation stage > 60 days
    → Assigns sales director to review

  → Revenue YTD: $1.2M vs $1.5M target (80%)
    → Hover: "Margin trending down — currently 24.2%"
    → Clicks → revenue by client breakdown
    → Hilton Sharm: 35% margin ✓
    → Movenpick: 18% margin ✗ — needs review

  → Project Health: 1 delayed, 3 at risk
    → Clicks delayed project → sees Movenpick Resort
    → Overdue milestone: "Electrical panel installation"
    → Schedules call with project manager

  → Decision Center: "2 contracts expiring in < 90 days"
    → Clicks renewals calendar
    → Schedules quarterly business review with both clients
```

| Stage | Portal | Screens |
|-------|--------|---------|
| Overview | Executive Dashboard | SCR-DSH-001 |
| Pipeline drill-down | Executive Dashboard | SCR-DSH-002 |
| Revenue analysis | Executive Dashboard | SCR-DSH-003 |
| Project health | Executive Dashboard | SCR-DSH-004 |
| Client renewals | Executive Dashboard | SCR-DSH-005 |

---

## Journey 4: Chief Engineer — Technical Oversight

**Persona:** Mahmoud, Chief Engineer at Marriott Cairo

```
Morning:
  → Opens portal → dashboard shows active project
  → HVAC overhaul project: milestone "Chiller installation" due next week
  → Opens project → reviews milestone details, downloads specs
  → Sees 3 files uploaded by Triangle Black team
  → Downloads chiller specifications for review

  → Submits maintenance request: "Backup generator monthly test needed"
  → Sets priority: Medium
  → Attaches last test report as reference
```

| Stage | Portal | Screens |
|-------|--------|---------|
| Dashboard | Client Portal | SCR-CPT-002 |
| Project detail | Client Portal | SCR-CPT-004 |
| Document access | Client Portal | SCR-CPT-007 |
| Service request | Client Portal | SCR-CPT-009 |

---

## Journey 5: Field Engineer — Site Survey

**Persona:** Khaled, Field Engineer at Triangle Black

```
Morning briefing:
  → Opens Operations Portal
  → Sees assigned: Site Survey at Sheraton Hurghada
  → Opens project → opens survey form

At site:
  → Walks through HVAC system
  → Completes checklist: chiller model, condition, photos
  → Captures photos via phone camera
  → Notes defects: "Compressor #3 has unusual vibration"
  → Saves as draft

Back at office:
  → Opens survey → reviews all data
  → Adds recommendations: "Compressor bearing replacement recommended"
  → Submits survey
  → System notifies sales team: Survey complete
```

| Stage | Portal | Screens |
|-------|--------|---------|
| Assignment | Operations | SCR-PRJ-001 |
| Survey execution | Operations | SCR-PRJ-006 |
| Survey submission | Operations | SCR-PRJ-006 |
| Notification | Cross-cutting | — |
