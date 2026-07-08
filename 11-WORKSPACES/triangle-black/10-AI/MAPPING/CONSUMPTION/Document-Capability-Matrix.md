# Document-Capability Consumption Matrix

> Rows: Capabilities (by domain) | Columns: Document types | Cells: P = Primary, S = Secondary, blank = Not Used

## 00-Shared-Kernel

| Capability | BOV | BCP | WKF | BRL | ROL | PER | SCR | CMP | DBA | API | EVT | NTF | RPT | KPI | AIO | TST | ACC |
|------------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| SK-01 Entity Framework | P | P | P | P | | | | | P | P | P | S | | | | S | S |
| SK-02 Enum Registry | P | P | | P | | | | | P | P | S | S | | | S | S | S |
| SK-03 Event Bus | P | P | P | P | | | | | P | P | P | P | | | S | P | P |
| SK-04 Validation Engine | P | P | P | P | | | | | P | P | S | S | | | S | P | P |
| SK-05 Notification Dispatcher | P | P | S | P | S | S | | S | P | P | P | P | | | S | P | P |
| SK-06 Report Generator | P | P | S | S | S | S | | | P | P | | | P | P | S | P | P |
| SK-07 Master Data Management | P | P | S | P | S | S | S | S | P | P | S | | S | | S | P | P |
| SK-08 Audit Trail | P | P | S | P | S | S | | | P | P | P | | S | | S | P | P |
| SK-09 Tenant Isolation | P | P | | P | S | S | | | P | P | S | | | | | P | P |

## 01-Commercial

| Capability | BOV | BCP | WKF | BRL | ROL | PER | SCR | CMP | DBA | API | EVT | NTF | RPT | KPI | AIO | TST | ACC |
|------------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| LEA-01 Lead Capture | P | P | P | P | S | S | S | S | P | P | P | S | S | S | S | P | P |
| LEA-02 Lead Scoring | P | P | P | P | S | S | S | S | P | P | P | S | S | S | P | P | P |
| LEA-03 Lead Qualification | P | P | P | P | P | P | S | S | P | P | P | S | S | S | S | P | P |
| LEA-04 Lead Assignment | P | P | P | P | P | P | S | S | P | P | P | P | S | S | S | P | P |
| LEA-05 Lead Nurture | P | P | P | P | S | S | S | S | P | P | P | P | S | S | S | P | P |
| ACC-01 Company Registration | P | P | P | P | S | S | S | S | P | P | P | S | | | S | P | P |
| ACC-02 Company Hierarchy | P | P | S | P | S | S | S | S | P | P | S | | | | | P | P |
| ACC-03 Company Segmentation | P | P | S | P | S | S | S | S | P | P | S | | S | | S | P | P |
| CON-01 Contact Management | P | P | P | P | S | S | S | S | P | P | P | S | S | | S | P | P |
| CON-02 Contact Communication | P | P | P | S | S | S | S | S | P | P | P | P | S | | S | P | P |
| OPP-01 Pipeline Management | P | P | P | P | P | P | P | P | P | P | P | P | P | P | S | P | P |
| OPP-02 Pipeline Forecasting | P | P | P | P | P | P | P | P | P | P | S | S | P | P | P | P | P |
| OPP-03 Win/Loss Analysis | P | P | S | S | S | S | S | S | P | P | S | | P | P | P | P | P |
| SRV-01 Survey Scheduling | P | P | P | P | P | P | S | S | P | P | P | P | | | S | P | P |
| SRV-02 Survey Execution | P | P | P | P | P | P | S | S | P | P | P | S | S | | S | P | P |
| SRV-03 Engineering Assessment | P | P | P | P | P | P | S | S | P | P | P | S | P | | P | P | P |
| SRV-04 Survey Approval | P | P | P | P | P | P | S | S | P | P | P | P | S | | | P | P |
| QTN-01 BOQ Builder | P | P | P | P | S | S | P | P | P | P | S | S | S | | S | P | P |
| QTN-02 Pricing Engine | P | P | P | P | S | P | S | S | P | P | S | | S | S | P | P | P |
| QTN-03 Quotation Generator | P | P | P | P | S | S | S | P | P | P | P | S | P | | S | P | P |
| QTN-04 Quotation Workflow | P | P | P | P | P | P | S | S | P | P | P | P | | S | S | P | P |
| QTN-05 Version Control | P | P | S | P | S | S | S | S | P | P | P | S | S | | | P | P |
| QTN-06 Margin Calculator | P | P | S | P | S | P | S | S | P | P | S | S | S | P | P | P | P |
| CTR-01 Contract Creation | P | P | P | P | P | P | P | P | P | P | P | P | S | S | S | P | P |
| CTR-02 Contract Lifecycle | P | P | P | P | P | P | S | S | P | P | P | P | S | S | S | P | P |
| CTR-03 Variation Orders | P | P | P | P | P | P | S | S | P | P | P | P | S | S | | P | P |
| CTR-04 Contract Attachments | P | P | S | P | S | S | S | S | P | P | S | | | | S | P | P |
| PT-01 Client Dashboard | P | P | S | S | P | P | P | P | P | P | S | S | S | S | S | P | P |
| PT-02 Service Requests | P | P | P | P | P | P | P | P | P | P | P | P | S | S | S | P | P |
| PT-03 Payment History | P | P | S | P | P | P | P | P | P | P | S | S | P | | | P | P |

