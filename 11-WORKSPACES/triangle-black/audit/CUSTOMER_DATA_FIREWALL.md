# Customer Data Firewall Audit

`CustomerDataScope` defines allowed classifications `REAL`, `IMPORTED`, `VERIFIED` and excluded `TEST`, `DEMO`, `GENERATED`, `UNKNOWN`, `INTERNAL`. Its query helper permits `NULL` classification as customer-visible. No production caller uses the scope. This is a **P0 FAIL** for the intended firewall.

Dashboards, pilot baseline, reports, attention, AI/recommendations and exports commonly query by `hotel_id` only. They have no verified classification predicate. The codebase also contains demo environment/scenario/seed endpoints and scripts. Therefore exposure of TEST/DEMO/GENERATED/UNKNOWN is possible wherever records have a matching hotel and a nullable/missing classification.

Customer-facing claims about data trust are PARTIALLY IMPLEMENTED in source but NOT VERIFIED in the active customer runtime.
