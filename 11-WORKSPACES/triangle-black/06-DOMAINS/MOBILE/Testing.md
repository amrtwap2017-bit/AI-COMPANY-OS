# 12-MOBILE — Testing

## Unit Tests
- Offline queue management (add, remove, retry)
- Conflict resolution (server wins)
- Photo resize logic

## Integration Tests
- Create record offline → sync → verify on server
- Sync conflict → server record preserved
- Photo upload → geo-tag stored

## E2E (Mobile)
- Offline daily report → sync → verify in project dashboard
- Client approves quotation from mobile → status updated on desktop
