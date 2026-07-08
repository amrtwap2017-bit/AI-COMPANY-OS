# Business Events

Real-world business events that trigger domain workflows within the Triangle Black ecosystem.

## Event Catalog

### Lead & Sales Events

| Business Event | Trigger | Followed By | Context |
|---------------|---------|-------------|---------|
| New inquiry received | Website/Email/Phone contact | Lead qualification | CRM |
| Lead qualified | Lead score threshold met | Opportunity creation | CRM |
| New opportunity identified | Client need confirmed | Proposal preparation | CRM |
| RFP received from client | Client sends request for proposal | Proposal workflow | Proposal |
| Budget approved by client | Client confirms budget range | Quotation generation | Quotation |
| Site visit requested | Client requests physical inspection | Site survey scheduling | Site Survey |

### Contract & Project Events

| Business Event | Trigger | Followed By | Context |
|---------------|---------|-------------|---------|
| Contract signed | All parties execute contract | Project kickoff | Contract |
| Contract variation requested | Client requests scope change | Change order workflow | Contract / Project |
| Project kickoff approved | Contract effective date reached | Project planning | Project |
| Site mobilization completed | Equipment and crew arrive on site | Execution start | Project |
| Milestone reached | Defined project phase completed | Milestone billing | Project |
| Project completed | All deliverables accepted | Handover process | Project / Handover |

### Procurement Events

| Business Event | Trigger | Followed By | Context |
|---------------|---------|-------------|---------|
| Material requisition raised | Project identifies a material need | RFQ preparation | Procurement |
| RFQ issued | Requisition approved | Vendor response | Procurement |
| Vendor quotation received | Vendor submits pricing | Quotation evaluation | Procurement |
| Purchase order issued | Vendor selected and approved | Order fulfilment | Procurement |
| Goods delivered | Shipment arrives at site | Goods receipt inspection | Procurement / Supply |
| Invoice received from vendor | Goods receipt confirmed | Invoice processing | Procurement |

### Quality & Handover Events

| Business Event | Trigger | Followed By | Context |
|---------------|---------|-------------|---------|
| Quality inspection due | Pre-defined check point | Inspection execution | QA/QC |
| Defect identified | Inspection or testing | Defect rectification | QA/QC |
| Punch list created | Pre-handover inspection | Defect resolution | QA/QC / Handover |
| Final inspection passed | All defects resolved | Handover documentation | Handover |
| Handover completed | Client signs handover certificate | Warranty period start | Handover |
| Warranty claim received | Client reports defect | Warranty assessment | Maintenance / Contract |

### Maintenance Events

| Business Event | Trigger | Followed By | Context |
|---------------|---------|-------------|---------|
| Scheduled maintenance due | Calendar trigger | Maintenance dispatch | Maintenance |
| Emergency maintenance requested | Client escalation | Emergency dispatch | Maintenance |
| Service report required | Maintenance completed | Report submission | Maintenance |
| Contract expiring | 90 days before end date | Renewal discussion | Renewals / Contract |

## Event-Process Mapping

| Business Event | Initiates Process | Related Documents |
|---------------|-------------------|-------------------|
| New inquiry received | Lead capture | Inquiry form |
| RFP received | Proposal creation | RFP document |
| Site visit requested | Site survey | Survey report |
| Contract signed | Project setup | Signed contract |
| Material requisition raised | Procurement | Material request form |
| Goods delivered | Goods receipt | Delivery note |
| Defect identified | Non-conformance | NCR report |
| Handover completed | Warranty start | Handover certificate |
| Contract expiring | Renewal | Contract amendment |
