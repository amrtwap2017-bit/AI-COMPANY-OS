# Migration Map — Old to New Structure

## Legacy Structure (Before)

```
TRIANGLE-BLACK/
├── PHASE-00/                          5 files    → 01-EXECUTIVE/
├── PHASE-01-ENTERPRISE-DOCUMENTATION/ 288 files  → Distributed across 10 new dirs
├── PHASE-02-IMPLEMENTATION-BLUEPRINT/ 9 files    → 00-ARCHITECT/BLUEPRINT/
├── PHASE-03-DIGITAL-TWIN-DESIGN/      76 files   → 04-DESIGN/
├── PHASE-04-ENTERPRISE-ENGINEERING/   41 files   → 05-ENGINEERING/
├── PHASE-05-PRODUCT-IMPLEMENTATION/   40 files   → 05-ENGINEERING/ + 04-DESIGN/
├── PHASE-06-BUSINESS-DOMAINS/         317 files  → 06-DOMAINS/
├── PHASE-07-ENTERPRISE-INTEGRATION/   13 files   → 07-INTEGRATION/
├── PHASE-08-ENTERPRISE-OPERATIONAL-READINESS/ 81 files  → 08-OPERATIONS/READINESS/
├── PHASE-09-ENTERPRISE-TRANSITION/    104 files  → 08-OPERATIONS/TRANSITION/
├── PHASE-10-ENTERPRISE-EVOLUTION/     115 files  → 09-EVOLUTION/
├── PROGRAM-02-ENTERPRISE-AI-DELIVERY/ 120 files  → 10-AI/DELIVERY/ + GOVERNANCE/
├── PROGRAM-02.5-DELIVERY-MAPPING/     115 files  → 10-AI/MAPPING/ + CONTEXTS/
├── PROGRAM-03-ENTERPRISE-AI-EXECUTION/ 120 files → 10-AI/EXECUTION/
├── SHARED/                            11 files   → 12-SHARED/
├── archive/                           1 file     → 13-ARCHIVE/
├── Root governance (8 files)                     → Distributed
└── Root README, INDEX, etc.                      → 99-META/
```

## New Structure (After)

| New Layer | Old Sources | File Count |
|-----------|-------------|-----------|
| `00-ARCHITECT/` | Root governance, PHASE-02, PHASE-01/09-Architecture | ~32 |
| `01-EXECUTIVE/` | PHASE-00, Root roadmap, PHASE-01/01-Executive | ~14 |
| `02-GOVERNANCE/` | Root quality/risk/traceability, PHASE-01/00-Governance | ~7 |
| `03-BUSINESS/` | PHASE-01 (business, market, hospitality, domain, ops) | ~80+ |
| `04-DESIGN/` | PHASE-03, PHASE-01 (product, UX, database, API), PHASE-05 | ~76 |
| `05-ENGINEERING/` | PHASE-04, PHASE-05, PHASE-01 (infra, security, testing) | ~41 |
| `06-DOMAINS/` | PHASE-06 (all 13 domains + shared + release) | ~317 |
| `07-INTEGRATION/` | PHASE-07 (all 12 integration specs) | ~13 |
| `08-OPERATIONS/` | PHASE-08 + PHASE-09 (readiness + transition) | ~185 |
| `09-EVOLUTION/` | PHASE-10 (evolution + research) | ~114 |
| `10-AI/` | PROGRAM-02, 02.5, 03 (delivery + mapping + execution) | ~340 |
| `11-KNOWLEDGE/` | PHASE-01/21-Knowledge-Base, PROGRAM-02/12-Knowledge | ~15+ |
| `12-SHARED/` | PHASE-01/22-Templates + 23-Checklists, PROGRAM-02/06-Templates | ~24 |
| `13-ARCHIVE/` | archive/ | ~1 |
| `99-META/` | Root INDEX, README, migration docs | ~10 |

## Cross-Reference Preservation

Every original document has:
1. **Copy preserved** at new location
2. **README stub** at old location pointing to new path
3. **MIGRATION.md** in old directories (where applicable)
4. **Cross-reference** in `99-META/MIGRATION-MAP.md`
