# V10 DECISIONS
Generated: 2026-09-09

---

## ADR-V10-001: No Feature Explosion in V10

**Decision:** V10 does not add major new feature domains.
**Rationale:** 160 domain modules already exist. Operational quality > feature count.
**Consequence:** All sprints focus on trust, deployment, data quality, E2E, pilot.

## ADR-V10-002: Progressive main.py Extraction Only

**Decision:** Do not rewrite main.py in a single operation.
**Rationale:** Extraction risk is high. Behavior-preserving extraction in batches of 10 routes.
**Consequence:** main.py will reduce from 8,942 → <1,500 over multiple V10 sprints.

## ADR-V10-003: Data Quality Before AI Sophistication

**Decision:** Do not build additional AI directors until WO→Asset > 50%.
**Rationale:** AI on incomplete data produces low-quality recommendations (8% acceptance).
**Consequence:** V10-006 (data trust) before V10-008 (AI 2.0).

## ADR-V10-004: Production VM Is P0

**Decision:** No customer conversations without a live URL.
**Rationale:** Engineering companies cannot evaluate localhost.
**Consequence:** V10-002 (production) is the highest-priority local + business action.

## ADR-V10-005: Daily Digest Is The Primary AI UX

**Decision:** Users should see the daily digest (top 5), not the full pending list.
**Rationale:** 1,059 pending recommendations = decision fatigue.
**Consequence:** Attention dashboard routes to daily digest as primary view.

## ADR-V10-006: Confidence Metadata On Every Intelligence Metric

**Decision:** Every metric must expose: value, confidence, sample_size, coverage.
**Rationale:** Claiming MTTR=88h when WO→Asset=5% is misleading.
**Consequence:** All engine responses include data lineage.
