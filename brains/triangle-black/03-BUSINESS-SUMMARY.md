# TRIANGLE BLACK — BUSINESS SUMMARY

## Revenue Loop (Commercial)
lead.create
  → qualify (score 0-100)
  → assign agent (round-robin by capacity)
  → quote.generate (auto-detect services from lead notes)
  → quote.submit (draft→review)
  → quote.send (review→sent + email PDF + notify manager)
  → quote.approve (sent→approved + contract created + lead converted + notify all)
  → contract.activate (pending_signature→active + invoice auto-created + notify all)
  → invoice.send (draft→sent)
  → invoice.mark-paid (sent→paid)
  → contract.renew (active→expired + new contract + new invoice)

## Ops Loop (Service Operations)
contract.activate
  → site.create (physical location)
  → assets.register (equipment at site)
  → work_order.create (PM or reactive)
  → work_order.assign (technician dispatch)
  → work_order.complete (close + service report)
  → service_report.create (findings + recommendations)

## Procurement Loop
purchase_request.create (requester submits need)
  → purchase_request.approve (manager approval)
  → option A: convert_to_po (direct PO)
  → option B: rfq.create → vendor quotes → rfq.award → po.create
  → purchase_order.approve
  → goods_receipt.create (receive items)
  → goods_receipt.receive (stock updated via stock_movements)

## Qualification Scoring
source=referral: +30 | direct: +20 | web: +10
priority=high: +30 | medium: +20 | low: +10
has_company: +20 | has_phone: +10 | has_notes: +10
Score >= 70 = qualified | >= 40 = warm | < 40 = cold

## Invoice Generation (auto on activate)
amount       = contract.total_value
tax_amount   = amount * 0.14 (VAT 14%)
total_amount = amount + tax_amount
due_date     = start_date + 30 days
invoice_number = TB-INV-YYYYMM-XXXX (sequential)

## Notification Types
lead_qualified  → recipient: manager
lead_assigned   → recipient: agent
quote_sent      → recipient: manager
quote_approved  → recipient: all
quote_rejected  → recipient: agent
