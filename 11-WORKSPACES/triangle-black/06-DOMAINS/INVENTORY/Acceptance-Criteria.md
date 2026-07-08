# 05-INVENTORY — Acceptance Criteria

- [ ] Stock in from PO receipt creates inventory record
- [ ] Stock issue deducts quantity and records project consumption
- [ ] Stock cannot go negative (blocked at service level)
- [ ] Transfer creates outbound and inbound records atomically
- [ ] Adjustment requires reason and approval (if > threshold)
- [ ] Low stock alert sends notification when below min_level
- [ ] Inventory valuation (weighted average) updates on each receipt
- [ ] Transaction log provides full audit trail
- [ ] Warehouse management with location tracking