## 02-Project-Delivery

| Capability | BOV | BCP | WKF | BRL | ROL | PER | SCR | CMP | DBA | API | EVT | NTF | RPT | KPI | AIO | TST | ACC |
|------------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| PRJ-01 Project Creation | P | P | P | P | P | P | S | S | P | P | P | P | S | S | S | P | P |
| PRJ-02 Milestone Management | P | P | P | P | P | P | S | S | P | P | P | P | P | P | S | P | P |
| PRJ-03 Task Management | P | P | P | P | P | P | P | P | P | P | P | P | P | S | S | P | P |
| PRJ-04 Gantt/Schedule | P | P | P | P | S | S | P | P | P | P | P | S | P | S | S | P | P |
| RES-01 Team Allocation | P | P | P | P | P | P | S | S | P | P | P | P | S | S | S | P | P |
| RES-02 Equipment Tracking | P | P | P | P | S | S | S | S | P | P | P | S | P | S | S | P | P |
| TIM-01 Timesheet Entry | P | P | P | P | S | S | S | S | P | P | P | S | P | S | S | P | P |
| TIM-02 Timesheet Approval | P | P | P | P | P | P | S | S | P | P | P | P | S | S | | P | P |
| QLT-01 Inspection Checklist | P | P | P | P | P | P | S | S | P | P | P | S | S | S | S | P | P |
| QLT-02 Non-Conformance Report | P | P | P | P | P | P | S | S | P | P | P | P | P | P | P | P | P |
| QLT-03 Quality Audit | P | P | P | P | P | P | S | S | P | P | P | P | P | S | S | P | P |
| RSK-01 Risk Register | P | P | P | P | P | P | S | S | P | P | P | P | P | S | P | P | P |
| SIT-01 Daily Site Report | P | P | P | P | S | S | S | S | P | P | P | S | P | S | S | P | P |
| SIT-02 Site Diary | P | P | S | S | S | S | S | S | P | P | S | | P | | | P | P |
| SIT-03 Photo Documentation | P | P | S | S | S | S | S | S | P | P | S | | S | | S | P | P |
| HND-01 Handover Preparation | P | P | P | P | P | P | S | S | P | P | P | P | P | S | S | P | P |
| HND-02 Client Training | P | P | P | S | P | P | S | S | S | S | | S | S | | | P | P |
| HND-03 Project Closeout | P | P | P | P | P | P | S | S | P | P | P | P | P | P | S | P | P |

## 03-Procurement

