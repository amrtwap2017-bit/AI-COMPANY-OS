# 11-INTEGRATIONS — API Endpoints

```
GET    /api/v1/integrations/configs              — List integrations
PATCH  /api/v1/integrations/configs/:provider    — Update config
POST   /api/v1/integrations/webhooks             — Register webhook
GET    /api/v1/integrations/webhooks             — List webhooks
DELETE /api/v1/integrations/webhooks/:id         — Delete webhook
POST   /api/v1/integrations/webhooks/:id/test   — Test webhook delivery
GET    /api/v1/integrations/logs                 — Integration logs
POST   /api/v1/integrations/e-invoice/submit    — Submit invoice to ETA
GET    /api/v1/integrations/e-invoice/status/:id — Check ETA status
POST   /api/v1/integrations/import              — Import data from file
```
