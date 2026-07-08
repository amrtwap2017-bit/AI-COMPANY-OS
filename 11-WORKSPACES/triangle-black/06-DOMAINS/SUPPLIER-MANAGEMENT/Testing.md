# 04-SUPPLIER-MANAGEMENT — Testing

## Unit Tests
- Supplier status transitions: pending → approved → suspended → blacklisted
- Tier calculation from evaluation scores
- Document expiry detection
- Duplicate tax ID detection

## Integration Tests
- Supplier registration → document upload → approval → PO creation
- Blacklisted supplier blocked from new POs
- Evaluation score → tier change flow

## E2E
- Register supplier → upload docs → approve → view in supplier directory
