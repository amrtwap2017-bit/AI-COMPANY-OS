# 03-PROCUREMENT — Business Rules

| ID | Rule | Enforcement |
|----|------|-------------|
| REQ-R01 | Requisition requires project | FK constraint |
| REQ-R02 | Quantity must be positive | Validation |
| REQ-R03 | Urgent requisition auto-notifies | Event handler |
| PO-R01 | PO value cannot exceed project remaining budget | Validation |
| PO-R02 | PO requires approved supplier (04) | FK + status check |
| PO-R03 | PO approval level by value threshold | Workflow config |
| PO-R04 | Partial receipts allowed | GR tracks per-receipt |
| PO-R05 | Over-receipt capped at 10% of PO qty | Validation |
| GR-R01 | Receipt must reference a PO | FK constraint |
| GR-R02 | Received qty auto-updates PO received qty | Service logic |
| GR-R03 | Rejected goods require QA note | Validation |
