# QA/QC — Quality Assurance and Quality Control

## Overview

The QA/QC process ensures that all engineering work, materials, and installations meet defined quality standards, specifications, and contractual requirements through systematic inspection, testing, and documentation.

---

## BPMN Description

**Start Event:** Project reaches a defined quality checkpoint OR material delivery

1. **Develop Inspection & Test Plan (ITP)** — Define inspection points, acceptance criteria, and responsible parties
2. **Submit ITP for Approval** — Client or consultant approves the ITP
3. **Conduct Material Inspections** — Verify incoming materials against specifications
4. **Perform In-Process Inspections** — Inspect work at defined hold points
5. **Perform Testing** — Conduct required tests (pressure, electrical, performance)
6. **Document Results** — Record inspection and test results
7. **Identify Non-Conformances** — Flag items that do not meet specifications
8. **Raise Non-Conformance Report (NCR)** — Document the non-conformance
9. **Assign Corrective Action** — Determine root cause and corrective action
10. **Implement Correction** — Fix the non-conformance
11. **Re-Inspect** — Verify the correction meets requirements
12. **Close NCR** — Document closure with evidence
13. **Conduct Final Inspection** — Pre-handover quality check
14. **Prepare Quality Documents** — Compile ITP records, test results, NCRs, certifications
15. **Submit Quality Dossier** — Provide complete quality documentation for handover

**End Event:** Quality dossier complete and accepted

---

## Actors

| Actor | Role | System Access |
|-------|------|---------------|
| QA/QC Inspector | Conducts inspections and testing | QA/QC, Project |
| QA/QC Manager | Manages quality system and team | QA/QC |
| Project Manager | Ensures quality resources and compliance | Project |
| Site Supervisor | Implements corrective actions | Project |
| Contractor / Subcontractor | Performs work subject to inspection | External |
| Client / Consultant | Approves ITP, witnesses inspections | ClientPortal, Email |
| Testing Lab (external) | Performs specialized testing | External |
| NCR Coordinator | Tracks non-conformance resolution | QA/QC |

---

## Inputs

| Input | Source |
|-------|--------|
| Engineering specifications | Engineering Assessment |
| Inspection & Test Plan (ITP) template | QA/QC, Document |
| Material certificates and test reports | Vendors |
| Contract quality requirements | Contract |
| Applicable standards and codes | Regulatory / Knowledge base |
| Project schedule with hold points | Project |
| Previous inspection records | QA/QC |

---

## Outputs

| Output | Description | Destination |
|--------|-------------|-------------|
| Approved ITP | Inspection plan | QA/QC, Client |
| Inspection reports | Results of inspections | QA/QC, Document |
| Test certificates | Proof of testing compliance | QA/QC, Handover |
| Non-Conformance Reports | Quality issue records | QA/QC, Project |
| Corrective action records | Issue resolution documentation | QA/QC |
| Quality dossier | Complete quality record | Handover, Client |
| Punch list | Outstanding items for completion | Project, Handover |

---

## Business Rules

- All hold points in ITP must be signed off before subsequent work proceeds
- NCR must be raised within 24 hours of defect identification
- Critical defects require immediate work stoppage and management notification
- Re-inspection required after any corrective action
- Testing must be witnessed by client/consultant where specified in ITP
- Quality records must be submitted within 5 days of inspection/testing
- No project handover without complete quality dossier
- Subcontractor quality must be managed through same QA/QC process

---

## Documents Involved

| Document | Description |
|----------|-------------|
| Inspection & Test Plan | Quality hold points and tests |
| Inspection request form | Request for inspection |
| Inspection report | Inspection results |
| Test certificate | Test compliance evidence |
| Non-Conformance Report | Quality issue documentation |
| Corrective action request | Action to fix non-conformance |
| Material test certificate | Supplier material compliance |
| Calibration certificate | Test equipment calibration |
| Punch list | Pre-handover outstanding items |
| Quality dossier | Complete quality record |
| Welding / NDT reports | Specialized test results |

---

## KPIs

| KPI | Target | Measurement |
|-----|--------|-------------|
| First-pass yield (inspections) | > 90% | Passed first inspection / Total inspections |
| NCR closure time | < 10 business days | NCR raised - NCR closed |
| NCR recurrence rate | < 5% | Recurring NCRs / Total NCRs |
| ITP hold point compliance | 100% | Signed hold points / Total hold points |
| Inspection on-time rate | > 95% | Inspections on schedule / Total |
| Punch list items at handover | < 20 | Open punch list items |
| Quality dossier completeness | 100% | Required docs submitted / Total required |
| Customer quality satisfaction score | > 4.0 / 5.0 | Client quality survey score |
