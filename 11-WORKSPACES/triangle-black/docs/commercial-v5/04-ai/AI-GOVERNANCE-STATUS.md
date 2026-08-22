# AI Governance Verification (N-001)

| Capability | Status | Evidence |
|---|---|---|
| AI Gateway Registry | 🟢 Active | /api/v1/ai-gateway/registry returns 200 |
| AI Gateway Request | 🟢 Active | POST /api/v1/ai-gateway/request functional |
| AI Maintenance Director | 🟡 Unit Pass | Director logic verified, API 404 pending fix |
| AI Signals Dashboard | 🟢 Active | Portal renders real-time signals |
| Prompt Injection Defense | 🟡 Pending | No formal prompt sanitization verified |
| AI Cost Tracking | 🟡 Partial | cost_estimate_usd in response, no aggregation |
| AI Audit Trail | 🟢 Active | audit_id returned on every request |
| Human Approval Gate | 🟢 Active | governance_status: governed_advisory |
