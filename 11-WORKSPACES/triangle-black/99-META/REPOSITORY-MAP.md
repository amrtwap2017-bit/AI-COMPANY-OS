# Repository Map — Triangle Black Enterprise AI Knowledge

## Tree Structure

```
TRIANGLE-BLACK/
├── INDEX.md                          # Single entry point (human + AI)
├── .ai-context.md                    # AI agent loading instructions
├── MIGRATION-COMPLETE.md             # Migration manifest
│
├── 00-ARCHITECT/                     # ~32 files — Principles, ADRs, Blueprints
│   ├── INDEX.md | SUMMARY.md | README.md
│   ├── PRINCIPLES/                   # Architecture principles, enterprise architecture
│   ├── DECISIONS/                    # ADRs, decision records
│   ├── BLUEPRINT/                    # Implementation blueprint (9 architecture docs)
│   └── EVOLUTION/                    # Master dependencies, evolution path
│
├── 01-EXECUTIVE/                     # ~14 files — Vision, Strategy, Business Model
│   ├── INDEX.md | SUMMARY.md | README.md
│   ├── VISION/                       # Vision architecture, value proposition
│   ├── STRATEGY/                     # Strategic foundation
│   ├── BUSINESS-MODEL/               # Business model documentation
│   ├── REVENUE/                      # Revenue architecture
│   ├── ROADMAP/                      # Strategic roadmap, implementation roadmap
│   └── ASSURANCE/                    # Program assurance review
│
├── 02-GOVERNANCE/                    # ~7 files — Quality, Risk, Traceability
│   ├── INDEX.md | SUMMARY.md | README.md
│   ├── PRINCIPLES/                   # Shared governance principles
│   ├── DECISIONS/                    # Implementation baseline
│   ├── QUALITY/                      # Quality gates, gate criteria
│   ├── RISK/                         # Risk register
│   ├── TRACEABILITY/                 # Cross-phase traceability matrix
│   ├── ALIGNMENT/                    # Cross-phase alignment audit
│   └── COMPLIANCE/                   # Compliance documentation
│
├── 03-BUSINESS/                      # ~80+ files — Business Architecture, DDD
│   ├── INDEX.md | SUMMARY.md | README.md
│   ├── ARCHITECTURE/                 # Business architecture, master context
│   ├── CAPABILITIES/                 # Capability maps, feature justification
│   ├── MARKET/                       # Market research
│   ├── HOSPITALITY/                  # Hospitality domain knowledge (26 files)
│   ├── DOMAIN/                       # DDD, ubiquitous language (12 files)
│   ├── OPERATIONS/                   # Operations playbook (25+ files)
│   ├── WORKFLOWS/                    # Operational workflows, client lifecycle
│   └── RULES/                        # Business rules
│
├── 04-DESIGN/                        # ~76 files — Digital Twin, UX, API Design
│   ├── INDEX.md | SUMMARY.md | README.md
│   ├── PRODUCT/                      # Product decomposition
│   ├── PORTAL/                       # Portal design, frontend architecture
│   ├── UX/                           # User experience, workflow foundation
│   ├── SCREENS/                      # Screen inventory
│   ├── DESIGN-SYSTEM/                # Design system documentation
│   ├── DATABASE/                     # Physical database design (20+ files)
│   ├── API/                          # API specifications, design (17+ files)
│   ├── BACKEND/                      # Backend module design
│   ├── EVENTS/                       # Event architecture, business events
│   ├── SECURITY/                     # Security design
│   ├── REPORTING/                    # Reporting design
│   ├── AGENTS/                       # AI agent design
│   └── READINESS/                    # Implementation readiness
│
├── 05-ENGINEERING/                   # ~41 files — Standards, CI/CD, Testing
│   ├── INDEX.md | SUMMARY.md | README.md
│   ├── HANDBOOK/                     # Engineering handbook, master context
│   ├── MONOREPO/                     # Monorepo architecture
│   ├── GIT/                          # Git strategy
│   ├── STANDARDS/                    # Development + coding + documentation standards
│   ├── DATABASE/                     # Database standards
│   ├── API/                          # API standards
│   ├── FRONTEND/                     # Frontend standards
│   ├── BACKEND/                      # Backend standards
│   ├── TESTING/                      # Testing strategy
│   ├── SECURITY/                     # Security standards
│   ├── OBSERVABILITY/                # Observability
│   ├── CI-CD/                        # CI/CD pipeline
│   ├── DEVOPS/                       # DevOps architecture
│   ├── AI-CODING/                    # AI coding standards
│   ├── REVIEW/                       # Review process
│   ├── RELEASE/                      # Release management, sprint foundation
│   ├── QUALITY/                      # Quality gates, DoD, MVP validation
│   ├── COST/                         # Startup cost optimization
│   ├── SCALING/                      # Future scaling
│   └── FOUNDATION/                   # Platform foundation, identity, infra
│
├── 06-DOMAINS/                       # ~317 files — 13 Business Domains
│   ├── INDEX.md | SUMMARY.md | README.md
│   ├── SHARED-KERNEL/                # 20 files — shared entities, value objects
│   ├── COMMERCIAL/                   # 20 files — leads, quotes, contracts
│   ├── PROJECT-DELIVERY/             # 20 files — projects, milestones, close-out
│   ├── PROCUREMENT/                  # 20 files — RFQ, PO, goods receipt
│   ├── SUPPLIER-MANAGEMENT/          # 20 files — qualification, performance
│   ├── INVENTORY/                    # 20 files — warehouses, stock, transfers
│   ├── FINANCIAL-CONTROL/            # 20 files — budgets, invoices, profitability
│   ├── MAINTENANCE/                  # 20 files — assets, work orders, SLA
│   ├── DOCUMENT-MANAGEMENT/          # 20 files — library, versioning, approvals
│   ├── EXECUTIVE-INTELLIGENCE/       # 20 files — dashboards, KPIs, decisions
│   ├── AI-COPILOTS/                  # 20 files — AI advisors per domain
│   ├── INTEGRATIONS/                 # 20 files — PMS, ERP, accounting
│   ├── MOBILE/                       # 20 files — field ops, offline, GPS
│   ├── HUMAN-RESOURCES/              # 20 files — HR domain
│   └── RELEASE/                      # 20 files — release architecture
│
├── 07-INTEGRATION/                   # ~13 files — External Systems, Contracts
│   ├── INDEX.md | SUMMARY.md | README.md
│   ├── CONTEXT-MAP/                  # Integration context map
│   ├── GATEWAY/                      # API gateway design
│   ├── CONTRACTS/                    # Integration contracts
│   ├── EVENTS/                       # Event integration
│   ├── SYNC/                         # Synchronization
│   ├── EXTERNAL-SYSTEMS/             # External system catalog
│   ├── ETA/                          # Egypt ETA e-invoicing
│   ├── FINANCIAL/                    # Financial integrations
│   ├── HOSPITALITY/                  # Hospitality integrations (PMS)
│   ├── IDENTITY/                     # Identity federation
│   ├── GOVERNANCE/                   # Integration governance
│   └── MONITORING/                   # Integration monitoring
│
├── 08-OPERATIONS/                    # ~185 files — Readiness, Transition
│   ├── INDEX.md | SUMMARY.md | README.md
│   ├── READINESS/                    # 62 files — Operational readiness (9 sub-sections)
│   │   ├── BUSINESS/                 # Business readiness (7)
│   │   ├── PRODUCT/                  # Product readiness (8)
│   │   ├── ENGINEERING/              # Engineering readiness (8)
│   │   ├── QA/                       # Quality assurance (11)
│   │   ├── SECURITY/                 # Security readiness (10)
│   │   ├── INFRASTRUCTURE/           # Infrastructure readiness (10)
│   │   ├── COMMERCIAL/               # Commercial readiness (4)
│   │   ├── FINANCE/                  # Finance readiness (empty)
│   │   └── AI-GOVERNANCE/            # AI governance (empty)
│   ├── TRANSITION/                   # 86 files — Enterprise transition (10 sub-sections)
│   │   ├── GOVERNANCE/               # Go-live governance
│   │   ├── DEPLOYMENT/               # Deployment execution
│   │   ├── BUSINESS-TRANSITION/      # Business transition
│   │   ├── CUSTOMER-ONBOARDING/      # Customer onboarding
│   │   ├── SECURITY-OPS/             # Security operations
│   │   ├── COMMERCIAL-ROLLOUT/       # Commercial rollout
│   │   ├── HYPERCARE/                # Hypercare
│   │   ├── POST-LAUNCH/              # Post-launch review
│   │   └── CLOSURE/                  # Transition closure
│   ├── MONITORING/                   # 8 files — Monitoring operations
│   ├── SUPPORT/                      # 8 files — Support operations
│   ├── CUSTOMER/                     # 8 files — Customer success
│   └── KNOWLEDGE-TRANSFER/           # 8 files — Knowledge transfer
│
├── 09-EVOLUTION/                     # ~114 files — Future Strategy, Research
│   ├── INDEX.md | SUMMARY.md | README.md
│   ├── STRATEGY/                     # 8 files — Evolution strategy
│   ├── PRODUCT/                      # 8 files — Product evolution
│   ├── AI/                           # 10 files — AI evolution
│   ├── DATA/                         # 10 files — Data intelligence
│   ├── AUTOMATION/                   # 9 files — Automation
│   ├── PLATFORM/                     # 9 files — Platform scaling
│   ├── ECOSYSTEM/                    # 9 files — Enterprise ecosystem
│   ├── CUSTOMER-SUCCESS/             # 8 files — Customer success evolution
│   ├── ENGINEERING/                  # 9 files — Engineering evolution
│   ├── GROWTH/                       # 9 files — Business growth
│   ├── RESEARCH/                     # 9 files — Research lab
│   └── GOVERNANCE/                   # 9 files — Architecture governance
│
├── 10-AI/                            # ~340 files — AI Delivery, Execution, Agents
│   ├── INDEX.md | SUMMARY.md | README.md
│   ├── DELIVERY/                     # ~60 files — AI delivery framework
│   │   ├── FOUNDATION/               # Foundation principles
│   │   ├── ORGANIZATION/             # AI organization
│   │   └── PIPELINE/                 # Delivery pipeline
│   │   └── STANDARDS/                # AI delivery standards
│   ├── MAPPING/                      # ~102 files — Delivery mapping
│   │   ├── CAPABILITIES/             # Capability mapping
│   │   ├── CONSUMPTION/              # Consumption matrix
│   │   ├── TRACEABILITY/             # Traceability maps
│   │   ├── MODULES/                  # Module maps
│   │   ├── SPRINTS/                  # Sprint maps
│   │   ├── DEPENDENCIES/             # Dependency graphs
│   │   ├── SEQUENCES/                # Implementation sequences
│   │   ├── DELIVERABLES/             # Deliverable mapping
│   │   └── VALIDATION/               # Validation
│   ├── EXECUTION/                    # ~123 files — AI execution system
│   │   ├── PORTFOLIO/                # Portfolio
│   │   ├── MANAGEMENT/               # Program management
│   │   ├── EPICS/                    # Epic management
│   │   ├── FEATURES/                 # Feature management
│   │   ├── STORIES/                  # User stories
│   │   ├── TASKS/                    # Task decomposition
│   │   ├── SPRINTS/                  # Sprint system
│   │   ├── DELIVERABLES/             # Deliverables
│   │   ├── QUALITY/                  # Quality gates
│   │   ├── RELEASE/                  # Release management
│   │   ├── CONFIGURATION/            # Configuration
│   │   ├── OBSERVABILITY/            # Observability
│   │   └── CONTINUOUS/              # Continuous execution
│   ├── ENGINEERING/                  # 8 files — AI engineering
│   ├── AGENTS/                       # AI agents (from design)
│   ├── PROMPTS/                      # 6 files — AI prompts
│   ├── CONTEXTS/                     # 14 files — Context packs
│   ├── GOVERNANCE/                   # 16 files — AI governance
│   ├── METRICS/                      # 8 files — AI metrics
│   └── AUTOMATION/                   # 7 files — AI automation
│
├── 11-KNOWLEDGE/                     # ~15+ files — RAG, Vector, Graph
│   ├── INDEX.md | SUMMARY.md | README.md
│   ├── SYSTEM/                       # Knowledge system design
│   ├── RAG/                          # RAG platform
│   ├── VECTOR/                       # Vector strategy
│   ├── GRAPH/                        # Knowledge graph
│   ├── MEMORY/                       # AI memory
│   └── STRATEGY/                     # Knowledge strategy
│
├── 12-SHARED/                        # ~24 files — Templates, Conventions
│   ├── INDEX.md | SUMMARY.md | README.md
│   ├── TEMPLATES/                    # 17 files — Document, ADR, API templates
│   ├── CONVENTIONS/                  # Naming conventions
│   ├── POLICIES/                     # Cross-cutting policies
│   └── CHECKLISTS/                   # 7 files — Review checklists
│
├── 13-ARCHIVE/                       # Historical documents
│   ├── INDEX.md | SUMMARY.md | README.md
│
└── 99-META/                          # ~10 files — Repository metadata
    ├── INDEX.md | SUMMARY.md | README.md
    ├── MASTER-INDEX.md               # Original master index
    ├── README-ORIGINAL.md            # Original root README
    ├── REPOSITORY-MAP.md             # This file
    ├── VECTOR-STRATEGY.md            # Vectorization strategy
    ├── AGENT-STRATEGY.md             # AI agent loading strategy
    ├── KNOWLEDGE-LIFECYCLE.md        # Knowledge lifecycle
    ├── REPOSITORY-SCORES.md          # Quality & maturity scores
    ├── MIGRATION-MAP.md              # Migration mapping
    └── IMPROVEMENT-ROADMAP.md        # Future improvements
```

## Statistics

| Metric | Value |
|--------|-------|
| Total documents | ~1,444 |
| Top-level layers | 15 |
| Subdirectories | ~120+ |
| AI context packs | 16 roles |
| Vector collections | 14 |
| Business domains | 13 |