| Capability | BOV | BCP | WKF | BRL | ROL | PER | SCR | CMP | DBA | API | EVT | NTF | RPT | KPI | AIO | TST | ACC |
|------------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| REQ-01 Requisition Creation | P | P | P | P | S | S | S | S | P | P | P | S | S | S | S | P | P |
| REQ-02 Requisition Approval | P | P | P | P | P | P | S | S | P | P | P | P | | S | | P | P |
| PO-01 PO Generation | P | P | P | P | P | P | S | S | P | P | P | S | S | S | S | P | P |
| PO-02 PO Approval Workflow | P | P | P | P | P | P | S | S | P | P | P | P | | S | | P | P |
| PO-03 PO Dispatch | P | P | P | S | S | S | S | S | P | P | P | P | | | | P | P |
| PO-04 PO Tracking | P | P | P | S | S | S | P | P | P | P | P | P | P | S | S | P | P |
| GR-01 Goods Receipt | P | P | P | P | P | P | S | S | P | P | P | S | S | S | S | P | P |
| GR-02 Quality Inspection | P | P | P | P | P | P | S | S | P | P | P | P | S | S | S | P | P |
| PRP-01 Procurement Schedule | P | P | P | P | S | S | S | S | P | P | P | P | P | S | S | P | P |

## 04-Supplier-Management

| Capability | BOV | BCP | WKF | BRL | ROL | PER | SCR | CMP | DBA | API | EVT | NTF | RPT | KPI | AIO | TST | ACC |
|------------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| SUP-01 Supplier Registration | P | P | P | P | S | S | S | S | P | P | P | S | S | | S | P | P |
| SUP-02 Document Management | P | P | S | P | S | S | S | S | P | P | S | S | S | | S | P | P |
| SUP-03 Supplier Approval | P | P | P | P | P | P | S | S | P | P | P | P | | | | P | P |
| SUP-04 Rate Card Management | P | P | P | P | S | S | S | S | P | P | S | S | P | S | S | P | P |
| SUP-05 Supplier Segmentation | P | P | S | P | S | S | S | S | P | P | S | | P | S | S | P | P |
| SUP-06 Performance Evaluation | P | P | P | P | P | P | S | S | P | P | P | P | P | P | P | P | P |
| SUP-07 Blacklist Management | P | P | P | P | P | P | S | S | P | P | P | P | S | | | P | P |
| SCT-01 Framework Agreements | P | P | P | P | P | P | S | S | P | P | P | S | S | S | | P | P |
| SCM-01 Communication Log | P | P | S | S | S | S | S | S | P | P | S | P | S | | S | P | P |

## 05-Inventory

| Capability | BOV | BCP | WKF | BRL | ROL | PER | SCR | CMP | DBA | API | EVT | NTF | RPT | KPI | AIO | TST | ACC |
|------------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| INV-01 Stock Receipt | P | P | P | P | S | S | S | S | P | P | P | S | S | | S | P | P |
| INV-02 Stock Issue | P | P | P | P | S | S | S | S | P | P | P | S | P | S | S | P | P |
| INV-03 Stock Transfer | P | P | P | P | S | S | S | S | P | P | P | P | S | S | | P | P |
| INV-04 Stock Adjustment | P | P | P | P | P | P | S | S | P | P | P | P | S | S | S | P | P |
| INV-05 Inventory Count | P | P | P | P | P | P | S | S | P | P | P | P | P | P | S | P | P |
| INV-06 Reorder Alerts | P | P | P | P | S | S | S | S | P | P | P | P | S | S | P | P | P |
| INV-07 Inventory Valuation | P | P | S | P | P | P | S | S | P | P | S | | P | P | S | P | P |
| INV-08 Warehouse Management | P | P | P | P | S | S | P | P | P | P | P | S | P | S | S | P | P |

## 06-Financial-Control

