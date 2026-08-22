# Workflow State Machine Matrix

## Reference Flow: Service Request to Resolution
`SERVICE REQUEST` -> `TRIAGE` -> `WORK ORDER GENERATION` -> `ASSIGNMENT` -> `EXECUTION` -> `SERVICE REPORT` -> `CLOSURE` -> `AUTO-INVOICE` -> `KPI AGGREGATION`

- **Transition Enforcement:** `src/commercial/workflow_engine/engine.py` (`TriangleWorkflowEngine`)
- **Audit Points:** 4 state transition hooks emitting to `platform_audit_log`
- **SLA Scanner:** `src/core/sla_scanner.py` calculating breach status on every transition
