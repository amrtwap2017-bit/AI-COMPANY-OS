# 11-INTEGRATIONS — Testing

## Unit Tests
- E-Invoice XML/JSON transformation
- Webhook HMAC signature verification
- Retry logic (3 attempts with backoff)
- Rate limiter enforcement

## Integration Tests
- SMTP email sending (test mailbox)
- Webhook dispatch → external endpoint → log delivery
- Import → data validation → import result