| Capability | BOV | BCP | WKF | BRL | ROL | PER | SCR | CMP | DBA | API | EVT | NTF | RPT | KPI | AIO | TST | ACC |
|------------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| AR-01 Invoice Generation | P | P | P | P | P | P | S | S | P | P | P | S | P | P | S | P | P |
| AR-02 Invoice Lifecycle | P | P | P | P | P | P | S | S | P | P | P | P | P | P | S | P | P |
| AR-03 Payment Tracking | P | P | P | P | P | P | P | S | P | P | P | P | P | P | S | P | P |
| AR-04 Credit Notes | P | P | P | P | P | P | S | S | P | P | P | S | S | S | | P | P |
| AP-01 Supplier Invoice Matching | P | P | P | P | P | P | S | S | P | P | P | P | P | P | P | P | P |
| AP-02 Payment Scheduling | P | P | P | P | P | P | S | S | P | P | P | P | P | P | S | P | P |
| AP-03 Payment Execution | P | P | P | P | P | P | S | S | P | P | P | P | P | S | | P | P |
| REV-01 Revenue Recognition | P | P | P | P | P | P | S | S | P | P | P | S | P | P | S | P | P |
| REV-02 Deferred Revenue | P | P | S | P | P | P | S | S | P | P | P | | P | P | | P | P |
| PA-01 Project P&L | P | P | P | P | P | P | P | P | P | P | S | S | P | P | P | P | P |
| PA-02 Cost Allocation | P | P | P | P | P | P | S | S | P | P | P | | P | P | S | P | P |
| GL-01 Chart of Accounts | P | P | S | P | P | P | S | S | P | P | S | | P | | | P | P |
| GL-02 Journal Entries | P | P | P | P | P | P | S | S | P | P | P | | P | | | P | P |
| GL-03 Trial Balance | P | P | S | P | P | P | S | S | P | P | S | | P | S | | P | P |

## 07-Maintenance

| Capability | BOV | BCP | WKF | BRL | ROL | PER | SCR | CMP | DBA | API | EVT | NTF | RPT | KPI | AIO | TST | ACC |
|------------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| MNT-01 Service Request | P | P | P | P | P | P | S | S | P | P | P | P | S | S | S | P | P |
| MNT-02 SLA Management | P | P | P | P | P | P | S | S | P | P | P | P | P | P | S | P | P |
| MNT-03 Preventive Maintenance | P | P | P | P | S | S | S | S | P | P | P | P | P | P | P | P | P |
| MNT-04 Warranty Management | P | P | P | P | S | S | S | S | P | P | P | P | S | S | S | P | P |
| MNT-05 Maintenance History | P | P | P | S | S | S | S | S | P | P | P | | P | P | S | P | P |

## 08-Document-Management

| Capability | BOV | BCP | WKF | BRL | ROL | PER | SCR | CMP | DBA | API | EVT | NTF | RPT | KPI | AIO | TST | ACC |
|------------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| DOC-01 Document Upload | P | P | P | P | S | S | S | P | P | P | P | S | S | | P | P | P |
| DOC-02 Folder Organization | P | P | P | P | S | P | P | P | P | P | S | | S | | | P | P |
| DOC-03 Version Control | P | P | P | P | S | S | S | S | P | P | P | S | | | | P | P |
| DOC-04 Document Search | P | P | P | S | S | P | P | P | P | P | | | | | P | P | P |
| DOC-05 Access Control | P | P | P | P | P | P | S | S | P | P | S | | | | | P | P |
| DOC-06 Document Templates | P | P | P | P | S | S | S | S | P | P | S | | S | | S | P | P |
| DOC-07 Document Sharing | P | P | P | P | S | P | S | S | P | P | P | P | | | | P | P |

## 09-Executive-Intelligence

| Capability | BOV | BCP | WKF | BRL | ROL | PER | SCR | CMP | DBA | API | EVT | NTF | RPT | KPI | AIO | TST | ACC |
|------------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| BI-01 Executive Dashboard | P | P | S | P | P | P | P | P | P | P | S | S | P | P | P | P | P |
| BI-02 Sales Pipeline View | P | P | S | S | P | P | P | P | P | P | | | P | P | P | P | P |
| BI-03 Financial Dashboard | P | P | S | S | P | P | P | P | P | P | | | P | P | P | P | P |
| BI-04 Project Portfolio | P | P | S | S | P | P | P | P | P | P | | S | P | P | P | P | P |
| BI-05 Custom Report Builder | P | P | P | P | P | P | P | P | P | P | | | P | P | P | P | P |
| BI-06 Scheduled Reports | P | P | P | S | S | P | S | S | P | P | P | P | P | S | S | P | P |
| BI-07 Data Export | P | P | S | S | S | P | S | S | P | P | | S | P | | | P | P |
| BI-08 Trend Analysis | P | P | S | P | P | P | P | P | P | P | | | P | P | P | P | P |

