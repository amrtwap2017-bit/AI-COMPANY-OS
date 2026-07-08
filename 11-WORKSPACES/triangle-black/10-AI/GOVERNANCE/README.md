# Quality System Overview

This directory defines the quality framework for Program 2 (Enterprise AI Delivery Framework). The quality system ensures consistency, reliability, and security across all delivery artifacts through a layered set of checklists and definitions that gate each phase of the delivery pipeline.

## Document Relationships

```
                    +-------------------------------+
                    |   Definition of Ready (DoR)    |
                    |  Pre-conditions for any work   |
                    +--------------+----------------+
                                   |
                                   v
                    +-------------------------------+
                    |       Architecture Review      |
                    |     Architecture Checklist     |
                    +--------------+----------------+
                                   |
                                   v
                    +-------------------------------+
                    |          Code Review           |
                    |      Review Checklist          |
                    +--------------+----------------+
                                   |
                                   v
          +------------------------+------------------------+
          |                        |                        |
          v                        v                        v
+------------------+   +------------------+   +------------------+
| Security Review  |   | Performance Rev  |   |   QA Review      |
| Security Check   |   | Performance Check|   |   QA Checklist   |
+------------------+   +------------------+   +------------------+
          |                        |                        |
          +------------------------+------------------------+
                                   |
                                   v
                    +-------------------------------+
                    |    Definition of Done (DoD)    |
                    |  Post-conditions for release   |
                    +-------------------------------+
```

## Integration with Delivery Pipeline

Each quality gate corresponds to a stage in the delivery pipeline:

| Pipeline Stage | Quality Artifact | Gate |
|---|---|---|
| Backlog Refinement | Definition of Ready | Work cannot enter a sprint without meeting DoR |
| Architecture / Design | Architecture Checklist | Design must pass architecture review |
| Development | Review Checklist | Code must pass peer review |
| Security Scan | Security Checklist | Security review must pass |
| Performance Testing | Performance Checklist | Performance targets must be met |
| QA / Testing | QA Checklist | All test levels must pass |
| Release | Definition of Done | Item must satisfy all DoD criteria |

## Usage

Each checklist is a living document. Items may be added, removed, or modified as the program matures. All checklists should be reviewed at the end of each sprint and updated in the retrospective.

## Related Documents

- [Definition of Ready](Definition-of-Ready.md)
- [Definition of Done](Definition-of-Done.md)
- [Architecture Checklist](Architecture-Checklist.md)
- [Review Checklist](Review-Checklist.md)
- [Security Checklist](Security-Checklist.md)
- [Performance Checklist](Performance-Checklist.md)
- [QA Checklist](QA-Checklist.md)
