# Attention Audit

Attention dashboard source aggregates work orders, PM plans, and recommendations by hotel and calculates SLA presentation fields. `attention_sla` has explicit event recording/history/summary routes. This is PARTIAL source implementation.

The active app validator reports attention and SLA summary absent. The requested durable lifecycle DETECTED → ACKNOWLEDGED → ASSIGNED → IN_PROGRESS → RESOLVED → VERIFIED → CLOSED is not demonstrated as a mandatory transition model with actor/reason history. Attention event/SLA history is manually recorded; automatic lifecycle emission is NOT VERIFIED.
