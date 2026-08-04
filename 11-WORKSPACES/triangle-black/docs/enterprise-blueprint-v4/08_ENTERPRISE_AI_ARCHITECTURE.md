# Enterprise AI Architecture v4

## AI operating-layer principles

AI is a governed capability layer, not a collection of direct HTTP calls in feature routers. Every request requires tenant context, purpose, minimum necessary evidence, model policy, cost budget, retention policy, audit event and human escalation rule. Current local Ollama, Chroma and Qdrant-oriented components are retained as implementation options behind an AI gateway.

| Agent | Mission / knowledge | Tools and permissions | Decision authority / escalation |
|---|---|---|---|
| AI CEO | enterprise health, strategic risks, portfolio opportunities | governed KPI/read-model queries; no transactional writes | advisory only; escalates material decisions to executives. |
| AI COO | daily operational exceptions and coordination | operations/maintenance read models, notification proposal | may draft tasks/escalations; human approves assignments. |
| AI Procurement Director | sourcing risk, supplier comparison, compliance and savings | PR/RFQ/PO/supplier evidence, market integrations | recommends; approvals and PO issuance remain policy-controlled. |
| AI Planner | capacity and project/work plan alternatives | schedule, skills, dependencies, constraints | proposes plan; PM/dispatcher approves. |
| AI Scheduler | optimize appointments and technician allocation | availability, SLA, location, skills | may auto-schedule only within explicit tenant policy; otherwise approval. |
| AI Maintenance Director | reliability risk, PM plans and fault diagnostics | asset history, inspections, manuals, telemetry | recommends work and priority; never closes safety incidents autonomously. |
| AI Project Director | project risk, forecast and change-impact analysis | contract, schedule, budget, risk register | advisory; escalates cost/scope deviations. |
| AI Executive Analyst | KPI narratives, anomaly and forecast explanation | governed analytics semantic layer | advisory with source citations. |
| AI Knowledge Expert | answer from approved, versioned enterprise knowledge | document/RAG retrieval with ACL filtering | answer-only; citations, confidence and feedback required. |
| AI Cost Optimizer | estimate cost, margin, procurement and inventory alternatives | cost catalogs, historical outcomes, stock | recommendation; financial commitments require approval. |

## Required platform components

1. Agent registry and versioned capability/permission manifest.
2. Model gateway with provider, model, fallback, rate, region, cost and safety policy.
3. Prompt registry with tests, versioning and tenant-safe variables.
4. Retrieval service with document ACL enforcement, provenance and retention.
5. AI action protocol: proposal → human/system policy check → execution → audit/evaluation.
6. Evaluation, red-team, feedback, drift, cost and latency dashboards.
7. AI memory classified as working, episodic and knowledge memory, each with retention and delete/export behavior.

