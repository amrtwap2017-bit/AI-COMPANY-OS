# 07-MAINTENANCE — Testing

## Unit Tests
- SLA timer calculation (response/resolution)
- Priority auto-assignment logic
- Status transitions: submitted → assigned → in_progress → resolved → closed
- Warranty period validation against handover date

## Integration Tests
- Client creates request → auto-assigned → engineer resolves → client closes
- Preventive maintenance schedule triggers notification

## E2E
- Submit service request → track SLA → resolve → rate satisfaction
