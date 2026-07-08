# Mapping Integrity

## Purpose

Validates the integrity of the delivery mapping itself — ensuring no orphans, dead documents, or circular dependencies exist across the Program 2.5 artifact tree.

## Integrity Rules

### 1. No Orphan Capabilities

A capability is an **orphan** if it does not map to any document or deliverable.

**Check**: Every capability in `Capability-Dependencies.md` must appear in at least one domain deliverable file and have a corresponding user story or requirement.

| Capability | Appears In | Status |
|-----------|-----------|--------|
| Identity & Auth | 00-Shared-Kernel-Deliverables.md | ✓ |
| Contract Management | 01-Commercial-Deliverables.md | ✓ |
| ... | ... | ... |

**Failure**: Orphan found → High severity.

**Remediation**: Either add the capability to a deliverable file or remove it from the dependency graph.

### 2. No Dead Documents

A document is **dead** if it exists in a deliverable file but is never referenced by any capability.

**Check**: Every document listed in deliverable mapping files must be traced to at least one capability.

| Document | Source | Referenced By | Status |
|----------|--------|--------------|--------|
| API Docs - 00 | OpenAPI spec | Identity & Auth, Tenant Mgmt | ✓ |
| Revenue Policy | Business docs | Revenue Scheduling | ✓ |
| ... | ... | ... | ... |

**Failure**: Dead document found → Medium severity.

**Remediation**: Either add capability references or remove the document from the mapping.

### 3. No Circular Dependencies

A circular dependency exists when capability A depends on B, B depends on C, and C depends on A (or any longer cycle).

**Check**: The dependency graph must be a directed acyclic graph (DAG).

Dependency chains to verify:

| Chain | Length | Valid |
|-------|--------|-------|
| 00 SH → 01 COM → 02 DEL → 06 FIN → 09 INTEL | 5 | ✓ (acyclic) |
| 03 PROC → 04 SUP → 08 DOC ← → 10 AI | 4 | ✓ (acyclic) |
| 01 COM → 05 INV → 07 MAINT → ... | 3 | ✓ (acyclic) |

**Failure**: Cycle detected → Critical severity.

**Detection Algorithm**:
```
For each node in dependency graph:
  visited = empty set
  stack = [node]
  
  while stack not empty:
    current = stack.pop()
    if current in visited:
      CYCLE DETECTED: trace path
    visited.add(current)
    for each dependency of current:
      stack.push(dependency)
```

**Remediation**: Break the cycle by removing or redirecting one dependency edge.

## Automated Integrity Check

```yaml
integrity_check:
  orphans:
    enabled: true
    severity: high
    action: block_release
    
  dead_documents:
    enabled: true
    severity: medium
    action: flag_report
    
  circular_deps:
    enabled: true
    severity: critical
    action: block_release
```

## Integrity Report

Generated after any change to the mapping:

```
Mapping Integrity Report
========================

Orphans: 0 ✓
Dead Documents: 0 ✓
Circular Dependencies: 0 ✓

Mapping Integrity: PASS

Last Validated: [Date]
Validation Tool: validate_mapping.py
```

## Maintenance Schedule

| Check | Frequency | Owner |
|-------|-----------|-------|
| Full integrity scan | Every sprint | Program Architect |
| Orphan check | On each context pack creation | Domain Lead |
| Dead doc check | On each deliverable update | Technical Writer |
| Circular dep check | On each dependency graph change | Program Architect |
