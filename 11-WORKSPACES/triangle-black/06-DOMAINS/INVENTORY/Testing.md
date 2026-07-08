# 05-INVENTORY — Testing

## Unit Tests
- Stock issue: negative quantity prevention, min_level enforcement
- Stock transfer: dual record creation, quantity consistency
- Adjustment: approval workflow, reason requirement
- Weighted average cost calculation

## Integration Tests
- PO receipt → stock in → inventory update
- Stock issue → project cost update
- Transfer → source deduction + destination addition

## E2E
- Receive stock from PO → issue to project → verify stock decreased
- Transfer between warehouses → verify both sides