## 10-AI-Copilots

| Capability | BOV | BCP | WKF | BRL | ROL | PER | SCR | CMP | DBA | API | EVT | NTF | RPT | KPI | AIO | TST | ACC |
|------------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| AI-01 Lead Scoring | P | P | P | P | S | S | S | S | P | P | P | S | S | S | P | P | P |
| AI-02 Margin Validation | P | P | P | P | P | P | S | S | P | P | P | P | S | S | P | P | P |
| AI-03 NCR Classification | P | P | P | S | S | S | S | S | P | P | P | S | S | S | P | P | P |
| AI-04 Anomaly Detection | P | P | P | P | P | P | S | S | P | P | P | P | P | P | P | P | P |
| AI-05 Document Tagging | P | P | S | S | S | S | S | S | P | P | P | | S | S | P | P | P |
| AI-06 Smart Notification | P | P | P | P | S | S | S | S | P | P | P | P | S | S | P | P | P |

## 11-Integrations

| Capability | BOV | BCP | WKF | BRL | ROL | PER | SCR | CMP | DBA | API | EVT | NTF | RPT | KPI | AIO | TST | ACC |
|------------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| INT-01 Email Sending | P | P | P | P | S | S | S | S | P | P | P | P | S | S | S | P | P |
| INT-02 E-Invoice Submission | P | P | P | P | P | P | S | S | P | P | P | P | S | S | | P | P |
| INT-03 SMS Notifications | P | P | S | S | S | S | S | S | P | P | P | P | S | S | | P | P |
| INT-04 Calendar Sync | P | P | S | S | S | S | S | S | P | P | P | S | | | S | P | P |
| INT-05 Webhook Receiver | P | P | P | P | S | P | S | | P | P | P | | S | | | P | P |
| INT-06 Webhook Dispatcher | P | P | P | P | S | S | S | | P | P | P | | S | S | | P | P |
| INT-07 Data Import | P | P | P | P | S | S | S | S | P | P | P | S | S | | S | P | P |
| INT-08 Data Export | P | P | P | S | S | S | S | S | P | P | | S | S | | | P | P |

## 12-Mobile

| Capability | BOV | BCP | WKF | BRL | ROL | PER | SCR | CMP | DBA | API | EVT | NTF | RPT | KPI | AIO | TST | ACC |
|------------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| MOB-01 Field Daily Report | P | P | P | P | S | S | P | P | P | P | P | S | S | | S | P | P |
| MOB-02 Survey Capture | P | P | P | P | S | S | P | P | P | P | P | S | S | | S | P | P |
| MOB-03 NCR Creation | P | P | P | P | S | S | P | P | P | P | P | S | S | | S | P | P |
| MOB-04 Timesheet Entry | P | P | P | P | S | S | P | P | P | P | P | S | S | S | | P | P |
| MOB-05 Photo Documentation | P | P | P | S | S | S | P | P | P | P | P | | S | | P | P | P |
| MOB-06 Client Approvals | P | P | P | P | P | P | P | P | P | P | P | P | | | | P | P |
| MOB-07 Service Requests | P | P | P | S | S | S | P | P | P | P | P | P | S | | S | P | P |
| MOB-08 Offline Sync | P | P | P | P | S | S | S | P | P | P | P | P | | S | S | P | P |

## 13-Human-Resources

