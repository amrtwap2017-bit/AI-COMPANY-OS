# 03-PROCUREMENT — Testing

## Unit Tests
- Requisition → PO conversion: all fields mapped correctly
- PO approval levels: thresholds enforced by value
- Goods receipt: partial acceptance, over-receipt cap
- Budget check: PO blocked if project budget exceeded

## Integration Tests
- Requisition→approve→PO→approve→send→receive (full flow)
- Budget consumption updated on PO approval
- Inventory adjusted on goods receipt

## E2E
- Create requisition → approve → create PO → approve → send → receive goods
