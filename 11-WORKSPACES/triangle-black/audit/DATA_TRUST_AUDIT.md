# Data Trust Audit

Provenance vocabulary and `classify_record` exist (REAL, IMPORTED, VERIFIED, TEST, DEMO, GENERATED, UNKNOWN, INTERNAL). Work-order linkage/classification and confidence concepts are present in code and documentation, but active end-to-end enforcement is NOT VERIFIED.

The classifying helper defaults unknown sources to `UNKNOWN`; the customer scope permits `NULL` classification, and no customer query uses it. Pilot/baseline queries count records by hotel rather than trust class. This makes confidence and provenance presentation unsafe for real customer KPI/ROI use.

Work-order ASSET_LINKED / LOCATION_LINKED / NON_ASSET / UNKNOWN and HIGH/MEDIUM/LOW/VERY_LOW/INSUFFICIENT are not comprehensively verifiable from active runtime because relevant V15 routes are absent and no real database was available. Treat the feature as PARTIAL.
