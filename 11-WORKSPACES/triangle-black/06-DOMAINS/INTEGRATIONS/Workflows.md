# 11-INTEGRATIONS — Workflows

## E-Invoice Submission Flow

```
Invoice Paid → E-Invoice Service → Transform to ETA format → Submit to ETA API
    │                                                             │
    │                                                             ├── Success → Store ETA reference
    │                                                             └── Failure → Retry queue (3 attempts)
    │                                                                         ↓
    │                                                                   Notify admin
```

## Webhook Dispatch

```
Domain Event → Webhook Dispatcher → Match registered webhooks → POST to each URL
    │                                                                │
    │                                                                ├── 200 → Mark delivered
    │                                                                └── Error → Retry (3x) → Disable webhook
```