| Capability | BOV | BCP | WKF | BRL | ROL | PER | SCR | CMP | DBA | API | EVT | NTF | RPT | KPI | AIO | TST | ACC |
|------------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| DEP-01 Department Management | P | P | P | P | S | S | S | S | P | P | P | S | S | S | | P | P |
| DEP-02 Hierarchy Management | P | P | S | P | S | S | S | S | P | P | S | | S | | | P | P |
| DEP-03 Budget Management | P | P | P | P | P | P | S | S | P | P | S | P | P | P | S | P | P |
| EMP-01 Employee Records | P | P | P | P | P | P | S | S | P | P | P | S | P | S | S | P | P |
| EMP-02 Employee Lifecycle | P | P | P | P | P | P | S | S | P | P | P | P | S | S | S | P | P |
| EMP-03 Document Management | P | P | S | S | P | P | S | S | P | P | S | P | S | | S | P | P |
| EMP-04 Emergency Contacts | P | P | S | S | S | S | S | S | P | P | | | | | | P | P |
| ATT-01 Check-in/Check-out | P | P | P | P | S | S | S | S | P | P | P | P | S | S | S | P | P |
| ATT-02 Schedule Management | P | P | P | P | P | P | S | S | P | P | P | P | P | S | S | P | P |
| ATT-03 Attendance Report | P | P | S | S | S | P | S | S | P | P | | S | P | P | S | P | P |
| ATT-04 Anomaly Detection | P | P | S | P | S | P | S | S | P | P | P | P | S | S | P | P | P |
| LVE-01 Leave Request | P | P | P | P | S | S | S | S | P | P | P | P | S | S | | P | P |
| LVE-02 Leave Approval | P | P | P | P | P | P | S | S | P | P | P | P | | S | | P | P |
| LVE-03 Leave Balance Tracking | P | P | S | P | S | S | S | S | P | P | P | S | P | S | | P | P |
| LVE-04 Leave Calendar | P | P | S | S | S | S | P | P | P | P | | | S | | | P | P |
| TS-01 Timesheet Entry | P | P | P | P | S | S | S | S | P | P | P | S | S | S | S | P | P |
| TS-02 Timesheet Approval | P | P | P | P | P | P | S | S | P | P | P | P | S | S | | P | P |
| TS-03 Project Cost Allocation | P | P | S | P | P | P | S | S | P | P | P | | P | P | S | P | P |
| TS-04 Timesheet Reports | P | P | S | S | S | S | S | S | P | P | | S | P | P | S | P | P |
| PRL-01 Payroll Data Export | P | P | P | P | P | P | S | S | P | P | P | S | P | S | | P | P |
| PRL-02 Salary Structure | P | P | S | P | P | P | S | S | P | P | S | | S | S | | P | P |
| REC-01 Job Posting | P | P | P | P | P | P | S | S | P | P | P | P | S | S | S | P | P |
| REC-02 Application Management | P | P | P | P | P | P | S | S | P | P | P | P | S | S | P | P | P |
| PRF-01 Performance Reviews | P | P | P | P | P | P | S | S | P | P | P | P | P | P | P | P | P |
| PRF-02 Employee Feedback | P | P | S | S | S | S | S | S | P | P | P | P | S | S | P | P | P |

## 99-Release

| Capability | BOV | BCP | WKF | BRL | ROL | PER | SCR | CMP | DBA | API | EVT | NTF | RPT | KPI | AIO | TST | ACC |
|------------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| REL-01 System Testing | P | P | P | P | P | P | S | S | P | P | P | S | P | P | S | P | P |
| REL-02 User Acceptance Testing | P | P | P | P | P | P | P | P | S | S | S | S | P | S | | P | P |
| REL-03 Training | P | P | P | S | P | P | P | P | S | S | | S | S | | | P | P |
| REL-04 Data Migration | P | P | P | P | P | P | | | P | P | P | S | P | S | S | P | P |
| REL-05 Deployment | P | P | P | S | P | P | | | P | P | P | P | P | P | S | P | P |
| REL-06 Go-Live | P | P | P | P | P | P | | | P | P | P | P | P | P | | P | P |
| REL-07 Hyper-care | P | P | P | S | P | P | S | S | P | P | P | P | P | P | S | P | P |
| REL-08 Performance Monitoring | P | P | P | S | P | P | P | P | P | P | P | P | P | P | P | P | P |
