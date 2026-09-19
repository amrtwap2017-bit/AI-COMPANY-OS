# Requirement Traceability

| Business requirement | Backend | DB | Frontend | Test | Security | Production | Customer validation | Status |
|---|---|---|---|---|---|---|---|---|
| Authentication | exists | users model | exists | source tests | partial | no live proof | none | PARTIAL |
| Tenant isolation | partial | hotel IDs | partial | source tests | default fallback | no proof | none | PARTIAL |
| Customer firewall | definition only | classifications partial | unknown | unit only | bypassed | no | none | MISSING |
| Assets/work orders/PM | active subset | models/migrations | screens | source tests | partial | no live | none | PARTIAL |
| Attention/recommendations/evidence/adoption | source exists | partial | screens | source tests | partial | routes absent | none | PARTIAL |
| Imports/invites/onboarding | source exists | partial | screens | source tests | partial | routes absent | none | PARTIAL |
| Verified ROI/executive report | source claims | unavailable DB | screens | source tests | insufficient | no | none | MISSING |
| Notifications/backups/monitoring | scripts/modules | unknown | partial | source tests | partial | no operating proof | none | PARTIAL |
