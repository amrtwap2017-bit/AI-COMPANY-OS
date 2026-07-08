# 11-INTEGRATIONS — Notifications

| Event | Recipient | Message |
|-------|-----------|---------|
| Integration failure | Integration Admin | "{provider} integration failed: {error}" |
| E-Invoice submitted | Finance | "Invoice {number} submitted to ETA" |
| E-Invoice failed | Finance | "ETA submission failed for invoice {number}" |
| Webhook disabled | Integration Admin | "Webhook {name} disabled after 3 failures" |
